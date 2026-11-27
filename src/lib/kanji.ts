import grade1 from '../data/kanji-grade1.json'
import grade2 from '../data/kanji-grade2.json'
import grade3 from '../data/kanji-grade3.json'
import grade4 from '../data/kanji-grade4.json'
import grade5 from '../data/kanji-grade5.json'
import grade6 from '../data/kanji-grade6.json'

export interface KanjiEntry { kanji: string; reading: string; word: string; wordReading: string; example: string }
type Grade = 1 | 2 | 3 | 4 | 5 | 6
export interface KanjiLevel { id: `kanji-g${Grade}`; grade: Grade; title: string; entries: readonly KanjiEntry[] }

export const kanjiLevels: readonly KanjiLevel[] = [
  { id: 'kanji-g1', grade: 1, title: '1年生の漢字', entries: grade1 },
  { id: 'kanji-g2', grade: 2, title: '2年生の漢字', entries: grade2 },
  { id: 'kanji-g3', grade: 3, title: '3年生の漢字', entries: grade3 },
  { id: 'kanji-g4', grade: 4, title: '4年生の漢字', entries: grade4 },
  { id: 'kanji-g5', grade: 5, title: '5年生の漢字', entries: grade5 },
  { id: 'kanji-g6', grade: 6, title: '6年生の漢字', entries: grade6 },
]
