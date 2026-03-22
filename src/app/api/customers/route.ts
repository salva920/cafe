import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDatabaseUrl } from '@/lib/require-database'

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

export async function GET(request: Request) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === '1'
    const customers = await prisma.customer.findMany({
      where: all ? {} : { balance: { gt: 0 } },
      orderBy: { name: 'asc' },
      include: { _count: { select: { payments: true } } },
    })
    return NextResponse.json(customers)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error'
    console.error('Error al obtener clientes:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    const nameNorm = normalizeName(name)
    const existing = await prisma.customer.findFirst({ where: { nameNorm } })
    if (existing) return NextResponse.json(existing)
    const customer = await prisma.customer.create({
      data: {
        name,
        nameNorm,
        phone: body.phone?.trim() || null,
      },
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error'
    console.error('Error al crear cliente:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
