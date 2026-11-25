import { useEffect, useRef, useState } from 'react'
import { initialScore, scoreAnswer, type DrillResult } from '../lib/scoring'

interface Prompt { text: string; target?: string; promptLabel?: string; answer: number | string; choices: (number | string)[] }
interface Attempt<Question> { question: Question; correct: boolean; answeredAt: number }
interface Props<Question extends Prompt> { level: { id: string; title: string }; eyebrow: string; subtitle?: string; questions: Question[]; onFinish: (result: DrillResult, attempts: Attempt<Question>[]) => void }

export default function DrillSession<Question extends Prompt>({ level, eyebrow, subtitle, questions, onFinish }: Props<Question>) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | string | null>(null)
  const [stats, setStats] = useState(initialScore)
  const [started] = useState(() => Date.now())
  const [seconds, setSeconds] = useState(0)
  const pending = useRef<number | null>(null)
  const attempts = useRef<Attempt<Question>[]>([])
  const question = questions[index]

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250)
    return () => {
      window.clearInterval(timer)
      if (pending.current !== null) window.clearTimeout(pending.current)
    }
  }, [started])

  function choose(value: number | string) {
    if (pending.current !== null) return
    const correct = value === question.answer
    const answeredAt = Date.now()
    attempts.current.push({ question, correct, answeredAt })
    const next = scoreAnswer(stats, correct)
    const timeMs = answeredAt - started
    setSelected(value)
    setStats(next)
    pending.current = window.setTimeout(() => {
      if (index + 1 === questions.length) {
        onFinish({ score: next.score, correct: next.correct, maxCombo: next.maxCombo, total: questions.length, timeMs }, attempts.current)
      } else {
        pending.current = null
        setIndex(index + 1)
        setSelected(null)
      }
    }, 700)
  }

  return <section className="sheet" data-level={level.id}>
    <span className="eyebrow">{eyebrow}</span><h1>{level.title}</h1><p>{question.promptLabel ?? subtitle}</p>
    <div className="drill-meta"><strong>{index + 1} / {questions.length}</strong><span>タイム {seconds}秒</span><span>{stats.score}てん</span></div>
    <progress value={index + 1} max={questions.length} aria-label="もんだいの進みぐあい" />
    <div className="combo">{stats.combo >= 2 && `🔥 ${stats.combo}コンボ`}</div>
    <h2 className="question" aria-label={question.text} aria-live="polite">{'target' in question ? [...question.text].map((character, position) =>
      character === question.target ? <span className="target-kanji" key={position}>{character}</span> : character) : question.text}</h2>
    <div className="choices">{question.choices.map(value => <button key={value} disabled={selected !== null} onClick={() => choose(value)} className={selected === null ? '' : value === question.answer ? 'correct' : value === selected ? 'wrong' : ''}>{value}</button>)}</div>
    <p className="feedback" role="status">{selected === null ? 'こたえをタップしよう' : selected === question.answer ? 'せいかい！' : `おしい！ せいかいは ${question.answer} だよ`}</p>
  </section>
}
