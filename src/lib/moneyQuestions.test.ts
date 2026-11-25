import { expect, it } from 'vitest'
import { coinsSignature, moneyLevels } from './money'
import { generateMoneyQuestion, generateMoneySet } from './moneyQuestions'

it.each(moneyLevels)('$id respects coin, bill, amount and choice limits', stage => {
  const bills = new Set<number>()
  for (let index = 0; index < 121; index++) {
    const { coins, total, choices } = generateMoneyQuestion(stage, () => index / 121)
    expect(total).toBe(coins.reduce((sum, coin) => sum + coin.denom * coin.count, 0))
    expect(total).toBeLessThanOrEqual(stage.cap)
    let coinCount = 0, previous = Infinity
    for (const { denom, count } of coins) {
      expect([1, 5, 10, 50, 100, 500, 1000, 5000]).toContain(denom)
      expect(denom).toBeLessThan(previous)
      previous = denom
      expect(Number.isInteger(count) && count > 0).toBe(true)
      if (denom < 1000) coinCount += count
      else { bills.add(denom); expect(count).toBe(1) }
    }
    expect(coinCount).toBeGreaterThanOrEqual(stage.minCoins)
    expect(coinCount).toBeLessThanOrEqual(stage.maxCoins)
    expect(choices).toContain(total)
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices.every(value => value >= 0 && (stage.id !== 'money-s1' || value <= 500))).toBe(true)
  }
  expect(bills).toEqual(new Set(stage.id === 'money-s3' ? [1000, 5000] : []))
  const set = generateMoneySet(stage, 10, () => 0)
  expect(set).toHaveLength(10)
  expect(new Set(set.map(({ coins }) => coinsSignature(coins))).size).toBe(10)
  expect(set.every(({ total }) => set.filter(question => question.total === total).length <= 2)).toBe(true)
})
