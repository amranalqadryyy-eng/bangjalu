'use client'

import { useState } from 'react'
import {
  AVALIST1_RATES,
  AVALIST2_RATES,
  buildWaLink,
  formatPersen,
  formatRupiah,
  formatTanggal,
  HARI_BERLAKU,
  MIN_INVESTASI,
  RATE_BULANAN,
  tambahBulan,
  tambahHari,
  TENOR_BULAN,
} from '@/lib/config'

type Hasil = {
  id: string
  hasilBulanan: number
  totalHasil: number
  rateBulanan: number
  tenorBulan: number
  rateAvalist1: number
  avalist1Bulanan: number
  namaMarketing: string
  rateMarketing: number
  komisiBulanan: number
}

export default function Calculator() {
  const [nama, setNama] = useState('')
  const [rateAvalist1, setRateAvalist1] = useState<number>(AVALIST1_RATES[0])
  const [namaMarketing, setNamaMarketing] = useState('')
  const [rateMarketing, setRateMarketing] = useState<number>(AVALIST2_RATES[0])
  const [nominalStr, setNominalStr] = useState('10.000.000')
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const nominal = Number(nominalStr.replace(/\./g, '')) || 0

  function handleNominalChange(v: string) {
    const digits = v.replace(/\D/g, '')
    setNominalStr(digits ? Number(digits).toLocaleString('id-ID') : '')
  }

  async function hitung() {
    setError('')
    if (!nama.trim()) {
      setError('Mohon isi nama investor.')
      return
    }
    if (!namaMarketing.trim()) {
      setError('Mohon isi nama Avalist 2.')
      return
    }
    if (nominal < MIN_INVESTASI) {
      setError(`Nominal minimal ${formatRupiah(MIN_INVESTASI)}.`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          nominal,
          tanggalMulai: tanggal,
          rateAvalist1,
          namaMarketing: namaMarketing.trim(),
          rateMarketing,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Terjadi kesalahan. Coba lagi.')
        return
      }
      setHasil(data)
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Tanggal-tanggal turunan
  const tglHariIni = new Date()
  const tglSepuluh = tambahHari(tglHariIni, HARI_BERLAKU)
  const tglMulai = new Date(tanggal)
  const bagiHasilPertama = tambahBulan(tglMulai, 1)
  const bagiHasilTerakhir = tambahBulan(tglMulai, TENOR_BULAN)

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
      {/* Kolom input */}
      <div className="p-8 md:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
            1
          </span>
          <h2 className="text-xl font-bold text-slate-800">Input Investasi</h2>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Investor</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Lengkap"
          className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nominal (Min. {formatRupiah(MIN_INVESTASI)})
        </label>
        <div className="mb-5 flex items-center rounded-xl border border-slate-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <span className="pl-4 text-sm font-semibold text-slate-400">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={nominalStr}
            onChange={(e) => handleNominalChange(e.target.value)}
            className="w-full rounded-xl px-3 py-3 font-semibold text-slate-800 outline-none"
          />
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Bagi Hasil Avalist 1
        </label>
        <div className="mb-5 grid grid-cols-2 gap-3">
          {AVALIST1_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setRateAvalist1(rate)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                rateAvalist1 === rate
                  ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-100'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {formatPersen(rate)} per bulan
            </button>
          ))}
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nama Avalist 2
        </label>
        <input
          type="text"
          value={namaMarketing}
          onChange={(e) => setNamaMarketing(e.target.value)}
          placeholder="Nama Avalist 2"
          className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Bagi Hasil Avalist 2
        </label>
        <div className="mb-5 grid grid-cols-2 gap-3">
          {AVALIST2_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setRateMarketing(rate)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                rateMarketing === rate
                  ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-100'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {formatPersen(rate)} per bulan
            </button>
          ))}
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Tanggal Mulai Kontrak
        </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={hitung}
          disabled={loading}
          className="w-full rounded-xl bg-sky-600 py-4 font-bold tracking-wide text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? 'MENGHITUNG…' : 'HITUNG ESTIMASI'}
        </button>
      </div>

      {/* Kolom hasil */}
      <div className="bg-slate-900 p-8 text-white md:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
            2
          </span>
          <h2 className="text-xl font-bold">Hasil Proyeksi</h2>
        </div>

        {!hasil ? (
          <div className="flex h-64 items-center justify-center">
            <p className="italic text-slate-400">Klik tombol untuk melihat simulasi hasil</p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-300">
              Halo <span className="font-semibold text-white">{nama}</span>, berikut estimasi
              hasil investasi Anda:
            </p>

            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">
                Bagi Hasil Investor per Bulan ({formatPersen(hasil.rateBulanan)})
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">
                {formatRupiah(hasil.hasilBulanan)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">Total Akumulasi {hasil.tenorBulan} Bulan</p>
              <p className="mt-1 text-3xl font-bold text-sky-400">
                {formatRupiah(hasil.totalHasil)}
              </p>
            </div>

            {/* Avalist */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Avalist 1 ({formatPersen(hasil.rateAvalist1)}/bln)</p>
                <p className="mt-1 text-lg font-bold text-amber-400">
                  {formatRupiah(hasil.avalist1Bulanan)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">
                  Avalist 2 — {hasil.namaMarketing} ({formatPersen(hasil.rateMarketing)}/bln)
                </p>
                <p className="mt-1 text-lg font-bold text-amber-400">
                  {formatRupiah(hasil.komisiBulanan)}
                </p>
              </div>
            </div>

            {/* Tanggal-tanggal */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Tanggal Hari Ini</p>
                <p className="mt-1 font-semibold">{formatTanggal(tglHariIni)}</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Berlaku {HARI_BERLAKU} Hari (s/d)</p>
                <p className="mt-1 font-semibold">{formatTanggal(tglSepuluh)}</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Modal Investasi</p>
                <p className="mt-1 font-semibold">{formatRupiah(nominal)}</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Mulai Kontrak</p>
                <p className="mt-1 font-semibold">{formatTanggal(tglMulai)}</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Bagi Hasil Pertama</p>
                <p className="mt-1 font-semibold text-emerald-300">
                  {formatTanggal(bagiHasilPertama)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Bagi Hasil Terakhir</p>
                <p className="mt-1 font-semibold text-emerald-300">
                  {formatTanggal(bagiHasilTerakhir)}
                </p>
              </div>
            </div>

            <a
              href={buildWaLink(nama.trim(), nominal, tglMulai)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch(`/api/submissions/${hasil.id}`, { method: 'PATCH' }).catch(() => {})
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold tracking-wide text-white transition hover:bg-emerald-600"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              AMBIL SLOT INVESTASI SEKARANG
            </a>

            <p className="text-xs leading-relaxed text-slate-500">
              *Estimasi bagi hasil investor {formatPersen(RATE_BULANAN)} per bulan. Hasil aktual
              mengikuti akad dan kinerja usaha.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
