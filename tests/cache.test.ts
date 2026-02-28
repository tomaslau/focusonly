import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCacheKey } from '@/lib/cache';
import type { Profile } from '@/lib/types';

// We can only test getCacheKey without chrome.storage mock
// The async functions (getCachedVerdict, setCachedVerdict, clearAllCache)
// require chrome.storage.local which doesn't exist in Node

const profile1: Profile = {
  role: 'Solo Founder',
  goals: ['Find PMF'],
  avoid: ['Enterprise'],
  focus: ['bootstrapping'],
};

const profile2: Profile = {
  role: 'Growth Marketer',
  goals: ['Grow traffic'],
  avoid: ['Brand theory'],
  focus: ['SEO'],
};

describe('getCacheKey', () => {
  it('returns a string', () => {
    const key = getCacheKey('https://example.com', profile1);
    expect(typeof key).toBe('string');
  });

  it('starts with focusonly_cache_ prefix', () => {
    const key = getCacheKey('https://example.com', profile1);
    expect(key).toMatch(/^focusonly_cache_/);
  });

  it('same URL + same profile = same key', () => {
    const key1 = getCacheKey('https://example.com', profile1);
    const key2 = getCacheKey('https://example.com', { ...profile1 });
    expect(key1).toBe(key2);
  });

  it('different URLs = different keys', () => {
    const key1 = getCacheKey('https://example.com/a', profile1);
    const key2 = getCacheKey('https://example.com/b', profile1);
    expect(key1).not.toBe(key2);
  });

  it('different profiles = different keys', () => {
    const key1 = getCacheKey('https://example.com', profile1);
    const key2 = getCacheKey('https://example.com', profile2);
    expect(key1).not.toBe(key2);
  });

  it('handles empty URL', () => {
    const key = getCacheKey('', profile1);
    expect(key).toMatch(/^focusonly_cache_/);
  });

  it('handles very long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(10000);
    const key = getCacheKey(longUrl, profile1);
    // Key should still be reasonably short (hashed)
    expect(key.length).toBeLessThan(100);
  });

  it('handles special characters in URL', () => {
    const key = getCacheKey('https://example.com/page?q=hello&lang=en#section', profile1);
    expect(key).toMatch(/^focusonly_cache_/);
  });

  it('is deterministic (same input → same output)', () => {
    const results = Array.from({ length: 10 }, () =>
      getCacheKey('https://example.com', profile1)
    );
    expect(new Set(results).size).toBe(1);
  });

  it('handles profile with empty arrays', () => {
    const emptyProfile: Profile = { role: '', goals: [], avoid: [], focus: [] };
    const key = getCacheKey('https://example.com', emptyProfile);
    expect(key).toMatch(/^focusonly_cache_/);
  });

  it('same key for profile with reordered goals', () => {
    const profile1a: Profile = { role: 'Dev', goals: ['A', 'B'], avoid: [], focus: [] };
    const profile1b: Profile = { role: 'Dev', goals: ['B', 'A'], avoid: [], focus: [] };
    const key1 = getCacheKey('https://example.com', profile1a);
    const key2 = getCacheKey('https://example.com', profile1b);
    // Arrays are sorted before hashing, so reordering doesn't invalidate cache
    expect(key1).toBe(key2);
  });

  it('same key for reordered avoid and focus arrays', () => {
    const a: Profile = { role: 'Dev', goals: [], avoid: ['X', 'Y'], focus: ['1', '2'] };
    const b: Profile = { role: 'Dev', goals: [], avoid: ['Y', 'X'], focus: ['2', '1'] };
    expect(getCacheKey('https://example.com', a)).toBe(getCacheKey('https://example.com', b));
  });
});

describe('Cache key collision resistance', () => {
  it('similar URLs produce different keys', () => {
    const urls = [
      'https://example.com/a',
      'https://example.com/b',
      'https://example.com/ab',
      'https://example.com/ba',
      'https://example.com/aa',
    ];
    const keys = urls.map(u => getCacheKey(u, profile1));
    expect(new Set(keys).size).toBe(urls.length);
  });

  it('hash function handles unicode', () => {
    const key1 = getCacheKey('https://example.com/日本語', profile1);
    const key2 = getCacheKey('https://example.com/中文', profile1);
    expect(key1).not.toBe(key2);
  });
});
