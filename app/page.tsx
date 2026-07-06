import Link from 'next/link'
import Calculator from '@/components/Calculator'
import { formatRupiah, MIN_INVESTASI } from '@/lib/config'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold text-slate-800">
            BangJalu <span className="text-sky-600">Investasi Syariah</span>
          </p>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#beranda" className="hover:text-sky-600">Beranda</a>
            <a href="#kalkulator" className="hover:text-sky-600">Kalkulator Investasi</a>
            <a href="#faq" className="hover:text-sky-600">FAQ</a>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            DASBOARD
          </Link>
        </div>
      </header>

      {/* Kalkulator */}
      <main id="beranda" className="mx-auto max-w-6xl px-6 py-14">
        <section id="kalkulator">
          <h1 className="text-center text-4xl font-bold text-slate-900">
            BangJalu Investasi Syariah
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-500">
            Perhitungan transparan: Estimasi hasil investasi bagi hasil bulanan dan akumulasi
            total pendapatan.
          </p>
          <p className="mt-3 text-center font-bold text-slate-800">
            Khusus investasi minimal {formatRupiah(MIN_INVESTASI)}
          </p>

          <div className="mt-10">
            <Calculator />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">FAQ</h2>
          <div className="mt-8 space-y-4">
            {[
              {
                q: 'Apakah investasi ini sesuai prinsip syariah?',
                a: 'Ya, investasi menggunakan akad syirkah (bagi hasil) sesuai prinsip syariah, tanpa riba.',
              },
              {
                q: 'Berapa minimal investasinya?',
                a: `Minimal investasi adalah ${formatRupiah(MIN_INVESTASI)} dengan tenor kontrak 12 bulan.`,
              },
              {
                q: 'Bagaimana cara pencairan bagi hasil?',
                a: 'Bagi hasil dibayarkan setiap bulan ke rekening Anda selama masa kontrak berjalan.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-800">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} BangJalu Investasi Syariah. Investasi berbasis syariah —
        aman, nyaman, menguntungkan.
      </footer>
    </div>
  )
}
