import { expect, it } from 'vitest'
import { wordProblemLevel } from './levels'
import { generateSet } from './questions'

it.each([
  ['easy', 2, 9, 20], ['normal', 5, 30, 50], ['hard', 15, 99, 100],
] as const)('generates valid ten-story sets on %s', (difficulty, min, max, cap) => {
  let state = 1234
  const rng = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32)
  for (let round = 0; round < 20; round++) {
    const set = generateSet(wordProblemLevel, difficulty, 10, rng)
    expect(set).toHaveLength(10)
    expect(new Set(set.map(question => question.text)).size).toBe(10)
    expect(new Set(set.map(question => question.operator))).toEqual(new Set(['+', '-']))
    for (const { first, second, operator, answer, choices, text, prompt } of set) {
      expect(Math.min(first, second)).toBeGreaterThanOrEqual(min)
      expect(Math.max(first, second)).toBeLessThanOrEqual(max)
      if (operator === '-') expect(first).toBeGreaterThanOrEqual(second)
      expect(answer).toBe(operator === '+' ? first + second : first - second)
      expect(answer).toBeGreaterThanOrEqual(difficulty === 'easy' ? 1 : 0)
      expect(answer).toBeLessThanOrEqual(cap)
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(Math.min(...choices)).toBeGreaterThanOrEqual(0)
      expect(choices).toContain(answer)
      expect(text).toBe(prompt)
      expect(text).toMatch(/か？$/)
      expect(text.match(/\d+/g)).toEqual([String(first), String(second)])
    }
  }
})
