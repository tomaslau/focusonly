import type { Verdict, CachedVerdict, Profile } from './types';
import { CACHE_TTL_MS } from './constants';

const CACHE_KEY_PREFIX = 'focusonly_cache_';

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function getCacheKey(url: string, profile: Profile): string {
  const profileHash = hashString(JSON.stringify(profile));
  const urlHash = hashString(url);
  return `${CACHE_KEY_PREFIX}${urlHash}_${profileHash}`;
}

export async function getCachedVerdict(url: string, profile: Profile): Promise<Verdict | null> {
  const key = getCacheKey(url, profile);
  const result = await chrome.storage.local.get(key);
  const cached = result[key] as CachedVerdict | undefined;

  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    await chrome.storage.local.remove(key);
    return null;
  }
  return cached.verdict;
}

export async function setCachedVerdict(url: string, profile: Profile, verdict: Verdict): Promise<void> {
  const key = getCacheKey(url, profile);
  const entry: CachedVerdict = { verdict, timestamp: Date.now(), url };
  await chrome.storage.local.set({ [key]: entry });
}

export async function clearAllCache(): Promise<void> {
  const all = await chrome.storage.local.get(null);
  const cacheKeys = Object.keys(all).filter(k => k.startsWith(CACHE_KEY_PREFIX));
  if (cacheKeys.length > 0) {
    await chrome.storage.local.remove(cacheKeys);
  }
}
