export const clockLevels = [
  { id: 'clock-s1', title: '○じと ○じはん', description: 'ちょうどと はんの とけいを よもう', step: 30 },
  { id: 'clock-s2', title: '15ふんずつ', description: '15ふんごとの とけいを よもう', step: 15 },
  { id: 'clock-s3', title: '5ふんずつ', description: 'ながい はりを 5ふんずつ かぞえよう', step: 5 },
] as const

export type ClockLevel = typeof clockLevels[number]
export interface ClockTime { hour: number; minute: number }
