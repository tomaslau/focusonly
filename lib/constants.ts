import type { ProfilePreset, Profile, ApiConfig, Settings } from './types';

export const DEFAULT_PROFILE: Profile = {
  role: '',
  goals: [],
  avoid: [],
  focus: [],
};

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
};

export const PROFILE_PRESETS: ProfilePreset[] = [
  {
    id: 'solo-founder',
    name: 'Solo Founder',
    profile: {
      role: 'Solo Founder',
      goals: [
        'Find product-market fit',
        'Learn distribution and growth tactics',
        'Understand pricing strategies',
        'Ship faster with fewer resources',
      ],
      avoid: [
        'Enterprise sales processes',
        'VC fundraising advice',
        'Large team management',
        'Corporate strategy frameworks',
      ],
      focus: ['bootstrapping', 'indie products', 'solo business'],
    },
  },
  {
    id: 'growth-marketer',
    name: 'Growth Marketer',
    profile: {
      role: 'Growth Marketer',
      goals: [
        'Discover acquisition channels',
        'Improve conversion rates',
        'Learn analytics and attribution',
        'Understand content-led growth',
      ],
      avoid: [
        'Brand strategy theory',
        'Agency pitch decks',
        'Enterprise marketing automation',
        'Traditional advertising',
      ],
      focus: ['growth', 'SEO', 'conversion', 'analytics'],
    },
  },
  {
    id: 'indie-developer',
    name: 'Indie Developer',
    profile: {
      role: 'Indie Developer',
      goals: [
        'Ship side projects faster',
        'Learn modern developer tools',
        'Understand technical architecture patterns',
        'Build in public and grow audience',
      ],
      avoid: [
        'Management and leadership advice',
        'Team scaling processes',
        'Enterprise software procurement',
        'Corporate DevOps pipelines',
      ],
      focus: ['coding', 'dev tools', 'side projects', 'open source'],
    },
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    profile: {
      role: 'Content Creator',
      goals: [
        'Grow audience across platforms',
        'Improve writing and storytelling craft',
        'Monetize content effectively',
        'Build a personal brand',
      ],
      avoid: [
        'Corporate marketing strategies',
        'Enterprise content management',
        'Agency workflow tools',
        'B2B content syndication',
      ],
      focus: ['writing', 'audience growth', 'monetization', 'creator economy'],
    },
  },
];

export const DEFAULT_SKIP_DOMAINS: string[] = [
  // Productivity apps
  'mail.google.com',
  'calendar.google.com',
  'docs.google.com',
  'sheets.google.com',
  'drive.google.com',
  'notion.so',
  'figma.com',
  'linear.app',
  'slack.com',
  'discord.com',
  'trello.com',
  'asana.com',
  // Media/entertainment
  'youtube.com',
  'netflix.com',
  'spotify.com',
  'twitch.tv',
  // Social (not article content)
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  // Dev tools
  'github.com',
  'gitlab.com',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];

export const SKIP_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'file://',
  'edge://',
  'moz-extension://',
  'devtools://',
];

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  skipDomains: DEFAULT_SKIP_DOMAINS,
  profile: DEFAULT_PROFILE,
  apiConfig: DEFAULT_API_CONFIG,
};

export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const CONTENT_CHAR_LIMIT = 12000;
export const API_TIMEOUT_MS = 15000;
export const MAX_RETRIES = 3;

export const BADGE_COLORS = {
  read: '#22c55e',   // green
  save: '#eab308',   // yellow
  leave: '#ef4444',  // red
  loading: '#9ca3af', // grey
  error: '#9ca3af',  // grey
  skipped: '#9ca3af', // grey
} as const;
