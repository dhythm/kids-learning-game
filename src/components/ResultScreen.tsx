import type { BadgeDef } from '../lib/badges'
import type { DrillResult } from '../lib/scoring'
import type { BestScore } from '../lib/storage'

interface Props { title: string; subtitle?: string; result: DrillResult; best?: BestScore; newBadges: BadgeDef[]; isNewRecord: boolean; remaining?: number; onRetry?: () => void; onHome: () => void }

export default function ResultScreen({ title, subtitle, result, best, newBadges, isNewRecord, remaining, onRetry, onHome }: Props) {
  return <section className="sheet result">
    <span className="eyebrow">DRILL RESULT</span><h1>けっか</h1><p>{title}{subtitle && `（${subtitle}）`}・よくがんばったね！</p>
    <div className="score-box">{isNewRecord && <span className="badge">☆ 新記録！</span>}<strong>{result.score}<small>てん</small></strong>{remaining === undefined && `ベスト: ${best ? `${best.score}てん` : '—'}`}</div>
    {remaining !== undefined && remaining > 0 && <p>ふくしゅうリスト: あと{remaining}問</p>}
    <dl>{[['正答率', `${Math.round(100 * result.correct / result.total)}%`], ['せいかい', `${result.correct} / ${result.total}`], ['タイム', `${(result.timeMs / 1000).toFixed(1)}秒`], ['最大コンボ', `${result.maxCombo}コンボ`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {newBadges.length > 0 && <section className="new-badges"><h2>バッジをもらったよ！</h2>
      <ul className="badge-list">{newBadges.map(badge => <li key={badge.id} className="earned"><span aria-hidden="true">{badge.icon}</span> <strong>{badge.name}</strong></li>)}</ul>
    </section>}
    {onRetry && <button className="action primary" onClick={onRetry}>もう一度あそぶ</button>}<button className="action" onClick={onHome}>レベルをえらぶ</button>
  </section>
}
