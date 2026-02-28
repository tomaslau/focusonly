import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PROFILE,
  DEFAULT_API_CONFIG,
  PROFILE_PRESETS,
  DEFAULT_SKIP_DOMAINS,
  SKIP_URL_PREFIXES,
  DEFAULT_SETTINGS,
  CACHE_TTL_MS,
  CONTENT_CHAR_LIMIT,
  API_TIMEOUT_MS,
  MAX_RETRIES,
  BADGE_COLORS,
} from '@/lib/constants';

describe('DEFAULT_PROFILE', () => {
  it('has all required fields', () => {
    expect(DEFAULT_PROFILE).toHaveProperty('role');
    expect(DEFAULT_PROFILE).toHaveProperty('goals');
    expect(DEFAULT_PROFILE).toHaveProperty('avoid');
    expect(DEFAULT_PROFILE).toHaveProperty('focus');
  });

  it('has empty defaults (user must configure)', () => {
    expect(DEFAULT_PROFILE.role).toBe('');
    expect(DEFAULT_PROFILE.goals).toEqual([]);
    expect(DEFAULT_PROFILE.avoid).toEqual([]);
    expect(DEFAULT_PROFILE.focus).toEqual([]);
  });
});

describe('DEFAULT_API_CONFIG', () => {
  it('has valid base URL', () => {
    expect(DEFAULT_API_CONFIG.baseUrl).toMatch(/^https?:\/\//);
    expect(DEFAULT_API_CONFIG.baseUrl).not.toMatch(/\/$/); // no trailing slash
  });

  it('has empty API key by default (user must set)', () => {
    expect(DEFAULT_API_CONFIG.apiKey).toBe('');
  });

  it('has a valid default model', () => {
    expect(DEFAULT_API_CONFIG.model).toBeTruthy();
    expect(DEFAULT_API_CONFIG.model.length).toBeGreaterThan(0);
    // Should not contain spaces or special chars
    expect(DEFAULT_API_CONFIG.model).toMatch(/^[a-z0-9\-\.]+$/);
  });

  it('default model is not a placeholder/fake', () => {
    // These are known-valid OpenAI models
    const validModels = [
      'gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1',
      'gpt-5-nano', 'gpt-5-mini', 'gpt-5', 'gpt-5.1', 'gpt-5.2',
    ];
    expect(validModels).toContain(DEFAULT_API_CONFIG.model);
  });
});

describe('PROFILE_PRESETS', () => {
  it('has at least 2 presets', () => {
    expect(PROFILE_PRESETS.length).toBeGreaterThanOrEqual(2);
  });

  it('all presets have unique IDs', () => {
    const ids = PROFILE_PRESETS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all presets have unique names', () => {
    const names = PROFILE_PRESETS.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all presets have non-empty profiles', () => {
    for (const preset of PROFILE_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.profile.role).toBeTruthy();
      expect(preset.profile.goals.length).toBeGreaterThan(0);
      expect(preset.profile.avoid.length).toBeGreaterThan(0);
      expect(preset.profile.focus.length).toBeGreaterThan(0);
    }
  });

  it('preset IDs are kebab-case', () => {
    for (const preset of PROFILE_PRESETS) {
      expect(preset.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('goals and avoid lists do not overlap', () => {
    for (const preset of PROFILE_PRESETS) {
      const goalsLower = preset.profile.goals.map(g => g.toLowerCase());
      const avoidLower = preset.profile.avoid.map(a => a.toLowerCase());
      const overlap = goalsLower.filter(g => avoidLower.some(a => a === g));
      expect(overlap).toEqual([]);
    }
  });
});

describe('DEFAULT_SKIP_DOMAINS', () => {
  it('is a non-empty array', () => {
    expect(DEFAULT_SKIP_DOMAINS.length).toBeGreaterThan(0);
  });

  it('all domains are lowercase', () => {
    for (const domain of DEFAULT_SKIP_DOMAINS) {
      expect(domain).toBe(domain.toLowerCase());
    }
  });

  it('no duplicate domains', () => {
    expect(new Set(DEFAULT_SKIP_DOMAINS).size).toBe(DEFAULT_SKIP_DOMAINS.length);
  });

  it('no domains have protocol prefix', () => {
    for (const domain of DEFAULT_SKIP_DOMAINS) {
      expect(domain).not.toMatch(/^https?:\/\//);
    }
  });

  it('no domains have trailing slash', () => {
    for (const domain of DEFAULT_SKIP_DOMAINS) {
      expect(domain).not.toMatch(/\/$/);
    }
  });

  it('includes common productivity apps', () => {
    expect(DEFAULT_SKIP_DOMAINS).toContain('mail.google.com');
    expect(DEFAULT_SKIP_DOMAINS).toContain('slack.com');
  });

  it('includes localhost variants', () => {
    expect(DEFAULT_SKIP_DOMAINS).toContain('localhost');
    expect(DEFAULT_SKIP_DOMAINS).toContain('127.0.0.1');
  });
});

describe('SKIP_URL_PREFIXES', () => {
  it('includes chrome:// and about:', () => {
    expect(SKIP_URL_PREFIXES).toContain('chrome://');
    expect(SKIP_URL_PREFIXES).toContain('about:');
  });

  it('all prefixes end with :// or :', () => {
    for (const prefix of SKIP_URL_PREFIXES) {
      expect(prefix).toMatch(/:\/?\/?$/);
    }
  });
});

describe('DEFAULT_SETTINGS', () => {
  it('is enabled by default', () => {
    expect(DEFAULT_SETTINGS.enabled).toBe(true);
  });

  it('references the same DEFAULT_SKIP_DOMAINS array', () => {
    expect(DEFAULT_SETTINGS.skipDomains).toBe(DEFAULT_SKIP_DOMAINS);
  });

  it('references the same DEFAULT_PROFILE', () => {
    expect(DEFAULT_SETTINGS.profile).toBe(DEFAULT_PROFILE);
  });

  it('references the same DEFAULT_API_CONFIG', () => {
    expect(DEFAULT_SETTINGS.apiConfig).toBe(DEFAULT_API_CONFIG);
  });
});

describe('Tuning constants', () => {
  it('CACHE_TTL_MS is 7 days', () => {
    expect(CACHE_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('CONTENT_CHAR_LIMIT is reasonable (1K-50K)', () => {
    expect(CONTENT_CHAR_LIMIT).toBeGreaterThanOrEqual(1000);
    expect(CONTENT_CHAR_LIMIT).toBeLessThanOrEqual(50000);
  });

  it('API_TIMEOUT_MS is reasonable (5s-60s)', () => {
    expect(API_TIMEOUT_MS).toBeGreaterThanOrEqual(5000);
    expect(API_TIMEOUT_MS).toBeLessThanOrEqual(60000);
  });

  it('MAX_RETRIES is between 1 and 5', () => {
    expect(MAX_RETRIES).toBeGreaterThanOrEqual(1);
    expect(MAX_RETRIES).toBeLessThanOrEqual(5);
  });
});

describe('BADGE_COLORS', () => {
  it('has all required colors', () => {
    expect(BADGE_COLORS).toHaveProperty('read');
    expect(BADGE_COLORS).toHaveProperty('save');
    expect(BADGE_COLORS).toHaveProperty('leave');
    expect(BADGE_COLORS).toHaveProperty('loading');
    expect(BADGE_COLORS).toHaveProperty('error');
    expect(BADGE_COLORS).toHaveProperty('skipped');
  });

  it('all colors are valid hex', () => {
    for (const color of Object.values(BADGE_COLORS)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('read is green, save is yellow, leave is red', () => {
    // Green channel dominant for read
    expect(BADGE_COLORS.read).toBe('#22c55e');
    // Yellow
    expect(BADGE_COLORS.save).toBe('#eab308');
    // Red
    expect(BADGE_COLORS.leave).toBe('#ef4444');
  });

  it('error, loading, skipped are all grey', () => {
    expect(BADGE_COLORS.loading).toBe(BADGE_COLORS.error);
    expect(BADGE_COLORS.error).toBe(BADGE_COLORS.skipped);
  });
});
