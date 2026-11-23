import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getBest, loadBest, saveResult } from './storage'

const result = { score: 100, correct: 1, total: 10, timeMs: 2500 }
const key = 'kids-learning-game:best:v1'
beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

it('round-trips records and replaces only a strictly lower best for the same level', () => {
  expect(loadBest()).toEqual({})
  localStorage.setItem(key, JSON.stringify({ kuku: { ...result, score: 900, updatedAt: 1 } }))
  expect(getBest('kuku:normal')).toBeUndefined()
  expect(saveResult('kuku:normal', result)).toBe(true)
  const original = getBest('kuku:normal')
  expect(original).toEqual({ ...result, updatedAt: expect.any(Number) })
  expect(saveResult('divide:normal', result)).toBe(true)
  expect(saveResult('kuku:hard', { ...result, score: 50 })).toBe(true)
  expect(saveResult('kuku:normal', { ...result, score: 90 })).toBe(false)
  expect(saveResult('kuku:normal', { ...result, timeMs: 12 })).toBe(false)
  expect(getBest('kuku:normal')).toEqual(original)
  expect(saveResult('kuku:normal', { ...result, score: 220, correct: 2 })).toBe(true)
  expect(loadBest()['kuku:normal'].score).toBe(220)
  expect(loadBest()['divide:normal'].score).toBe(100)
  expect(loadBest()['kuku:hard'].score).toBe(50)
})

it.each(['{broken', 'null', '[]', '{"kuku":{"score":"oops"}}'])('handles invalid data: %s', raw => {
  localStorage.setItem(key, raw)
  expect(loadBest()).toEqual({})
})

it('tolerates unavailable storage', () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('blocked') })
  expect(loadBest()).toEqual({})
  expect(saveResult('kuku:normal', result)).toBe(false)
})
