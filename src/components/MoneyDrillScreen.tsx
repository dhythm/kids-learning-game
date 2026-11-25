import type { MoneyLevel } from '../lib/money'
import type { MoneyQuestion } from '../lib/moneyQuestions'
import type { ReviewItem } from '../lib/review'
import type { DrillResult } from '../lib/scoring'
import DrillSession from './DrillSession'

interface Props { level: MoneyLevel; questions: MoneyQuestion[]; onFinish: (result: DrillResult, missed: ReviewItem[]) => void }

export default function MoneyDrillScreen({ level, questions, onFinish }: Props) {
  return <DrillSession level={level} eyebrow="MONEY DRILL" subtitle="ぜんぶで いくら？"
    questions={questions.map(({ coins, total, choices }) => ({ text: '', money: coins, answer: total, choices }))}
    onFinish={(result, attempts) => onFinish(result, attempts.filter(attempt => !attempt.correct).map(({ question, answeredAt }) => ({
      kind: 'money', levelId: level.id, coins: question.money, total: question.answer, missedAt: answeredAt,
    })))} />
}
