import { z } from 'zod'

const vocabCardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  ipaHint: z.string().optional(),
})

const dialogueLineSchema = z.object({
  speaker: z.string().min(1),
  fr: z.string().min(1),
  de: z.string().min(1),
})

const listeningQuizSchema = z
  .object({
    audioText: z.string().min(1),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2, 'listeningQuiz braucht mindestens 2 options'),
    correctIndex: z.number().int().min(0),
  })
  .refine((quiz) => quiz.correctIndex < quiz.options.length, {
    message: 'listeningQuiz.correctIndex muss innerhalb des options-Bereichs liegen',
    path: ['correctIndex'],
  })

export const unitSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  cefrTopic: z.string().min(1),
  grammarNote: z.string().optional(),
  vocab: z.array(vocabCardSchema).min(1, 'Unit braucht mindestens 1 vocab-Eintrag'),
  dialogue: z.array(dialogueLineSchema).min(1, 'Unit braucht mindestens 1 dialogue-Zeile'),
  listeningQuiz: listeningQuizSchema,
  shadowingSentences: z.array(z.string().min(1)).min(1, 'Unit braucht mindestens 1 shadowingSentence'),
})

export type Unit = z.infer<typeof unitSchema>

export function parseUnit(input: unknown): Unit {
  const result = unitSchema.safeParse(input)
  if (!result.success) {
    throw new Error(`Ungueltige Unit: ${result.error.message}`)
  }
  return result.data
}

export function parseUnits(input: unknown[]): Unit[] {
  const units = input.map((raw) => parseUnit(raw))
  const seenIds = new Set<string>()
  for (const unit of units) {
    if (seenIds.has(unit.id)) {
      throw new Error(`Unit-id ist nicht eindeutig (duplicate): ${unit.id}`)
    }
    seenIds.add(unit.id)
  }
  return units
}
