import type { Difficulty } from './difficulty'
import type { LevelDef, Operator } from './levels'
import { shuffle } from './shuffle'
import { generateWordProblem, generateWordSet } from './wordProblems'

export interface Question { first: number; second: number; operator: Operator; text: string; prompt?: string; answer: number; choices: number[] }
type Rng = () => number

function integer(min: number, max: number, rng: Rng) {
  return min + Math.floor(rng() * (max - min + 1))
}

export function makeQuestion(first: number, second: number, operator: Operator, rng: Rng): Question {
  const left = operator === '÷' ? first * second : first
  const answer = operator === '+' ? left + second : operator === '-' ? left - second : operator === '×' ? left * second : first
  return { first: left, second, operator, text: `${left} ${operator} ${second} = ?`, answer, choices: mathChoices(answer, second, operator, rng) }
}

export function mathChoices(answer: number, second: number, operator: Operator, rng: Rng) {
  const step = operator === '×' ? second : 10
  const misses = [...new Set([1, -1, 2, -2, step, -step, 3].map(offset => answer + offset))].filter(value => value >= 0 && value !== answer)
  return shuffle([answer, ...shuffle(misses, rng).slice(0, 3)], rng)
}

export function generateQuestion(level: LevelDef, difficulty: Difficulty, rng: Rng = Math.random) {
  if (level.id === 'word-problems') return generateWordProblem(difficulty, rng)
  const { left, right } = level.ranges[difficulty]
  const operator = level.operators[integer(0, level.operators.length - 1, rng)]
  const first = integer(...left, rng)
  const second = integer(right[0], operator === '-' ? Math.min(first, right[1]) : right[1], rng)
  return makeQuestion(first, second, operator, rng)
}

export function generateSet(level: LevelDef, difficulty: Difficulty, count = 10, rng: Rng = Math.random) {
  if (level.id === 'word-problems') return generateWordSet(difficulty, count, rng)
  const { left, right } = level.ranges[difficulty]
  const questions = new Map<string, Question>()
  for (let attempt = 0; questions.size < count && attempt < count * 3; attempt++) {
    const question = generateQuestion(level, difficulty, rng)
    questions.set(question.text, question)
  }
  if (questions.size < count) {
    for (const operator of level.operators) {
      for (let first = left[0]; first <= left[1]; first++) {
        for (let second = right[0]; second <= right[1]; second++) {
          if (operator === '-' && second > first) break
          const question = makeQuestion(first, second, operator, rng)
          questions.set(question.text, question)
          if (questions.size === count) return [...questions.values()]
        }
      }
    }
  }
  const set = [...questions.values()]
  while (set.length < count) set.push(generateQuestion(level, difficulty, rng))
  return set
}
