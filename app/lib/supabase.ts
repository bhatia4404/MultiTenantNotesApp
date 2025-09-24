import { createClient } from '@supabase/supabase-js'

// Make sure the URL has a valid format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if we have valid values before creating the client
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('Invalid or missing NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create the client with explicit string URLs
export const supabase = createClient(
  supabaseUrl.toString(), 
  supabaseAnonKey.toString()
)