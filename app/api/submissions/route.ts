import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  AVALIST1_RATES,
  AVALIST2_RATES,
  MIN_INVESTASI,
  RATE_BULANAN,
  TENOR_BULAN,
} from '@/lib/config'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const nama = typeof body?.nama === 'string' ? body.nama.trim() : ''
  const nominal = Number(body?.nominal)
  const tanggalMulai = new Date(body?.tanggalMulai)
  const rateAvalist1 = Number(body?.rateAvalist1)
  const namaMarketing = typeof body?.namaMarketing === 'string' ? body.namaMarketing.trim() : ''
  const rateMarketing = Number(body?.rateMarketing)

  if (!nama) {
    return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
  }
  if (!AVALIST1_RATES.includes(rateAvalist1 as (typeof AVALIST1_RATES)[number])) {
    return NextResponse.json({ error: 'Pilihan Avalist 1 tidak valid' }, { status: 400 })
  }
  if (!namaMarketing) {
    return NextResponse.json({ error: 'Nama Avalist 2 wajib diisi' }, { status: 400 })
  }
  if (!AVALIST2_RATES.includes(rateMarketing as (typeof AVALIST2_RATES)[number])) {
    return NextResponse.json({ error: 'Pilihan Avalist 2 tidak valid' }, { status: 400 })
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
  const avalist1Bulanan = Math.round(nominal * rateAvalist1)
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
      rateAvalist1,
      avalist1Bulanan: BigInt(avalist1Bulanan),
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
    rateAvalist1,
    avalist1Bulanan,
    namaMarketing,
    rateMarketing,
    komisiBulanan,
  })
}
