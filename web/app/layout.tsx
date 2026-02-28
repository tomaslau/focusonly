import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://focusonly.com'),
  title: 'FocusOnly — AI-powered relevance filter for your browser',
  description:
    'Stop wasting time on irrelevant content. FocusOnly uses AI to instantly evaluate whether a webpage is worth your time. Leave, Read, or Save — decided in seconds.',
  openGraph: {
    title: 'FocusOnly',
    description: 'AI-powered relevance filter for your browser',
    siteName: 'FocusOnly',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusOnly',
    description: 'AI-powered relevance filter for your browser',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
