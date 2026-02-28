import { VerdictSchema, type ApiConfig, type Profile, type PageData, type Verdict } from './types';
import { API_TIMEOUT_MS } from './constants';

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
  return cleaned.trim();
}

export async function evaluatePage(
  apiConfig: ApiConfig,
  profile: Profile,
  page: PageData,
): Promise<Verdict> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserMessage(profile, page) },
        ],
        temperature: 0,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('API key is invalid. Check your settings.');
      if (response.status === 429) throw new Error('Rate limited. Try again in a few seconds.');
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from API');

    const cleaned = stripMarkdownFences(content);
    const parsed = JSON.parse(cleaned);
    const validated = VerdictSchema.parse(parsed);
    return validated;
  } finally {
    clearTimeout(timeout);
  }
}

export async function testConnection(apiConfig: ApiConfig): Promise<{ ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
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
