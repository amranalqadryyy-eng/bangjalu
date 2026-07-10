'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ id, nama }: { id: string; nama: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function hapus() {
    if (!confirm(`Hapus data "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        alert('Gagal menghapus data. Coba lagi.')
        setLoading(false)
        return
      }
      router.refresh()
    } catch {
      alert('Gagal terhubung ke server. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={hapus}
      disabled={loading}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? 'Menghapus…' : 'Hapus'}
    </button>
  )
}
