import { expect, it } from 'vitest'
import { kanjiLevels } from './kanji'

it.each(kanjiLevels)('$id has a complete, well-formed vocabulary list', ({ grade, entries }) => {
  expect(entries).toHaveLength([80, 160, 200][grade - 1])
  expect(new Set(entries.map(entry => entry.kanji)).size).toBe(entries.length)
  for (const { kanji, reading, word, wordReading } of entries) {
    expect(kanji).toMatch(/^\p{Script=Han}$/u)
    expect(reading).toMatch(/^[ぁ-んー]+$/)
    expect(word).toContain(kanji)
    expect(wordReading).toMatch(/^[ぁ-んー]+$/)
  }
})
