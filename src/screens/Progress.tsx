import { useRef, useState } from 'react'
import { db } from '../db/dbInstance'
import { exportBackup, importBackup } from '../db/backup'

interface ProgressProps {
  streak: number
  onBack: () => void
  onImported: () => void
}

export function Progress({ streak, onBack, onImported }: ProgressProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleExport() {
    const json = await exportBackup(db)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fran-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      await importBackup(db, text)
      setMessage('✅ Backup importiert.')
      onImported()
    } catch (err) {
      setMessage(`❌ Import fehlgeschlagen: ${(err as Error).message}`)
    }
  }

  return (
    <div className="screen">
      <h2>Fortschritt</h2>
      <p className="streak">🔥 {streak} Tage Streak</p>

      <div className="backup-actions">
        <button onClick={handleExport}>⬇️ Fortschritt exportieren</button>
        <button onClick={() => fileInputRef.current?.click()}>⬆️ Backup importieren</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
          }}
        />
      </div>
      {message && <p>{message}</p>}

      <button className="secondary" onClick={onBack}>
        Zurück
      </button>
    </div>
  )
}
