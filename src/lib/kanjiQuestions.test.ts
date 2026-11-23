import { expect, it } from 'vitest'
import { kanjiLevels } from './kanji'
import { generateKanjiQuestion, generateKanjiSet } from './kanjiQuestions'

function seededRng() {
  let state = 1234
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32)
}

it.each(kanjiLevels)('$id samples unique targets and offers four readings from that grade', ({ entries }) => {
  const questions = generateKanjiSet(entries, 10, seededRng())
  expect(questions).toEqual(generateKanjiSet(entries, 10, seededRng()))
  expect(questions).toHaveLength(10)
  expect(new Set(questions.map(question => question.target)).size).toBe(10)
  const readings = new Set(entries.map(entry => entry.wordReading))
  for (const { target, text, answer, choices } of [...questions, generateKanjiQuestion(entries, seededRng())]) {
    expect(entries.find(entry => entry.kanji === target)).toMatchObject({ word: text, wordReading: answer })
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain(answer)
    expect(choices.every(choice => readings.has(choice))).toBe(true)
  }
})
