// Konfigurasi skema bagi hasil — ubah angka di sini sesuai kebutuhan.
export const RATE_BULANAN = 0.05 // 5% per bulan dari nominal, untuk investor
export const TENOR_BULAN = 12 // lama kontrak (bulan)
export const MIN_INVESTASI = 10_000_000 // minimal nominal investasi (Rp)
export const HARI_BERLAKU = 10 // slot berlaku berapa hari dari tanggal hari ini

// Pilihan bagi hasil bulanan Avalist 1 (tanpa nama) — dipilih salah satu saat input
export const AVALIST1_RATES = [0.02, 0.01] as const
// Pilihan bagi hasil bulanan Avalist 2 (pakai nama) — dipilih salah satu saat input
export const AVALIST2_RATES = [0.01, 0.005] as const

// Nomor WhatsApp tujuan tombol "Ambil Slot" — format internasional tanpa tanda +
export const WA_NUMBER = '6281354993383'

export function buildWaLink(nama: string, nominal: number, tanggal: Date): string {
  const pesan =
    `Assalamu'alaikum, saya ${nama}. ` +
    `Saya tertarik mengambil slot investasi sebesar ${formatRupiah(nominal)} ` +
    `mulai kontrak ${formatTanggal(tanggal)}. ` +
    `Mohon info langkah selanjutnya.`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatTanggal(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function tambahHari(date: Date, hari: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + hari)
  return d
}

export function tambahBulan(date: Date, bulan: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + bulan)
  return d
}

// Tanggal dana diakui sebagai investasi: HARI_BERLAKU (10) hari setelah
// tanggal transfer dana.
export function tanggalDiakui(tglTransfer: Date): Date {
  return tambahHari(tglTransfer, HARI_BERLAKU)
}

// Jadwal tanggal bagi hasil bulanan. Dimulai 1 bulan setelah tanggal diakui,
// berulang tiap bulan pada tanggal yang sama. Pembayaran terakhir jatuh
// TENOR_BULAN (12) bulan setelah pembayaran pertama — sesuai alur:
// transfer 7 Juli → diakui 17 Juli → pertama 17 Agustus → terakhir 17 Agustus
// tahun berikutnya.
export function jadwalBagiHasil(tglTransfer: Date): Date[] {
  const diakui = tanggalDiakui(tglTransfer)
  const dates: Date[] = []
  for (let i = 1; i <= TENOR_BULAN + 1; i++) {
    dates.push(tambahBulan(diakui, i))
  }
  return dates
}

export function formatPersen(rate: number): string {
  return `${(rate * 100).toLocaleString('id-ID')}%`
}
