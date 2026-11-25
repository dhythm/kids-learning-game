import { useEffect } from 'react'
import { isSpeechAvailable, speak, stopSpeaking } from '../lib/speech'

export default function SpeakerButton({ text, label = 'きく' }: { text: string; label?: string }) {
  useEffect(() => stopSpeaking, [])
  if (!isSpeechAvailable()) return null
  return <button type="button" className="speaker-button" onClick={() => speak(text)}>🔊 {label}</button>
}
