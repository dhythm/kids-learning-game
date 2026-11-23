import { longestStreak, totalCorrect, type StatsStore } from './stats'

export interface BadgeDef { id: string; name: string; description: string; icon: string }

export const badges: BadgeDef[] = [
  { id: 'first-step', name: 'はじめの一歩', description: 'はじめて10問に挑戦', icon: '🌱' },
  { id: 'plays-10', name: 'れんしゅう名人', description: '合計10回プレイ', icon: '📚' },
  { id: 'correct-100', name: '100問せいかい', description: '合計100問正解', icon: '⭐' },
  { id: 'correct-500', name: '500問せいかい', description: '合計500問正解', icon: '🌟' },
  { id: 'streak-3', name: '3日れんぞく', description: '3日続けてプレイ', icon: '☘️' },
  { id: 'streak-7', name: '7日れんぞく', description: '7日続けてプレイ', icon: '🌈' },
  { id: 'perfect-1', name: 'パーフェクト', description: '全問正解を1回', icon: '🎯' },
  { id: 'perfect-5', name: 'パーフェクト名人', description: '全問正解を5回', icon: '🏅' },
  { id: 'combo-10', name: 'コンボ王', description: '10問連続で正解', icon: '👑' },
]

export function earnedBadges(store: StatsStore): BadgeDef[] {
  const subjects = Object.values(store.byKey)
  const plays = subjects.reduce((sum, subject) => sum + subject.plays, 0)
  const perfect = subjects.reduce((sum, subject) => sum + subject.perfectPlays, 0)
  const correct = totalCorrect(store), streak = longestStreak(store)
  const earned: Record<string, boolean> = {
    'first-step': plays >= 1, 'plays-10': plays >= 10,
    'correct-100': correct >= 100, 'correct-500': correct >= 500,
    'streak-3': streak >= 3, 'streak-7': streak >= 7,
    'perfect-1': perfect >= 1, 'perfect-5': perfect >= 5,
    'combo-10': subjects.some(subject => subject.bestCombo >= 10),
  }
  return badges.filter(badge => earned[badge.id])
}

export function earnedBadgeIds(store: StatsStore) { return new Set(earnedBadges(store).map(badge => badge.id)) }
