import { NextResponse } from 'next/server'
import { cekKredensial, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!cekKredensial(username, password)) {
    return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, process.env.AUTH_SECRET ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  })
  return res
}
