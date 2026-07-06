'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Muat ulang data server component secara berkala agar data baru langsung tampil.
export default function AutoRefresh({ intervalMs = 10_000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const t = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(t)
  }, [router, intervalMs])

  return null
}
