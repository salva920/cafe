import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDatabaseUrl } from '@/lib/require-database'

export async function GET() {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(products)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    const body = await request.json()
    const { name, category, price, stock } = body
    if (!name || !category || price == null) {
      return NextResponse.json(
        { error: 'Nombre, categoría y precio son requeridos' },
        { status: 400 }
      )
    }
    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        category: String(category),
        price: parseFloat(price) || 0,
        stock: parseFloat(stock) || 0,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
