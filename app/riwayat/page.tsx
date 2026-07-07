import Link from 'next/link'
import AutoRefresh from '@/components/AutoRefresh'
import { prisma } from '@/lib/prisma'
import { formatPersen, formatRupiah, formatTanggal } from '@/lib/config'

export const dynamic = 'force-dynamic'

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

  // Kelompokkan per tanggal (tanggal data masuk / createdAt)
  const groups = new Map<string, typeof submissions>()
  for (const s of submissions) {
    // Kunci tanggal lokal (YYYY-MM-DD) agar konsisten dengan tampilan formatTanggal
    const key = s.createdAt.toLocaleDateString('sv-SE')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }

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
        {groups.size === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center italic text-slate-400 shadow-sm">
            {dbError ? 'Data tidak tersedia saat ini.' : 'Belum ada data masuk.'}
          </p>
        ) : (
          [...groups.entries()].map(([key, items]) => {
            const totalAvalist1 = items.reduce((sum, s) => sum + Number(s.avalist1Bulanan), 0)
            const totalAvalist2 = items.reduce((sum, s) => sum + Number(s.komisiBulanan), 0)

            return (
              <section key={key} className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                {/* Header tanggal + total */}
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    {formatTanggal(items[0].createdAt)}
                  </h2>
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
                </div>

                {/* Rincian tiap entri pada tanggal ini */}
                <ul className="space-y-3">
                  {items.map((s) => (
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
              </section>
            )
          })
        )}
      </main>
    </div>
  )
}
