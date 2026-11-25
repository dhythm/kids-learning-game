import grade1 from '../data/kanji-grade1.json'
import grade2 from '../data/kanji-grade2.json'
import grade3 from '../data/kanji-grade3.json'

export interface KanjiEntry { kanji: string; reading: string; word: string; wordReading: string; example: string }
type Grade = 1 | 2 | 3
export interface KanjiLevel { id: `kanji-g${Grade}`; grade: Grade; title: string; entries: readonly KanjiEntry[] }

export const kanjiLevels: readonly KanjiLevel[] = [
  { id: 'kanji-g1', grade: 1, title: '1年生の漢字', entries: grade1 },
  { id: 'kanji-g2', grade: 2, title: '2年生の漢字', entries: grade2 },
  { id: 'kanji-g3', grade: 3, title: '3年生の漢字', entries: grade3 },
]
