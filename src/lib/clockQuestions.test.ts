import { expect, it } from 'vitest'
import { clockLevels } from './clock'
import { generateClockQuestion, generateClockSet } from './clockQuestions'

it.each(clockLevels)('$id offers four readable, stage-appropriate times even across noon', stage => {
  const size = 720 / stage.step
  const allowed = new Set<string>()
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += stage.step) allowed.add(minute ? `${hour}時${minute}分` : `${hour}時`)
  }
  for (let index = 0; index < size; index++) {
    const { hour, minute, text, choices } = generateClockQuestion(stage, () => index / size)
    expect(hour).toBeGreaterThanOrEqual(1)
    expect(hour).toBeLessThanOrEqual(12)
    expect(minute % stage.step).toBe(0)
    expect(text).toBe(minute === 0 ? `${hour}時` : `${hour}時${minute}分`)
    expect(choices).toContain(text)
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices.every(choice => allowed.has(choice))).toBe(true)
  }
  expect(new Set(generateClockSet(stage, size, () => 0).map(question => question.text))).toEqual(allowed)
})
