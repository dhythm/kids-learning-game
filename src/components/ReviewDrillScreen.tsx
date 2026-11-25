import type { ReviewQuestion } from '../lib/review'
import type { DrillResult } from '../lib/scoring'
import DrillSession from './DrillSession'

interface Props { questions: ReviewQuestion[]; onFinish: (result: DrillResult, solvedKeys: string[]) => void }

export default function ReviewDrillScreen({ questions, onFinish }: Props) {
  return <DrillSession level={{ id: 'review', title: 'ふくしゅう' }} eyebrow="REVIEW"
    questions={questions.map(question => ({ ...question, text: question.prompt }))}
    onFinish={(result, attempts) => onFinish(result, attempts.filter(attempt => attempt.correct).map(attempt => attempt.question.key))} />
}
