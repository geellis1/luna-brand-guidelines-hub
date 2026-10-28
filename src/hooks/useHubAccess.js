import { useCallback, useState } from 'react'

// Shared hub password, set in the environment so it can change without a code edit.
// It ships in the client bundle, so this is a soft gate, not real security.
export const HUB_PASSWORD = import.meta.env.VITE_HUB_PASSWORD ?? ''

const KEY = 'luna-hub-access'

// Remembers the password that unlocked this browser, so changing it locks everyone out again.
const readUnlocked = () => {
  try {
    return HUB_PASSWORD !== '' && localStorage.getItem(KEY) === HUB_PASSWORD
  } catch {
    return false
  }
}

export function useHubAccess() {
  const [unlocked, setUnlocked] = useState(readUnlocked)

  const unlock = useCallback(() => {
    try {
      localStorage.setItem(KEY, HUB_PASSWORD)
    } catch {
      // Storage blocked: stay unlocked for this visit only.
    }
    setUnlocked(true)
  }, [])

  const lock = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Nothing stored to clear.
    }
    setUnlocked(false)
  }, [])

  return { unlocked, unlock, lock }
}
