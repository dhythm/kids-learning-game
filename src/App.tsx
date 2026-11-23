import { useState } from 'react'
import DrillScreen from './components/DrillScreen'
import HomeScreen from './components/HomeScreen'
import ResultScreen from './components/ResultScreen'
import type { LevelDef } from './lib/levels'
import { generateSet, type Question } from './lib/questions'
import type { DrillResult } from './lib/scoring'
import { getBest, saveResult, type BestScore } from './lib/storage'

type Screen = { name: 'home' } | { name: 'playing'; level: LevelDef; questions: Question[] } | { name: 'result'; level: LevelDef; result: DrillResult; isNewRecord: boolean; best?: BestScore }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  function start(level: LevelDef) { setScreen({ name: 'playing', level, questions: generateSet(level) }) }
  function finish(level: LevelDef, result: DrillResult) {
    const isNewRecord = saveResult(level.id, result)
    setScreen({ name: 'result', level, result, isNewRecord, best: getBest(level.id) })
  }
  return <>
    <header className="masthead"><div><span className="brand"><b aria-hidden="true">▦</b>まなびノート</span><span className="subject">さんすう</span></div></header>
    <main>{screen.name === 'home' ? <HomeScreen onStart={start} /> : screen.name === 'playing' ? <DrillScreen level={screen.level} questions={screen.questions} onFinish={result => finish(screen.level, result)} /> : <ResultScreen {...screen} onRetry={() => start(screen.level)} onHome={() => setScreen({ name: 'home' })} />}</main>
  </>
}
