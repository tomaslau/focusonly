const steps = [
  {
    number: '01',
    title: 'Set up in 60 seconds',
    description:
      'Install the extension. Pick a preset profile — Solo Founder, Growth Marketer, Developer, or Creator. Paste your API key. Done.',
  },
  {
    number: '02',
    title: 'Browse like normal',
    description:
      'Every page you visit is quietly analyzed in the background. The toolbar icon changes color: green, yellow, or red. No interruptions.',
  },
  {
    number: '03',
    title: 'Reclaim your attention',
    description:
      'Click the icon for a relevance score and two-line explanation. Re-analyze, tweak your profile, or skip entire domains.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 sm:py-40 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">
          How it works
        </p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 text-center mb-24 tracking-tight leading-tight">
          Three steps.<br />Zero friction.
        </h2>

        <div className="space-y-20">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-8 sm:gap-12 items-start">
              <span className="text-5xl sm:text-6xl font-bold text-gray-200 leading-none tracking-tighter flex-shrink-0 tabular-nums">
                {step.number}
              </span>
              <div className="pt-2">
                <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
