import { difficulties, difficultyLabels, subjectKey } from '../lib/difficulty'
import { levels } from '../lib/levels'
import { currentStreak, localDate, totalCorrect, type StatsStore } from '../lib/stats'

function accuracy(correct: number, questions: number) {
  return questions ? `${Math.round(100 * correct / questions)}%` : '—'
}

export default function ParentReport({ store, onHome }: { store: StatsStore; onHome: () => void }) {
  const subjects = Object.values(store.byKey)
  const plays = subjects.reduce((sum, subject) => sum + subject.plays, 0)
  const questions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0)
  return <section className="sheet report">
    <h1>保護者向けレポート</h1>
    <h2>全体の記録</h2>
    <dl>{[['挑戦回数', `${plays}回`], ['問題数', `${questions}問`], ['正答率', accuracy(totalCorrect(store), questions)],
      ['累計プレイ日数', `${store.playDates.length}日`], ['現在の連続日数', `${currentStreak(store)}日`]].map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h2>レベル別の記録</h2>
    {levels.map(level => {
      const rows = difficulties.flatMap(difficulty => {
        const subject = store.byKey[subjectKey(level.id, difficulty)]
        if (!subject?.plays) return []
        return <tr key={difficulty}><th scope="row">{difficultyLabels[difficulty]}</th><td>{subject.plays}回</td>
          <td>{accuracy(subject.totalCorrect, subject.totalQuestions)}</td><td>{(subject.totalTimeMs / subject.plays / 1000).toFixed(1)}秒</td>
          <td>{localDate(new Date(subject.lastPlayedAt))}</td></tr>
      })
      return <section key={level.id}><h3>{level.title}</h3>{rows.length ? <div className="table-scroll">
        <table aria-label={level.title}><thead><tr>{['難易度', '挑戦回数', '正答率', '平均タイム/回', '最終プレイ日'].map(title => <th key={title} scope="col">{title}</th>)}</tr></thead><tbody>{rows}</tbody></table>
      </div> : <p>まだ遊んでいません</p>}</section>
    })}
    <button className="action" onClick={onHome}>もどる</button>
  </section>
}
