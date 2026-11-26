import type { Difficulty } from './difficulty'

export type Operator = '+' | '-' | '×' | '÷'
type Range = readonly [number, number]

function operands(left: Range, right: Range = left) { return { left, right } }

export interface LevelDef {
  id: string
  title: string
  gradeLabel: string
  description: string
  icon: string
  operators: readonly Operator[]
  ranges: Record<Difficulty, { left: Range; right: Range }>
}

export const wordProblemLevel: LevelDef = {
  id: 'word-problems', title: 'ぶんしょうだい', gradeLabel: '小学1〜3年', description: 'おはなしの けいさん', icon: '📖', operators: ['+', '-'],
  ranges: { easy: operands([2, 9]), normal: operands([5, 30]), hard: operands([15, 99]) },
}

export const levels: LevelDef[] = [
  { id: 'add-basic', title: 'たしざん入門', gradeLabel: '小学1年目安', description: 'ふたつの数をたしてみよう。', icon: '+', operators: ['+'],
    ranges: { easy: operands([1, 5]), normal: operands([1, 10]), hard: operands([5, 20]) } },
  { id: 'sub-basic', title: 'ひきざん入門', gradeLabel: '小学1〜2年', description: 'ひいたらいくつになるかな？', icon: '−', operators: ['-'],
    ranges: { easy: operands([1, 10]), normal: operands([1, 20]), hard: operands([1, 50]) } },
  { id: 'addsub', title: 'たしざん・ひきざん', gradeLabel: '小学2〜3年', description: '大きな数をたしたり、ひいたり。', icon: '±', operators: ['+', '-'],
    ranges: { easy: operands([10, 30]), normal: operands([10, 99]), hard: operands([50, 299]) } },
  { id: 'kuku', title: '九九', gradeLabel: '小学2〜3年', description: '1の段から9の段までおさらいしよう。', icon: '×', operators: ['×'],
    ranges: { easy: operands([1, 5]), normal: operands([1, 9]), hard: operands([3, 9], [6, 9]) } },
  { id: 'multiply', title: 'かけざん', gradeLabel: '小学3〜4年', description: '2けたと1けたのかけざんに挑戦！', icon: '×', operators: ['×'],
    ranges: { easy: operands([10, 30], [2, 5]), normal: operands([10, 99], [1, 9]), hard: operands([20, 99], [6, 9]) } },
  { id: 'divide', title: 'わりざん', gradeLabel: '小学3〜5年', description: 'ぴったりわりきれる数を見つけよう。', icon: '÷', operators: ['÷'],
    ranges: { easy: operands([1, 5], [2, 5]), normal: operands([1, 12], [1, 9]), hard: operands([6, 12], [3, 12]) } },
  wordProblemLevel,
]
