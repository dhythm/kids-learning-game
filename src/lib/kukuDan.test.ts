import { expect, it } from 'vitest'
import { generateDanSet } from './kukuDan'

it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('covers all nine multipliers in a ten-question set for dan %i', dan => {
  const set = generateDanSet(dan)
  expect(set).toHaveLength(10)
  expect(new Set(set.map(question => question.second))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
  for (const question of set) {
    expect(question).toMatchObject({ first: dan, operator: '×', answer: dan * question.second })
    expect(question.choices).toHaveLength(4)
    expect(new Set(question.choices).size).toBe(4)
    expect(question.choices).toContain(question.answer)
  }
})
