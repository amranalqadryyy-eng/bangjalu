import Link from 'next/link'
import AutoRefresh from '@/components/AutoRefresh'
import { prisma } from '@/lib/prisma'
import {
  formatPersen,
  formatRupiah,
  formatTanggal,
  HARI_BERLAKU,
  tambahBulan,
  tambahHari,
  TENOR_BULAN,
} from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let submissions: Awaited<ReturnType<typeof prisma.submission.findMany>> = []
  let dbError = false
  try {
    submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    console.warn('Gagal memuat data dashboard:', err instanceof Error ? err.message : err)
    dbError = true
  }

  const totalNominal = submissions.reduce((sum, s) => sum + Number(s.nominal), 0)
  const totalHasilBulanan = submissions.reduce((sum, s) => sum + Number(s.hasilBulanan), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <AutoRefresh />
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold text-slate-800">
            Dashboard <span className="text-sky-600">Simulasi</span>
          </p>
          <nav className="flex gap-5 text-sm font-medium text-sky-600">
            <Link href="/riwayat" className="hover:underline">
              Riwayat Harian
            </Link>
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {dbError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Gagal terhubung ke database. Data tidak dapat ditampilkan untuk sementara. Coba muat
            ulang halaman beberapa saat lagi.
          </div>
        )}

        {/* Ringkasan */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Data Masuk</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{submissions.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Nominal Disimulasikan</p>
            <p className="mt-2 text-3xl font-bold text-sky-600">{formatRupiah(totalNominal)}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Bagi Hasil Investor</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {formatRupiah(totalHasilBulanan)}
            </p>
          </div>
        </div>

        {/* Tabel data */}
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-900 text-slate-200">
              <tr>
                <th className="px-4 py-4 font-semibold">Tgl Hari Ini</th>
                <th className="px-4 py-4 font-semibold">Nama Investor</th>
                <th className="px-4 py-4 font-semibold">Nominal</th>
                <th className="px-4 py-4 font-semibold">Berlaku {HARI_BERLAKU} Hari</th>
                <th className="px-4 py-4 font-semibold">Mulai Kontrak</th>
                <th className="px-4 py-4 font-semibold">Bagi Hasil Investor</th>
                <th className="px-4 py-4 font-semibold">Avalist 1</th>
                <th className="px-4 py-4 font-semibold">Avalist 2</th>
                <th className="px-4 py-4 font-semibold">B.Hasil Pertama</th>
                <th className="px-4 py-4 font-semibold">B.Hasil Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center italic text-slate-400">
                    Belum ada data simulasi masuk.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-500">{formatTanggal(s.createdAt)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{s.nama}</td>
                    <td className="px-4 py-4">{formatRupiah(Number(s.nominal))}</td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatTanggal(tambahHari(s.createdAt, HARI_BERLAKU))}
                    </td>
                    <td className="px-4 py-4">{formatTanggal(s.tanggalMulai)}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-600">
                      {formatRupiah(Number(s.hasilBulanan))}
                    </td>
                    <td className="px-4 py-4 text-amber-600">
                      {s.rateAvalist1 > 0 ? (
                        <>
                          {formatPersen(s.rateAvalist1)}
                          <br />
                          <span className="text-xs">{formatRupiah(Number(s.avalist1Bulanan))}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {s.namaMarketing ? (
                        <>
                          <span className="font-semibold text-slate-900">{s.namaMarketing}</span>
                          <br />
                          <span className="text-xs text-amber-600">
                            {formatPersen(s.rateMarketing)} ={' '}
                            {formatRupiah(Number(s.komisiBulanan))}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatTanggal(tambahBulan(s.tanggalMulai, 1))}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatTanggal(tambahBulan(s.tanggalMulai, TENOR_BULAN))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
