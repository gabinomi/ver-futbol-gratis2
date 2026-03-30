import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  return req.cookies.get('admin_auth')?.value === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  // Update 'orden' for each match based on its position in the array
  const updates = ids.map((id: string, index: number) => 
    supabaseAdmin()
      .from('partidos')
      .update({ orden: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Some updates failed', details: errors }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
