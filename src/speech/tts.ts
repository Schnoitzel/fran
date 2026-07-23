export interface SpeakOptions {
  rate?: number
}

export function pickFrenchVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith('fr'))
}

/**
 * Spricht Text auf Franzoesisch aus (Web Speech API). Kostenlos, laeuft im
 * Browser, funktioniert auch in iOS Safari. Kein Effekt (kein Fehler), wenn
 * die API im aktuellen Browser nicht verfuegbar ist.
 */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (typeof speechSynthesis === 'undefined' || !speechSynthesis) return

  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = options.rate ?? 1

  const voice = pickFrenchVoice(speechSynthesis.getVoices())
  if (voice) utterance.voice = voice

  speechSynthesis.speak(utterance)
}
