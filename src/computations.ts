// ── Pure computation & validation functions ──────────────────────────────────
// Extracted so they can be imported by both App.tsx and unit tests.

export interface ProjectionParams {
  basePay: number;
  contributedSoFar: number;
  agencyMatchSoFar: number;
  agencyAutoSoFar: number;
  maxAnnualContribution: number;
  autoContributionPercent: number; // e.g. 1 means 1 %
  maxMatchPercent: number;         // e.g. 4 means 4 %
  remainingPayPeriods: number;
  ratePercent: number;             // 0–100
}

export interface ProjectionResult {
  totalContribution: number;
  totalMatch: number;
  totalAuto: number;
  periodsWithLostMatch: number;
  hitLimitEarly: boolean;
  lostMatchAmount: number;
}

/**
 * Returns the agency-match fraction (not percent) for a given employee rate.
 *   < 1 %  → 0 (no match below 1 %)
 *   1–3 %  → dollar-for-dollar
 *   3–5 %  → 50 cents per dollar (above 3 %)
 *   > 5 %  → capped at maxMatchPercent / 100
 */
export function calculateMatch(ratePercent: number, maxMatchPercent: number): number {
  if (ratePercent < 1) return 0;
  const rate = ratePercent / 100;
  let match: number;
  if (rate > 0.03) {
    match = 0.03 + Math.min(rate - 0.03, 0.02) * 0.5;
  } else {
    match = rate;
  }
  return Math.min(match, maxMatchPercent / 100);
}

/** Simulate pay-period-by-pay-period contributions for any fixed contribution rate. */
export function projectStrategy(p: ProjectionParams): ProjectionResult {
  let tempContribution = p.contributedSoFar;
  let tempMatch = p.agencyMatchSoFar;
  let tempAuto = p.agencyAutoSoFar;
  const autoPerPeriod = p.basePay * (p.autoContributionPercent / 100);
  let periodsWithLostMatch = 0;
  let hitLimitEarly = false;
  let lostMatchAmount = 0;

  for (let i = 0; i < p.remainingPayPeriods; i++) {
    tempAuto += autoPerPeriod;

    const roomLeft = Math.max(0, p.maxAnnualContribution - tempContribution);
    const desiredContribution = p.basePay * (p.ratePercent / 100);

    let actualRatePercent = p.ratePercent;
    if (desiredContribution > roomLeft) {
      hitLimitEarly = true;
      tempContribution += roomLeft;
      actualRatePercent = p.basePay > 0 ? (roomLeft / p.basePay) * 100 : 0;
    } else {
      tempContribution += desiredContribution;
    }

    const matchWeActuallyGot = p.basePay * calculateMatch(actualRatePercent, p.maxMatchPercent);
    const maximumPossibleMatch = p.basePay * (p.maxMatchPercent / 100);
    const matchWeWouldHaveGotten = p.basePay * calculateMatch(p.ratePercent, p.maxMatchPercent);

    tempMatch += matchWeActuallyGot;

    if (matchWeActuallyGot < matchWeWouldHaveGotten) {
      periodsWithLostMatch++;
    }
    if (matchWeActuallyGot < maximumPossibleMatch) {
      lostMatchAmount += maximumPossibleMatch - matchWeActuallyGot;
    }
  }

  return { totalContribution: tempContribution, totalMatch: tempMatch, totalAuto: tempAuto, periodsWithLostMatch, hitLimitEarly, lostMatchAmount };
}

/**
 * Returns the minimum integer contribution rate (0–100) needed to exactly hit
 * the annual max by the last pay period.
 */
export function computeOptimalRate(params: {
  contributedSoFar: number;
  maxAnnualContribution: number;
  remainingPayPeriods: number;
  basePay: number;
}): number {
  const { contributedSoFar, maxAnnualContribution, remainingPayPeriods, basePay } = params;
  const remainingLimit = Math.max(0, maxAnnualContribution - contributedSoFar);
  const rawRate =
    remainingPayPeriods > 0 && basePay > 0
      ? (remainingLimit / remainingPayPeriods / basePay) * 100
      : 0;
  return Math.min(100, Math.ceil(rawRate));
}

// ── Input validation ─────────────────────────────────────────────────────────

export interface ValidationParams {
  basePay: number;
  contributedSoFar: number;
  maxAnnualContribution: number;
  agencyMatchSoFar: number;
  agencyAutoSoFar: number;
}

/** Returns an array of human-readable error strings; empty means valid. */
export function validateInputs(p: ValidationParams): string[] {
  const errors: string[] = [];
  if (p.basePay < 0)
    errors.push('Base pay cannot be negative.');
  if (p.contributedSoFar < 0)
    errors.push('Contributed so far cannot be negative.');
  if (p.contributedSoFar > p.maxAnnualContribution)
    errors.push('Contributed so far cannot exceed the max annual contribution.');
  if (p.agencyMatchSoFar < 0)
    errors.push('Agency match so far cannot be negative.');
  if (p.agencyAutoSoFar < 0)
    errors.push('Agency auto contribution so far cannot be negative.');
  return errors;
}
