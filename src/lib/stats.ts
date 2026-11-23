import type { DrillResult } from './scoring'

export interface SubjectStats {
  plays: number
  totalQuestions: number
  totalCorrect: number
  totalTimeMs: number
  perfectPlays: number
  bestCombo: number
  lastPlayedAt: number
}

export interface StatsStore { byKey: Record<string, SubjectStats>; playDates: string[] }
const storageKey = 'kids-learning-game:stats:v1'
const initial: SubjectStats = { plays: 0, totalQuestions: 0, totalCorrect: 0, totalTimeMs: 0, perfectPlays: 0, bestCombo: 0, lastPlayedAt: 0 }

export function localDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isSubject(value: unknown): value is SubjectStats {
  return isRecord(value) && Object.keys(initial).every(field => {
    const number = value[field]
    return typeof number === 'number' && Number.isSafeInteger(number) && number >= 0
  })
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value)
}

export function loadStats(): StatsStore {
  try {
    const store = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (isRecord(store) && isRecord(store.byKey) && Object.values(store.byKey).every(isSubject) &&
      Array.isArray(store.playDates) && store.playDates.every(validDate)) {
      return { byKey: store.byKey as Record<string, SubjectStats>, playDates: [...new Set(store.playDates)].sort() }
    }
  } catch {}
  return { byKey: {}, playDates: [] }
}

export function recordResult(key: string, result: Omit<DrillResult, 'score'>, now = new Date()): StatsStore {
  const { byKey, playDates } = loadStats()
  const prior = Object.hasOwn(byKey, key) ? byKey[key] : initial
  const updated = {
    plays: prior.plays + 1, totalQuestions: prior.totalQuestions + result.total,
    totalCorrect: prior.totalCorrect + result.correct, totalTimeMs: prior.totalTimeMs + result.timeMs,
    perfectPlays: prior.perfectPlays + Number(result.correct === result.total),
    bestCombo: Math.max(prior.bestCombo, result.maxCombo), lastPlayedAt: Math.max(prior.lastPlayedAt, now.getTime()),
  }
  const store = { byKey: { ...byKey, [key]: updated }, playDates: [...new Set([...playDates, localDate(now)])].sort() }
  try { localStorage.setItem(storageKey, JSON.stringify(store)) } catch {}
  return store
}

export function totalCorrect(store: StatsStore) {
  return Object.values(store.byKey).reduce((sum, subject) => sum + subject.totalCorrect, 0)
}

function dayNumber(date: string) { return Date.parse(date) / 86_400_000 }

export function currentStreak(store: StatsStore, today = new Date()) {
  const days = new Set(store.playDates.map(dayNumber))
  let day = dayNumber(localDate(today))
  if (!days.has(day)) day--
  let streak = 0
  while (days.has(day--)) streak++
  return streak
}

export function longestStreak(store: StatsStore) {
  let previous = -Infinity, streak = 0, longest = 0
  for (const date of store.playDates) {
    const day = dayNumber(date)
    streak = day === previous + 1 ? streak + 1 : 1
    longest = Math.max(longest, streak)
    previous = day
  }
  return longest
}
