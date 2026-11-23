import DrillScreen from './DrillScreen'
import type { KanjiLevel } from '../lib/kanji'
import type { KanjiQuestion } from '../lib/kanjiQuestions'
import type { DrillResult } from '../lib/scoring'

interface Props { level: KanjiLevel; questions: KanjiQuestion[]; onFinish: (result: DrillResult) => void }

export default function KanjiDrillScreen(props: Props) {
  return <DrillScreen {...props} eyebrow="KANJI DRILL" subtitle="よみかたを えらぼう" />
}
