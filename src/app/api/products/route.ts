import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
  } catch (error: any) {
    console.error('Error al crear producto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
