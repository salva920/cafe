import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, category, price, stock } = body
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = String(name).trim()
    if (category !== undefined) data.category = String(category)
    if (price !== undefined) data.price = parseFloat(price)
    if (stock !== undefined) data.stock = parseFloat(stock)
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
