import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { kanjiLevels } from './lib/kanji'
import { loadStats, recordResult } from './lib/stats'
import { loadBest } from './lib/storage'

beforeEach(() => { localStorage.clear(); vi.useFakeTimers() })
afterEach(() => { cleanup(); vi.useRealTimers() })

function start() {
  render(<StrictMode><App /></StrictMode>)
  expect(screen.getByRole('heading', { name: 'さんすうドリル' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: /たしざん入門/ }))
  fireEvent.click(screen.getByRole('button', { name: /やさしい/ }))
  expect(screen.getByText('やさしい')).toBeVisible()
}

function answerButton() {
  const equation = screen.getByRole('heading', { name: /\d+ \+ \d+ = \?/ }).textContent!
  const [left, right] = equation.match(/\d+/g)!.map(Number)
  return screen.getByRole('button', { name: String(left + right) })
}

it('records a math miss, keeps it after a wrong review and clears it after a correct retry', () => {
  vi.setSystemTime(new Date(2024, 10, 24, 12))
  start()
  const wrongChoice = () => screen.getAllByRole('button').find(choice => choice !== answerButton())!
  for (let index = 0; index < 10; index++) {
    fireEvent.click(index === 9 ? wrongChoice() : answerButton())
    act(() => vi.advanceTimersByTime(700))
  }
  fireEvent.click(screen.getByRole('button', { name: 'レベルをえらぶ' }))
  expect(screen.getByText('算数 1問・漢字 0問')).toBeVisible()
  expect(screen.getByText('🔥 1日 れんぞく がくしゅう中！')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'ふくしゅうをはじめる' }))
  expect(screen.getByText('1 / 1')).toBeVisible()
  fireEvent.click(wrongChoice())
  act(() => vi.advanceTimersByTime(700))
  expect(screen.getByText('ふくしゅうリスト: あと1問')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'もう一度あそぶ' }))
  fireEvent.click(answerButton())
  act(() => vi.advanceTimersByTime(700))
  expect(screen.getByText('100%')).toBeVisible()
  expect(loadStats().byKey.review).toMatchObject({ plays: 2, totalCorrect: 1 })
  expect(loadBest()).not.toHaveProperty('review')
  fireEvent.click(screen.getByRole('button', { name: 'レベルをえらぶ' }))
  expect(screen.queryByRole('region', { name: 'ふくしゅう' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '保護者向けレポート' }))
  expect(screen.getByText('11月24日（日）')).toBeVisible()
})

it('gives immediate feedback, advances once, saves a record, and replays', () => {
  start()
  for (let index = 1; index <= 10; index++) {
    expect(screen.getByText(`${index} / 10`)).toBeVisible()
    const choice = answerButton()
    fireEvent.click(choice)
    fireEvent.click(choice)
    expect(screen.getByRole('status')).toHaveTextContent('せいかい！')
    expect(screen.getByRole('button', { name: choice.textContent! })).toBeDisabled()
    act(() => vi.advanceTimersByTime(700))
  }
  expect(screen.getByRole('heading', { name: 'けっか' })).toBeVisible()
  expect(screen.getByText(/新記録！/)).toBeVisible()
  expect(screen.getByText('100%')).toBeVisible()
  expect(screen.getByText('はじめの一歩')).toBeVisible()
  expect(screen.getByText(/たしざん入門（やさしい）/)).toBeVisible()
  expect(screen.getByText(/ベスト: 1900てん/)).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'もう一度あそぶ' }))
  expect(screen.getByText('1 / 10')).toBeVisible()
  for (let index = 0; index < 10; index++) {
    const correct = answerButton()
    fireEvent.click(screen.getAllByRole('button').find(choice => choice !== correct)!)
    expect(screen.getByRole('status')).toHaveTextContent(`せいかいは ${correct.textContent}`)
    act(() => vi.advanceTimersByTime(700))
  }
  expect(screen.queryByText(/新記録！/)).not.toBeInTheDocument()
  expect(screen.queryByText('はじめの一歩')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'レベルをえらぶ' }))
  expect(screen.getByRole('button', { name: /たしざん入門.*1900てん/ })).toBeVisible()
  expect(screen.getByText(/はじめの一歩/)).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '保護者向けレポート' }))
  const report = screen.getByRole('table', { name: 'たしざん入門' })
  expect(within(report).getByRole('row', { name: /やさしい 2回 50%/ })).toBeVisible()
  expect(screen.getByText('20問')).toBeVisible()
  expect(screen.getAllByText('まだ遊んでいません')).toHaveLength(5)
  fireEvent.click(screen.getByRole('button', { name: 'もどる' }))
  fireEvent.click(screen.getByRole('button', { name: /たしざん入門/ }))
  expect(screen.getByRole('button', { name: /やさしい.*1900てん/ })).toBeVisible()
  expect(screen.getByRole('button', { name: /ふつう.*—/ })).toBeVisible()
})

it('updates live time and clears pending work on unmount', () => {
  start()
  act(() => vi.advanceTimersByTime(1000))
  expect(screen.getByText('タイム 1秒')).toBeVisible()
  fireEvent.click(answerButton())
  cleanup()
  expect(vi.getTimerCount()).toBe(0)
})

it('replays a missed kanji word with its original reading', () => {
  render(<StrictMode><App /></StrictMode>)
  fireEvent.click(screen.getByRole('button', { name: /2年生の漢字/ }))
  let missed = kanjiLevels[1].entries[0]
  for (let index = 0; index < 10; index++) {
    const word = screen.getByRole('heading', { level: 2 }).textContent
    const entry = kanjiLevels[1].entries.find(candidate => candidate.word === word)!
    const answer = screen.getByRole('button', { name: entry.wordReading })
    if (index === 0) missed = entry
    fireEvent.click(index === 0 ? screen.getAllByRole('button').find(choice => choice !== answer)! : answer)
    act(() => vi.advanceTimersByTime(700))
  }
  fireEvent.click(screen.getByRole('button', { name: 'レベルをえらぶ' }))
  expect(screen.getByText('算数 0問・漢字 1問')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'ふくしゅうをはじめる' }))
  expect(screen.getByRole('heading', { name: missed.word })).toBeVisible()
  expect(screen.getByText('よみかたを えらぼう')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: missed.wordReading }))
  act(() => vi.advanceTimersByTime(700))
  expect(screen.getByText('100%')).toBeVisible()
})

it('lists only the latest fourteen local play dates, newest first', () => {
  render(<App />)
  expect(screen.getByText('きょうから はじめよう！')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '保護者向けレポート' }))
  expect(screen.getByText('まだ記録がありません')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'もどる' }))
  for (let day = 10; day <= 24; day++) recordResult('review', { correct: 1, maxCombo: 1, total: 1, timeMs: 1000 }, new Date(2024, 10, day))
  fireEvent.click(screen.getByRole('button', { name: '保護者向けレポート' }))
  const dates = screen.getAllByRole('listitem')
  expect(dates).toHaveLength(14)
  expect(dates[0]).toHaveTextContent('11月24日（日）')
  expect(dates[13]).toHaveTextContent('11月11日（月）')
})

it('plays a kanji set, awards badges, and reports the plain grade key', () => {
  const grade = kanjiLevels[0]
  render(<StrictMode><App /></StrictMode>)
  fireEvent.click(screen.getByRole('button', { name: /1年生の漢字/ }))
  for (let index = 1; index <= 10; index++) {
    expect(screen.getByText(`${index} / 10`)).toBeVisible()
    const word = screen.getByRole('heading', { level: 2 }).textContent
    const entry = grade.entries.find(candidate => candidate.word === word)!
    fireEvent.click(screen.getByRole('button', { name: entry.wordReading }))
    expect(screen.getByRole('status')).toHaveTextContent('せいかい！')
    act(() => vi.advanceTimersByTime(700))
  }
  expect(screen.getByText('はじめの一歩')).toBeVisible()
  expect(loadStats().byKey['kanji-g1'].plays).toBe(1)
  expect(loadBest()['kanji-g1'].score).toBe(1900)
  fireEvent.click(screen.getByRole('button', { name: 'レベルをえらぶ' }))
  expect(screen.getByRole('button', { name: /1年生の漢字.*1900てん/ })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '保護者向けレポート' }))
  expect(screen.getByRole('row', { name: /1年生の漢字 1回 100%/ })).toBeVisible()
  expect(screen.queryByText('2年生の漢字')).not.toBeInTheDocument()
})
