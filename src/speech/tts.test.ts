import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickFrenchVoice, speak } from './tts'

function fakeVoice(lang: string, name = lang): SpeechSynthesisVoice {
  return { lang, name, default: false, localService: true, voiceURI: name } as SpeechSynthesisVoice
}

describe('pickFrenchVoice', () => {
  it('waehlt eine Stimme, deren lang mit "fr" beginnt', () => {
    const voices = [fakeVoice('en-US'), fakeVoice('fr-FR', 'Amélie'), fakeVoice('de-DE')]
    expect(pickFrenchVoice(voices)?.name).toBe('Amélie')
  })

  it('ist case-insensitiv', () => {
    const voices = [fakeVoice('FR-CA')]
    expect(pickFrenchVoice(voices)).toBeDefined()
  })

  it('gibt undefined zurueck, wenn keine franzoesische Stimme vorhanden ist', () => {
    expect(pickFrenchVoice([fakeVoice('en-US')])).toBeUndefined()
  })

  it('gibt undefined zurueck bei leerer Liste', () => {
    expect(pickFrenchVoice([])).toBeUndefined()
  })
})

describe('speak', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ruft speechSynthesis.speak mit franzoesischer lang auf, wenn die API verfuegbar ist', () => {
    const speakFn = vi.fn()
    const cancelFn = vi.fn()
    vi.stubGlobal('speechSynthesis', {
      speak: speakFn,
      cancel: cancelFn,
      getVoices: () => [fakeVoice('fr-FR')],
    })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string
        lang = ''
        rate = 1
        voice: SpeechSynthesisVoice | null = null
        constructor(text: string) {
          this.text = text
        }
      },
    )

    speak('Bonjour')

    expect(cancelFn).toHaveBeenCalled()
    expect(speakFn).toHaveBeenCalledTimes(1)
    const utterance = speakFn.mock.calls[0][0]
    expect(utterance.text).toBe('Bonjour')
    expect(utterance.lang).toBe('fr-FR')
  })

  it('wirft nicht, wenn speechSynthesis nicht verfuegbar ist (z.B. Browser ohne Support)', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(() => speak('Bonjour')).not.toThrow()
  })
})
