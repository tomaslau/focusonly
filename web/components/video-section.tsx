export default function VideoSection() {
  return (
    <section className="py-32 sm:py-40 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">
          See it in action
        </p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 text-center mb-6 tracking-tight leading-tight">
          60 seconds.
          <br />
          That&apos;s all it takes.
        </h2>
        <p className="text-lg text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Watch FocusOnly evaluate real pages against a real profile — and deliver an instant verdict.
        </p>

        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          <video
            src="/video/demo.mp4"
            controls
            playsInline
            preload="metadata"
            className="w-full block"
            style={{ aspectRatio: '16/9' }}
          />
        </div>
      </div>
    </section>
  );
}
