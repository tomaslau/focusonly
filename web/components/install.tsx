import { DOWNLOAD_URL } from '@/lib/config';

/* ---------- Mock: chrome://extensions toolbar ---------- */
function ExtensionsMock() {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Chrome toolbar */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
          <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-500 font-mono">
            chrome://extensions
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 font-medium">Developer mode</span>
          <div className="w-8 h-4.5 rounded-full bg-blue-500 relative">
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>
      {/* Toolbar buttons */}
      <div className="px-4 py-3 flex gap-3 border-b border-gray-100">
        <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">Load unpacked</span>
        <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs rounded-md">Pack extension</span>
        <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs rounded-md">Update</span>
      </div>
      {/* Extension card */}
      <div className="px-4 py-4 flex items-center gap-4">
        <span className="text-2xl">🚥</span>
        <div>
          <p className="text-sm font-semibold text-gray-900">FocusOnly</p>
          <p className="text-xs text-gray-400">AI-powered webpage relevance evaluator</p>
        </div>
        <div className="ml-auto w-8 h-4.5 rounded-full bg-blue-500 relative">
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Mock: Options page — API tab ---------- */
function OptionsMock() {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Tab bar */}
      <div className="bg-gray-50 px-4 pt-4 flex gap-1 border-b border-gray-200">
        <span className="px-3 py-2 text-xs text-gray-400 rounded-t-md">Profile</span>
        <span className="px-3 py-2 text-xs font-semibold text-gray-900 bg-white border border-b-0 border-gray-200 rounded-t-md -mb-px">API</span>
        <span className="px-3 py-2 text-xs text-gray-400 rounded-t-md">Skip List</span>
        <span className="px-3 py-2 text-xs text-gray-400 rounded-t-md">Stats</span>
      </div>
      <div className="p-5 space-y-5">
        {/* API Endpoint */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">API Endpoint</label>
          <div className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-400 font-mono">
            https://api.openai.com/v1
          </div>
        </div>
        {/* API Key */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">API Key</label>
          <div className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono flex items-center justify-between">
            <span className="text-gray-900">sk-proj-••••••••••••</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Stored locally. Use a restricted, low-quota key.</p>
        </div>
        {/* Model */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Model</label>
          <div className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 font-mono">
            gpt-4o-mini — balanced ($0.15/1M in)
          </div>
        </div>
        {/* Test button */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg">Test Connection</span>
          <span className="text-xs text-green-600 font-medium">Connection successful!</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mock: Popup verdict ---------- */
function VerdictMock() {
  return (
    <div className="mt-6 mx-auto w-72 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm">🚥</span>
          <span className="font-semibold text-sm text-gray-900">FocusOnly</span>
        </div>
        <div className="w-8 h-4.5 rounded-full bg-green-500 relative">
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="bg-green-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="font-bold text-lg text-green-700">Read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-14 h-1.5 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }} />
              </div>
              <span className="text-xs font-bold text-green-700">82</span>
            </div>
          </div>
        </div>
        <ul className="space-y-1">
          <li className="flex items-start gap-1.5 text-[11px] text-gray-600">
            <span className="text-green-400 mt-px">&#x2713;</span>
            Relevant to your solo founder goals
          </li>
          <li className="flex items-start gap-1.5 text-[11px] text-gray-600">
            <span className="text-green-400 mt-px">&#x2713;</span>
            Covers distribution tactics you need
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- Main Install Section ---------- */
export default function Install() {
  return (
    <section id="install" className="py-32 sm:py-40 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">
          Get started
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-6 tracking-tight leading-tight">
          Up and running in 2 minutes.
        </h2>
        <p className="text-lg text-gray-400 text-center mb-20 max-w-lg mx-auto">
          Chrome Web Store listing coming soon. For now, load it in developer mode.
        </p>

        <div className="space-y-20">
          {/* Step 1 */}
          <div className="flex gap-8 sm:gap-12 items-start">
            <span className="text-5xl sm:text-6xl font-bold text-gray-200 leading-none tracking-tighter flex-shrink-0 tabular-nums">1</span>
            <div className="pt-2 flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Download &amp; unzip</h3>
              <p className="text-gray-500 text-base leading-relaxed">
                Download the extension zip and unzip it anywhere on your computer.
              </p>
              <a
                href={DOWNLOAD_URL}
                className="inline-flex items-center justify-center mt-4 h-10 px-5 bg-gray-900 text-white font-medium text-sm rounded-full hover:bg-gray-800 transition-colors"
              >
                Download focusonly.zip
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-8 sm:gap-12 items-start">
            <span className="text-5xl sm:text-6xl font-bold text-gray-200 leading-none tracking-tighter flex-shrink-0 tabular-nums">2</span>
            <div className="pt-2 flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Load in Chrome</h3>
              <p className="text-gray-500 text-base leading-relaxed">
                Open <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-gray-600">chrome://extensions</code>, enable <strong>Developer mode</strong> (top right), then click <strong>Load unpacked</strong> and select the unzipped <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-gray-600">dist</code> folder.
              </p>
              <ExtensionsMock />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-8 sm:gap-12 items-start">
            <span className="text-5xl sm:text-6xl font-bold text-gray-200 leading-none tracking-tighter flex-shrink-0 tabular-nums">3</span>
            <div className="pt-2 flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Add your API key</h3>
              <p className="text-gray-500 text-base leading-relaxed">
                Right-click the 🚥 icon in your toolbar and choose <strong>Options</strong>. Go to the <strong>API</strong> tab, paste your OpenAI API key, and hit <strong>Test Connection</strong>.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Don&apos;t have an API key? Get one at{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 transition-colors">
                  platform.openai.com/api-keys
                </a>
              </p>
              <OptionsMock />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-8 sm:gap-12 items-start">
            <span className="text-5xl sm:text-6xl font-bold text-gray-200 leading-none tracking-tighter flex-shrink-0 tabular-nums">4</span>
            <div className="pt-2 flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Pick a profile &amp; browse</h3>
              <p className="text-gray-500 text-base leading-relaxed">
                Switch to the <strong>Profile</strong> tab and pick a preset — Solo Founder, Growth Marketer, Developer, or Creator. Customize your goals if you like, then visit any page. Click the toolbar icon to see your verdict.
              </p>
              <VerdictMock />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
