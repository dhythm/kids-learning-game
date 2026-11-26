import type { Difficulty } from './difficulty'
import { wordProblemLevel } from './levels'
import { makeQuestion, type Question } from './questions'
import { shuffle } from './shuffle'

const names = ['はなこ', 'たろう', 'そら', 'ゆい', 'けん', 'みお', 'あおい', 'りく']
const foods = [['りんご', 'こ'], ['みかん', 'こ'], ['あめ', 'こ'], ['クッキー', 'まい'], ['いちご', 'こ']]
const items = [...foods, ['シール', 'まい'], ['えんぴつ', 'ほん'], ['どんぐり', 'こ'], ['ほん', 'さつ'], ['おりがみ', 'まい'], ['ビー玉', 'こ'], ['ノート', 'さつ']]
const templates = [
  ['+', '{name}は {item}を {first} もっています。{other}から {second} もらいました。ぜんぶで {how}に なりますか？'],
  ['+', '{item}を きのう {first}、きょう {second} かいました。あわせて {how}ですか？'],
  ['+', '{name}が {item}を {first}、{other}が {second} あつめました。ふたりで {how} あつめましたか？'],
  ['+', 'はこに {item}が {first} あります。{name}が {second} いれました。いま はこに {how} ありますか？'],
  ['-', '{item}が {first} ありました。{name}が {second} たべました。のこりは {how}ですか？', 'food'],
  ['-', '{name}は {item}を {first} もっています。{other}に {second} あげると、のこりは {how}ですか？'],
  ['-', '{name}は {item}を {first} もっていました。{second} なくしました。いま {how} もっていますか？'],
  ['-', 'ふくろに {item}が {first} あります。{second} とりだすと、ふくろには {how} のこりますか？'],
  ['-', '{name}は {item}を {first}、{other}は {second} もっています。{name}のほうが {how} おおいですか？'],
  ['-', 'あかい はこには {item}が {first}、あおい はこには {second} あります。かずの ちがいは {how}ですか？'],
  ['-', '{name}が あつめた {item}は {first}、{other}が あつめたのは {second}です。{other}のほうが {how} すくないですか？'],
  ['-', '{item}を きのう {first}、きょう {second} かいました。きのうは きょうより {how} おおく かいましたか？'],
] as const

function pick<Value>(values: readonly Value[], rng: () => number) { return values[Math.floor(rng() * values.length)] }

export function generateWordProblem(difficulty: Difficulty, rng = Math.random, template = pick(templates, rng)): Question {
  const [operator, story, category] = template
  const [min, max] = wordProblemLevel.ranges[difficulty].left
  const cap = { easy: 20, normal: 50, hard: 100 }[difficulty]
  const operand = () => min + Math.floor(rng() * (max - min + 1))
  let first = operator === '+' ? min : min + 1, second = min
  for (let attempt = 0; attempt < 24; attempt++) {
    const left = operand(), right = operand()
    if (operator === '+' ? left + right <= cap : left > right) {
      first = left; second = right; break
    }
  }
  const name = pick(names, rng), other = pick(names.filter(candidate => candidate !== name), rng)
  const [item, counter] = pick(category === 'food' ? foods : items, rng)
  const words: Record<string, string> = { name, other, item, first: `${first}${counter}`, second: `${second}${counter}`, how: counter === 'ほん' ? 'なんぼん' : `なん${counter}` }
  const prompt = story.replace(/\{(\w+)\}/g, (_, key: string) => words[key])
  return { ...makeQuestion(first, second, operator, rng), text: prompt, prompt }
}

export function generateWordSet(difficulty: Difficulty, count: number, rng: () => number) {
  const deck = shuffle([...templates], rng)
  return Array.from({ length: count }, (_, index) => generateWordProblem(difficulty, rng, deck[index % deck.length]))
}
