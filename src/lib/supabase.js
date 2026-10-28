import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && anonKey)
export const supabase = isConfigured ? createClient(url, anonKey) : null

export const ASSET_BUCKET = 'brand-assets'

// brand_items.image_url may be a full URL or a path inside the storage bucket.
export function assetUrl(pathOrUrl) {
  if (!pathOrUrl) return null
  if (/^(https?:|data:|\/)/.test(pathOrUrl)) return pathOrUrl
  if (!supabase) return null
  return supabase.storage.from(ASSET_BUCKET).getPublicUrl(pathOrUrl).data.publicUrl
}
