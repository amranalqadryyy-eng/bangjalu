import Link from 'next/link'
import AutoRefresh from '@/components/AutoRefresh'
import { prisma } from '@/lib/prisma'
import { formatPersen, formatRupiah, formatTanggal, jadwalBagiHasil } from '@/lib/config'

export const dynamic = 'force-dynamic'

// Kunci tanggal lokal (YYYY-MM-DD) — bisa dibandingkan langsung sebagai string
function dateKey(d: Date): string {
  return d.toLocaleDateString('sv-SE')
}

export default async function RiwayatPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const today = new Date()
  const todayKey = dateKey(today)

  // Cari submission yang bagi hasilnya jatuh tempo HARI INI,
  // sekaligus tanggal bagi hasil terdekat berikutnya (untuk kondisi kosong).
  const jatuhTempoHariIni: typeof submissions = []
  let nextKey: string | null = null
  let nextDate: Date | null = null

  for (const s of submissions) {
    // Bagi hasil bulanan dihitung dari tanggal diakui (transfer + 10 hari).
    for (const tgl of jadwalBagiHasil(s.tanggalMulai)) {
      const key = dateKey(tgl)
      if (key === todayKey) {
        jatuhTempoHariIni.push(s)
      } else if (key > todayKey && (nextKey === null || key < nextKey)) {
        nextKey = key
        nextDate = tgl
      }
    }
  }

  const totalAvalist1 = jatuhTempoHariIni.reduce((sum, s) => sum + Number(s.avalist1Bulanan), 0)
  const totalAvalist2 = jatuhTempoHariIni.reduce((sum, s) => sum + Number(s.komisiBulanan), 0)

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
            <Link href="/avalist" className="hover:underline">
              Rekap Avalist 2
            </Link>
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          {/* Header tanggal bagi hasil */}
          <div className="mb-4 border-b border-slate-100 pb-4">
            <p className="text-xs text-slate-400">Tanggal Bagi Hasil</p>
            <h2 className="text-lg font-bold text-slate-900">{formatTanggal(today)}</h2>

            {jatuhTempoHariIni.length > 0 && (
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

          {jatuhTempoHariIni.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-slate-500">Tidak ada bagi hasil hari ini.</p>
              {nextDate && (
                <p className="mt-2 text-sm text-slate-600">
                  Next bagi hasil:{' '}
                  <span className="font-semibold text-emerald-600">{formatTanggal(nextDate)}</span>
                </p>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {jatuhTempoHariIni.map((s) => (
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
