import Link from 'next/link'
import AutoRefresh from '@/components/AutoRefresh'
import { prisma } from '@/lib/prisma'
import { formatRupiah } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const totalNominal = submissions.reduce((sum, s) => sum + Number(s.nominal), 0)
  const totalHasilBulanan = submissions.reduce((sum, s) => sum + Number(s.hasilBulanan), 0)
  const totalLeadWa = submissions.filter((s) => s.klikWa).length

  return (
    <div className="min-h-screen bg-slate-50">
      <AutoRefresh />
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold text-slate-800">
            Dashboard <span className="text-sky-600">Simulasi</span>
          </p>
          <Link href="/" className="text-sm font-medium text-sky-600 hover:underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Ringkasan */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Simulasi Masuk</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{submissions.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Lead Klik WhatsApp</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{totalLeadWa}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Nominal Disimulasikan</p>
            <p className="mt-2 text-3xl font-bold text-sky-600">{formatRupiah(totalNominal)}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Bagi Hasil / Bulan</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {formatRupiah(totalHasilBulanan)}
            </p>
          </div>
        </div>

        {/* Tabel data */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-200">
              <tr>
                <th className="px-5 py-4 font-semibold">Waktu Submit</th>
                <th className="px-5 py-4 font-semibold">Nama</th>
                <th className="px-5 py-4 font-semibold">Nominal</th>
                <th className="px-5 py-4 font-semibold">Mulai Kontrak</th>
                <th className="px-5 py-4 font-semibold">Bagi Hasil/Bulan</th>
                <th className="px-5 py-4 font-semibold">Total ({'12 bln'})</th>
                <th className="px-5 py-4 font-semibold">Marketing (Komisi)</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center italic text-slate-400">
                    Belum ada data simulasi masuk.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500">
                      {s.createdAt.toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{s.nama}</td>
                    <td className="px-5 py-4">{formatRupiah(Number(s.nominal))}</td>
                    <td className="px-5 py-4">
                      {s.tanggalMulai.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-4 text-emerald-600">
                      {formatRupiah(Number(s.hasilBulanan))}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatRupiah(Number(s.totalHasil))}
                    </td>
                    <td className="px-5 py-4">
                      {s.namaMarketing ? (
                        <>
                          <span className="font-semibold text-slate-900">{s.namaMarketing}</span>
                          <br />
                          <span className="text-xs text-amber-600">
                            {(s.rateMarketing * 100).toLocaleString('id-ID')}% ={' '}
                            {formatRupiah(Number(s.komisiBulanan))}/bln
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {s.klikWa ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Klik WA
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Baru
                        </span>
                      )}
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
