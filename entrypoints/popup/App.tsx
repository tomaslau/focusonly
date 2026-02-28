import { useState, useEffect, useCallback } from 'react';
import type { VerdictStatus } from '@/lib/types';
import { getSettings } from '@/lib/storage';

function App() {
  const [status, setStatus] = useState<VerdictStatus>({ type: 'idle' });
  const [enabled, setEnabled] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);

  const fetchStatus = useCallback(async () => {
    const settings = await getSettings();
    setEnabled(settings.enabled);
    setHasApiKey(!!settings.apiConfig.apiKey);

    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    if (response) setStatus(response);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleToggle = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    await chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled: newEnabled });
    if (newEnabled) {
      setStatus({ type: 'loading' });
      const response = await chrome.runtime.sendMessage({ type: 'ANALYZE_PAGE' });
      if (response) setStatus(response);
    }
  };

  const handleReanalyze = async () => {
    setStatus({ type: 'loading' });
    const response = await chrome.runtime.sendMessage({ type: 'REANALYZE_PAGE' });
    if (response) setStatus(response);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-72 bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚥</span>
          <span className="font-semibold text-sm">FocusOnly</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={enabled ? 'Disable' : 'Enable'}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <button
            onClick={openOptions}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {!enabled && <DisabledState />}
        {enabled && !hasApiKey && <NoApiKeyState onOpenSettings={openOptions} />}
        {enabled && hasApiKey && status.type === 'idle' && <IdleState />}
        {enabled && hasApiKey && status.type === 'loading' && <LoadingState />}
        {enabled && hasApiKey && status.type === 'success' && (
          <VerdictDisplay verdict={status.verdict} onReanalyze={handleReanalyze} />
        )}
        {enabled && hasApiKey && status.type === 'error' && (
          <ErrorState message={status.message} onRetry={handleReanalyze} onOpenSettings={openOptions} />
        )}
        {enabled && hasApiKey && status.type === 'skipped' && (
          <SkippedState reason={status.reason} />
        )}
      </div>
    </div>
  );
}

function DisabledState() {
  return (
    <div className="text-center py-4">
      <p className="text-gray-400 text-sm">FocusOnly is paused</p>
      <p className="text-gray-300 text-xs mt-1">Toggle the switch to enable</p>
    </div>
  );
}

function NoApiKeyState({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="text-center py-4">
      <p className="text-gray-500 text-sm mb-2">No API key configured</p>
      <button
        onClick={onOpenSettings}
        className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Set up in Settings
      </button>
    </div>
  );
}

function IdleState() {
  return (
    <div className="text-center py-4">
      <p className="text-gray-400 text-sm">Navigate to a page to analyze</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-6">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
      <p className="text-gray-400 text-sm mt-3">Analyzing page...</p>
    </div>
  );
}

function VerdictDisplay({ verdict, onReanalyze }: { verdict: { verdict: string; score: number; reasons: string[] }; onReanalyze: () => void }) {
  const config = {
    Read: { color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', label: 'Read', emoji: '🟢' },
    Save: { color: 'bg-yellow-400', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', label: 'Save', emoji: '🟡' },
    Leave: { color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', label: 'Leave', emoji: '🔴' },
  }[verdict.verdict] ?? { color: 'bg-gray-400', textColor: 'text-gray-700', bgLight: 'bg-gray-50', label: verdict.verdict, emoji: '⚪' };

  return (
    <div>
      {/* Verdict header */}
      <div className={`${config.bgLight} rounded-lg p-3 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.emoji}</span>
            <span className={`font-bold text-lg ${config.textColor}`}>{config.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${config.color} rounded-full`} style={{ width: `${verdict.score}%` }} />
            </div>
            <span className={`text-sm font-semibold ${config.textColor}`}>{verdict.score}</span>
          </div>
        </div>
      </div>

      {/* Reasons */}
      {verdict.reasons.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {verdict.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-gray-300 mt-0.5">&#8226;</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Re-analyze */}
      <button
        onClick={onReanalyze}
        className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors cursor-pointer"
      >
        Re-analyze this page
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry, onOpenSettings }: { message: string; onRetry: () => void; onOpenSettings: () => void }) {
  const isKeyError = message.includes('API key') || message.includes('401');

  return (
    <div className="text-center py-3">
      <p className="text-red-500 text-sm mb-2">{message}</p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Retry
        </button>
        {isKeyError && (
          <button
            onClick={onOpenSettings}
            className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Settings
          </button>
        )}
      </div>
    </div>
  );
}

function SkippedState({ reason }: { reason: string }) {
  return (
    <div className="text-center py-4">
      <p className="text-gray-400 text-sm">Page skipped</p>
      <p className="text-gray-300 text-xs mt-1">{reason}</p>
    </div>
  );
}

export default App;
