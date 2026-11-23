import { levels, type LevelDef } from '../lib/levels'
import { loadBest } from '../lib/storage'
import Workbook from './Workbook'

export default function HomeScreen({ onStart }: { onStart: (level: LevelDef) => void }) {
  const best = loadBest()
  return <>
    <section className="welcome">
      <div><span className="eyebrow">MATH WORKBOOK</span><h1>さんすうドリル</h1><p>10問ずつ、楽しく算数のれんしゅう！</p></div>
      <Workbook />
    </section>
    <section aria-labelledby="levels-title">
      <div className="section-heading"><h2 id="levels-title">レベルをえらぼう</h2><span>全6レベル</span></div>
      <div className="level-grid">{levels.map((level, index) => <button className="level-card" data-level={level.id} key={level.id} onClick={() => onStart(level)}>
        <span className="card-top"><span className="math-tile" aria-hidden="true">{level.icon}</span><span className="level-number">LEVEL 0{index + 1}</span><span className="grade">{level.gradeLabel}</span></span>
        <strong>{level.title}</strong><span className="description">{level.description}</span>
        <span className="card-bottom"><span>☆ {best[level.id] ? `ベスト: ${best[level.id].score}てん` : 'ベスト: —'}</span><span className="arrow" aria-hidden="true">→</span></span>
      </button>)}</div>
    </section>
  </>
}
