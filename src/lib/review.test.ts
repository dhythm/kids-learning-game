import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { kanjiLevels } from './kanji'
import { addMissed, loadReview, removeSolved, reviewKey, toReviewQuestions, type ReviewItem } from './review'

const storageKey = 'kids-learning-game:review:v1'
const math = { kind: 'math', levelId: 'kuku', difficulty: 'normal', first: 7, second: 8, operator: '×', text: '7 × 8 = ?', answer: 56, missedAt: 1 } satisfies ReviewItem
const grade = kanjiLevels[1], entry = grade.entries[0]
const kanji = { kind: 'kanji', gradeId: grade.id, kanji: entry.kanji, word: entry.word, wordReading: entry.wordReading, missedAt: 2 } satisfies ReviewItem
beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

it('rebuilds visual prompts, deduplicates across stages, and skips invalid stored visuals', () => {
  const clock = { kind: 'clock', levelId: 'clock-s1', hour: 12, minute: 30, missedAt: 1 } satisfies ReviewItem
  const money = { kind: 'money', levelId: 'money-s1', coins: [{ denom: 10, count: 1 }, { denom: 1, count: 2 }], total: 12, missedAt: 2 } satisfies ReviewItem
  localStorage.setItem(storageKey, JSON.stringify([{ ...clock, minute: 5 }, { ...clock, hour: 0 }, { ...money, total: 17 }, { ...money, coins: [] }]))
  expect(loadReview()).toEqual([])
  addMissed([money, clock, { ...clock, levelId: 'clock-s2', missedAt: 3 }, { ...money, coins: [...money.coins].reverse(), missedAt: 4 }])
  const questions = toReviewQuestions(loadReview(), () => 0)
  expect(questions).toHaveLength(2)
  expect(questions.find(question => question.clock)).toMatchObject({ key: 'clock:12:30', clock: { hour: 12, minute: 30 }, answer: '12時30分' })
  expect(questions.find(question => question.money)).toMatchObject({ key: 'money:12:10x1,1x2', money: [...money.coins].reverse(), answer: '12円' })
  for (const question of questions) {
    expect(new Set(question.choices).size).toBe(4)
    expect(question.choices).toContain(question.answer)
  }
})

it('deduplicates both subjects across sessions, refreshes timestamps and removes only solved keys', () => {
  addMissed([math, kanji])
  const latest = { ...math, missedAt: 3 }, latestKanji = { ...kanji, missedAt: 4 }
  expect(addMissed([latest, latestKanji])).toEqual([latestKanji, latest])
  expect(reviewKey(math)).toBe(`math:${math.text}`)
  expect(reviewKey(kanji)).toBe(`kanji:${kanji.word}`)
  expect(removeSolved([reviewKey(kanji)])).toEqual([latest])
  expect(loadReview()).toEqual([latest])
})

it('keeps the most recent 100 misses and samples at most ten without changing the list', () => {
  const items = Array.from({ length: 101 }, (_, first) => ({ ...math, first, answer: first * 8, text: `${first} × 8 = ?`, missedAt: first }))
  addMissed(items.reverse())
  const stored = loadReview()
  expect(stored).toHaveLength(100)
  expect(stored.some(item => item.missedAt === 0)).toBe(false)
  const session = toReviewQuestions(stored, () => 0)
  expect(new Set(session.map(question => question.key)).size).toBe(10)
  expect(session[0].key).not.toBe(reviewKey(stored[0]))
  expect(stored).toEqual(loadReview())
})

it('reads only valid items and recovers from missing or unreadable data', () => {
  expect(loadReview()).toEqual([])
  for (const raw of ['{', '{}', 'null']) {
    localStorage.setItem(storageKey, raw)
    expect(loadReview()).toEqual([])
  }
  localStorage.setItem(storageKey, JSON.stringify([null, {}, { ...math, second: '8' }, { ...kanji, gradeId: 'bad' }, math]))
  expect(loadReview()).toEqual([math])
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('blocked') })
  expect(loadReview()).toEqual([])
  expect(addMissed([kanji])).toEqual([kanji])
  expect(removeSolved([])).toEqual([])
})

it('restores the missed story for display and speech, then removes it when solved', () => {
  const promptText = 'りんごが 3こ あります。2こ もらうと ぜんぶで なんこですか？'
  const item = { ...math, levelId: 'word-problems', first: 3, second: 2, operator: '+', answer: 5, text: '3 + 2 = ?', promptText } as const
  addMissed([item])
  const [question] = toReviewQuestions(loadReview())
  expect(question).toMatchObject({ prompt: promptText, spokenPrompt: promptText, answer: '5' })
  removeSolved([question.key])
  expect(loadReview()).toEqual([])
  localStorage.setItem(storageKey, JSON.stringify([42, 'あ'.repeat(201)].map(promptText => ({ ...item, promptText }))))
  expect(loadReview()).toEqual([])
})

it('rebuilds four distinct math choices and four readings from the stored grade', () => {
  const [reading, equation] = toReviewQuestions([math, kanji], () => 0)
  expect(equation).toMatchObject({ key: reviewKey(math), prompt: math.text, answer: '56' })
  expect(reading).toMatchObject({ key: reviewKey(kanji), prompt: entry.word, promptLabel: 'よみかたを えらぼう', answer: entry.wordReading })
  for (const question of [reading, equation]) {
    expect(question.choices).toHaveLength(4)
    expect(new Set(question.choices).size).toBe(4)
    expect(question.choices).toContain(question.answer)
  }
  expect(reading.choices.every(choice => grade.entries.some(candidate => candidate.wordReading === choice))).toBe(true)
})
