import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { KOMISI_MARKETING, MIN_INVESTASI, RATE_BULANAN, TENOR_BULAN } from '@/lib/config'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const nama = typeof body?.nama === 'string' ? body.nama.trim() : ''
  const nominal = Number(body?.nominal)
  const tanggalMulai = new Date(body?.tanggalMulai)
  const namaMarketing = typeof body?.namaMarketing === 'string' ? body.namaMarketing.trim() : ''
  const rateMarketing = Number(body?.rateMarketing)

  if (!nama) {
    return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
  }
  if (!namaMarketing) {
    return NextResponse.json({ error: 'Nama marketing wajib diisi' }, { status: 400 })
  }
  if (!KOMISI_MARKETING.includes(rateMarketing as (typeof KOMISI_MARKETING)[number])) {
    return NextResponse.json({ error: 'Pilihan komisi tidak valid' }, { status: 400 })
  }
  if (!Number.isFinite(nominal) || nominal < MIN_INVESTASI) {
    return NextResponse.json(
      { error: `Nominal minimal Rp ${MIN_INVESTASI.toLocaleString('id-ID')}` },
      { status: 400 }
    )
  }
  if (isNaN(tanggalMulai.getTime())) {
    return NextResponse.json({ error: 'Tanggal tidak valid' }, { status: 400 })
  }

  const hasilBulanan = Math.round(nominal * RATE_BULANAN)
  const totalHasil = hasilBulanan * TENOR_BULAN
  const komisiBulanan = Math.round(nominal * rateMarketing)

  const submission = await prisma.submission.create({
    data: {
      nama,
      nominal: BigInt(nominal),
      tanggalMulai,
      rateBulanan: RATE_BULANAN,
      tenorBulan: TENOR_BULAN,
      hasilBulanan: BigInt(hasilBulanan),
      totalHasil: BigInt(totalHasil),
      namaMarketing,
      rateMarketing,
      komisiBulanan: BigInt(komisiBulanan),
    },
  })

  return NextResponse.json({
    id: submission.id,
    hasilBulanan,
    totalHasil,
    rateBulanan: RATE_BULANAN,
    tenorBulan: TENOR_BULAN,
    namaMarketing,
    rateMarketing,
    komisiBulanan,
  })
}
