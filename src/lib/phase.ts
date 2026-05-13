const DAY_MS = 1000 * 60 * 60 * 24

export type Phase = 1 | 2 | 3

const PHASE_LABELS: Record<Phase, string> = {
  1: 'Reset',
  2: 'Sculpt',
  3: 'Sustain',
}

export function weeksSinceStart(createdAt: Date | string): number {
  const start = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const elapsedDays = Math.floor((Date.now() - start.getTime()) / DAY_MS)
  return Math.max(1, Math.floor(elapsedDays / 7) + 1)
}

export function compliancePct(
  checkIns: { trained: boolean; date: Date | string }[],
  days: number,
): number {
  if (days <= 0) return 0
  const cutoff = Date.now() - days * DAY_MS
  const trainedDays = new Set<string>()
  for (const ci of checkIns) {
    const d = typeof ci.date === 'string' ? new Date(ci.date) : ci.date
    if (!ci.trained) continue
    if (d.getTime() < cutoff) continue
    trainedDays.add(d.toISOString().slice(0, 10))
  }
  return trainedDays.size / days
}

export function computePhase(
  weeksCompleted: number,
  complianceLast4Weeks: number,
): { phase: Phase; label: string; stalled: boolean } {
  const naturalPhase: Phase = weeksCompleted >= 13 ? 3 : weeksCompleted >= 7 ? 2 : 1
  const atBoundary = weeksCompleted === 7 || weeksCompleted === 13

  if (atBoundary && complianceLast4Weeks < 0.8) {
    const heldPhase: Phase = (naturalPhase - 1) as Phase
    return { phase: heldPhase, label: PHASE_LABELS[heldPhase], stalled: true }
  }

  return { phase: naturalPhase, label: PHASE_LABELS[naturalPhase], stalled: false }
}
