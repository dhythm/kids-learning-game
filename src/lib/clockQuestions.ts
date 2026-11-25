import type { ClockLevel, ClockTime } from './clock'
import { shuffle } from './shuffle'

export function formatTime(hour: number, minute: number) { return `${hour}時${minute ? `${minute}分` : ''}` }

function clockTime(minutes: number): ClockTime {
  const normalized = (minutes + 720) % 720
  return { hour: Math.floor(normalized / 60) || 12, minute: normalized % 60 }
}

export function clockChoices(stage: ClockLevel, hour: number, minute: number, rng = Math.random) {
  const offsets = shuffle([-60, -30, -15, -5, 5, 15, 30, 60].filter(offset => offset % stage.step === 0), rng)
  const others = offsets.slice(0, 3).map(offset => clockTime(hour * 60 + minute + offset))
  return shuffle([formatTime(hour, minute), ...others.map(time => formatTime(time.hour, time.minute))], rng)
}

function question(stage: ClockLevel, minutes: number, rng: () => number) {
  const { hour, minute } = clockTime(minutes)
  return { hour, minute, text: formatTime(hour, minute), choices: clockChoices(stage, hour, minute, rng) }
}
export type ClockQuestion = ReturnType<typeof question>

export function generateClockQuestion(stage: ClockLevel, rng = Math.random) {
  return question(stage, Math.floor(rng() * (720 / stage.step)) * stage.step, rng)
}

export function generateClockSet(stage: ClockLevel, count = 10, rng = Math.random) {
  const times = Array.from({ length: 720 / stage.step }, (_, index) => index * stage.step)
  if (!Number.isInteger(count) || count < 0 || count > times.length) throw new RangeError('Invalid clock set size')
  return shuffle(times, rng).slice(0, count).map(minutes => question(stage, minutes, rng))
}
