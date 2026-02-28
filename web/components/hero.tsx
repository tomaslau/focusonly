import ChromeIcon from '@/components/chrome-icon';
import GithubIcon from '@/components/github-icon';
import { DOWNLOAD_URL, GITHUB_URL } from '@/lib/config';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-black overflow-hidden">
      {/* Subtle radial glow behind the popup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[120px]" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-10 py-6 z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🚥</span>
          <span className="text-white font-semibold text-lg tracking-tight">FocusOnly</span>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-white transition-colors"
        >
          <GithubIcon size={20} />
        </a>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase mb-6">
          AI-powered browsing filter
        </p>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight">
          Know what to read
          <br />
          <span className="text-green-400">before you read it</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
          FocusOnly uses AI to instantly score every page you visit.
          One glance at the toolbar tells you: leave, read, or save for later.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center justify-center gap-2.5 h-14 px-10 bg-white text-black font-semibold text-base rounded-full hover:bg-white/90 transition-colors"
          >
            <ChromeIcon size={20} />
            Download for Chrome
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 h-14 px-10 border border-white/20 text-white font-medium text-base rounded-full hover:border-white/40 transition-colors"
          >
            <GithubIcon size={18} />
            View Source
          </a>
        </div>

        <p className="text-white/30 text-xs mb-20">
          Early access — requires{' '}
          <a href="#install" className="underline hover:text-white/50 transition-colors">
            manual install
          </a>{' '}
          in developer mode
        </p>

        {/* Floating popup mock with glassmorphism */}
        <div className="mx-auto w-80 rounded-2xl glass glow-green border border-white/10 text-left overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm">🚥</span>
              <span className="font-semibold text-sm text-gray-900">FocusOnly</span>
            </div>
            <div className="w-9 h-5 rounded-full bg-green-500 relative">
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
          <div className="px-5 py-5">
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-bold text-xl text-green-700">Read</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: '82%' }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-700">82</span>
                </div>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[13px] text-gray-600">
                <span className="text-green-400 mt-px">&#x2713;</span>
                Directly relevant to your solo founder goals
              </li>
              <li className="flex items-start gap-2 text-[13px] text-gray-600">
                <span className="text-green-400 mt-px">&#x2713;</span>
                Covers distribution tactics you wanted to learn
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
