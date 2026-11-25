import type { ClockLevel } from '../lib/clock'
import type { ClockQuestion } from '../lib/clockQuestions'
import type { ReviewItem } from '../lib/review'
import type { DrillResult } from '../lib/scoring'
import DrillSession from './DrillSession'

interface Props { level: ClockLevel; questions: ClockQuestion[]; onFinish: (result: DrillResult, missed: ReviewItem[]) => void }

export default function ClockDrillScreen({ level, questions, onFinish }: Props) {
  return <DrillSession level={level} eyebrow="CLOCK DRILL" subtitle="なんじ なんふん？"
    questions={questions.map(({ hour, minute, text, choices }) => ({ text, answer: text, choices, clock: { hour, minute } }))}
    onFinish={(result, attempts) => onFinish(result, attempts.filter(attempt => !attempt.correct).map(({ question, answeredAt }) => ({
      kind: 'clock', levelId: level.id, ...question.clock, missedAt: answeredAt,
    })))} />
}
