import { expect, it } from 'vitest'
import { earnedBadgeIds } from './badges'
import type { SubjectStats } from './stats'

const base: SubjectStats = { plays: 0, totalCorrect: 0, totalQuestions: 0, totalTimeMs: 0, perfectPlays: 0, bestCombo: 0, lastPlayedAt: 0 }
it.each<[string, keyof SubjectStats, number]>([
  ['first-step', 'plays', 1], ['plays-10', 'plays', 10], ['correct-100', 'totalCorrect', 100], ['correct-500', 'totalCorrect', 500],
  ['perfect-1', 'perfectPlays', 1], ['perfect-5', 'perfectPlays', 5], ['combo-10', 'bestCombo', 10],
])('unlocks %s at its threshold', (id, field, threshold) => {
  const subject = { ...base, [field]: threshold - 1 }
  const store = { byKey: { 'add:easy': subject, 'add:hard': { ...base } }, playDates: [] }
  expect(earnedBadgeIds(store).has(id)).toBe(false)
  if (field === 'bestCombo') subject.bestCombo++
  else store.byKey['add:hard'][field]++
  expect(earnedBadgeIds(store).has(id)).toBe(true)
})

it('keeps historical streak badges and does not count across gaps', () => {
  const playDates = Array.from({ length: 7 }, (_, index) => `2020-01-0${index + 1}`)
  const ids = (days: number) => earnedBadgeIds({ byKey: {}, playDates: [...playDates.slice(0, days), '2020-12-25'] })
  expect(ids(2).has('streak-3')).toBe(false)
  expect(ids(3).has('streak-3')).toBe(true)
  expect(ids(6).has('streak-7')).toBe(false)
  expect(ids(7).has('streak-7')).toBe(true)
})
