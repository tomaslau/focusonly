import GithubIcon from '@/components/github-icon';
import { GITHUB_URL } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          FocusOnly — Free &amp; Open Source
        </p>
        <a
          href={GITHUB_URL}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon size={16} />
          GitHub
        </a>
      </div>
    </footer>
  );
}
