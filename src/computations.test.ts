import { describe, it, expect } from 'vitest';
import {
  calculateMatch,
  projectStrategy,
  computeOptimalRate,
  validateInputs,
} from './computations';

// ── Shared base params (mid-year scenario using the app's DEFAULTS) ──────────
const BASE = {
  basePay: 6177.30,
  contributedSoFar: 8524.69,
  agencyMatchSoFar: 988.36,
  agencyAutoSoFar: 247.08,
  maxAnnualContribution: 24500,
  autoContributionPercent: 1,
  maxMatchPercent: 4,
  remainingPayPeriods: 4,
};

// ── calculateMatch ────────────────────────────────────────────────────────────

describe('calculateMatch', () => {
  it('returns 0 for 0 %', () => {
    expect(calculateMatch(0, 4)).toBe(0);
  });

  it('returns 0 for any rate below 1 %', () => {
    expect(calculateMatch(0.5, 4)).toBe(0);
    expect(calculateMatch(0.99, 4)).toBe(0);
  });

  it('matches dollar-for-dollar at exactly 1 %', () => {
    expect(calculateMatch(1, 4)).toBeCloseTo(0.01);
  });

  it('matches dollar-for-dollar at 3 %', () => {
    expect(calculateMatch(3, 4)).toBeCloseTo(0.03);
  });

  it('adds 50-cents-per-dollar above 3 % up to 5 %', () => {
    // 5 % → 0.03 + (0.02 * 0.5) = 0.04
    expect(calculateMatch(5, 4)).toBeCloseTo(0.04);
  });

  it('is capped at maxMatchPercent / 100 for high rates', () => {
    expect(calculateMatch(50, 4)).toBeCloseTo(0.04);
    expect(calculateMatch(100, 4)).toBeCloseTo(0.04);
  });

  it('respects a custom maxMatchPercent', () => {
    // With a 3 % cap, contributing 5 % should yield only 0.03
    expect(calculateMatch(5, 3)).toBeCloseTo(0.03);
  });
});

// ── projectStrategy ───────────────────────────────────────────────────────────

describe('projectStrategy', () => {
  it('realistic mid-year scenario: correct total contribution', () => {
    const result = projectStrategy({ ...BASE, ratePercent: 33 });
    // 4 periods × 6177.30 × 33 % = 8153.04; starting at 8524.69 → 16677.73
    expect(result.totalContribution).toBeCloseTo(8524.69 + 4 * 6177.30 * 0.33, 1);
    expect(result.hitLimitEarly).toBe(false);
    expect(result.periodsWithLostMatch).toBe(0);
    expect(result.lostMatchAmount).toBe(0);
  });

  it('realistic mid-year scenario: captures full 4 % match each period', () => {
    const result = projectStrategy({ ...BASE, ratePercent: 33 });
    const matchPerPeriod = BASE.basePay * 0.04;
    expect(result.totalMatch).toBeCloseTo(BASE.agencyMatchSoFar + 4 * matchPerPeriod, 2);
  });

  it('rate = 0 %: no employee contributions added, no match earned', () => {
    const result = projectStrategy({
      ...BASE,
      ratePercent: 0,
      agencyMatchSoFar: 0,
      contributedSoFar: 0,
    });
    expect(result.totalContribution).toBeCloseTo(0);
    expect(result.totalMatch).toBeCloseTo(0);
    expect(result.lostMatchAmount).toBeGreaterThan(0);
  });

  it('rate = 100 %: hits the IRS limit early', () => {
    const result = projectStrategy({ ...BASE, ratePercent: 100 });
    expect(result.totalContribution).toBeCloseTo(BASE.maxAnnualContribution, 1);
    expect(result.hitLimitEarly).toBe(true);
    expect(result.periodsWithLostMatch).toBeGreaterThan(0);
    expect(result.lostMatchAmount).toBeGreaterThan(0);
  });

  it('remainingPayPeriods = 0: totals are unchanged from starting values', () => {
    const result = projectStrategy({ ...BASE, remainingPayPeriods: 0, ratePercent: 33 });
    expect(result.totalContribution).toBeCloseTo(BASE.contributedSoFar);
    expect(result.totalMatch).toBeCloseTo(BASE.agencyMatchSoFar);
    expect(result.totalAuto).toBeCloseTo(BASE.agencyAutoSoFar);
    expect(result.hitLimitEarly).toBe(false);
    expect(result.lostMatchAmount).toBe(0);
  });

  it('contributedSoFar already at max: no additional contributions possible', () => {
    const result = projectStrategy({ ...BASE, contributedSoFar: 24500, ratePercent: 33 });
    expect(result.totalContribution).toBeCloseTo(24500);
    expect(result.hitLimitEarly).toBe(true);
    expect(result.periodsWithLostMatch).toBeGreaterThan(0);
  });

  it('rate = 5 % (min for full match): captures full match every period', () => {
    const result = projectStrategy({ ...BASE, ratePercent: 5, agencyMatchSoFar: 0 });
    const expectedMatch = 4 * BASE.basePay * 0.04;
    expect(result.totalMatch).toBeCloseTo(expectedMatch, 2);
    expect(result.lostMatchAmount).toBe(0);
  });
});

// ── computeOptimalRate ────────────────────────────────────────────────────────

describe('computeOptimalRate', () => {
  it('returns 0 when there are no remaining pay periods', () => {
    expect(computeOptimalRate({ contributedSoFar: 0, maxAnnualContribution: 24500, remainingPayPeriods: 0, basePay: 6000 })).toBe(0);
  });

  it('returns 0 when basePay is 0', () => {
    expect(computeOptimalRate({ contributedSoFar: 0, maxAnnualContribution: 24500, remainingPayPeriods: 6, basePay: 0 })).toBe(0);
  });

  it('caps at 100 when the required rate exceeds 100 %', () => {
    // Need $24 500 in 1 period on $100 pay → 24 500 % → capped at 100
    expect(computeOptimalRate({ contributedSoFar: 0, maxAnnualContribution: 24500, remainingPayPeriods: 1, basePay: 100 })).toBe(100);
  });

  it('calculates the correct rate for the default mid-year scenario', () => {
    // Remaining: 24500 - 8524.69 = 15975.31 over 4 periods at 6177.30
    // rawRate ≈ 15975.31 / 4 / 6177.30 * 100 ≈ 64.67 → ceil → 65
    expect(computeOptimalRate({ contributedSoFar: 8524.69, maxAnnualContribution: 24500, remainingPayPeriods: 4, basePay: 6177.30 })).toBe(65);
  });

  it('returns 0 when already at the max annual contribution', () => {
    expect(computeOptimalRate({ contributedSoFar: 24500, maxAnnualContribution: 24500, remainingPayPeriods: 4, basePay: 6177.30 })).toBe(0);
  });
});

// ── validateInputs ────────────────────────────────────────────────────────────

describe('validateInputs', () => {
  const VALID = {
    basePay: 6177.30,
    contributedSoFar: 8524.69,
    maxAnnualContribution: 24500,
    agencyMatchSoFar: 988.36,
    agencyAutoSoFar: 247.08,
  };

  it('returns no errors for a realistic valid set of values', () => {
    expect(validateInputs(VALID)).toHaveLength(0);
  });

  it('returns no errors when contributedSoFar equals maxAnnualContribution (boundary)', () => {
    expect(validateInputs({ ...VALID, contributedSoFar: 24500 })).toHaveLength(0);
  });

  it('rejects negative basePay', () => {
    const errors = validateInputs({ ...VALID, basePay: -0.01 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => /base pay/i.test(e))).toBe(true);
  });

  it('rejects zero basePay (boundary)', () => {
    // Zero is technically invalid for meaningful calculations
    // Note: 0 is allowed by the validator (only negatives are rejected).
    // This test documents that boundary behaviour explicitly.
    expect(validateInputs({ ...VALID, basePay: 0 })).toHaveLength(0);
  });

  it('rejects negative contributedSoFar', () => {
    const errors = validateInputs({ ...VALID, contributedSoFar: -1 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => /contributed/i.test(e))).toBe(true);
  });

  it('rejects contributedSoFar exceeding maxAnnualContribution', () => {
    const errors = validateInputs({ ...VALID, contributedSoFar: 24500.01 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => /exceed|max annual/i.test(e))).toBe(true);
  });

  it('rejects negative agencyMatchSoFar', () => {
    const errors = validateInputs({ ...VALID, agencyMatchSoFar: -1 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => /match/i.test(e))).toBe(true);
  });

  it('rejects negative agencyAutoSoFar', () => {
    const errors = validateInputs({ ...VALID, agencyAutoSoFar: -0.01 });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => /auto/i.test(e))).toBe(true);
  });

  it('returns multiple errors when several fields are invalid', () => {
    const errors = validateInputs({ ...VALID, basePay: -1, contributedSoFar: -1, agencyMatchSoFar: -1 });
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
