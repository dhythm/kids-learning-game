import { useState } from 'react'
import { badges, earnedBadgeIds } from '../lib/badges'
import { difficulties, difficultyLabels, subjectKey, type Difficulty } from '../lib/difficulty'
import { levels, type LevelDef } from '../lib/levels'
import { loadStats } from '../lib/stats'
import { loadBest } from '../lib/storage'
import Workbook from './Workbook'

interface Props { onStart: (level: LevelDef, difficulty: Difficulty) => void; onReport: () => void }

export default function HomeScreen({ onStart, onReport }: Props) {
  const [selected, select] = useState<LevelDef | null>(null)
  const best = loadBest()
  if (selected) return <section className="sheet" data-level={selected.id}>
    <span className="eyebrow">{selected.title}</span><h1>むずかしさをえらぼう</h1>
    {difficulties.map(difficulty => {
      const record = best[subjectKey(selected.id, difficulty)]
      return <button className="action difficulty" key={difficulty} onClick={() => onStart(selected, difficulty)}>
        {difficultyLabels[difficulty]}<small>☆ ベスト: {record ? `${record.score}てん` : '—'}</small>
      </button>
    })}
    <button className="action" onClick={() => select(null)}>もどる</button>
  </section>
  const earned = earnedBadgeIds(loadStats())
  return <>
    <section className="welcome">
      <div><span className="eyebrow">MATH WORKBOOK</span><h1>さんすうドリル</h1><p>10問ずつ、楽しく算数のれんしゅう！</p></div>
      <Workbook />
    </section>
    <section aria-labelledby="levels-title">
      <div className="section-heading"><h2 id="levels-title">レベルをえらぼう</h2><span>全6レベル</span></div>
      <div className="level-grid">{levels.map((level, index) => {
        const scores = difficulties.flatMap(difficulty => best[subjectKey(level.id, difficulty)]?.score ?? [])
        return <button className="level-card" data-level={level.id} key={level.id} onClick={() => select(level)}>
        <span className="card-top"><span className="math-tile" aria-hidden="true">{level.icon}</span><span className="level-number">LEVEL 0{index + 1}</span><span className="grade">{level.gradeLabel}</span></span>
        <strong>{level.title}</strong><span className="description">{level.description}</span>
        <span className="card-bottom"><span>☆ ベスト: {scores.length ? `${Math.max(...scores)}てん` : '—'}</span><span className="arrow" aria-hidden="true">→</span></span>
      </button>})}</div>
    </section>
    <section aria-labelledby="badge-title">
      <div className="section-heading"><h2 id="badge-title">バッジ</h2><span>{earned.size} / {badges.length}</span></div>
      <ul className="badge-list">{badges.map(badge => <li key={badge.id} className={earned.has(badge.id) ? 'earned' : 'locked'}>
        <strong><span aria-hidden="true">{badge.icon}</span> {badge.name}</strong>
        <small>{earned.has(badge.id) ? '獲得！' : badge.description}</small>
      </li>)}</ul>
    </section>
    <button className="action" onClick={onReport}>保護者向けレポート</button>
  </>
}
