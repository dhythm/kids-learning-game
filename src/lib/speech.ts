import type { Question } from './questions'

export function isSpeechAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function'
  } catch { return false }
}

export function speak(text: string, opts?: { rate?: number }): boolean {
  if (!isSpeechAvailable()) return false
  try {
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = opts?.rate ?? 0.95
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
    return true
  } catch { return false }
}

export function stopSpeaking() {
  try { if (isSpeechAvailable()) window.speechSynthesis.cancel() } catch {}
}

const verbs = { '+': 'たす', '-': 'ひく', '×': 'かける', '÷': 'わる' }

export function spokenQuestion({ first, second, operator }: Pick<Question, 'first' | 'second' | 'operator'>) {
  return `${first} ${verbs[operator]} ${second} は？`
}
