// Konfigurasi skema bagi hasil — ubah angka di sini sesuai kebutuhan.
export const RATE_BULANAN = 0.05 // 5% per bulan dari nominal, untuk investor
export const TENOR_BULAN = 12 // lama kontrak (bulan)
export const MIN_INVESTASI = 10_000_000 // minimal nominal investasi (Rp)

// Pilihan komisi bulanan untuk marketing/pembawa investor (dipilih salah satu saat input)
export const KOMISI_MARKETING = [0.01, 0.005] as const

// Nomor WhatsApp tujuan tombol "Ambil Slot" — format internasional tanpa tanda +
export const WA_NUMBER = '6281354993383'

export function buildWaLink(nama: string, nominal: number, tanggal: Date): string {
  const pesan =
    `Assalamu'alaikum, saya ${nama}. ` +
    `Saya tertarik mengambil slot investasi sebesar ${formatRupiah(nominal)} ` +
    `mulai kontrak ${tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. ` +
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
