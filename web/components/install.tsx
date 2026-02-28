import { DOWNLOAD_URL } from '@/lib/config';

const steps = [
  {
    number: '1',
    title: 'Download & unzip',
    description: 'Download focusonly.zip and unzip it anywhere on your computer.',
  },
  {
    number: '2',
    title: 'Open Chrome extensions',
    description: 'Go to chrome://extensions and enable "Developer mode" in the top right.',
  },
  {
    number: '3',
    title: 'Load the extension',
    description: 'Click "Load unpacked" and select the unzipped dist folder.',
  },
];

export default function Install() {
  return (
    <section id="install" className="py-32 sm:py-40 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">
          Early access
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-6 tracking-tight leading-tight">
          Install in 30 seconds.
        </h2>
        <p className="text-lg text-gray-400 text-center mb-20 max-w-md mx-auto">
          Chrome Web Store listing coming soon. For now, load it manually.
        </p>

        <div className="space-y-16">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-8 sm:gap-12 items-start">
              <span className="text-5xl sm:text-6xl font-bold text-gray-200 leading-none tracking-tighter flex-shrink-0 tabular-nums">
                {step.number}
              </span>
              <div className="pt-2">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed">
                  {step.description}
                </p>
                {step.number === '2' && (
                  <code className="inline-block mt-3 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                    chrome://extensions
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white font-semibold text-sm rounded-full hover:bg-gray-800 transition-colors"
          >
            Download focusonly.zip
          </a>
        </div>
      </div>
    </section>
  );
}
