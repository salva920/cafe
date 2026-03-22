import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDatabaseUrl } from '@/lib/require-database'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
