import Link from 'next/link'
import AutoRefresh from '@/components/AutoRefresh'
import { prisma } from '@/lib/prisma'
import { formatRupiah, formatTanggal, jadwalBagiHasil } from '@/lib/config'

export const dynamic = 'force-dynamic'

type Entry = { tanggal: Date; komisi: number; namaInvestor: string }
type Grup = { nama: string; total: number; entries: Entry[] }

export default async function AvalistPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const today = new Date()
  const tahun = today.getFullYear()
  const bulan = today.getMonth()

  // Kumpulkan pembayaran Avalist 2 yang jatuh tempo di BULAN BERJALAN,
  // dikelompokkan per nama Avalist 2 (nama sama digabung).
  const map = new Map<string, Grup>()

  for (const s of submissions) {
    if (!s.namaMarketing) continue
    const komisi = Number(s.komisiBulanan)
    if (komisi <= 0) continue

    // Bagi hasil bulanan (dari tanggal diakui). Ambil yang jatuh di bulan
    // berjalan (maksimal satu pembayaran per submission per bulan).
    for (const tgl of jadwalBagiHasil(s.tanggalMulai)) {
      if (tgl.getFullYear() === tahun && tgl.getMonth() === bulan) {
        const key = s.namaMarketing.trim().toLowerCase()
        const grup = map.get(key) ?? { nama: s.namaMarketing.trim(), total: 0, entries: [] }
        grup.entries.push({ tanggal: tgl, komisi, namaInvestor: s.nama })
        grup.total += komisi
        map.set(key, grup)
        break
      }
    }
  }

  // Grup diurutkan dari total terbesar; tiap entri diurutkan dari tanggal awal.
  const grup = [...map.values()].sort((a, b) => b.total - a.total)
  for (const g of grup) g.entries.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime())

  const totalSemua = grup.reduce((sum, g) => sum + g.total, 0)
  const namaBulan = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-slate-50">
      <AutoRefresh />
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold text-slate-800">
            Rekap <span className="text-sky-600">Avalist 2</span>
          </p>
          <nav className="flex gap-5 text-sm font-medium text-sky-600">
            <Link href="/dashboard" className="hover:underline">
              Tabel Data
            </Link>
            <Link href="/riwayat" className="hover:underline">
              Riwayat Harian
            </Link>
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Ringkasan bulan berjalan */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs text-slate-400">Bagi Hasil Avalist 2 — Bulan Berjalan</p>
          <h2 className="text-lg font-bold text-slate-900">{namaBulan}</h2>
          <div className="mt-3 rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-slate-500">Total Semua Avalist 2</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{formatRupiah(totalSemua)}</p>
          </div>
        </section>

        {grup.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="italic text-slate-400">
              Belum ada bagi hasil Avalist 2 di bulan {namaBulan}.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grup.map((g) => (
              <section key={g.nama} className="rounded-2xl bg-white p-6 shadow-sm">
                {/* Header per nama Avalist 2 */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{g.nama}</p>
                    <p className="text-xs text-slate-400">
                      {g.entries.length} pembayaran bulan ini
                    </p>
                  </div>
                  <p className="text-xl font-bold text-amber-600">{formatRupiah(g.total)}</p>
                </div>

                {/* Rincian tanggal */}
                <ul className="space-y-2">
                  {g.entries.map((e, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{formatTanggal(e.tanggal)}</p>
                        <p className="text-xs text-slate-400">dari {e.namaInvestor}</p>
                      </div>
                      <p className="font-semibold text-amber-600">{formatRupiah(e.komisi)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
