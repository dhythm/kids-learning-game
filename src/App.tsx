import { useState } from 'react'
import DrillScreen from './components/DrillScreen'
import HomeScreen from './components/HomeScreen'
import ResultScreen from './components/ResultScreen'
import ParentReport from './components/ParentReport'
import { earnedBadgeIds, earnedBadges, type BadgeDef } from './lib/badges'
import { subjectKey, type Difficulty } from './lib/difficulty'
import { loadStats, recordResult } from './lib/stats'
import type { LevelDef } from './lib/levels'
import { generateSet, type Question } from './lib/questions'
import type { DrillResult } from './lib/scoring'
import { getBest, saveResult, type BestScore } from './lib/storage'

type Selection = { level: LevelDef; difficulty: Difficulty }
type Screen = { name: 'home' } | { name: 'report' }
  | (Selection & { name: 'playing'; questions: Question[] })
  | (Selection & { name: 'result'; result: DrillResult; isNewRecord: boolean; best?: BestScore; newBadges: BadgeDef[] })

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  function home() { setScreen({ name: 'home' }) }
  function start(level: LevelDef, difficulty: Difficulty) {
    setScreen({ name: 'playing', level, difficulty, questions: generateSet(level, difficulty) })
  }
  function finish({ level, difficulty }: Selection, result: DrillResult) {
    const key = subjectKey(level.id, difficulty)
    const previous = earnedBadgeIds(loadStats())
    const newBadges = earnedBadges(recordResult(key, result)).filter(badge => !previous.has(badge.id))
    const isNewRecord = saveResult(key, result)
    setScreen({ name: 'result', level, difficulty, result, newBadges, isNewRecord, best: getBest(key) })
  }
  return <>
    <header className="masthead"><div><span className="brand"><b aria-hidden="true">▦</b>まなびノート</span><span className="subject">さんすう</span></div></header>
    <main>
      {screen.name === 'home' && <HomeScreen onStart={start} onReport={() => setScreen({ name: 'report' })} />}
      {screen.name === 'report' && <ParentReport store={loadStats()} onHome={home} />}
      {screen.name === 'playing' && <DrillScreen {...screen} onFinish={result => finish(screen, result)} />}
      {screen.name === 'result' && <ResultScreen {...screen} onRetry={() => start(screen.level, screen.difficulty)} onHome={home} />}
    </main>
  </>
}
