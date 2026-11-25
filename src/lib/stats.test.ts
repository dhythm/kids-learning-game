import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { currentStreak, loadStats, localDate, recordResult, thisWeek, totalCorrect } from './stats'

const key = 'kids-learning-game:stats:v1'
const result = { correct: 10, total: 10, timeMs: 4000, maxCombo: 10 }
beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

it.each([new Date(2024, 11, 29), new Date(2025, 0, 1), new Date(2025, 0, 4)])('shows the Sunday-first local week for %s', today => {
  const store = { byKey: {}, playDates: ['2024-12-28', '2024-12-30', '2025-01-03'] }
  const days = thisWeek(store, today)
  expect(days.map(day => day.weekday).join('')).toBe('日月火水木金土')
  expect(days.map(day => day.date)).toEqual(['2024-12-29', '2024-12-30', '2024-12-31', '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'])
  expect(days.filter(day => day.played).map(day => day.date)).toEqual(['2024-12-30', '2025-01-03'])
  expect(days.filter(day => day.isToday).map(day => day.date)).toEqual([localDate(today)])
})

it('aggregates by subject, counting each local play date only once in chronological order', () => {
  const first = new Date(2024, 1, 29, 23, 59), last = new Date(2024, 2, 1, 0, 1)
  expect(localDate(first)).toBe('2024-02-29')
  recordResult('add:easy', result, last)
  recordResult('add:normal', result, first)
  const store = recordResult('add:easy', { ...result, correct: 7, maxCombo: 4 }, last)
  expect(store.byKey['add:easy']).toEqual({ plays: 2, totalQuestions: 20, totalCorrect: 17, totalTimeMs: 8000,
    perfectPlays: 1, bestCombo: 10, lastPlayedAt: last.getTime() })
  expect(store.playDates).toEqual(['2024-02-29', '2024-03-01'])
  expect(totalCorrect(store)).toBe(27)
  expect(loadStats()).toEqual(store)
})

it('counts streaks ending today or yesterday, stopping at a gap', () => {
  const store = { byKey: {}, playDates: ['2024-12-28', '2024-12-30', '2024-12-31', '2025-01-01'] }
  expect(currentStreak(store, new Date(2025, 0, 1))).toBe(3)
  expect(currentStreak(store, new Date(2025, 0, 2))).toBe(3)
  expect(currentStreak(store, new Date(2025, 0, 3))).toBe(0)
  expect(currentStreak(loadStats(), new Date(2025, 0, 1))).toBe(0)
})

it.each(['{', 'null', '[]', '{}', '{"byKey":[],"playDates":[]}', '{"byKey":{"kuku":{}},"playDates":[]}',
  '{"byKey":{},"playDates":["2025-02-30"]}'])('recovers from corrupt stored data: %s', raw => {
  localStorage.setItem(key, raw)
  expect(loadStats()).toEqual({ byKey: {}, playDates: [] })
  expect(recordResult('add:easy', result).byKey['add:easy'].plays).toBe(1)
})

it('still returns the completed result when storage is unavailable', () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('blocked') })
  expect(recordResult('kuku:easy', result).byKey['kuku:easy'].totalCorrect).toBe(10)
})
