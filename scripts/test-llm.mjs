// Quick test: simulates what the extension does when analyzing a page
// Usage: OPENAI_API_KEY=sk-... node scripts/test-llm.mjs

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Set OPENAI_API_KEY env var. Example:');
  console.error('  OPENAI_API_KEY=sk-... node scripts/test-llm.mjs');
  process.exit(1);
}

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

const profile = {
  role: 'Solo Founder',
  goals: ['Find product-market fit', 'Learn distribution and growth tactics', 'Understand pricing strategies'],
  avoid: ['Enterprise sales processes', 'VC fundraising advice', 'Large team management'],
  focus: ['bootstrapping', 'indie products', 'solo business'],
};

const page = {
  url: 'https://example.com/blog/pricing-your-saas',
  domain: 'example.com',
  title: 'How to Price Your SaaS Product: A Practical Guide for Solo Founders',
  excerpt: 'Pricing is one of the hardest decisions for a solo founder. Most indie hackers underprice their products by 3-5x. In this guide, we cover value-based pricing, tiered pricing strategies, and how to run pricing experiments without a data team. We interviewed 50 bootstrapped founders who crossed $10k MRR to understand what pricing strategies actually worked.',
};

console.log('Testing LLM evaluation...');
console.log('Profile:', profile.role);
console.log('Page:', page.title);
console.log('---');

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);

try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify({ profile, page }) },
      ],
      temperature: 0,
      max_tokens: 150,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`API Error ${response.status}:`, err);
    process.exit(1);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  console.log('Raw response:', content);

  // Strip markdown fences
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);
  console.log('---');
  console.log('Verdict:', parsed.verdict);
  console.log('Score:', parsed.score);
  console.log('Reasons:', parsed.reasons);
  console.log('---');
  console.log('AI processing works!');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
