# FocusOnly 🚥 — Product Requirements Document
**Version:** 2.0 — 2026-02-28
**Author:** Tomas Laurinavicius

---

## 🎯 Vision

Help knowledge workers protect their attention by instantly evaluating whether a webpage is relevant to their goals and providing a clear verdict: **Leave / Read / Save**.

---

## 🧩 Problem Statement

People waste time on content that sounds relevant but is misaligned with their real goals (e.g. enterprise-focused advice for solo founders). Browsers lack a goal-aware, real-time filter for relevance.

---

## 🎯 Success Criteria

- Verdict returned in under ~2 seconds
- Fully client-side, BYOK (Bring Your Own Key)
- Clear, decisive outcomes (Leave / Read / Save)
- No server-side storage or processing of page content
- Graceful degradation on API errors (never crash, never hang)

---

## 🧠 Target Users

- Solo founders
- Indie hackers / makers
- Growth operators
- Knowledge workers consuming strategy content

---

## 🛠 Tech Stack

### Chrome Extension

- Chrome Extension **Manifest V3**
- **WXT** (recommended) or **Vite** + **@crxjs/vite-plugin** as fallback
- **TypeScript** (strict mode)
- **React + Tailwind** for popup & options UI
- **Zod** for LLM response validation

> **Note on WXT vs CRXJS:** WXT has better MV3 support, more active maintenance, and fewer dev server issues. Evaluate both during scaffold; default to WXT unless a blocking issue is found.

### LLM Integration (BYOK)

- Client-side `fetch()` calls to any **OpenAI-compatible API endpoint**
- User supplies: API key + base URL + model name
- Calls made from the **popup or offscreen document** (not the service worker) to avoid MV3 service worker timeout issues
- 15-second `AbortController` timeout on all API calls
- No backend required for MVP

### Storage

- `chrome.storage.sync` — user profile, settings, API config (lightweight, <8KB per item, 100KB total)
- `chrome.storage.local` — cached verdicts, evaluation stats (~10MB capacity)

---

## 🚀 MVP Scope

### Features

#### 1. Profile Settings
User defines:
- Role (text input)
- Goals (3–5 items)
- Avoidances (3–5 items)
- Current focus topics (freeform tags)

**Preset profiles** to reduce onboarding friction:
- "Solo Founder" — goals: product-market fit, distribution, pricing; avoid: enterprise sales, VC fundraising
- "Growth Marketer" — goals: acquisition channels, conversion, analytics; avoid: brand strategy, agency pitches
- "Indie Developer" — goals: shipping, developer tools, technical architecture; avoid: management advice, team scaling
- "Content Creator" — goals: audience growth, monetization, writing craft; avoid: corporate marketing, enterprise content

Users select a preset and customize from there, or start blank.

#### 2. BYOK Setup
- **Base URL** input (default: `https://api.openai.com/v1`)
- **API key** input (stored in `chrome.storage.sync`, never transmitted except to the configured endpoint)
- **Model name** input (default: `gpt-4o-mini`)
- **Connection test** button — sends a minimal prompt to verify the key works
- Supports any OpenAI-compatible provider: OpenAI, OpenRouter, Groq, Together, Ollama (localhost)

#### 3. Content Extraction
Client-side extraction using **@mozilla/readability** (or equivalent):
- Page title
- URL + domain
- Cleaned article text via Readability.js (strips nav, ads, footers, sidebars)
- Character cap: **12,000 characters** (~3,000 tokens)
- Fallback: if Readability fails, use `document.body.innerText` truncated to cap

**Auto-analyze trigger:**
- Fires on `tabs.onUpdated` with `status: 'complete'` for the **active tab only**
- Debounced: waits 2 seconds after page load before analyzing
- Listens to `webNavigation.onHistoryStateUpdated` for SPA navigation (Twitter, Reddit, etc.)
- Does **not** re-analyze if URL hasn't changed
- Only runs when extension is **enabled** (global toggle)

**Default skip list** (user-editable in settings):
- Internal pages: `chrome://`, `chrome-extension://`, `about:`, `file://`, `edge://`
- Dev URLs: `localhost`, `127.0.0.1`, `0.0.0.0`
- Productivity apps: `mail.google.com`, `calendar.google.com`, `docs.google.com`, `sheets.google.com`, `notion.so`, `figma.com`, `linear.app`, `slack.com`
- Social/media: `youtube.com`, `netflix.com`, `spotify.com`
- Finance: `*.bank.*` patterns, user can add their banking domains

#### 4. Relevance Evaluation
- LLM prompt compares page content vs profile
- Returns strict JSON:
  - `verdict`: Leave / Read / Save
  - `score`: 0–100
  - `reasons`: max 2 bullets
- Validated with Zod schema; if validation fails → retry once with a stricter prompt, then show "Unable to evaluate" error state

**Error handling:**
| Error | Badge | Popup | Action |
|-------|-------|-------|--------|
| Loading/analyzing | ⏳ grey "..." | "Analyzing page..." spinner | Wait |
| API key missing | ❌ grey "!" | "Set up your API key in settings" | Link to options |
| API key invalid (401) | ❌ grey "!" | "API key is invalid. Check settings." | Link to options |
| Rate limited (429) | ⚠️ yellow "!" | "Rate limited. Will retry in X seconds." | Exponential backoff (2s, 4s, 8s, max 3 retries) |
| Network error | ⚠️ yellow "!" | "Network error. Click to retry." | Manual retry button |
| Malformed LLM response | ⚠️ yellow "?" | "Couldn't parse response. Click to retry." | Retry with stricter prompt |
| Skipped page | ➖ grey "—" | "This page is skipped (not content)" | Show skip reason |
| Extension disabled | (no badge) | "FocusOnly is paused" | Toggle to enable |

#### 5. UI

**Toolbar badge:**
- 🟢 Green = Read (score 60–100)
- 🟡 Yellow = Save (score 30–59)
- 🔴 Red = Leave (score 0–29)
- ⚪ Grey = loading, error, skipped, or disabled

**Popup (280×400px):**
- Verdict with color indicator
- Score (0–100) with visual bar
- 2 reasoning bullets
- Manual re-analyze button
- **Global on/off toggle** at top
- Link to options/settings

**Options page:**
- Profile settings (with preset selector)
- API configuration (base URL, key, model, test button)
- Skip list editor
- Simple stats: pages analyzed today, total API calls, estimated token usage
- Clear cache button

#### 6. Caching
- Cache key: `hash(url + profileHash)` where `profileHash = hash(JSON.stringify(profile))`
- Default TTL: 7 days
- Stored in `chrome.storage.local`
- Profile changes automatically invalidate all cached verdicts (new `profileHash`)
- Manual "clear cache" button in options
- Manual "re-analyze" button in popup bypasses cache for current page

#### 7. Controls
- **Global toggle** in popup — enables/disables auto-analysis
- **Domain blacklist** in settings — user can add domains to never analyze
- Extension respects the skip list + blacklist before making any API calls

---

## 📊 UX Flow

1. User installs extension
2. Sees welcome page → selects a **preset profile** (or creates custom)
3. Enters API key + optionally changes base URL/model
4. Clicks "Test Connection" to verify
5. Browses normally
6. Extension auto-analyzes active tab (if not on skip list, if enabled)
7. Badge shows color-coded verdict within ~2 seconds
8. Click popup to see score + reasoning
9. Can toggle off, re-analyze, or adjust profile at any time

---

## 📈 LLM Prompt Contract

### System Prompt
```
You are a relevance evaluator. Given a user profile and a webpage excerpt, determine how relevant the page is to the user's goals.

Respond with ONLY valid JSON, no markdown, no explanation. Use this exact format:
{"verdict":"Leave|Read|Save","score":0,"reasons":["",""]}

Scoring guide:
- 0-29 (Leave): Content is irrelevant, misaligned, or a distraction
- 30-59 (Save): Somewhat relevant, worth bookmarking but not reading now
- 60-100 (Read): Directly relevant to current goals, read now

Be decisive. When in doubt, score lower.
```

### User Message Input
```json
{
  "profile": { "role": "", "goals": [], "avoid": [], "focus": [] },
  "page": { "url": "", "domain": "", "title": "", "excerpt": "" }
}
```

### Expected Output
```json
{
  "verdict": "Leave | Read | Save",
  "score": 0,
  "reasons": ["", ""]
}
```

### LLM Call Parameters
- `temperature`: 0 (deterministic)
- `max_tokens`: 150
- `timeout`: 15 seconds (AbortController)
- Strip markdown code fences from response before parsing (handle ```json wrapping)

Response validated with Zod. On validation failure: retry once, then show error state.

---

## 📋 Manifest Permissions

```json
{
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]
}
```

> `host_permissions: <all_urls>` is needed because the user's API endpoint could be any URL (OpenAI, OpenRouter, Ollama localhost, etc.). The content script needs access to read page content for extraction. Both are justified and disclosed in the privacy section.

---

## 🔐 Privacy & Security

- All processing happens client-side
- No content or keys stored remotely
- API key only sent to the user's configured endpoint
- Page content only sent to the user's configured endpoint
- BYOK with clear guidance: "Use a restricted, low-quota API key"
- Open source for auditability
- `<all_urls>` permission justified: needed for content extraction + flexible API endpoints

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|-----|------------|
| API key exposure | Recommend restricted, low-quota keys; keys stored only in chrome.storage.sync |
| High token usage | 12k char content cap + 7-day caching + active-tab-only analysis |
| Noisy pages | Readability.js extraction + configurable skip list |
| Service worker timeout | API calls made from popup/offscreen document, not service worker |
| LLM returns bad JSON | Zod validation + strip markdown fences + 1 retry + error state |
| Rate limiting | Exponential backoff (2s/4s/8s), max 3 retries, user notification |
| Privacy concerns | Global toggle, domain blacklist, skip list; no data leaves except to user's own API |

---

## 📦 Deliverables

- Open-source Chrome extension (GitHub repo)
- Manifest V3 setup with WXT or CRXJS
- System prompt + scoring rubric
- Preset profiles (4)
- Demo video (≤5 min)

---

## 🕐 Build Plan (Realistic)

| Phase | Time | Task |
|-------|------|------|
| 1 | 1.5h | Scaffold extension (WXT + React + Tailwind + TypeScript), manifest, basic popup & options page shells |
| 2 | 1.5h | Options page: profile presets + BYOK config + connection test + skip list editor |
| 3 | 1h | Content extraction: Readability.js integration + skip list check + auto-analyze trigger |
| 4 | 1.5h | LLM integration: API call + Zod validation + error handling + retry logic |
| 5 | 1h | Popup UI: verdict display + badge colors + loading/error states + toggle |
| 6 | 0.5h | Caching: hash-based lookup + TTL + cache clear |
| 7 | 1h | Testing, bug fixes, edge cases |
| — | Separate | Demo recording + polish |

**Total: ~8 hours** (realistic for a solid MVP, not 4)
