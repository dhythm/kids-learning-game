import DrillSession from './DrillSession'
import type { ReviewItem } from '../lib/review'
import type { KanjiLevel } from '../lib/kanji'
import type { KanjiQuestion } from '../lib/kanjiQuestions'
import type { DrillResult } from '../lib/scoring'

interface Props { level: KanjiLevel; questions: KanjiQuestion[]; onFinish: (result: DrillResult, missed: ReviewItem[]) => void }

export default function KanjiDrillScreen({ level, questions, onFinish }: Props) {
  return <DrillSession level={level} questions={questions} eyebrow="KANJI DRILL" subtitle="よみかたを えらぼう"
    onFinish={(result, attempts) => onFinish(result, attempts.filter(attempt => !attempt.correct).map(({ question: { entry }, answeredAt }) => ({
      kind: 'kanji', gradeId: level.id, kanji: entry.kanji, word: entry.word, wordReading: entry.wordReading, missedAt: answeredAt,
    })))} />
}
