import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const PENDING_KEY = 'luna:pending-name'

// Remember the name typed on the landing page until the magic link returns.
export function rememberPendingName(name) {
  try {
    if (name) localStorage.setItem(PENDING_KEY, name)
  } catch {
    /* storage unavailable — the name prompt will ask instead */
  }
}

function takePendingName() {
  try {
    const name = localStorage.getItem(PENDING_KEY)
    localStorage.removeItem(PENDING_KEY)
    return name?.trim() || null
  } catch {
    return null
  }
}

// The signed-in person's profile (display name shown on comments/reactions).
export function useProfile(user) {
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const saveName = useCallback(
    async (name) => {
      const display_name = name.trim()
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name })
        .eq('id', user.id)
        .select('*')
        .single()
      if (error) throw error
      await supabase.auth.updateUser({ data: { display_name } })
      setProfile(data)
      return data
    },
    [user],
  )

  useEffect(() => {
    if (!supabase || !user) return
    let active = true
    supabase
      .from('profiles')
      // '*' so this still works before the onboarding column migration runs.
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!active) return
        // First sign-in after typing a name on the landing page: apply it.
        const pending = !data?.display_name && takePendingName()
        if (pending) {
          try {
            await saveName(pending)
          } catch {
            setProfile(data)
          }
        } else {
          setProfile(data)
        }
        setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [user, saveName])

  const completeOnboarding = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)
      .select('*')
      .single()
    if (error) throw error
    setProfile(data)
  }, [user])

  return { profile, loaded, saveName, completeOnboarding }
}
