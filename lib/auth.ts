// Nama cookie sesi login admin.
export const SESSION_COOKIE = 'bangjalu_session'

// Cocokkan username & password dengan kredensial di environment.
export function cekKredensial(username: string, password: string): boolean {
  const u = process.env.AUTH_USERNAME ?? ''
  const p = process.env.AUTH_PASSWORD ?? ''
  return u.length > 0 && username === u && password === p
}

// Path yang wajib login (dipakai proxy & sebagai referensi).
export const PROTECTED_PREFIXES = ['/dashboard', '/riwayat', '/avalist']
