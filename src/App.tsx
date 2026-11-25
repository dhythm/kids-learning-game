import { useState } from 'react'
import DrillScreen from './components/DrillScreen'
import KanjiDrillScreen from './components/KanjiDrillScreen'
import ClockDrillScreen from './components/ClockDrillScreen'
import MoneyDrillScreen from './components/MoneyDrillScreen'
import type { ClockLevel } from './lib/clock'
import type { MoneyLevel } from './lib/money'
import { generateClockSet, type ClockQuestion } from './lib/clockQuestions'
import { generateMoneySet, type MoneyQuestion } from './lib/moneyQuestions'
import HomeScreen from './components/HomeScreen'
import ResultScreen from './components/ResultScreen'
import ParentReport from './components/ParentReport'
import ReviewDrillScreen from './components/ReviewDrillScreen'
import { addMissed, loadReview, removeSolved, toReviewQuestions, type ReviewItem, type ReviewQuestion } from './lib/review'
import { earnedBadgeIds, earnedBadges, type BadgeDef } from './lib/badges'
import { difficultyLabels, subjectKey, type Difficulty } from './lib/difficulty'
import type { KanjiLevel } from './lib/kanji'
import { generateKanjiSet, type KanjiQuestion } from './lib/kanjiQuestions'
import { loadStats, recordResult } from './lib/stats'
import type { LevelDef } from './lib/levels'
import { generateDanSet, type DanLevel } from './lib/kukuDan'
import { generateSet, type Question } from './lib/questions'
import type { DrillResult } from './lib/scoring'
import { getBest, saveResult, type BestScore } from './lib/storage'

type MathSelection = { level: LevelDef; difficulty: Difficulty } | { level: DanLevel; difficulty: 'normal' }
type KanjiSelection = { level: KanjiLevel }
type Selection = MathSelection | { level: KanjiLevel | ClockLevel | MoneyLevel }
type Screen = { name: 'home' } | { name: 'report' }
  | (MathSelection & { name: 'math'; questions: Question[] })
  | (KanjiSelection & { name: 'kanji'; questions: KanjiQuestion[] })
  | { name: 'clock'; level: ClockLevel; questions: ClockQuestion[] }
  | { name: 'money'; level: MoneyLevel; questions: MoneyQuestion[] }
  | { name: 'review'; questions: ReviewQuestion[] }
  | { name: 'result'; selection: Selection | null; result: DrillResult; isNewRecord: boolean; best?: BestScore; newBadges: BadgeDef[]; remaining?: number }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  function home() { setScreen({ name: 'home' }) }
  function start(selection: Selection) {
    if ('difficulty' in selection) {
      const { level, difficulty } = selection
      const questions = 'dan' in level ? generateDanSet(level.dan) : generateSet(level, difficulty)
      setScreen({ ...selection, name: 'math', questions })
    } else {
      const { level } = selection
      if ('step' in level) setScreen({ name: 'clock', level, questions: generateClockSet(level) })
      else if ('minCoins' in level) setScreen({ name: 'money', level, questions: generateMoneySet(level) })
      else setScreen({ name: 'kanji', level, questions: generateKanjiSet(level.entries) })
    }
  }
  function startReview() {
    const questions = toReviewQuestions(loadReview())
    setScreen(questions.length ? { name: 'review', questions } : { name: 'home' })
  }
  function record(key: string, result: DrillResult) {
    const previous = earnedBadgeIds(loadStats())
    return earnedBadges(recordResult(key, result)).filter(badge => !previous.has(badge.id))
  }
  function finishReview(result: DrillResult, solvedKeys: string[]) {
    const remaining = removeSolved(solvedKeys).length
    setScreen({ name: 'result', selection: null, result, remaining, newBadges: record('review', result), isNewRecord: false })
  }
  function finish(selection: Selection, result: DrillResult, missed: ReviewItem[]) {
    addMissed(missed)
    const key = 'difficulty' in selection ? subjectKey(selection.level.id, selection.difficulty) : selection.level.id
    const newBadges = record(key, result)
    const isNewRecord = saveResult(key, result)
    setScreen({ name: 'result', selection, result, newBadges, isNewRecord, best: getBest(key) })
  }
  return <>
    <header className="masthead"><div><span className="brand"><b aria-hidden="true">▦</b>まなびノート</span><span className="subject">さんすう・かんじ・とけい・おかね</span></div></header>
    <main>
      {screen.name === 'home' && <HomeScreen onStart={(level, difficulty) => start({ level, difficulty })} onDanStart={level => start({ level, difficulty: 'normal' })}
        onStageStart={level => start({ level })} onReview={startReview} onReport={() => setScreen({ name: 'report' })} />}
      {screen.name === 'report' && <ParentReport store={loadStats()} onHome={home} />}
      {screen.name === 'math' && <DrillScreen {...screen} onFinish={(result, missed) => finish(screen, result, missed)} />}
      {screen.name === 'kanji' && <KanjiDrillScreen {...screen} onFinish={(result, missed) => finish(screen, result, missed)} />}
      {screen.name === 'clock' && <ClockDrillScreen {...screen} onFinish={(result, missed) => finish(screen, result, missed)} />}
      {screen.name === 'money' && <MoneyDrillScreen {...screen} onFinish={(result, missed) => finish(screen, result, missed)} />}
      {screen.name === 'review' && <ReviewDrillScreen {...screen} onFinish={finishReview} />}
      {screen.name === 'result' && <ResultScreen {...screen} title={screen.selection?.level.title ?? 'ふくしゅう'}
        subtitle={screen.selection && 'difficulty' in screen.selection ? difficultyLabels[screen.selection.difficulty] : undefined}
        onRetry={screen.remaining === 0 ? undefined : () => screen.selection ? start(screen.selection) : startReview()} onHome={home} />}
    </main>
  </>
}
