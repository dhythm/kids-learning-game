import { describe, expect, it } from 'vitest'
import { difficulties } from './difficulty'
import { levels, type Operator } from './levels'
import { generateQuestion, generateSet } from './questions'
import { initialScore, scoreAnswer } from './scoring'

function seededRng() {
  let state = 1234
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32)
}

describe.each(levels.flatMap(level => difficulties.map(difficulty => ({ level, difficulty }))))('$level.id / $difficulty', ({ level, difficulty }) => {
  const ranges = level.ranges[difficulty]
  it('generates valid equations and four distinct non-negative choices', () => {
    const rng = seededRng()
    const seen = new Set<string>()
    for (let index = 0; index < 120; index++) {
      const { text, answer, choices } = generateQuestion(level, difficulty, rng)
      const match = /^(\d+) ([-+×÷]) (\d+) = \?$/.exec(text)
      expect(match).not.toBeNull()
      const [, leftText, operator, rightText] = match!
      const left = Number(leftText), right = Number(rightText)
      seen.add(operator)
      expect(level.operators).toContain(operator)
      expect(answer).toBe(({ '+': left + right, '-': left - right, '×': left * right, '÷': left / right })[operator as Operator])
      expect(Number.isInteger(answer) && answer >= 0).toBe(true)
      expect(operator === '÷' ? answer : left).toBeGreaterThanOrEqual(ranges.left[0])
      expect(operator === '÷' ? answer : left).toBeLessThanOrEqual(ranges.left[1])
      expect(right).toBeGreaterThanOrEqual(ranges.right[0])
      expect(right).toBeLessThanOrEqual(ranges.right[1])
      if (level.id === 'kuku') expect(left >= 1 && left <= 9 && right >= 1 && right <= 9).toBe(true)
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(choices).toContain(answer)
      expect(Math.min(...choices)).toBeGreaterThanOrEqual(0)
    }
    expect(seen).toEqual(new Set(level.operators))
  })

  it('produces ten unique texts, even when the RNG repeats', () => {
    for (const rng of [seededRng(), () => 0]) {
      const set = generateSet(level, difficulty, undefined, rng)
      expect(set).toHaveLength(10)
      expect(new Set(set.map(question => question.text)).size).toBe(10)
    }
  })
})

it('bonuses follow the current streak, not the longest one', () => {
  const streak = [true, true, true].reduce(scoreAnswer, initialScore)
  expect(streak).toEqual({ score: 360, correct: 3, combo: 3, maxCombo: 3 })
  const wrong = scoreAnswer(streak, false)
  expect(wrong).toEqual({ ...streak, combo: 0 })
  expect(scoreAnswer(wrong, true)).toEqual({ score: 460, correct: 4, combo: 1, maxCombo: 3 })
})
