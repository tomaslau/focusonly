# FocusOnly

A goal-aware Chrome extension that evaluates any page you browse and tells you instantly whether to **Leave**, **Read**, or **Save** it — with a clear reason why.

Knowledge workers consume content that isn't aligned with their actual goals. FocusOnly compares each page against your personal profile and uses an LLM to return a relevance score and verdict in seconds. Results are cached locally so repeat visits are instant and free.

## How it works

1. You define your profile — role, goals, focus areas, and topics to avoid
2. When you visit a page, FocusOnly extracts the content using Mozilla Readability
3. It sends the content + your profile to an LLM (your API key, your choice of model)
4. You get back a score (0–100), a verdict (Leave / Read / Save), and reasons why
5. The verdict is cached locally — revisiting the same URL costs nothing

Everything runs client-side. No backend, no data collection.

## Installation

### From release (easiest)

1. Download `focusonly.zip` from the [latest release](https://github.com/tomaslau/focusonly/releases)
2. Unzip it
3. Open Chrome and go to `chrome://extensions`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the unzipped folder

### Setup

1. Click the FocusOnly icon in your toolbar
2. Go to **Settings**
3. Enter your API key and choose a model (any OpenAI-compatible endpoint works)
4. Fill in your profile — role, goals, what to focus on, what to avoid
5. Browse normally — FocusOnly runs automatically on every page

## Development

**Prerequisites:** [Bun](https://bun.sh), Node.js 18+

```bash
# Install dependencies
bun install

# Start dev server with hot reload
bun run dev

# Load the extension
# Open chrome://extensions → Enable Developer mode → Load unpacked → select .output/chrome-mv3
```

**Other commands:**

```bash
bun run build          # Production build for Chrome
bun run build:firefox  # Production build for Firefox
bun run zip            # Build + zip for distribution
bun run test           # Run test suite
bun run compile        # Type-check without building
```

## Stack

- [WXT](https://wxt.dev) — extension framework
- [React 19](https://react.dev) + [Tailwind CSS v4](https://tailwindcss.com)
- [Mozilla Readability](https://github.com/mozilla/readability) — content extraction
- [Zod v4](https://zod.dev) — LLM response validation
- [Vitest](https://vitest.dev) — testing

## Project structure

```
entrypoints/      # Extension entry points (background, content, popup, options)
lib/              # Shared logic (LLM client, types, storage, cache, constants)
tests/            # Vitest test suite
public/           # Static assets
web/              # Next.js landing page
```

## License

MIT
