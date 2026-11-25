import { difficulties, type Difficulty } from './difficulty'
import { kanjiLevels } from './kanji'
import { distinctReadings, readingChoices } from './kanjiQuestions'
import { mathChoices, type Question } from './questions'
import { shuffle } from './shuffle'
import { spokenQuestion } from './speech'
import { clockLevels, type ClockTime } from './clock'
import { clockChoices, formatTime } from './clockQuestions'
import { coinsSignature, denominations, moneyLevels, moneyTotal, type CoinGroup } from './money'
import { moneyChoices } from './moneyQuestions'

export type ReviewItem = { kind: 'math'; levelId: string; difficulty: Difficulty; missedAt: number } & Omit<Question, 'choices'>
  | { kind: 'kanji'; gradeId: string; kanji: string; word: string; wordReading: string; missedAt: number }
  | { kind: 'clock'; levelId: string; hour: number; minute: number; missedAt: number }
  | { kind: 'money'; levelId: string; coins: CoinGroup[]; total: number; missedAt: number }

export interface ReviewQuestion { key: string; prompt: string; promptLabel: string; spokenPrompt?: string; answer: string; choices: string[]; clock?: ClockTime; money?: CoinGroup[]; example?: string }
const storageKey = 'kids-learning-game:review:v1'

export function reviewKey(item: ReviewItem) {
  if (item.kind === 'clock') return `clock:${item.hour}:${item.minute}`
  if (item.kind === 'money') return `money:${item.total}:${coinsSignature(item.coins)}`
  return item.kind === 'math' ? `math:${item.text}` : `kanji:${item.word}`
}

function nonempty(value: unknown) { return typeof value === 'string' && value.trim().length > 0 }
function natural(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 }

function validItem(value: unknown): value is ReviewItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  if (!natural(item.missedAt)) return false
  if (item.kind === 'clock') {
    const stage = clockLevels.find(level => level.id === item.levelId)
    return !!stage && natural(item.hour) && item.hour >= 1 && item.hour <= 12 && natural(item.minute) && item.minute < 60 && item.minute % stage.step === 0
  }
  if (item.kind === 'money') {
    const stage = moneyLevels.find(level => level.id === item.levelId), coins = item.coins
    if (!stage || !Array.isArray(coins) || coins.length > denominations.length || !coins.every(coin => coin && denominations.includes(coin.denom) &&
      natural(coin.count) && coin.count > 0 && (coin.denom < 1000 || (stage.id === 'money-s3' && coin.count === 1)))) return false
    const count = coins.reduce((sum, coin) => sum + (coin.denom < 1000 ? coin.count : 0), 0)
    return count >= stage.minCoins && count <= stage.maxCoins && new Set(coins.map(coin => coin.denom)).size === coins.length &&
      natural(item.total) && item.total <= stage.cap && item.total === moneyTotal(coins)
  }
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
    if (item.kind === 'clock') {
      const { hour, minute } = item, stage = clockLevels.find(level => level.id === item.levelId)!
      return { key, prompt: '', promptLabel: 'なんじ なんふん？', clock: { hour, minute }, answer: formatTime(hour, minute), choices: clockChoices(stage, hour, minute, rng) }
    }
    if (item.kind === 'money') {
      const stage = moneyLevels.find(level => level.id === item.levelId)!
      return { key, prompt: '', promptLabel: 'ぜんぶで いくら？', money: item.coins, answer: `${item.total}円`, choices: moneyChoices(stage, item.total, item.coins, rng).map(value => `${value}円`) }
    }
    if (item.kind === 'math') return { key, prompt: item.text, promptLabel: 'こたえを えらぼう', spokenPrompt: spokenQuestion(item), answer: String(item.answer),
      choices: mathChoices(item.answer, item.second, item.operator, rng).map(String) }
    const grade = kanjiLevels.find(level => level.id === item.gradeId)!
    return { key, prompt: item.word, promptLabel: 'よみかたを えらぼう', answer: item.wordReading,
      example: grade.entries.find(entry => entry.kanji === item.kanji && entry.word === item.word)?.example,
      choices: readingChoices(item.wordReading, distinctReadings(grade.entries), rng) }
  })
}
