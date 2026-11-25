import { denominations, moneyLevels, type CoinGroup, type MoneyLevel } from './money'
import { shuffle } from './shuffle'

interface Purse { coins: CoinGroup[]; total: number }
export interface MoneyQuestion extends Purse { choices: number[] }

function purses(stage: MoneyLevel) {
  const result: Purse[] = []
  function collect(index: number, coins: CoinGroup[], coinCount: number, total: number) {
    if (index === denominations.length) {
      if (coinCount >= stage.minCoins) result.push({ coins, total })
      return
    }
    const denom = denominations[index], bill = denom >= 1000
    const limit = bill ? Number(stage.id === 'money-s3') : stage.maxCoins - coinCount
    for (let count = 0; count <= limit && total + count * denom <= stage.cap; count++) {
      collect(index + 1, count ? [...coins, { denom, count }] : coins, coinCount + (bill ? 0 : count), total + count * denom)
    }
  }
  collect(0, [], 0, 0)
  return result
}

const pools = Object.fromEntries(moneyLevels.map(stage => [stage.id, purses(stage)]))

export function moneyChoices(stage: MoneyLevel, total: number, coins: CoinGroup[], rng = Math.random) {
  const steps = new Set([10, 50, 100, 500, ...coins.map(coin => coin.denom)])
  const others = [...steps].flatMap(step => [total - step, total + step])
    .filter(value => value >= 0 && value <= (stage.id === 'money-s1' ? 500 : stage.cap))
  return shuffle([total, ...shuffle(others, rng).slice(0, 3)], rng)
}

function question(stage: MoneyLevel, purse: Purse, rng: () => number): MoneyQuestion {
  const coins = purse.coins.map(coin => ({ ...coin }))
  return { coins, total: purse.total, choices: moneyChoices(stage, purse.total, coins, rng) }
}

export function generateMoneyQuestion(stage: MoneyLevel, rng = Math.random) {
  const pool = pools[stage.id]
  return question(stage, pool[Math.floor(rng() * pool.length)], rng)
}

export function generateMoneySet(stage: MoneyLevel, count = 10, rng = Math.random) {
  const pool = pools[stage.id]
  if (!Number.isInteger(count) || count < 0 || count > pool.length) throw new RangeError('Invalid money set size')
  const totals = new Map<number, number>(), preferred: Purse[] = [], overflow: Purse[] = []
  for (const purse of shuffle([...pool], rng)) {
    const used = totals.get(purse.total) ?? 0
    if (used < 2) { preferred.push(purse); totals.set(purse.total, used + 1) }
    else overflow.push(purse)
  }
  return preferred.concat(overflow).slice(0, count).map(purse => question(stage, purse, rng))
}
