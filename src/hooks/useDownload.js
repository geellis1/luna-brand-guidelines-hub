import { useCallback, useState } from 'react'
import { downloadBlob } from '../lib/logo'

// Runs one generated download at a time; `busy` is the key of the one running.
export function useDownload() {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  const run = useCallback(async (key, makeBlob, filename) => {
    setBusy(key)
    setError(null)
    try {
      downloadBlob(await makeBlob(), filename)
    } catch (err) {
      setError(err.message || 'Download failed. Try again.')
    }
    setBusy(null)
  }, [])

  return { busy, error, run }
}
