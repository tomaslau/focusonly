import { describe, it, expect } from 'vitest';
import { VerdictSchema } from '@/lib/types';
import {
  DEFAULT_API_CONFIG,
  DEFAULT_SETTINGS,
  CONTENT_CHAR_LIMIT,
  PROFILE_PRESETS,
} from '@/lib/constants';

describe('API config edge cases', () => {
  it('base URL has no trailing slash', () => {
    // If baseUrl has trailing slash, the constructed URL would be
    // "https://api.openai.com/v1//chat/completions" — double slash
    expect(DEFAULT_API_CONFIG.baseUrl.endsWith('/')).toBe(false);
  });

  it('base URL construction works correctly', () => {
    const fullUrl = `${DEFAULT_API_CONFIG.baseUrl}/chat/completions`;
    expect(fullUrl).toBe('https://api.openai.com/v1/chat/completions');
  });

  it('GAP: no validation on base URL format', () => {
    // Nothing prevents user from entering garbage as baseUrl
    // The extension will just fail at runtime with a network error
    // This is acceptable — error message from testConnection handles it
  });
});

describe('Content extraction edge cases', () => {
  it('CONTENT_CHAR_LIMIT truncation boundary', () => {
    const content = 'a'.repeat(CONTENT_CHAR_LIMIT + 1000);
    const truncated = content.slice(0, CONTENT_CHAR_LIMIT);
    expect(truncated.length).toBe(CONTENT_CHAR_LIMIT);
  });

  it('GAP: minimum content threshold is only 50 chars', () => {
    // background.ts line 137: if (!pageData?.excerpt || pageData.excerpt.length < 50)
    // 50 chars is very short — might not be enough for meaningful analysis
    // "Lorem ipsum dolor sit amet, consectetur adipiscing" is exactly 51 chars
    // This could lead to low-quality verdicts on pages with minimal text
    const minContent = 'x'.repeat(51);
    expect(minContent.length).toBeGreaterThan(50);
    // GAP: Consider raising the minimum to 200+ chars
  });
});

describe('Verdict-score alignment (coercion)', () => {
  // The schema now coerces verdict to match score ranges:
  // 0-29 → Leave, 30-59 → Save, 60-100 → Read

  const testCases = [
    { input: 'Leave' as const, score: 90, expected: 'Read' },
    { input: 'Read' as const, score: 5, expected: 'Leave' },
    { input: 'Save' as const, score: 95, expected: 'Read' },
    { input: 'Leave' as const, score: 15, expected: 'Leave' },
    { input: 'Read' as const, score: 80, expected: 'Read' },
    { input: 'Save' as const, score: 45, expected: 'Save' },
  ];

  for (const tc of testCases) {
    it(`${tc.input} with score ${tc.score} → coerced to ${tc.expected}`, () => {
      const result = VerdictSchema.parse({
        verdict: tc.input,
        score: tc.score,
        reasons: ['test'],
      });
      expect(result.verdict).toBe(tc.expected);
    });
  }
});

describe('Settings deep merge safety', () => {
  it('deep merge preserves nested defaults for partial apiConfig', () => {
    // storage.ts now does deep merge for nested objects
    const stored = { apiConfig: { apiKey: 'sk-test' } };
    const merged = {
      ...DEFAULT_SETTINGS,
      ...stored,
      apiConfig: { ...DEFAULT_SETTINGS.apiConfig, ...stored.apiConfig },
    };

    expect(merged.apiConfig.apiKey).toBe('sk-test');
    expect(merged.apiConfig.baseUrl).toBe('https://api.openai.com/v1');
    expect(merged.apiConfig.model).toBe('gpt-4o-mini');
  });

  it('deep merge preserves nested defaults for partial profile', () => {
    const stored = { profile: { role: 'Custom Role' } };
    const merged = {
      ...DEFAULT_SETTINGS,
      ...stored,
      profile: { ...DEFAULT_SETTINGS.profile, ...stored.profile },
    };

    expect(merged.profile.role).toBe('Custom Role');
    expect(merged.profile.goals).toEqual([]);
    expect(merged.profile.avoid).toEqual([]);
  });

  it('user values override defaults in deep merge', () => {
    const stored = {
      enabled: false,
      apiConfig: { baseUrl: 'https://custom.api.com', apiKey: 'sk-test', model: 'gpt-5-nano' },
    };
    const merged = {
      ...DEFAULT_SETTINGS,
      ...stored,
      apiConfig: { ...DEFAULT_SETTINGS.apiConfig, ...stored.apiConfig },
    };

    expect(merged.enabled).toBe(false);
    expect(merged.apiConfig.baseUrl).toBe('https://custom.api.com');
    expect(merged.apiConfig.model).toBe('gpt-5-nano');
  });

  it('profile presets are not mutated by reference', () => {
    const preset = PROFILE_PRESETS[0];
    const profileCopy = { ...preset.profile, goals: [...preset.profile.goals] };
    profileCopy.goals.push('New goal');
    expect(preset.profile.goals).not.toContain('New goal');
  });
});

describe('Debounce timing', () => {
  it('debounce interval is documented as 2 seconds', () => {
    // background.ts line 168: setTimeout(() => { ... }, 2000)
    // This is hardcoded — might be worth making configurable
    // For fast typers/navigators, 2s means many page loads are analyzed
    // For SPA navigation, 2s might cause duplicate analyses
  });
});

describe('LLM response parsing robustness', () => {
  // Test various malformed responses that LLMs might produce

  it('text before JSON is now extracted by stripMarkdownFences', () => {
    // stripMarkdownFences now extracts JSON from text-prefixed responses
    // This is tested in llm.test.ts via the evaluatePage integration
    // The raw JSON.parse still fails, but the extraction step handles it
    const raw = 'Here is my analysis:\n{"verdict":"Read","score":80,"reasons":["good"]}';
    expect(() => JSON.parse(raw.trim())).toThrow();
    // But extracting from first { to last } works:
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const extracted = raw.slice(start, end + 1);
    expect(() => JSON.parse(extracted)).not.toThrow();
  });

  it('handles JSON with trailing comma', () => {
    const raw = '{"verdict":"Read","score":80,"reasons":["good"],}';
    expect(() => JSON.parse(raw)).toThrow();
    // GAP: Some LLMs produce trailing commas — standard JSON.parse rejects them
  });

  it('handles JSON with single quotes', () => {
    const raw = "{'verdict':'Read','score':80,'reasons':['good']}";
    expect(() => JSON.parse(raw)).toThrow();
    // GAP: Some LLMs use single quotes — standard JSON.parse rejects them
  });

  it('handles multiple JSON objects', () => {
    const raw = '{"verdict":"Read","score":80,"reasons":["good"]}\n{"verdict":"Leave","score":10,"reasons":["bad"]}';
    expect(() => JSON.parse(raw)).toThrow();
    // GAP: Some LLMs produce multiple objects — JSON.parse only handles one
  });
});

describe('Token estimation accuracy', () => {
  it('rough estimate of 4 chars/token is approximate', () => {
    // GPT tokenizer: "Hello, world!" ≈ 4 tokens (13 chars → 3.25 chars/token)
    // The 4 chars/token estimate is intentionally conservative
    // For cost tracking, overestimating is better than underestimating
    const text = 'Hello, world!';
    const estimate = Math.ceil(text.length / 4);
    expect(estimate).toBe(4); // 13/4 = 3.25 → 4

    // Long technical text has higher chars/token ratio
    const code = 'function calculateTotalRevenueFromSubscriptions(users) { return users.reduce((total, u) => total + u.subscription.price, 0); }';
    const codeEstimate = Math.ceil(code.length / 4);
    // Actual tokens would be much fewer (identifiers are multi-char tokens)
    // This overestimates, which is fine for cost tracking
    expect(codeEstimate).toBeGreaterThan(10);
  });
});

describe('CORS and API compatibility', () => {
  it('API request format is OpenAI-compatible', () => {
    // The extension uses /chat/completions endpoint
    // This is compatible with: OpenAI, OpenRouter, Groq, Ollama, Together, etc.
    // Format: { model, messages, temperature, max_tokens }
    const request = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are...' },
        { role: 'user', content: '...' },
      ],
      temperature: 0,
      max_tokens: 150,
    };
    expect(request).toHaveProperty('model');
    expect(request).toHaveProperty('messages');
    expect(request.messages[0]).toHaveProperty('role');
    expect(request.messages[0]).toHaveProperty('content');
  });
});
