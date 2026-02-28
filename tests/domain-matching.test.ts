import { describe, it, expect } from 'vitest';
import { DEFAULT_SKIP_DOMAINS, SKIP_URL_PREFIXES } from '@/lib/constants';

/**
 * Tests for the domain skip logic from background.ts:
 *
 *   function shouldSkip(url: string, domain: string, skipDomains: string[]): string | null {
 *     for (const prefix of SKIP_URL_PREFIXES) {
 *       if (url.startsWith(prefix)) return `Internal page (${prefix})`;
 *     }
 *     for (const skip of skipDomains) {
 *       if (domain === skip || domain.endsWith('.' + skip)) {
 *         return `Skipped domain: ${skip}`;
 *       }
 *     }
 *     return null;
 *   }
 *
 * We re-implement the function here to test the logic since background.ts
 * wraps it in defineBackground() which needs WXT runtime.
 */

function shouldSkip(url: string, domain: string, skipDomains: string[]): string | null {
  for (const prefix of SKIP_URL_PREFIXES) {
    if (url.startsWith(prefix)) return `Internal page (${prefix})`;
  }
  for (const skip of skipDomains) {
    if (domain === skip || domain.endsWith('.' + skip)) {
      return `Skipped domain: ${skip}`;
    }
  }
  return null;
}

describe('shouldSkip - URL prefix matching', () => {
  it('skips chrome:// URLs', () => {
    expect(shouldSkip('chrome://extensions', '', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips chrome-extension:// URLs', () => {
    expect(shouldSkip('chrome-extension://abc123/options.html', '', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips about: URLs', () => {
    expect(shouldSkip('about:blank', '', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips file:// URLs', () => {
    expect(shouldSkip('file:///Users/test/doc.html', '', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('does not skip regular https URLs', () => {
    expect(shouldSkip('https://example.com', 'example.com', [])).toBeNull();
  });

  it('does not skip regular http URLs', () => {
    expect(shouldSkip('http://example.com', 'example.com', [])).toBeNull();
  });
});

describe('shouldSkip - exact domain matching', () => {
  it('skips exact match domains', () => {
    expect(shouldSkip('https://github.com', 'github.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips mail.google.com', () => {
    expect(shouldSkip('https://mail.google.com/mail/u/0/', 'mail.google.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips localhost', () => {
    expect(shouldSkip('http://localhost:3000', 'localhost', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips 127.0.0.1', () => {
    expect(shouldSkip('http://127.0.0.1:8080', '127.0.0.1', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('does not skip non-listed domains', () => {
    expect(shouldSkip('https://blog.example.com', 'blog.example.com', DEFAULT_SKIP_DOMAINS)).toBeNull();
  });
});

describe('shouldSkip - subdomain matching', () => {
  it('skips subdomains of listed domains', () => {
    // app.slack.com should match slack.com
    expect(shouldSkip('https://app.slack.com', 'app.slack.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips deep subdomains', () => {
    // something.calendar.google.com should match calendar.google.com
    expect(shouldSkip(
      'https://something.calendar.google.com',
      'something.calendar.google.com',
      DEFAULT_SKIP_DOMAINS
    )).toBeTruthy();
  });

  it('does NOT skip domains that just contain the skip domain', () => {
    // notslack.com should NOT match slack.com
    expect(shouldSkip('https://notslack.com', 'notslack.com', DEFAULT_SKIP_DOMAINS)).toBeNull();
  });

  it('does NOT skip partial subdomain matches', () => {
    // fakegithub.com should NOT match github.com
    expect(shouldSkip('https://fakegithub.com', 'fakegithub.com', DEFAULT_SKIP_DOMAINS)).toBeNull();
  });

  it('handles www prefix correctly', () => {
    // www.github.com should match github.com via subdomain logic
    expect(shouldSkip('https://www.github.com', 'www.github.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });
});

describe('shouldSkip - edge cases', () => {
  it('handles empty domain', () => {
    expect(shouldSkip('https://', '', DEFAULT_SKIP_DOMAINS)).toBeNull();
  });

  it('handles empty skip list', () => {
    expect(shouldSkip('https://github.com', 'github.com', [])).toBeNull();
  });

  it('handles empty URL with valid domain', () => {
    expect(shouldSkip('', 'github.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('does not skip google.com itself (only subdomains like mail.google.com)', () => {
    // google.com is NOT in the skip list, only mail.google.com, docs.google.com, etc.
    expect(shouldSkip('https://google.com', 'google.com', DEFAULT_SKIP_DOMAINS)).toBeNull();
  });

  it('skips youtube.com and its subdomains', () => {
    expect(shouldSkip('https://youtube.com', 'youtube.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
    expect(shouldSkip('https://www.youtube.com', 'www.youtube.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
    expect(shouldSkip('https://m.youtube.com', 'm.youtube.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });
});

describe('URL construction edge cases', () => {
  it('new URL() throws on invalid URLs', () => {
    // This tests a potential crash in background.ts line 97:
    // const domain = new URL(url).hostname || '';
    expect(() => new URL('')).toThrow();
    expect(() => new URL('not-a-url')).toThrow();
  });

  it('new URL() handles URLs without protocol', () => {
    // If tab.url is somehow just "example.com", URL constructor will throw
    expect(() => new URL('example.com')).toThrow();
  });

  it('new URL() correctly extracts hostname', () => {
    expect(new URL('https://mail.google.com/mail/u/0/').hostname).toBe('mail.google.com');
    expect(new URL('http://localhost:3000/path').hostname).toBe('localhost');
    expect(new URL('https://example.com:443/page?q=test#hash').hostname).toBe('example.com');
  });

  it('URL with empty path still has valid hostname', () => {
    expect(new URL('https://example.com').hostname).toBe('example.com');
  });
});

describe('Social domains in skip list', () => {
  it('skips twitter.com and x.com', () => {
    expect(shouldSkip('https://twitter.com', 'twitter.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
    expect(shouldSkip('https://x.com', 'x.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips twitter/x subdomains', () => {
    expect(shouldSkip('https://mobile.twitter.com', 'mobile.twitter.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('skips reddit.com', () => {
    expect(shouldSkip('https://reddit.com', 'reddit.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
    expect(shouldSkip('https://www.reddit.com', 'www.reddit.com', DEFAULT_SKIP_DOMAINS)).toBeTruthy();
  });

  it('does NOT skip LinkedIn (articles can be relevant)', () => {
    expect(shouldSkip('https://linkedin.com', 'linkedin.com', DEFAULT_SKIP_DOMAINS)).toBeNull();
  });
});
