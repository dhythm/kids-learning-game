import type { LevelDef } from '../lib/levels'
import type { DrillResult } from '../lib/scoring'
import type { BestScore } from '../lib/storage'

interface Props { level: LevelDef; result: DrillResult; best?: BestScore; isNewRecord: boolean; onRetry: () => void; onHome: () => void }

export default function ResultScreen({ level, result, best, isNewRecord, onRetry, onHome }: Props) {
  return <section className="sheet result">
    <span className="eyebrow">DRILL RESULT</span><h1>けっか</h1><p>{level.title}・よくがんばったね！</p>
    <div className="score-box">{isNewRecord && <span className="badge">☆ 新記録！</span>}<strong>{result.score}<small>てん</small></strong>ベスト: {best ? `${best.score}てん` : '—'}</div>
    <dl>{[['正答率', `${Math.round(100 * result.correct / result.total)}%`], ['せいかい', `${result.correct} / ${result.total}`], ['タイム', `${(result.timeMs / 1000).toFixed(1)}秒`], ['最大コンボ', `${result.maxCombo}コンボ`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <button className="action primary" onClick={onRetry}>もう一度あそぶ</button><button className="action" onClick={onHome}>レベルをえらぶ</button>
  </section>
}
