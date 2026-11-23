export const initialScore = { score: 0, correct: 0, combo: 0, maxCombo: 0 }
export type DrillResult = Omit<typeof initialScore, 'combo'> & { total: number; timeMs: number }

export function scoreAnswer(previous: typeof initialScore, correct: boolean) {
  if (!correct) return { ...previous, combo: 0 }
  const combo = previous.combo + 1
  return { score: previous.score + 100 + previous.combo * 20, correct: previous.correct + 1, combo, maxCombo: Math.max(previous.maxCombo, combo) }
}
