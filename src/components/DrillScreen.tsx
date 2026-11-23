import { useEffect, useRef, useState } from 'react'
import type { LevelDef } from '../lib/levels'
import type { Question } from '../lib/questions'
import { initialScore, scoreAnswer, type DrillResult } from '../lib/scoring'

interface Props { level: LevelDef; questions: Question[]; onFinish: (result: DrillResult) => void }

export default function DrillScreen({ level, questions, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [stats, setStats] = useState(initialScore)
  const [started] = useState(() => Date.now())
  const [seconds, setSeconds] = useState(0)
  const pending = useRef<number | null>(null)
  const question = questions[index]

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250)
    return () => {
      window.clearInterval(timer)
      if (pending.current !== null) window.clearTimeout(pending.current)
    }
  }, [started])

  function choose(value: number) {
    if (pending.current !== null) return
    const next = scoreAnswer(stats, value === question.answer)
    const timeMs = Date.now() - started
    setSelected(value)
    setStats(next)
    pending.current = window.setTimeout(() => {
      if (index + 1 === questions.length) {
        onFinish({ score: next.score, correct: next.correct, maxCombo: next.maxCombo, total: questions.length, timeMs })
      } else {
        pending.current = null
        setIndex(index + 1)
        setSelected(null)
      }
    }, 700)
  }

  return <section className="sheet" data-level={level.id}>
    <span className="eyebrow">MATH DRILL</span><h1>{level.title}</h1>
    <div className="drill-meta"><strong>{index + 1} / {questions.length}</strong><span>タイム {seconds}秒</span><span>{stats.score}てん</span></div>
    <progress value={index + 1} max={questions.length} aria-label="もんだいの進みぐあい" />
    <div className="combo">{stats.combo >= 2 && `🔥 ${stats.combo}コンボ`}</div>
    <h2 className="question" aria-live="polite">{question.text}</h2>
    <div className="choices">{question.choices.map(value => <button key={value} disabled={selected !== null} onClick={() => choose(value)} className={selected === null ? '' : value === question.answer ? 'correct' : value === selected ? 'wrong' : ''}>{value}</button>)}</div>
    <p className="feedback" role="status">{selected === null ? 'こたえをタップしよう' : selected === question.answer ? 'せいかい！' : `おしい！ せいかいは ${question.answer} だよ`}</p>
  </section>
}
