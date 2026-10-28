import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!supabase)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email, displayName) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
        // Picked up by the handle_new_user trigger on first sign-in.
        ...(displayName && { data: { display_name: displayName } }),
      },
    })
    if (error) throw error
  }, [])

  // Email + password: no email is sent (needs "Confirm email" off in Supabase).
  const signUpWithPassword = useCallback(async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
    // With email confirmation still on, Supabase returns no session.
    if (!data.session) throw new Error('CONFIRM_EMAIL_ON')
  }, [])

  const signInWithPassword = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  return {
    user: session?.user ?? null,
    ready,
    signIn,
    signUpWithPassword,
    signInWithPassword,
    signOut,
  }
}
