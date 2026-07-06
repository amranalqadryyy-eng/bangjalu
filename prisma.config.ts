import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Pakai process.env langsung (bukan env() dari prisma/config) supaya
// `prisma generate` tidak crash saat DATABASE_URL belum di-set — misalnya
// di tahap install pada CI/hosting. URL hanya benar-benar diperlukan untuk
// db push / migrate dan koneksi runtime.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
})
