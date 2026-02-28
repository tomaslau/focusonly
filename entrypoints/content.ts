import { Readability } from '@mozilla/readability';
import { CONTENT_CHAR_LIMIT } from '@/lib/constants';
import type { PageData } from '@/lib/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    // Listen for extraction requests from the background script
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'EXTRACT_CONTENT') {
        const data = extractPageContent();
        sendResponse(data);
      }
      return true; // keep channel open for async response
    });
  },
});

function extractPageContent(): PageData {
  const url = window.location.href;
  const domain = window.location.hostname;
  const title = document.title || '';

  let excerpt = '';

  try {
    // Clone the document for Readability (it modifies the DOM)
    const clone = document.cloneNode(true) as Document;
    const reader = new Readability(clone);
    const article = reader.parse();

    if (article?.textContent) {
      excerpt = article.textContent.trim();
    }
  } catch {
    // Readability failed — fall through to fallback
  }

  // Fallback: use body innerText
  if (!excerpt) {
    excerpt = document.body?.innerText?.trim() || '';
  }

  // Cap at character limit
  if (excerpt.length > CONTENT_CHAR_LIMIT) {
    excerpt = excerpt.slice(0, CONTENT_CHAR_LIMIT);
  }

  return { url, domain, title, excerpt };
}
