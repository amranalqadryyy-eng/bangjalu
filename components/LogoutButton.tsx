'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function keluar() {
    setLoading(true)
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={keluar}
      disabled={loading}
      className="font-medium text-red-500 hover:underline disabled:opacity-60"
    >
      {loading ? 'Keluar…' : 'Keluar'}
    </button>
  )
}
