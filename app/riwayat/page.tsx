import Link from 'next/link'
import AutoRefresh from '@/components/AutoRefresh'
import { prisma } from '@/lib/prisma'
import { formatPersen, formatRupiah, formatTanggal, tambahBulan, TENOR_BULAN } from '@/lib/config'

export const dynamic = 'force-dynamic'

// Kunci tanggal lokal (YYYY-MM-DD) agar bisa dibandingkan secara kronologis
function keyTanggal(date: Date): string {
  return date.toLocaleDateString('sv-SE')
}

export default async function RiwayatPage() {
  let submissions: Awaited<ReturnType<typeof prisma.submission.findMany>> = []
  let dbError = false
  try {
    submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    console.warn('Gagal memuat data riwayat:', err instanceof Error ? err.message : err)
    dbError = true
  }

  type Sub = (typeof submissions)[number]

  // Susun semua tanggal bagi hasil: tiap investor menerima bagi hasil bulanan
  // selama masa kontrak (tanggal mulai + 1 bulan s/d + TENOR_BULAN bulan).
  const jadwal: { key: string; date: Date; sub: Sub }[] = []
  for (const s of submissions) {
    for (let bulan = 1; bulan <= TENOR_BULAN; bulan++) {
      const date = tambahBulan(s.tanggalMulai, bulan)
      jadwal.push({ key: keyTanggal(date), date, sub: s })
    }
  }

  const hariIni = new Date()
  const keyHariIni = keyTanggal(hariIni)

  // Bagi hasil yang jatuh tepat hari ini
  const bagiHasilHariIni = jadwal.filter((j) => j.key === keyHariIni)

  // Jika hari ini tidak ada, cari tanggal bagi hasil terdekat berikutnya
  const adaHariIni = bagiHasilHariIni.length > 0
  let targetKey: string | null = adaHariIni ? keyHariIni : null
  if (!adaHariIni) {
    const berikutnya = jadwal
      .filter((j) => j.key > keyHariIni)
      .sort((a, b) => a.key.localeCompare(b.key))
    targetKey = berikutnya[0]?.key ?? null
  }

  const daftar = targetKey ? jadwal.filter((j) => j.key === targetKey) : []
  const tanggalTarget = daftar[0]?.date ?? null
  const totalAvalist1 = daftar.reduce((sum, j) => sum + Number(j.sub.avalist1Bulanan), 0)
  const totalAvalist2 = daftar.reduce((sum, j) => sum + Number(j.sub.komisiBulanan), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <AutoRefresh />
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold text-slate-800">
            Riwayat <span className="text-sky-600">Harian</span>
          </p>
          <nav className="flex gap-5 text-sm font-medium text-sky-600">
            <Link href="/dashboard" className="hover:underline">
              Tabel Data
            </Link>
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {dbError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Gagal terhubung ke database. Data tidak dapat ditampilkan untuk sementara. Coba muat
            ulang halaman beberapa saat lagi.
          </div>
        )}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Header: tanggal hari ini + status bagi hasil */}
          <div className="mb-4 border-b border-slate-100 pb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Bagi Hasil Hari Ini
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{formatTanggal(hariIni)}</h2>

            {!adaHariIni && tanggalTarget && (
              <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3">
                <p className="text-xs text-slate-500">Belum ada bagi hasil hari ini</p>
                <p className="mt-1 text-sm font-semibold text-sky-700">
                  Bagi hasil berikutnya: {formatTanggal(tanggalTarget)}
                </p>
              </div>
            )}

            {daftar.length > 0 && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-xs text-slate-500">Total Penerimaan Avalist 1</p>
                  <p className="mt-1 text-lg font-bold text-amber-600">
                    {formatRupiah(totalAvalist1)}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-xs text-slate-500">Total Penerimaan Avalist 2</p>
                  <p className="mt-1 text-lg font-bold text-amber-600">
                    {formatRupiah(totalAvalist2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rincian tiap penerima bagi hasil pada tanggal target */}
          {daftar.length === 0 ? (
            <p className="py-6 text-center italic text-slate-400">
              {dbError ? 'Data tidak tersedia saat ini.' : 'Belum ada jadwal bagi hasil.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {daftar.map(({ sub: s }) => (
                <li key={s.id} className="rounded-xl border border-slate-100 p-4 text-sm">
                  <p className="mb-2 font-semibold text-slate-800">
                    {s.nama}{' '}
                    <span className="font-normal text-slate-400">
                      · {formatRupiah(Number(s.nominal))}
                    </span>
                  </p>
                  <div className="space-y-1 text-slate-600">
                    <p>
                      Avalist 1 ({formatPersen(s.rateAvalist1)}):{' '}
                      <span className="font-semibold text-amber-600">
                        {formatRupiah(Number(s.avalist1Bulanan))}
                      </span>
                    </p>
                    {s.namaMarketing ? (
                      <p>
                        Avalist 2 — {s.namaMarketing} ({formatPersen(s.rateMarketing)}):{' '}
                        <span className="font-semibold text-amber-600">
                          {formatRupiah(Number(s.komisiBulanan))}
                        </span>
                      </p>
                    ) : (
                      <p className="text-slate-400">Avalist 2: tidak ada</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
