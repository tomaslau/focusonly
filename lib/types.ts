import { z } from 'zod';

// --- Profile ---

export interface Profile {
  role: string;
  goals: string[];
  avoid: string[];
  focus: string[];
}

export interface ProfilePreset {
  id: string;
  name: string;
  profile: Profile;
}

// --- API Config ---

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

// --- Settings ---

export interface Settings {
  enabled: boolean;
  skipDomains: string[];
  profile: Profile;
  apiConfig: ApiConfig;
}

// --- Verdict ---

export const VerdictSchema = z.object({
  verdict: z.enum(['Leave', 'Read', 'Save']),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()).max(3),
});

export type Verdict = z.infer<typeof VerdictSchema>;

export type VerdictStatus =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; verdict: Verdict }
  | { type: 'error'; message: string }
  | { type: 'skipped'; reason: string }
  | { type: 'disabled' };

// --- Cache ---

export interface CachedVerdict {
  verdict: Verdict;
  timestamp: number;
  url: string;
}

// --- Messages ---

export type Message =
  | { type: 'GET_STATUS' }
  | { type: 'ANALYZE_PAGE' }
  | { type: 'REANALYZE_PAGE' }
  | { type: 'TOGGLE_ENABLED'; enabled: boolean }
  | { type: 'STATUS_UPDATE'; status: VerdictStatus };

// --- Page Data ---

export interface PageData {
  url: string;
  domain: string;
  title: string;
  excerpt: string;
}

// --- Stats ---

export interface Stats {
  pagesAnalyzed: number;
  apiCalls: number;
  tokensEstimated: number;
}
