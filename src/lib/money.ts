export const moneyLevels = [
  { id: 'money-s1', title: 'こうかだけ', description: 'こうかを 2〜4まい かぞえよう', minCoins: 2, maxCoins: 4, cap: 300 },
  { id: 'money-s2', title: 'こうか いろいろ', description: 'こうかを 3〜6まい かぞえよう', minCoins: 3, maxCoins: 6, cap: 1000 },
  { id: 'money-s3', title: 'おさつも いっしょ', description: 'おさつと こうかを あわせてみよう', minCoins: 2, maxCoins: 5, cap: 6000 },
] as const

export type MoneyLevel = typeof moneyLevels[number]
export interface CoinGroup { denom: number; count: number }
export const denominations = [5000, 1000, 500, 100, 50, 10, 5, 1]
export function moneyTotal(coins: CoinGroup[]) { return coins.reduce((sum, coin) => sum + coin.denom * coin.count, 0) }
export function coinsSignature(coins: CoinGroup[]) {
  return [...coins].sort((first, second) => second.denom - first.denom).map(coin => `${coin.denom}x${coin.count}`).join(',')
}
