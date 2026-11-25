import { makeQuestion, type Question } from './questions'
import { shuffle } from './shuffle'

const multipliers = Array.from({ length: 9 }, (_, index) => index + 1)
export const danLevels = multipliers.map(dan => ({ id: `kuku-dan-${dan}`, dan, title: `${dan}のだん` }))
export type DanLevel = typeof danLevels[number]

export function generateDanSet(dan: number, count = 10, rng = Math.random): Question[] {
  const factors = [...multipliers]
  while (factors.length < count) factors.push(multipliers[Math.floor(rng() * multipliers.length)])
  return shuffle(factors, rng).slice(0, count).map(multiplier => makeQuestion(dan, multiplier, '×', rng))
}
