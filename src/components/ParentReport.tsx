import { difficulties, difficultyLabels, subjectKey } from '../lib/difficulty'
import { levels } from '../lib/levels'
import { kanjiLevels } from '../lib/kanji'
import { visualSubjects } from '../lib/visualSubjects'
import { currentStreak, localDate, totalCorrect, weekdays, type StatsStore } from '../lib/stats'

function accuracy(correct: number, questions: number) {
  return questions ? `${Math.round(100 * correct / questions)}%` : '—'
}

export default function ParentReport({ store, onHome }: { store: StatsStore; onHome: () => void }) {
  const subjects = Object.values(store.byKey)
  const plays = subjects.reduce((sum, subject) => sum + subject.plays, 0)
  const questions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0)
  const sections = levels.map(level => ({ title: level.title, column: '難易度',
    rows: difficulties.map(difficulty => ({ key: subjectKey(level.id, difficulty), label: difficultyLabels[difficulty] })) }))
  for (const subject of [{ title: 'かんじドリル', levels: kanjiLevels, column: '学年' }, ...visualSubjects.map(subject => ({ ...subject, column: 'ステージ' }))]) {
    const rows = subject.levels.filter(level => store.byKey[level.id]?.plays).map(level => ({ key: level.id, label: level.title }))
    if (rows.length) sections.push({ title: subject.title, column: subject.column, rows })
  }
  return <section className="sheet report">
    <h1>保護者向けレポート</h1>
    <h2>全体の記録</h2>
    <dl>{[['挑戦回数', `${plays}回`], ['問題数', `${questions}問`], ['正答率', accuracy(totalCorrect(store), questions)],
      ['累計プレイ日数', `${store.playDates.length}日`], ['現在の連続日数', `${currentStreak(store)}日`]].map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h2>最近の学習日</h2>
    {store.playDates.length ? <ul>{store.playDates.slice(-14).reverse().map(date => {
      const day = new Date(`${date}T12:00:00`)
      return <li key={date}><time dateTime={date}>{day.getMonth() + 1}月{day.getDate()}日（{weekdays[day.getDay()]}）</time></li>
    })}</ul> : <p>まだ記録がありません</p>}
    <h2>レベル別の記録</h2>
    {sections.map(section => {
      const rows = section.rows.flatMap(({ key, label }) => {
        const subject = store.byKey[key]
        if (!subject?.plays) return []
        return <tr key={key}><th scope="row">{label}</th><td>{subject.plays}回</td>
          <td>{accuracy(subject.totalCorrect, subject.totalQuestions)}</td><td>{(subject.totalTimeMs / subject.plays / 1000).toFixed(1)}秒</td>
          <td>{localDate(new Date(subject.lastPlayedAt))}</td></tr>
      })
      return <section key={section.title}><h3>{section.title}</h3>{rows.length ? <div className="table-scroll">
        <table aria-label={section.title}><thead><tr>{[section.column, '挑戦回数', '正答率', '平均タイム/回', '最終プレイ日'].map(title => <th key={title} scope="col">{title}</th>)}</tr></thead><tbody>{rows}</tbody></table>
      </div> : <p>まだ遊んでいません</p>}</section>
    })}
    <button className="action" onClick={onHome}>もどる</button>
  </section>
}
