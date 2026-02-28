import type { Settings, Stats } from './types';
import { DEFAULT_SETTINGS } from './constants';

const SETTINGS_KEY = 'focusonly_settings';
const STATS_KEY = 'focusonly_stats';

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(SETTINGS_KEY);
  if (!result[SETTINGS_KEY]) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
}

export async function getStats(): Promise<Stats> {
  const result = await chrome.storage.local.get(STATS_KEY);
  const stats = result[STATS_KEY] as Stats | undefined;
  return stats ?? { pagesAnalyzed: 0, apiCalls: 0, tokensEstimated: 0 };
}

export async function incrementStats(tokensUsed: number): Promise<void> {
  const stats = await getStats();
  stats.pagesAnalyzed += 1;
  stats.apiCalls += 1;
  stats.tokensEstimated += tokensUsed;
  await chrome.storage.local.set({ [STATS_KEY]: stats });
}

export async function resetStats(): Promise<void> {
  await chrome.storage.local.set({ [STATS_KEY]: { pagesAnalyzed: 0, apiCalls: 0, tokensEstimated: 0 } });
}
