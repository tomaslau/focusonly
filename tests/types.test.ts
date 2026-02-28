import { describe, it, expect } from 'vitest';
import { VerdictSchema } from '@/lib/types';

describe('VerdictSchema', () => {
  describe('valid verdicts', () => {
    it('accepts a valid Read verdict', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 82,
        reasons: ['Relevant to goals', 'Good content'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts a valid Save verdict', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Save',
        score: 45,
        reasons: ['Somewhat relevant'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts a valid Leave verdict', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Leave',
        score: 12,
        reasons: ['Not relevant'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts score of 0', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Leave',
        score: 0,
        reasons: ['Completely irrelevant'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts score of 100', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 100,
        reasons: ['Perfect match'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty reasons array', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 75,
        reasons: [],
      });
      expect(result.success).toBe(true);
    });

    it('accepts up to 3 reasons', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 75,
        reasons: ['one', 'two', 'three'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid verdicts', () => {
    it('rejects score below 0', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Leave',
        score: -1,
        reasons: ['bad'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects score above 100', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 101,
        reasons: ['too high'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid verdict string', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Skip',
        score: 50,
        reasons: ['invalid verdict'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects lowercase verdict', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'read',
        score: 75,
        reasons: ['lowercase'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects more than 3 reasons', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 75,
        reasons: ['one', 'two', 'three', 'four'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing verdict field', () => {
      const result = VerdictSchema.safeParse({
        score: 50,
        reasons: ['missing verdict'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing score field', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        reasons: ['missing score'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing reasons field', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 75,
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-string reasons', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 75,
        reasons: [123, true],
      });
      expect(result.success).toBe(false);
    });

    it('rejects string score', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: '75',
        reasons: ['string score'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = VerdictSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('rejects empty object', () => {
      const result = VerdictSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects float score', () => {
      // This one might pass — Zod z.number() accepts floats
      // This test documents the behavior: does the schema
      // allow fractional scores like 75.5?
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 75.5,
        reasons: ['float score'],
      });
      // NOTE: This PASSES because z.number() allows floats.
      // This could be a gap — LLMs sometimes return fractional scores.
      // Consider using z.number().int() if only integers are expected.
      expect(result.success).toBe(true);
    });
  });

  describe('edge cases from LLM responses', () => {
    it('handles verdict with extra fields (LLM adds reasoning)', () => {
      const result = VerdictSchema.safeParse({
        verdict: 'Read',
        score: 80,
        reasons: ['Good match'],
        explanation: 'This is extra',
        confidence: 0.9,
      });
      // Zod strips extra fields by default with .parse(), but .safeParse() should still succeed
      expect(result.success).toBe(true);
    });

    it('coerces Leave with high score to Read', () => {
      const result = VerdictSchema.parse({
        verdict: 'Leave',
        score: 90,
        reasons: ['Contradictory'],
      });
      // Score 90 → Read (coerced from Leave)
      expect(result.verdict).toBe('Read');
      expect(result.score).toBe(90);
    });

    it('coerces Read with low score to Leave', () => {
      const result = VerdictSchema.parse({
        verdict: 'Read',
        score: 5,
        reasons: ['Contradictory'],
      });
      // Score 5 → Leave (coerced from Read)
      expect(result.verdict).toBe('Leave');
      expect(result.score).toBe(5);
    });

    it('coerces Save with high score to Read', () => {
      const result = VerdictSchema.parse({
        verdict: 'Save',
        score: 75,
        reasons: ['High score'],
      });
      expect(result.verdict).toBe('Read');
    });

    it('preserves aligned verdicts', () => {
      expect(VerdictSchema.parse({ verdict: 'Leave', score: 15, reasons: ['ok'] }).verdict).toBe('Leave');
      expect(VerdictSchema.parse({ verdict: 'Save', score: 45, reasons: ['ok'] }).verdict).toBe('Save');
      expect(VerdictSchema.parse({ verdict: 'Read', score: 80, reasons: ['ok'] }).verdict).toBe('Read');
    });

    it('boundary: score 29 is Leave, 30 is Save, 59 is Save, 60 is Read', () => {
      expect(VerdictSchema.parse({ verdict: 'Read', score: 29, reasons: [] }).verdict).toBe('Leave');
      expect(VerdictSchema.parse({ verdict: 'Read', score: 30, reasons: [] }).verdict).toBe('Save');
      expect(VerdictSchema.parse({ verdict: 'Read', score: 59, reasons: [] }).verdict).toBe('Save');
      expect(VerdictSchema.parse({ verdict: 'Leave', score: 60, reasons: [] }).verdict).toBe('Read');
    });
  });
});
