import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.submission.update({
      where: { id },
      data: { klikWa: true },
    })
  } catch (err) {
    console.error('PATCH /api/submissions/[id] gagal:', err)
    return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
