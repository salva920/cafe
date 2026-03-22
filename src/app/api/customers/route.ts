import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

/** GET - Clientes con deuda (balance > 0) o todos con ?all=1 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === '1'
    const customers = await prisma.customer.findMany({
      where: all ? {} : { balance: { gt: 0 } },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { payments: true } },
      },
    })
    return NextResponse.json(customers)
  } catch (error: any) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/** POST - Crear cliente manual (opcional) */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    const nameNorm = normalizeName(name)
    const existing = await prisma.customer.findFirst({ where: { nameNorm } })
    if (existing) {
      return NextResponse.json(existing)
    }
    const customer = await prisma.customer.create({
      data: {
        name,
        nameNorm,
        phone: body.phone?.trim() || null,
      },
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
