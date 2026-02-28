import ChromeIcon from '@/components/chrome-icon';
import { DOWNLOAD_URL } from '@/lib/config';

export default function CTA() {
  return (
    <section className="relative py-32 sm:py-40 px-6 bg-black overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500/8 blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          Start focusing.
        </h2>
        <p className="text-lg text-white/40 mb-12 max-w-md mx-auto">
          Free. Open source. Takes less than a minute.
        </p>
        <a
          href={DOWNLOAD_URL}
          className="inline-flex items-center justify-center gap-2.5 h-14 px-10 bg-white text-black font-semibold text-base rounded-full hover:bg-white/90 transition-colors"
        >
          <ChromeIcon size={20} />
          Download for Chrome
        </a>
      </div>
    </section>
  );
}
