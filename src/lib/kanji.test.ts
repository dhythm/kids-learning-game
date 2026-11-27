import { expect, it } from 'vitest'
import { kanjiLevels } from './kanji'

it.each(kanjiLevels)('$id has a complete, well-formed vocabulary list', ({ grade, entries }) => {
  expect(entries).toHaveLength([80, 160, 200, 202, 193, 191][grade - 1])
  expect(new Set(entries.map(entry => entry.kanji)).size).toBe(entries.length)
  for (const { kanji, reading, word, wordReading, example } of entries) {
    expect(kanji).toMatch(/^\p{Script=Han}$/u)
    expect(reading).toMatch(/^[ぁ-ん]+$/)
    expect(word).toContain(kanji)
    expect(wordReading).toMatch(/^[ぁ-ん]+$/)
    expect(example.trim()).not.toBe('')
    expect(example).toContain(word)
    expect([...example].length).toBeGreaterThanOrEqual(8)
    expect([...example].length).toBeLessThanOrEqual(24)
  }
})

it('covers 1026 kanji without overlap between grades', () => {
  const kanji = kanjiLevels.flatMap(({ entries }) => entries.map(entry => entry.kanji))
  expect(kanji).toHaveLength(1026)
  expect(new Set(kanji).size).toBe(kanji.length)
})
