import { useState } from 'react'
import { badges, earnedBadgeIds } from '../lib/badges'
import { difficulties, difficultyLabels, subjectKey, type Difficulty } from '../lib/difficulty'
import { levels, type LevelDef } from '../lib/levels'
import { currentStreak, loadStats, thisWeek } from '../lib/stats'
import { loadReview } from '../lib/review'
import { loadBest } from '../lib/storage'
import Workbook from './Workbook'
import { kanjiLevels, type KanjiLevel } from '../lib/kanji'
import { visualSubjects } from '../lib/visualSubjects'
import type { ClockLevel } from '../lib/clock'
import type { MoneyLevel } from '../lib/money'

interface Props { onStart: (level: LevelDef, difficulty: Difficulty) => void; onStageStart: (level: KanjiLevel | ClockLevel | MoneyLevel) => void; onReview: () => void; onReport: () => void }

export default function HomeScreen({ onStart, onStageStart, onReview, onReport }: Props) {
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
  const stats = loadStats(), today = new Date()
  const earned = earnedBadgeIds(stats), streak = currentStreak(stats, today)
  const review = loadReview(), count = (kind: typeof review[number]['kind']) => review.filter(item => item.kind === kind).length
  return <>
    <section className="welcome">
      <div><span className="eyebrow">MATH WORKBOOK</span><h1>さんすうドリル</h1><p>10問ずつ、楽しく算数のれんしゅう！</p></div>
      <Workbook />
    </section>
    <section className="learning-card" aria-label="学習ストリーク">
      <h2>{streak ? `🔥 ${streak}日 れんぞく がくしゅう中！` : 'きょうから はじめよう！'}</h2>
      <ul className="week-dots">{thisWeek(stats, today).map(day => <li key={day.date} className={day.played ? 'played' : ''}
        aria-current={day.isToday ? 'date' : undefined}><span className="sr-only">{day.date} {day.played ? '学習済み' : '未学習'} </span>{day.weekday}</li>)}</ul>
    </section>
    {review.length > 0 && <section className="learning-card" aria-labelledby="review-title"><h2 id="review-title">ふくしゅう</h2>
      <p>算数 {count('math')}問・漢字 {count('kanji')}問{count('clock') > 0 && `・とけい ${count('clock')}問`}{count('money') > 0 && `・おかね ${count('money')}問`}</p><button className="action primary" onClick={onReview}>ふくしゅうをはじめる</button>
    </section>}
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
    <section aria-labelledby="kanji-title">
      <div className="section-heading"><h2 id="kanji-title">かんじドリル</h2><span>全3学年</span></div>
      <div className="level-grid">{kanjiLevels.map(level => <button className="level-card" key={level.id} onClick={() => onStageStart(level)}>
        <strong>{level.title}</strong><span className="description">小学{level.grade}年・{level.entries.length}字</span>
        <span className="card-bottom">☆ ベスト: {best[level.id] ? `${best[level.id].score}てん` : '—'}<span className="arrow" aria-hidden="true">→</span></span>
      </button>)}</div>
    </section>
    {visualSubjects.map(subject => <section key={subject.title} aria-label={subject.title}>
      <div className="section-heading"><h2>{subject.title}</h2><span>全{subject.levels.length}ステージ</span></div>
      <div className="level-grid">{subject.levels.map(level => <button className="level-card" data-level={level.id} key={level.id} onClick={() => onStageStart(level)}>
        <strong>{level.title}</strong><span className="description">{level.description}</span>
        <span className="card-bottom">☆ ベスト: {best[level.id] ? `${best[level.id].score}てん` : '—'}<span className="arrow" aria-hidden="true">→</span></span>
      </button>)}</div>
    </section>)}
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
