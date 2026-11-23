import type { LevelDef, Operator } from './levels'

export interface Question { text: string; answer: number; choices: number[] }
type Rng = () => number

function integer(min: number, max: number, rng: Rng) {
  return min + Math.floor(rng() * (max - min + 1))
}

function shuffle<T>(items: T[], rng: Rng) {
  for (let end = items.length - 1; end > 0; end--) {
    const index = integer(0, end, rng)
    ;[items[end], items[index]] = [items[index], items[end]]
  }
  return items
}

function makeQuestion(first: number, second: number, operator: Operator, rng: Rng): Question {
  const left = operator === '÷' ? first * second : first
  const answer = operator === '+' ? left + second : operator === '-' ? left - second : operator === '×' ? left * second : first
  const step = operator === '×' ? second : 10
  const misses = [...new Set([1, -1, 2, -2, step, -step, 3].map(offset => answer + offset))].filter(value => value >= 0)
  return { text: `${left} ${operator} ${second} = ?`, answer, choices: shuffle([answer, ...shuffle(misses, rng).slice(0, 3)], rng) }
}

export function generateQuestion(level: LevelDef, rng: Rng = Math.random) {
  const operator = level.operators[integer(0, level.operators.length - 1, rng)]
  const first = integer(...level.left, rng)
  const second = integer(level.right[0], operator === '-' ? Math.min(first, level.right[1]) : level.right[1], rng)
  return makeQuestion(first, second, operator, rng)
}

export function generateSet(level: LevelDef, count = 10, rng: Rng = Math.random) {
  const questions = new Map<string, Question>()
  for (let attempt = 0; questions.size < count && attempt < count * 3; attempt++) {
    const question = generateQuestion(level, rng)
    questions.set(question.text, question)
  }
  if (questions.size < count) {
    for (const operator of level.operators) {
      for (let first = level.left[0]; first <= level.left[1]; first++) {
        for (let second = level.right[0]; second <= level.right[1]; second++) {
          if (operator === '-' && second > first) break
          const question = makeQuestion(first, second, operator, rng)
          questions.set(question.text, question)
          if (questions.size === count) return [...questions.values()]
        }
      }
    }
  }
  const set = [...questions.values()]
  while (set.length < count) set.push(generateQuestion(level, rng))
  return set
}
