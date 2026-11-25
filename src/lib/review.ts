import { difficulties, type Difficulty } from './difficulty'
import { kanjiLevels } from './kanji'
import { distinctReadings, readingChoices } from './kanjiQuestions'
import { mathChoices, type Question } from './questions'
import { shuffle } from './shuffle'

export type ReviewItem = { kind: 'math'; levelId: string; difficulty: Difficulty; missedAt: number } & Omit<Question, 'choices'>
  | { kind: 'kanji'; gradeId: string; kanji: string; word: string; wordReading: string; missedAt: number }

export interface ReviewQuestion { key: string; prompt: string; promptLabel: string; answer: string; choices: string[] }
const storageKey = 'kids-learning-game:review:v1'

export function reviewKey(item: ReviewItem) {
  return item.kind === 'math' ? `math:${item.text}` : `kanji:${item.word}`
}

function nonempty(value: unknown) { return typeof value === 'string' && value.trim().length > 0 }
function natural(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 }

function validItem(value: unknown): value is ReviewItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  if (!natural(item.missedAt)) return false
  if (item.kind === 'kanji') return kanjiLevels.some(level => level.id === item.gradeId && level.entries.some(entry =>
    entry.word === item.word && entry.kanji === item.kanji && entry.wordReading === item.wordReading))
  return item.kind === 'math' && nonempty(item.levelId) && difficulties.some(difficulty => difficulty === item.difficulty) &&
    natural(item.first) && natural(item.second) && natural(item.answer) && ['+', '-', '×', '÷'].some(operator => operator === item.operator) && nonempty(item.text)
}

function newest(items: ReviewItem[]) {
  const unique = new Map<string, ReviewItem>()
  for (const item of items) {
    const key = reviewKey(item)
    if ((unique.get(key)?.missedAt ?? -1) <= item.missedAt) unique.set(key, item)
  }
  return [...unique.values()].sort((first, second) => second.missedAt - first.missedAt).slice(0, 100)
}

export function loadReview(): ReviewItem[] {
  try {
    const items: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(items)) return newest(items.filter(validItem))
  } catch {}
  return []
}

function persist(items: ReviewItem[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(items)) } catch {}
  return items
}

export function addMissed(items: ReviewItem[]) { return persist(newest([...loadReview(), ...items])) }

export function removeSolved(keys: string[]) {
  const solved = new Set(keys)
  return persist(loadReview().filter(item => !solved.has(reviewKey(item))))
}

export function toReviewQuestions(items: ReviewItem[], rng = Math.random): ReviewQuestion[] {
  return shuffle([...items], rng).slice(0, 10).map(item => {
    const key = reviewKey(item)
    if (item.kind === 'math') return { key, prompt: item.text, promptLabel: 'こたえを えらぼう', answer: String(item.answer),
      choices: mathChoices(item.answer, item.second, item.operator, rng).map(String) }
    const grade = kanjiLevels.find(level => level.id === item.gradeId)!
    return { key, prompt: item.word, promptLabel: 'よみかたを えらぼう', answer: item.wordReading,
      choices: readingChoices(item.wordReading, distinctReadings(grade.entries), rng) }
  })
}
