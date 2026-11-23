export type Operator = '+' | '-' | '×' | '÷'
type Range = readonly [number, number]

export interface LevelDef {
  id: string
  title: string
  gradeLabel: string
  description: string
  icon: string
  operators: readonly Operator[]
  left: Range
  right: Range
}

export const levels: LevelDef[] = [
  { id: 'add-basic', title: 'たしざん入門', gradeLabel: '小学1年目安', description: '1から10までの数をたしてみよう。', icon: '+', operators: ['+'], left: [1, 10], right: [1, 10] },
  { id: 'sub-basic', title: 'ひきざん入門', gradeLabel: '小学1〜2年', description: '20までの数で、ひきざんに挑戦！', icon: '−', operators: ['-'], left: [1, 20], right: [1, 20] },
  { id: 'addsub', title: 'たしざん・ひきざん', gradeLabel: '小学2〜3年', description: '2けたの数をたしたり、ひいたり。', icon: '±', operators: ['+', '-'], left: [10, 99], right: [10, 99] },
  { id: 'kuku', title: '九九', gradeLabel: '小学2〜3年', description: '1の段から9の段までおさらいしよう。', icon: '×', operators: ['×'], left: [1, 9], right: [1, 9] },
  { id: 'multiply', title: 'かけざん', gradeLabel: '小学3〜4年', description: '2けたと1けたのかけざんに挑戦！', icon: '×', operators: ['×'], left: [10, 99], right: [1, 9] },
  { id: 'divide', title: 'わりざん', gradeLabel: '小学3〜5年', description: 'ぴったりわりきれる数を見つけよう。', icon: '÷', operators: ['÷'], left: [1, 12], right: [1, 9] },
]
