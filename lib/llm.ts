import { VerdictSchema, type ApiConfig, type Profile, type PageData, type Verdict } from './types';
import { API_TIMEOUT_MS, MAX_RETRIES } from './constants';

const SYSTEM_PROMPT = `You are a relevance evaluator. Given a user profile and a webpage excerpt, determine how relevant the page is to the user's goals.

Respond with ONLY valid JSON, no markdown, no explanation. Use this exact format:
{"verdict":"Leave","score":0,"reasons":["reason 1","reason 2"]}

verdict must be exactly one of: Leave, Read, Save
score must be 0-100
reasons must have 1-2 short bullets

Scoring guide:
- 0-29 (Leave): Content is irrelevant, misaligned, or a distraction
- 30-59 (Save): Somewhat relevant, worth bookmarking but not reading now
- 60-100 (Read): Directly relevant to current goals, read now

Be decisive. When in doubt, score lower.`;

const STRICT_SYSTEM_PROMPT = SYSTEM_PROMPT + `

CRITICAL: Your response must be ONLY a single JSON object. No text before or after. No markdown. Example:
{"verdict":"Read","score":75,"reasons":["reason one","reason two"]}`;

function buildUserMessage(profile: Profile, page: PageData): string {
  return JSON.stringify({
    profile: {
      role: profile.role,
      goals: profile.goals,
      avoid: profile.avoid,
      focus: profile.focus,
    },
    page: {
      url: page.url,
      domain: page.domain,
      title: page.title,
      excerpt: page.excerpt,
    },
  });
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  // Remove ```json ... ``` wrapping
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
  }
  cleaned = cleaned.trim();
  // Extract JSON object if there's text before/after it
  if (!cleaned.startsWith('{')) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      cleaned = cleaned.slice(start, end + 1);
    }
  }
  return cleaned;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callApi(
  apiConfig: ApiConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('API key is invalid. Check your settings.');
      if (response.status === 429) {
        const err = new Error('Rate limited. Try again in a few seconds.');
        (err as any).status = 429;
        throw err;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from API');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export async function evaluatePage(
  apiConfig: ApiConfig,
  profile: Profile,
  page: PageData,
): Promise<Verdict> {
  const userMessage = buildUserMessage(profile, page);

  // Retry loop for rate limits with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const content = await callApi(apiConfig, SYSTEM_PROMPT, userMessage);
      const cleaned = stripMarkdownFences(content);

      try {
        const parsed = JSON.parse(cleaned);
        const validated = VerdictSchema.parse(parsed);
        return validated;
      } catch {
        // Validation failed — retry once with stricter prompt
        if (attempt < MAX_RETRIES - 1) {
          const retryContent = await callApi(apiConfig, STRICT_SYSTEM_PROMPT, userMessage);
          const retryCleaned = stripMarkdownFences(retryContent);
          const retryParsed = JSON.parse(retryCleaned);
          return VerdictSchema.parse(retryParsed);
        }
        throw new Error('Could not parse response. Click to retry.');
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      // Only retry on rate limit (429)
      if ((e as any)?.status === 429 && attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        await sleep(backoffMs);
        continue;
      }
      throw lastError;
    }
  }
  throw lastError ?? new Error('Evaluation failed.');
}

export async function testConnection(apiConfig: ApiConfig): Promise<{ ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${apiConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 5,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) return { ok: false, error: 'Invalid API key' };
      return { ok: false, error: `Error: ${response.status} ${response.statusText}` };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Connection failed' };
  } finally {
    clearTimeout(timeout);
  }
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}
