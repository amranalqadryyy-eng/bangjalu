'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Gagal login. Coba lagi.')
        setLoading(false)
        return
      }
      router.replace(next)
      router.refresh()
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        placeholder="Username"
        className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />

      <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        placeholder="Password"
        className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sky-600 py-3 font-bold tracking-wide text-white transition hover:bg-sky-700 disabled:opacity-60"
      >
        {loading ? 'MEMPROSES…' : 'MASUK'}
      </button>
    </form>
  )
}
