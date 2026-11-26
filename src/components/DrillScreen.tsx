import DrillSession from './DrillSession'
import { spokenQuestion } from '../lib/speech'
import { difficultyLabels, type Difficulty } from '../lib/difficulty'
import type { LevelDef } from '../lib/levels'
import type { Question } from '../lib/questions'
import type { ReviewItem } from '../lib/review'
import type { DrillResult } from '../lib/scoring'

interface Props { level: Pick<LevelDef, 'id' | 'title'>; difficulty: Difficulty; questions: Question[]; onFinish: (result: DrillResult, missed: ReviewItem[]) => void }

export default function DrillScreen({ level, difficulty, questions, onFinish }: Props) {
  return <DrillSession level={level} questions={questions} eyebrow="MATH DRILL" subtitle={difficultyLabels[difficulty]} spokenPrompt={question => question.prompt ?? spokenQuestion(question)}
    onFinish={(result, attempts) => onFinish(result, attempts.filter(attempt => !attempt.correct).map(({ question, answeredAt }) => ({
      kind: 'math', levelId: level.id, difficulty, first: question.first, second: question.second, operator: question.operator,
      text: question.text, promptText: question.prompt, answer: question.answer, missedAt: answeredAt,
    })))} />
}
