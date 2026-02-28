import { getSettings, incrementStats } from '@/lib/storage';
import { getCachedVerdict, setCachedVerdict } from '@/lib/cache';
import { evaluatePage, estimateTokens } from '@/lib/llm';
import { SKIP_URL_PREFIXES } from '@/lib/constants';
import type { PageData, VerdictStatus } from '@/lib/types';

// Track status per tab
const tabStatus = new Map<number, VerdictStatus>();
// Track last analyzed URL per tab (prevents duplicate SPA re-analysis)
const tabLastUrl = new Map<number, string>();
// Debounce timers per tab
const debounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

// Icon paths for each state
const ICON_PATHS = {
  default: { 16: 'icon/16.png', 32: 'icon/32.png', 48: 'icon/48.png', 128: 'icon/128.png' },
  read:    { 16: 'icon/read-16.png', 32: 'icon/read-32.png', 48: 'icon/read-48.png', 128: 'icon/read-128.png' },
  save:    { 16: 'icon/save-16.png', 32: 'icon/save-32.png', 48: 'icon/save-48.png', 128: 'icon/save-128.png' },
  leave:   { 16: 'icon/leave-16.png', 32: 'icon/leave-32.png', 48: 'icon/leave-48.png', 128: 'icon/leave-128.png' },
  grey:    { 16: 'icon/grey-16.png', 32: 'icon/grey-32.png', 48: 'icon/grey-48.png', 128: 'icon/grey-128.png' },
} as const;

export default defineBackground(() => {
  // --- Icon + badge setup ---
  function updateBadge(tabId: number, status: VerdictStatus) {
    tabStatus.set(tabId, status);
    // Clear text badge — we use icon swaps instead
    chrome.action.setBadgeText({ text: '', tabId });

    switch (status.type) {
      case 'loading':
        chrome.action.setIcon({ path: ICON_PATHS.grey, tabId });
        chrome.action.setBadgeText({ text: '...', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#9ca3af', tabId });
        break;
      case 'success': {
        const v = status.verdict;
        const iconKey = v.verdict === 'Read' ? 'read' : v.verdict === 'Save' ? 'save' : 'leave';
        chrome.action.setIcon({ path: ICON_PATHS[iconKey], tabId });
        break;
      }
      case 'error':
        chrome.action.setIcon({ path: ICON_PATHS.grey, tabId });
        break;
      case 'skipped':
        chrome.action.setIcon({ path: ICON_PATHS.grey, tabId });
        break;
      case 'disabled':
      case 'idle':
        chrome.action.setIcon({ path: ICON_PATHS.default, tabId });
        break;
    }
  }

  // --- Skip check ---
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

  // --- Core analyze function ---
  async function analyzeTab(tabId: number, forceReanalyze = false) {
    const settings = await getSettings();

    if (!settings.enabled) {
      updateBadge(tabId, { type: 'disabled' });
      return;
    }

    if (!settings.apiConfig.apiKey) {
      updateBadge(tabId, { type: 'error', message: 'Set up your API key in settings.' });
      return;
    }

    // Get current tab URL
    let tab: chrome.tabs.Tab;
    try {
      tab = await chrome.tabs.get(tabId);
    } catch {
      return; // Tab doesn't exist
    }

    const url = tab.url || '';

    // Skip if URL hasn't changed (unless force reanalyze)
    if (!forceReanalyze && tabLastUrl.get(tabId) === url) {
      return;
    }

    let domain: string;
    try {
      domain = new URL(url).hostname || '';
    } catch {
      updateBadge(tabId, { type: 'skipped', reason: 'Invalid URL' });
      return;
    }

    // Check skip list
    const skipReason = shouldSkip(url, domain, settings.skipDomains);
    if (skipReason) {
      updateBadge(tabId, { type: 'skipped', reason: skipReason });
      return;
    }

    // Check cache (unless force reanalyze)
    if (!forceReanalyze) {
      const cached = await getCachedVerdict(url, settings.profile);
      if (cached) {
        updateBadge(tabId, { type: 'success', verdict: cached });
        return;
      }
    }

    // Show loading
    updateBadge(tabId, { type: 'loading' });

    try {
      // Extract content via content script (already injected via manifest)
      let pageData: PageData;
      try {
        pageData = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_CONTENT' });
      } catch {
        // Content script may not be loaded yet — try injecting it
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content-scripts/content.js'],
          });
          pageData = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_CONTENT' });
        } catch {
          updateBadge(tabId, { type: 'error', message: 'Could not extract page content.' });
          return;
        }
      }

      if (!pageData?.excerpt || pageData.excerpt.length < 50) {
        updateBadge(tabId, { type: 'skipped', reason: 'Not enough content to analyze.' });
        return;
      }

      // Call LLM
      const verdict = await evaluatePage(settings.apiConfig, settings.profile, pageData);

      // Cache result
      await setCachedVerdict(url, settings.profile, verdict);

      // Track stats
      const tokens = estimateTokens(pageData.excerpt) + 200; // ~200 for system prompt + response
      await incrementStats(tokens);

      tabLastUrl.set(tabId, url);
      updateBadge(tabId, { type: 'success', verdict });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Analysis failed.';
      updateBadge(tabId, { type: 'error', message });
    }
  }

  // --- Debounced analyze ---
  function debouncedAnalyze(tabId: number) {
    const existing = debounceTimers.get(tabId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      debounceTimers.delete(tabId);
      analyzeTab(tabId);
    }, 2000);
    debounceTimers.set(tabId, timer);
  }

  // --- Tab event listeners ---

  // Page finished loading
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      debouncedAnalyze(tabId);
    }
  });

  // User switched tabs
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    const existing = tabStatus.get(tabId);
    if (!existing || existing.type === 'idle') {
      debouncedAnalyze(tabId);
    }
  });

  // SPA navigation
  chrome.webNavigation?.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId === 0) {
      debouncedAnalyze(details.tabId);
    }
  });

  // Clean up when tab closes
  chrome.tabs.onRemoved.addListener((tabId) => {
    tabStatus.delete(tabId);
    tabLastUrl.delete(tabId);
    const timer = debounceTimers.get(tabId);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.delete(tabId);
    }
  });

  // --- Message handler for popup ---
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_STATUS') {
      chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          const status = tabStatus.get(tabId) ?? { type: 'idle' as const };
          sendResponse(status);
        } else {
          sendResponse({ type: 'idle' });
        }
      });
      return true;
    }

    if (message.type === 'ANALYZE_PAGE' || message.type === 'REANALYZE_PAGE') {
      chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          analyzeTab(tabId, message.type === 'REANALYZE_PAGE').then(() => {
            const status = tabStatus.get(tabId) ?? { type: 'idle' as const };
            sendResponse(status);
          });
        }
      });
      return true;
    }

    if (message.type === 'TOGGLE_ENABLED') {
      getSettings().then(async settings => {
        settings.enabled = message.enabled;
        const { saveSettings } = await import('@/lib/storage');
        await saveSettings(settings);

        // Update all tabs
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id) {
            if (!message.enabled) {
              updateBadge(tab.id, { type: 'disabled' });
            } else {
              tabStatus.delete(tab.id);
              updateBadge(tab.id, { type: 'idle' });
            }
          }
        }
        sendResponse({ ok: true });
      });
      return true;
    }

    return false;
  });
});
