import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => { localStorage.clear(); vi.useFakeTimers() })
afterEach(() => { cleanup(); vi.useRealTimers() })

function start() {
  render(<StrictMode><App /></StrictMode>)
  expect(screen.getByRole('heading', { name: 'さんすうドリル' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: /たしざん入門/ }))
}

function answerButton() {
  const equation = screen.getByRole('heading', { name: /\d+ \+ \d+ = \?/ }).textContent!
  const [left, right] = equation.match(/\d+/g)!.map(Number)
  return screen.getByRole('button', { name: String(left + right) })
}

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
  fireEvent.click(screen.getByRole('button', { name: 'レベルをえらぶ' }))
  expect(screen.getByRole('button', { name: /たしざん入門.*1900てん/ })).toBeVisible()
})

it('updates live time and clears pending work on unmount', () => {
  start()
  act(() => vi.advanceTimersByTime(1000))
  expect(screen.getByText('タイム 1秒')).toBeVisible()
  fireEvent.click(answerButton())
  cleanup()
  expect(vi.getTimerCount()).toBe(0)
})
