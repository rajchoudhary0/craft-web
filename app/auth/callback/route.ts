import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Exchanges the ?code= from Supabase email links (recovery, magic link) for a session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'
  // Only allow same-site relative paths (blocks open redirect via //evil.com or full URLs).
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
