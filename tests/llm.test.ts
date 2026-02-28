import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluatePage, testConnection, estimateTokens } from '@/lib/llm';
import type { ApiConfig, Profile, PageData } from '@/lib/types';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const validConfig: ApiConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: 'sk-test-1234567890',
  model: 'gpt-4o-mini',
};

const validProfile: Profile = {
  role: 'Solo Founder',
  goals: ['Find product-market fit', 'Learn distribution'],
  avoid: ['Enterprise sales'],
  focus: ['bootstrapping', 'indie products'],
};

const validPage: PageData = {
  url: 'https://example.com/article',
  domain: 'example.com',
  title: 'How to Find Product-Market Fit',
  excerpt: 'A detailed guide on finding product-market fit for your startup. This covers customer interviews, MVP testing, and iterating on feedback...'.padEnd(100, '.'),
};

function mockApiResponse(content: string, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status === 200,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve({
      choices: [{ message: { content } }],
    }),
  });
}

function mockApiError(status: number, statusText: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({ error: { message: statusText } }),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('estimateTokens', () => {
  it('estimates roughly 4 chars per token', () => {
    expect(estimateTokens('hello world')).toBe(3); // 11 chars / 4 = 2.75 → 3
  });

  it('handles empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('handles very long text', () => {
    const longText = 'a'.repeat(12000);
    expect(estimateTokens(longText)).toBe(3000);
  });

  it('always returns integer', () => {
    expect(Number.isInteger(estimateTokens('abc'))).toBe(true); // 3/4 = 0.75 → 1
  });
});

describe('evaluatePage', () => {
  it('parses a valid JSON response', async () => {
    mockApiResponse('{"verdict":"Read","score":82,"reasons":["Relevant to goals"]}');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Read');
    expect(result.score).toBe(82);
    expect(result.reasons).toEqual(['Relevant to goals']);
  });

  it('strips markdown fences from response', async () => {
    mockApiResponse('```json\n{"verdict":"Save","score":45,"reasons":["Bookmark it"]}\n```');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Save'); // score 45 → Save (aligned)
    expect(result.score).toBe(45);
  });

  it('strips markdown fences without json label', async () => {
    mockApiResponse('```\n{"verdict":"Leave","score":10,"reasons":["Irrelevant"]}\n```');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Leave');
  });

  it('handles response with leading/trailing whitespace', async () => {
    mockApiResponse('  \n  {"verdict":"Read","score":75,"reasons":["OK"]}  \n  ');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Read');
  });

  it('extracts JSON from text-prefixed response (no retry needed)', async () => {
    // LLM prefixes JSON with explanation text — now extracted on first pass
    mockApiResponse('Here is my analysis:\n{"verdict":"Read","score":80,"reasons":["Relevant"]}');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Read');
    expect(mockFetch).toHaveBeenCalledTimes(1); // No retry needed
  });

  it('retries with strict prompt on completely invalid response', async () => {
    // First call returns no JSON at all
    mockApiResponse('This page is relevant because it covers the topic well.');
    // Retry with strict prompt succeeds
    mockApiResponse('{"verdict":"Read","score":80,"reasons":["Relevant"]}');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Read');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws on 401 unauthorized', async () => {
    mockApiError(401, 'Unauthorized');

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow('API key is invalid');
  });

  it('retries on 429 rate limit with backoff', async () => {
    // First attempt: rate limited
    mockApiError(429, 'Too Many Requests');
    // Second attempt succeeds
    mockApiResponse('{"verdict":"Read","score":70,"reasons":["OK"]}');

    const result = await evaluatePage(validConfig, validProfile, validPage);
    expect(result.verdict).toBe('Read');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  }, 10000);

  it('throws after all retries exhausted on 429', async () => {
    // All 3 attempts rate limited
    mockApiError(429, 'Too Many Requests');
    mockApiError(429, 'Too Many Requests');
    mockApiError(429, 'Too Many Requests');

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow('Rate limited');
  }, 30000);

  it('sends correct request format', async () => {
    mockApiResponse('{"verdict":"Read","score":75,"reasons":["OK"]}');

    await evaluatePage(validConfig, validProfile, validPage);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(options.method).toBe('POST');
    expect(options.headers['Authorization']).toBe('Bearer sk-test-1234567890');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.temperature).toBe(0);
    expect(body.max_tokens).toBe(150);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].role).toBe('user');
  });

  it('includes profile and page data in user message', async () => {
    mockApiResponse('{"verdict":"Read","score":75,"reasons":["OK"]}');

    await evaluatePage(validConfig, validProfile, validPage);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    const userContent = JSON.parse(body.messages[1].content);

    expect(userContent.profile.role).toBe('Solo Founder');
    expect(userContent.profile.goals).toContain('Find product-market fit');
    expect(userContent.page.url).toBe('https://example.com/article');
    expect(userContent.page.title).toBe('How to Find Product-Market Fit');
  });

  it('handles API returning empty choices array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [] }),
    });

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow();
  });

  it('handles API returning null content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        choices: [{ message: { content: null } }],
      }),
    });

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow();
  });

  it('handles generic API error (500)', async () => {
    mockApiError(500, 'Internal Server Error');

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow('API error: 500');
  });

  it('handles network timeout (abort)', async () => {
    mockFetch.mockImplementationOnce(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow();
  });

  it('handles LLM returning valid JSON but wrong schema', async () => {
    // LLM returns JSON but with wrong field names
    mockApiResponse('{"action":"read","confidence":0.82,"notes":["good"]}');
    // Strict retry also returns wrong schema
    mockApiResponse('{"action":"read","confidence":0.82,"notes":["good"]}');

    await expect(evaluatePage(validConfig, validProfile, validPage))
      .rejects.toThrow();
  });

  it('strips trailing slash from base URL', async () => {
    const configWithSlash = { ...validConfig, baseUrl: 'https://api.openai.com/v1/' };
    mockApiResponse('{"verdict":"Read","score":75,"reasons":["OK"]}');

    await evaluatePage(configWithSlash, validProfile, validPage);

    const calledUrl = mockFetch.mock.calls[0][0];
    // Trailing slash should be stripped — no double slash
    expect(calledUrl).toBe('https://api.openai.com/v1/chat/completions');
    expect(calledUrl).not.toContain('//chat');
  });

  it('strips multiple trailing slashes from base URL', async () => {
    const configWithSlashes = { ...validConfig, baseUrl: 'https://api.openai.com/v1///' };
    mockApiResponse('{"verdict":"Read","score":75,"reasons":["OK"]}');

    await evaluatePage(configWithSlashes, validProfile, validPage);

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe('https://api.openai.com/v1/chat/completions');
  });

  it('handles empty profile gracefully', async () => {
    const emptyProfile: Profile = { role: '', goals: [], avoid: [], focus: [] };
    mockApiResponse('{"verdict":"Save","score":50,"reasons":["No profile context"]}');

    // Should still make the API call even with empty profile
    const result = await evaluatePage(validConfig, emptyProfile, validPage);
    expect(result).toBeDefined();
  });
});

describe('testConnection', () => {
  it('returns ok:true on successful connection', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] }),
    });

    const result = await testConnection(validConfig);
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns specific error for 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const result = await testConnection(validConfig);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Invalid API key');
  });

  it('returns error for other HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const result = await testConnection(validConfig);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('400');
  });

  it('handles network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await testConnection(validConfig);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('sends minimal request (just "Say ok")', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] }),
    });

    await testConnection(validConfig);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(5);
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].content).toBe('Say "ok"');
  });

  it('uses correct model from config', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] }),
    });

    const customConfig = { ...validConfig, model: 'gpt-5-nano' };
    await testConnection(customConfig);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('gpt-5-nano');
  });
});
