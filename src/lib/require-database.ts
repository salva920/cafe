import { NextResponse } from 'next/server'

/**
 * En Vercel, si falta DATABASE_URL las rutas API devuelven 503 con mensaje claro.
 */
export function requireDatabaseUrl(): NextResponse | null {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    return NextResponse.json(
      {
        error: 'Base de datos no configurada',
        code: 'MISSING_DATABASE_URL',
        hint:
          'Vercel → tu proyecto → Settings → Environment Variables: añade DATABASE_URL con la URI de MongoDB Atlas. Marca Production (y Preview si quieres). Luego Deployments → Redeploy.',
      },
      { status: 503 }
    )
  }
  return null
}
