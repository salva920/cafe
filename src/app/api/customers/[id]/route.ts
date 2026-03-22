import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDatabaseUrl } from '@/lib/require-database'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        payments: { orderBy: { createdAt: 'desc' }, take: 50 },
        sales: {
          where: { paymentMethod: 'credito' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, total: true, createdAt: true },
        },
      },
    })
    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    return NextResponse.json(customer)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error'
    console.error('Error al obtener cliente:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
