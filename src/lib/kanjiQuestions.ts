import type { KanjiEntry } from './kanji'
import { shuffle } from './shuffle'

export interface KanjiQuestion { entry: KanjiEntry; text: string; target: string; answer: string; choices: string[] }

function makeQuestion(entry: KanjiEntry, readings: string[], rng: () => number): KanjiQuestion {
  return { entry, text: entry.word, target: entry.kanji, answer: entry.wordReading, choices: readingChoices(entry.wordReading, readings, rng) }
}

export function readingChoices(answer: string, readings: string[], rng: () => number) {
  if (readings.length < 4) throw new RangeError('A drill needs four distinct readings')
  const others = shuffle(readings.filter(reading => reading !== answer), rng)
  others.sort((first, second) => Math.abs(first.length - answer.length) - Math.abs(second.length - answer.length))
  return shuffle([answer, ...others.slice(0, 3)], rng)
}

export function distinctReadings(entries: readonly KanjiEntry[]) {
  return [...new Set(entries.map(entry => entry.wordReading))]
}

export function generateKanjiQuestion(entries: readonly KanjiEntry[], rng = Math.random) {
  return makeQuestion(entries[Math.floor(rng() * entries.length)], distinctReadings(entries), rng)
}

export function generateKanjiSet(entries: readonly KanjiEntry[], count = 10, rng = Math.random) {
  if (!Number.isInteger(count) || count < 0 || count > entries.length) throw new RangeError('Invalid kanji set size')
  const readings = distinctReadings(entries)
  return shuffle([...entries], rng).slice(0, count).map(entry => makeQuestion(entry, readings, rng))
}
