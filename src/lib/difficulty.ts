import type { KanjiLevel } from './kanji'
import type { ClockLevel } from './clock'
import type { MoneyLevel } from './money'

export type Difficulty = 'easy' | 'normal' | 'hard'

export const difficulties: readonly Difficulty[] = ['easy', 'normal', 'hard']
export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい',
}

export type SubjectKey = `${string}:${Difficulty}` | KanjiLevel['id'] | ClockLevel['id'] | MoneyLevel['id']

export function subjectKey(levelId: string, difficulty: Difficulty): SubjectKey {
  return `${levelId}:${difficulty}`
}
