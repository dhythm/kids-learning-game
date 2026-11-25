import { afterEach, expect, it, vi } from 'vitest'
import { isSpeechAvailable, speak, spokenQuestion, stopSpeaking } from './speech'

function mockSpeech() {
  const synth = { cancel: vi.fn(), speak: vi.fn() }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(readonly text: string) {} })
  return synth
}

afterEach(() => vi.unstubAllGlobals())

it('cancels first, then speaks the supplied text in Japanese', () => {
  const synth = mockSpeech()
  expect(speak('こんにちは')).toBe(true)
  expect(synth.speak).toHaveBeenCalledWith(expect.objectContaining({ text: 'こんにちは', lang: 'ja-JP', rate: 0.95, pitch: 1 }))
  expect(synth.cancel.mock.invocationCallOrder[0]).toBeLessThan(synth.speak.mock.invocationCallOrder[0])
  expect(speak('もういちど', { rate: 0.8 })).toBe(true)
  expect(synth.speak).toHaveBeenLastCalledWith(expect.objectContaining({ rate: 0.8 }))
  stopSpeaking()
  expect(synth.cancel).toHaveBeenCalledTimes(3)
})

it.each(['speechSynthesis', 'SpeechSynthesisUtterance'])('does nothing without %s', name => {
  const synth = mockSpeech()
  vi.stubGlobal(name, undefined)
  expect(isSpeechAvailable()).toBe(false)
  expect(speak('きく')).toBe(false)
  stopSpeaking()
  expect(synth.cancel).not.toHaveBeenCalled()
  expect(synth.speak).not.toHaveBeenCalled()
})

it('returns false if the browser rejects speech', () => {
  mockSpeech().speak.mockImplementation(() => { throw new Error('unavailable') })
  expect(speak('きく')).toBe(false)
})

it.each([['×', 'かける'], ['+', 'たす'], ['-', 'ひく'], ['÷', 'わる']] as const)('reads %s with both operands', (operator, verb) => {
  expect(spokenQuestion({ first: 7, second: 8, operator })).toBe(`7 ${verb} 8 は？`)
})
