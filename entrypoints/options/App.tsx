import { useState, useEffect } from 'react';
import type { Settings, Profile, ApiConfig, Stats } from '@/lib/types';
import { getSettings, saveSettings, getStats, resetStats } from '@/lib/storage';
import { clearAllCache } from '@/lib/cache';
import { testConnection } from '@/lib/llm';
import { PROFILE_PRESETS, DEFAULT_SETTINGS } from '@/lib/constants';

type Tab = 'profile' | 'api' | 'skiplist' | 'stats';

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>({ pagesAnalyzed: 0, apiCalls: 0, tokensEstimated: 0 });
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
    getStats().then(setStats);
  }, []);

  const save = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (updates: Partial<Profile>) => {
    save({ ...settings, profile: { ...settings.profile, ...updates } });
  };

  const updateApiConfig = (updates: Partial<ApiConfig>) => {
    save({ ...settings, apiConfig: { ...settings.apiConfig, ...updates } });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection(settings.apiConfig);
    setTestResult(result);
    setTesting(false);
  };

  const handleClearCache = async () => {
    await clearAllCache();
    alert('Cache cleared.');
  };

  const handleResetStats = async () => {
    await resetStats();
    setStats({ pagesAnalyzed: 0, apiCalls: 0, tokensEstimated: 0 });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'api', label: 'API' },
    { id: 'skiplist', label: 'Skip List' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🚥</span>
          <h1 className="text-xl font-bold text-gray-900">FocusOnly Settings</h1>
          {saved && (
            <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Saved</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-sm py-2 px-3 rounded-md transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'profile' && (
          <ProfileTab
            profile={settings.profile}
            onUpdate={updateProfile}
          />
        )}
        {activeTab === 'api' && (
          <ApiTab
            apiConfig={settings.apiConfig}
            onUpdate={updateApiConfig}
            onTest={handleTest}
            testing={testing}
            testResult={testResult}
          />
        )}
        {activeTab === 'skiplist' && (
          <SkipListTab
            skipDomains={settings.skipDomains}
            onUpdate={(skipDomains) => save({ ...settings, skipDomains })}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab
            stats={stats}
            onClearCache={handleClearCache}
            onResetStats={handleResetStats}
          />
        )}
      </div>
    </div>
  );
}

// --- Profile Tab ---

function ProfileTab({ profile, onUpdate }: { profile: Profile; onUpdate: (u: Partial<Profile>) => void }) {
  const [newGoal, setNewGoal] = useState('');
  const [newAvoid, setNewAvoid] = useState('');
  const [newFocus, setNewFocus] = useState('');

  const applyPreset = (presetId: string) => {
    const preset = PROFILE_PRESETS.find(p => p.id === presetId);
    if (preset) onUpdate(preset.profile);
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Section title="Quick Start — Choose a Preset">
        <div className="grid grid-cols-2 gap-2">
          {PROFILE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="font-medium text-sm text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{preset.profile.goals[0]}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Role */}
      <Section title="Your Role">
        <input
          type="text"
          value={profile.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          placeholder="e.g. Solo Founder, Growth Marketer"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Section>

      {/* Goals */}
      <Section title="Goals (what you want to learn)">
        <TagList
          items={profile.goals}
          onRemove={(i) => onUpdate({ goals: profile.goals.filter((_, idx) => idx !== i) })}
          color="green"
        />
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newGoal.trim()) {
                onUpdate({ goals: [...profile.goals, newGoal.trim()] });
                setNewGoal('');
              }
            }}
            placeholder="Add a goal..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (newGoal.trim()) {
                onUpdate({ goals: [...profile.goals, newGoal.trim()] });
                setNewGoal('');
              }
            }}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 cursor-pointer"
          >
            Add
          </button>
        </div>
      </Section>

      {/* Avoidances */}
      <Section title="Avoid (topics to filter out)">
        <TagList
          items={profile.avoid}
          onRemove={(i) => onUpdate({ avoid: profile.avoid.filter((_, idx) => idx !== i) })}
          color="red"
        />
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newAvoid}
            onChange={(e) => setNewAvoid(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newAvoid.trim()) {
                onUpdate({ avoid: [...profile.avoid, newAvoid.trim()] });
                setNewAvoid('');
              }
            }}
            placeholder="Add a topic to avoid..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (newAvoid.trim()) {
                onUpdate({ avoid: [...profile.avoid, newAvoid.trim()] });
                setNewAvoid('');
              }
            }}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 cursor-pointer"
          >
            Add
          </button>
        </div>
      </Section>

      {/* Focus Topics */}
      <Section title="Focus Topics (current interests)">
        <TagList
          items={profile.focus}
          onRemove={(i) => onUpdate({ focus: profile.focus.filter((_, idx) => idx !== i) })}
          color="blue"
        />
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newFocus}
            onChange={(e) => setNewFocus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newFocus.trim()) {
                onUpdate({ focus: [...profile.focus, newFocus.trim()] });
                setNewFocus('');
              }
            }}
            placeholder="Add a focus topic..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (newFocus.trim()) {
                onUpdate({ focus: [...profile.focus, newFocus.trim()] });
                setNewFocus('');
              }
            }}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Add
          </button>
        </div>
      </Section>
    </div>
  );
}

// --- API Tab ---

const OPENAI_MODELS = [
  { group: 'Recommended', models: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini — reliable & cheap ($0.15/1M in)' },
    { id: 'gpt-5-nano', label: 'GPT-5 Nano — cheapest ($0.05/1M in)' },
    { id: 'gpt-5-mini', label: 'GPT-5 Mini — balanced ($0.25/1M in)' },
  ]},
  { group: 'More capable', models: [
    { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini ($0.40/1M in)' },
    { id: 'gpt-5', label: 'GPT-5 ($1.25/1M in)' },
    { id: 'gpt-4.1', label: 'GPT-4.1 ($2.00/1M in)' },
  ]},
];


function ApiTab({
  apiConfig,
  onUpdate,
  onTest,
  testing,
  testResult,
}: {
  apiConfig: ApiConfig;
  onUpdate: (u: Partial<ApiConfig>) => void;
  onTest: () => void;
  testing: boolean;
  testResult: { ok: boolean; error?: string } | null;
}) {
  return (
    <div className="space-y-6">
      <Section title="API Endpoint">
        <input
          type="url"
          value={apiConfig.baseUrl}
          onChange={(e) => onUpdate({ baseUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Any OpenAI-compatible endpoint (OpenRouter, Groq, Ollama, etc.)
        </p>
      </Section>

      <Section title="API Key">
        <input
          type="password"
          value={apiConfig.apiKey}
          onChange={(e) => onUpdate({ apiKey: e.target.value })}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Stored locally. Use a restricted, low-quota key.
        </p>
      </Section>

      <Section title="Model">
        <select
          value={apiConfig.model}
          onChange={(e) => onUpdate({ model: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
        >
          {OPENAI_MODELS.map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.models.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </Section>

      <div>
        <button
          onClick={onTest}
          disabled={testing || !apiConfig.apiKey}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {testResult && (
          <span className={`ml-3 text-sm ${testResult.ok ? 'text-green-600' : 'text-red-500'}`}>
            {testResult.ok ? 'Connection successful!' : testResult.error}
          </span>
        )}
      </div>
    </div>
  );
}

// --- Skip List Tab ---

function SkipListTab({
  skipDomains,
  onUpdate,
}: {
  skipDomains: string[];
  onUpdate: (domains: string[]) => void;
}) {
  const [newDomain, setNewDomain] = useState('');

  const addDomain = () => {
    const domain = newDomain.trim().toLowerCase();
    if (domain && !skipDomains.includes(domain)) {
      onUpdate([...skipDomains, domain]);
      setNewDomain('');
    }
  };

  return (
    <div className="space-y-4">
      <Section title="Skipped Domains">
        <p className="text-xs text-gray-400 mb-3">
          Pages on these domains won't be analyzed. Internal pages (chrome://, about:, etc.) are always skipped.
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addDomain(); }}
            placeholder="example.com"
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addDomain}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="space-y-1 max-h-80 overflow-y-auto">
          {skipDomains.map((domain, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm">
              <span className="text-gray-700 font-mono text-xs">{domain}</span>
              <button
                onClick={() => onUpdate(skipDomains.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-500 text-xs cursor-pointer"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// --- Stats Tab ---

function StatsTab({
  stats,
  onClearCache,
  onResetStats,
}: {
  stats: Stats;
  onClearCache: () => void;
  onResetStats: () => void;
}) {
  return (
    <div className="space-y-6">
      <Section title="Usage Statistics">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Pages Analyzed" value={stats.pagesAnalyzed} />
          <StatCard label="API Calls" value={stats.apiCalls} />
          <StatCard label="Est. Tokens" value={stats.tokensEstimated.toLocaleString()} />
        </div>
      </Section>

      <Section title="Data Management">
        <div className="flex gap-3">
          <button
            onClick={onClearCache}
            className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Clear Verdict Cache
          </button>
          <button
            onClick={onResetStats}
            className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Reset Stats
          </button>
        </div>
      </Section>
    </div>
  );
}

// --- Shared Components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function TagList({ items, onRemove, color }: { items: string[]; onRemove: (i: number) => void; color: 'green' | 'red' | 'blue' }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${colorClasses[color]}`}>
          {item}
          <button onClick={() => onRemove(i)} className="hover:opacity-70 cursor-pointer">&times;</button>
        </span>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export default App;
