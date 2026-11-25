import { moneyTotal, type CoinGroup } from '../lib/money'

export default function MoneyVisual({ coins }: { coins: CoinGroup[] }) {
  return <div className="money-visual" role="img" aria-label={coins.map(({ denom, count }) => `${denom}円が${count}まい`).join('、')} data-total={moneyTotal(coins)}>
    {coins.flatMap(({ denom, count }) => Array.from({ length: count }, (_, index) =>
      <span key={`${denom}-${index}`} aria-hidden="true" className={denom >= 1000 ? 'yen-bill' : 'yen-coin'} data-denom={denom}>{denom}円</span>))}
  </div>
}
