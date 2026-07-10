import LoginForm from '@/components/LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  // Cegah open-redirect: hanya izinkan path internal.
  const tujuan = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold text-slate-800">
            BangJalu <span className="text-sky-600">Investasi Syariah</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">Masuk ke halaman admin</p>
        </div>
        <LoginForm next={tujuan} />
      </div>
    </div>
  )
}
