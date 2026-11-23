import type { SubjectKey } from './difficulty'

export interface BestScore { score: number; correct: number; total: number; timeMs: number; updatedAt: number }
const key = 'kids-learning-game:best:v1'

function isBest(value: unknown): value is BestScore {
  return typeof value === 'object' && value !== null && ['score', 'correct', 'total', 'timeMs', 'updatedAt'].every(field => {
    const number = (value as Record<string, unknown>)[field]
    return typeof number === 'number' && Number.isFinite(number) && number >= 0
  })
}

export function loadBest(): Record<string, BestScore> {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => isBest(value))) as Record<string, BestScore>
  } catch { return {} }
}

export function getBest(subject: SubjectKey): BestScore | undefined {
  const best = loadBest()
  return Object.hasOwn(best, subject) ? best[subject] : undefined
}

export function saveResult(subject: SubjectKey, { score, correct, total, timeMs }: Omit<BestScore, 'updatedAt'>) {
  const best = loadBest()
  if (Object.hasOwn(best, subject) && best[subject].score >= score) return false
  try {
    localStorage.setItem(key, JSON.stringify({ ...best, [subject]: { score, correct, total, timeMs, updatedAt: Date.now() } }))
    return true
  } catch { return false }
}
