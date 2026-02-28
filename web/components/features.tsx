const features = [
  {
    title: 'Your key. Your data.',
    description:
      'Bring your own API key. Your browsing content is never proxied, stored, or seen by anyone. Works with OpenAI, OpenRouter, Groq, or any compatible endpoint.',
  },
  {
    title: 'Verdict in seconds.',
    description:
      'The toolbar icon changes color before you finish reading the headline. Green means read. Yellow means save. Red means leave. Cached pages are instant.',
  },
  {
    title: 'Built around you.',
    description:
      'Set your role, goals, and distractions. Every verdict is scored against your profile — not a generic productivity filter.',
  },
  {
    title: 'Nothing to trust.',
    description:
      'No server. No account. No analytics. Everything runs locally in your browser. The entire codebase is open source.',
  },
];

export default function Features() {
  return (
    <section className="py-32 sm:py-40 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">
          Why FocusOnly
        </p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 text-center mb-6 tracking-tight leading-tight">
          Privacy-first.
          <br />
          Ruthlessly simple.
        </h2>
        <p className="text-lg text-gray-400 text-center mb-20 max-w-xl mx-auto">
          Not another blocker or distraction tool.
          A signal that helps you decide in seconds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100 rounded-3xl overflow-hidden">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-10 sm:p-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                {f.title}
              </h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
