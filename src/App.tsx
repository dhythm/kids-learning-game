import { useState } from 'react'
import DrillScreen from './components/DrillScreen'
import KanjiDrillScreen from './components/KanjiDrillScreen'
import HomeScreen from './components/HomeScreen'
import ResultScreen from './components/ResultScreen'
import ParentReport from './components/ParentReport'
import { earnedBadgeIds, earnedBadges, type BadgeDef } from './lib/badges'
import { difficultyLabels, subjectKey, type Difficulty } from './lib/difficulty'
import type { KanjiLevel } from './lib/kanji'
import { generateKanjiSet, type KanjiQuestion } from './lib/kanjiQuestions'
import { loadStats, recordResult } from './lib/stats'
import type { LevelDef } from './lib/levels'
import { generateSet, type Question } from './lib/questions'
import type { DrillResult } from './lib/scoring'
import { getBest, saveResult, type BestScore } from './lib/storage'

type MathSelection = { level: LevelDef; difficulty: Difficulty }
type KanjiSelection = { level: KanjiLevel }
type Selection = MathSelection | KanjiSelection
type Screen = { name: 'home' } | { name: 'report' }
  | (MathSelection & { name: 'math'; questions: Question[] })
  | (KanjiSelection & { name: 'kanji'; questions: KanjiQuestion[] })
  | { name: 'result'; selection: Selection; result: DrillResult; isNewRecord: boolean; best?: BestScore; newBadges: BadgeDef[] }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  function home() { setScreen({ name: 'home' }) }
  function start(selection: Selection) {
    if ('difficulty' in selection) {
      const { level, difficulty } = selection
      setScreen({ name: 'math', level, difficulty, questions: generateSet(level, difficulty) })
    } else {
      const { level } = selection
      setScreen({ name: 'kanji', level, questions: generateKanjiSet(level.entries) })
    }
  }
  function finish(selection: Selection, result: DrillResult) {
    const key = 'difficulty' in selection ? subjectKey(selection.level.id, selection.difficulty) : selection.level.id
    const previous = earnedBadgeIds(loadStats())
    const newBadges = earnedBadges(recordResult(key, result)).filter(badge => !previous.has(badge.id))
    const isNewRecord = saveResult(key, result)
    setScreen({ name: 'result', selection, result, newBadges, isNewRecord, best: getBest(key) })
  }
  return <>
    <header className="masthead"><div><span className="brand"><b aria-hidden="true">▦</b>まなびノート</span><span className="subject">さんすう・かんじ</span></div></header>
    <main>
      {screen.name === 'home' && <HomeScreen onStart={(level, difficulty) => start({ level, difficulty })} onKanjiStart={level => start({ level })} onReport={() => setScreen({ name: 'report' })} />}
      {screen.name === 'report' && <ParentReport store={loadStats()} onHome={home} />}
      {screen.name === 'math' && <DrillScreen {...screen} eyebrow="MATH DRILL" subtitle={difficultyLabels[screen.difficulty]} onFinish={result => finish(screen, result)} />}
      {screen.name === 'kanji' && <KanjiDrillScreen {...screen} onFinish={result => finish(screen, result)} />}
      {screen.name === 'result' && <ResultScreen {...screen} title={screen.selection.level.title}
        subtitle={'difficulty' in screen.selection ? difficultyLabels[screen.selection.difficulty] : undefined}
        onRetry={() => start(screen.selection)} onHome={home} />}
    </main>
  </>
}
