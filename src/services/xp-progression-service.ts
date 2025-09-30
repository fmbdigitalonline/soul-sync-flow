/**
 * Multi-Dimensional XP Progression System
 * 
 * Maps 7 dimensions of intelligence to XP with smart capping,
 * diminishing returns, and a logistic curve for natural progression.
 */

export type Dim = "SIP" | "CMP" | "PCP" | "HPP" | "COV" | "LVP" | "ADP";

export interface ProgressState {
  xpTotal: number;
  dimScoresEWMA: Record<Dim, number>;
  lastMilestoneHit: number;
  repeatsToday: Partial<Record<Dim, number>>;
  sessionXP: number;
  dailyXP: number;
  weeklyXP: number;
  lastADPAt?: number;
  last_reset_day?: string;
  last_reset_week?: number;
}

export interface ProgressEvent {
  timestamp: number;
  dims: Partial<Record<Dim, number>>;
  quality: number;
  kinds: string[];
}

export const Config = {
  caps: { SIP: 6, CMP: 4, PCP: 3, HPP: 4, COV: 3, LVP: 2, ADP: 50 } as const,
  kDR: 0.3,
  sessionCap: 25,
  dailyCap: 100,
  weeklyCap: 500,
  noveltyBonus: 0.25,
  noveltyBonusCap: 2,
  ewmaAlpha: 0.3,
} as const;

/**
 * Convert XP to percentage using logistic curve
 * ~25% at ~925 XP (1-3 weeks)
 * Late progress slows naturally
 */
export function xpToPercent(xp: number): number {
  return Math.floor(100 / (1 + Math.exp(-(xp - 1200) / 250)));
}

/**
 * Diminishing returns factor
 */
function diminishing(base: number, repeats: number, k = Config.kDR): number {
  return base / (1 + k * repeats);
}

/**
 * Award XP based on event with all caps and bonuses applied
 */
export function awardXP(
  state: ProgressState,
  ev: ProgressEvent,
  recentKinds: { kind: string; at: number }[]
): { state: ProgressState; deltaXP: number; topContributors: Array<{ dim: Dim; xp: number }> } {
  // Quality gate
  if (ev.quality < 0.6) {
    return { state, deltaXP: 0, topContributors: [] };
  }

  // Novelty check (not seen in last 24h)
  const isNovel = ev.kinds.some(
    (k) =>
      !recentKinds.some((a) => a.kind === k && ev.timestamp - a.at < 86_400_000)
  );

  // Diversity bonus (3+ dimensions in one event)
  const diversityBonus = new Set(Object.keys(ev.dims)).size >= 3 ? 4 : 0;

  let gained = 0;
  const topContributors: Array<{ dim: Dim; xp: number }> = [];

  for (const dim of Object.keys(ev.dims) as Dim[]) {
    const base = Math.min(ev.dims[dim] ?? 0, Config.caps[dim]);
    const withDR = diminishing(base, state.repeatsToday[dim] ?? 0);
    gained += withDR;
    
    topContributors.push({ dim, xp: withDR });
    
    state.repeatsToday[dim] = (state.repeatsToday[dim] ?? 0) + 1;
    
    // Update EWMA display score
    const prev = state.dimScoresEWMA[dim] ?? 50;
    const target = Math.max(0, Math.min(100, (ev.dims[dim] ?? 0) * 20));
    state.dimScoresEWMA[dim] =
      prev * (1 - Config.ewmaAlpha) + target * Config.ewmaAlpha;
  }

  // Sort contributors by XP contribution
  topContributors.sort((a, b) => b.xp - a.xp);

  // Apply novelty and diversity bonuses
  if (isNovel) gained += Math.min(Config.noveltyBonusCap, gained * Config.noveltyBonus);
  if (diversityBonus) gained += diversityBonus;

  // Apply session/daily/weekly caps with soft scaling
  const sessionRoom = Math.max(0, Config.sessionCap - state.sessionXP);
  const dayRoom = Math.max(0, Config.dailyCap - state.dailyXP);
  const weekRoom = Math.max(0, Config.weeklyCap - state.weeklyXP);

  let grant = Math.min(gained, sessionRoom);
  if (grant > dayRoom) grant = dayRoom + (grant - dayRoom) * 0.75;
  if (grant > weekRoom) grant = weekRoom + (grant - weekRoom) * 0.5;

  const deltaXP = Math.max(0, grant);
  state.xpTotal += deltaXP;
  state.sessionXP += deltaXP;
  state.dailyXP += deltaXP;
  state.weeklyXP += deltaXP;

  return { state, deltaXP, topContributors: topContributors.slice(0, 3) };
}

/**
 * Check if user passes gating requirements for milestone
 */
export function passesGates(
  percent: number,
  dims: Record<Dim, number>,
  lastADPAt?: number,
  now = Date.now()
): { passes: boolean; blockedReason?: string } {
  const countAt = (lvl: number) =>
    Object.values(dims).filter((v) => v >= lvl).length;

  if (percent >= 60 && countAt(60) < 3) {
    return {
      passes: false,
      blockedReason: "Need 3 dimensions ≥60 to pass 60%",
    };
  }
  if (percent >= 75 && countAt(70) < 4) {
    return {
      passes: false,
      blockedReason: "Need 4 dimensions ≥70 to pass 75%",
    };
  }
  if (percent >= 90 && countAt(80) < 5) {
    return {
      passes: false,
      blockedReason: "Need 5 dimensions ≥80 to pass 90%",
    };
  }
  if (percent >= 100) {
    if (countAt(85) < 7) {
      return {
        passes: false,
        blockedReason: "Need all 7 dimensions ≥85 to reach 100%",
      };
    }
    if (!lastADPAt || now - lastADPAt > 30 * 24 * 3600_000) {
      return {
        passes: false,
        blockedReason: "Need 1 ADP event in last 30 days for 100%",
      };
    }
  }

  return { passes: true };
}

/**
 * Handle day/week rollovers for caps
 */
export function handleRollovers(state: ProgressState, now = new Date()): ProgressState {
  const today = now.toISOString().slice(0, 10); // yyyy-mm-dd
  
  // Calculate week number (ISO 8601)
  const week = getWeekNumber(now);

  if (state.last_reset_day !== today) {
    state.dailyXP = 0;
    state.repeatsToday = {};
    state.last_reset_day = today;
  }

  if (state.last_reset_week !== week) {
    state.weeklyXP = 0;
    state.last_reset_week = week;
  }

  return state;
}

/**
 * Get ISO 8601 week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get dimension display names
 */
export function getDimensionName(dim: Dim): string {
  const names: Record<Dim, string> = {
    SIP: "Shadow Integration",
    CMP: "Cognitive Mastery",
    PCP: "Personality Coherence",
    HPP: "Hermetic Processing",
    COV: "Conversation Mastery",
    LVP: "Learning Velocity",
    ADP: "Autonomous Development",
  };
  return names[dim];
}

/**
 * Get next milestone and XP needed
 */
export function getNextMilestone(
  currentPercent: number,
  xpTotal: number
): { milestone: number; xpNeeded: number } | null {
  const milestones = [50, 60, 70, 80, 90, 100];
  const nextMilestone = milestones.find((m) => m > currentPercent);

  if (!nextMilestone) return null;

  // Calculate XP needed for next milestone using inverse of xpToPercent
  // percent = 100 / (1 + exp(-(xp - 1200) / 250))
  // Solving for xp: xp = 1200 + 250 * ln((percent / (100 - percent)))
  const targetXP = 1200 + 250 * Math.log(nextMilestone / (100 - nextMilestone));
  const xpNeeded = Math.ceil(Math.max(0, targetXP - xpTotal));

  return { milestone: nextMilestone, xpNeeded };
}
