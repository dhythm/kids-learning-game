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

export function getBest(levelId: string): BestScore | undefined {
  const best = loadBest()
  return Object.hasOwn(best, levelId) ? best[levelId] : undefined
}

export function saveResult(levelId: string, { score, correct, total, timeMs }: Omit<BestScore, 'updatedAt'>) {
  const best = loadBest()
  if (Object.hasOwn(best, levelId) && best[levelId].score >= score) return false
  try {
    localStorage.setItem(key, JSON.stringify({ ...best, [levelId]: { score, correct, total, timeMs, updatedAt: Date.now() } }))
    return true
  } catch { return false }
}
