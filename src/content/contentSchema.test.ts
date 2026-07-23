import { describe, expect, it } from 'vitest'
import { parseUnit, parseUnits, type Unit } from './contentSchema'

function validUnit(overrides: Partial<Unit> = {}): unknown {
  return {
    id: 'unit-greeting',
    title: 'Begrüßung & Vorstellung',
    cefrTopic: 'A1 - Begrüßung',
    grammarNote: 'Être im Präsens: je suis, tu es, il/elle est...',
    vocab: [{ front: 'bonjour', back: 'hallo' }],
    dialogue: [{ speaker: 'A', fr: 'Bonjour !', de: 'Hallo!' }],
    listeningQuizzes: [
      {
        audioText: 'Bonjour, comment ça va ?',
        question: 'Was wird gefragt?',
        options: ['Wie geht es dir?', 'Wie heißt du?'],
        correctIndex: 0,
      },
    ],
    shadowingSentences: ['Bonjour, comment ça va ?'],
    ...overrides,
  }
}

describe('parseUnit', () => {
  it('akzeptiert eine vollstaendige, gueltige Unit', () => {
    const unit = parseUnit(validUnit())
    expect(unit.id).toBe('unit-greeting')
    expect(unit.vocab).toHaveLength(1)
  })

  it('lehnt eine Unit ohne vocab ab', () => {
    expect(() => parseUnit(validUnit({ vocab: [] }))).toThrow(/vocab/i)
  })

  it('lehnt eine Unit ohne dialogue ab', () => {
    expect(() => parseUnit(validUnit({ dialogue: [] }))).toThrow(/dialogue/i)
  })

  it('lehnt eine Unit ohne shadowingSentences ab', () => {
    expect(() => parseUnit(validUnit({ shadowingSentences: [] }))).toThrow(/shadowing/i)
  })

  it('lehnt listeningQuiz mit weniger als 2 Optionen ab', () => {
    const bad = validUnit() as Record<string, unknown>
    // @ts-expect-error absichtlich ungueltig fuer den Test
    bad.listeningQuizzes[0].options = ['nur eine Option']
    expect(() => parseUnit(bad)).toThrow(/option/i)
  })

  it('lehnt listeningQuiz mit correctIndex ausserhalb des Options-Bereichs ab', () => {
    const bad = validUnit() as Record<string, unknown>
    // @ts-expect-error absichtlich ungueltig fuer den Test
    bad.listeningQuizzes[0].correctIndex = 5
    expect(() => parseUnit(bad)).toThrow(/correctIndex/i)
  })

  it('lehnt eine Unit ohne listeningQuizzes ab', () => {
    expect(() => parseUnit(validUnit({ listeningQuizzes: [] }))).toThrow(/listeningQuiz/i)
  })

  it('akzeptiert vocab mit register-Tag und optionale culture-Eintraege', () => {
    const unit = parseUnit(
      validUnit({
        vocab: [{ front: 'bouffer', back: 'futtern (umgangssprachlich)', register: 'slang' }],
        culture: [{ title: 'Redewendung', text: '"Avoir le cafard" = niedergeschlagen sein.' }],
      }),
    )
    expect(unit.vocab[0].register).toBe('slang')
    expect(unit.culture?.[0].title).toBe('Redewendung')
  })

  it('lehnt eine Unit ohne id ab', () => {
    const bad = validUnit() as Record<string, unknown>
    delete bad.id
    expect(() => parseUnit(bad)).toThrow()
  })
})

describe('parseUnits', () => {
  it('akzeptiert mehrere Units mit eindeutigen ids', () => {
    const units = parseUnits([validUnit({ id: 'unit-a' }), validUnit({ id: 'unit-b' })])
    expect(units).toHaveLength(2)
  })

  it('lehnt doppelte Unit-ids ab', () => {
    expect(() =>
      parseUnits([validUnit({ id: 'unit-a' }), validUnit({ id: 'unit-a' })]),
    ).toThrow(/eindeutig|duplicate|unique/i)
  })
})
