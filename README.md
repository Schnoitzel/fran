# Français — persönlicher Lernplan

Eine PWA für einen täglichen, automatisch generierten ~30-Minuten-Lernplan
für Französisch. Läuft komplett lokal im Browser (kein Server, keine
laufenden API-Kosten), installierbar auf dem iPhone via Safari → "Zum
Home-Bildschirm hinzufügen".

**Live:** https://schnoitzel.github.io/fran/

## Architektur

- Vite + React + TypeScript
- Dexie (IndexedDB) für lokale Daten: Vokabelkarten, Review-Log,
  Unit-Fortschritt, Streak
- SM-2-artiger Spaced-Repetition-Scheduler (`src/srs/sm2.ts`)
- Web Speech API für Text-to-Speech (kostenlos, kein externer Service)
- Inhalte als validierte JSON-Dateien unter `src/content/units/`
- `vite-plugin-pwa` für Offline-Support / Installierbarkeit

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm test         # Vitest
npm run build    # Production-Build + PWA-Assets
```

Deploy läuft automatisch via GitHub Actions bei jedem Push auf `main`
(`.github/workflows/deploy.yml`) nach GitHub Pages.

## Neue Content-Batches hinzufügen

Der Lerninhalt (Vokabeln, Dialoge, Hörverständnis-Quiz, Shadowing-Sätze)
wird nicht live von einer KI generiert, sondern in Chat-Sessions
vorbereitet und als JSON in `src/content/units/` eingecheckt. So entstehen
keine laufenden API-Kosten.

Um eine neue Unit hinzuzufügen:

1. Neue Datei `src/content/units/unit-XX-thema.json` anlegen, die dem
   Schema aus `src/content/contentSchema.ts` entspricht:
   ```ts
   {
     id: string            // eindeutig!
     title: string
     cefrTopic: string
     grammarNote?: string  // kurzer "Aha"-Hinweis, kein Lehrbuch-Kapitel
     vocab: { front, back, ipaHint? }[]       // mind. 1
     dialogue: { speaker, fr, de }[]           // mind. 1
     listeningQuiz: { audioText, question, options[], correctIndex }
     shadowingSentences: string[]              // mind. 1
   }
   ```
2. `npm test` laufen lassen — `src/content/units.test.ts` validiert
   automatisch alle JSON-Dateien per Zod-Schema und schlägt bei Fehlern
   (fehlende Felder, leere Arrays, `correctIndex` außerhalb des
   `options`-Bereichs, doppelte `id`) mit klarer Fehlermeldung fehl.
3. Committen und pushen — Deploy passiert automatisch.

Inhaltliche Reihenfolge: neue Units werden automatisch in Datei-
Sortierreihenfolge freigeschaltet (`unit-01-...`, `unit-02-...`, ...),
sobald die vorherige abgeschlossen ist (siehe `src/planner/dailyPlan.ts`).

## Backup

Da iOS Safari im Hintergrund unter Umständen lokale Daten bereinigt,
gibt es im "Fortschritt"-Tab einen Export/Import-Button für ein
JSON-Backup des kompletten Lernstands. Gelegentlich exportieren empfohlen.

## Roadmap (nicht Teil des aktuellen MVP)

- Minimalpaar-/Ohrtraining-Modul (HVPT)
- Informelles Register / Jugendsprache
- Rap-/Slang-Verstehen als Fernziel (Orelsan etc.)
- Push-Benachrichtigungen
