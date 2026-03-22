import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    })
    return NextResponse.json(sales)
  } catch (error: any) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientName, paymentMethod, bank, items: itemsPayload } = body
    if (!itemsPayload || !Array.isArray(itemsPayload) || itemsPayload.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto' },
        { status: 400 }
      )
    }

    let total = 0
    const itemsToCreate: Array<{
      productId: string
      productName: string
      quantity: number
      price: number
      subtotal: number
    }> = []

    for (const it of itemsPayload) {
      const product = await prisma.product.findUnique({
        where: { id: it.productId },
      })
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${it.productId} no encontrado` },
          { status: 404 }
        )
      }
      const qty = parseFloat(it.quantity) || 0
      if (qty <= 0) continue
      if (product.stock < qty) {
        return NextResponse.json(
          { error: `Stock insuficiente de "${product.name}". Disponible: ${product.stock}` },
          { status: 400 }
        )
      }
      const price = parseFloat(it.price) ?? product.price
      const subtotal = Math.round(price * qty * 100) / 100
      total += subtotal
      itemsToCreate.push({
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price,
        subtotal,
      })
    }

    total = Math.round(total * 100) / 100
    if (total <= 0) {
      return NextResponse.json(
        { error: 'El total debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const rawMethod = String(paymentMethod || 'efectivo').toLowerCase()
    let metodoPago: 'efectivo' | 'transferencia' | 'credito'
    if (rawMethod === 'transferencia') metodoPago = 'transferencia'
    else if (rawMethod === 'credito' || rawMethod === 'crédito') metodoPago = 'credito'
    else metodoPago = 'efectivo'

    const banco = typeof bank === 'string' ? bank.trim() : ''
    if (metodoPago === 'transferencia' && !banco) {
      return NextResponse.json(
        { error: 'Debes especificar el banco para pagos por transferencia' },
        { status: 400 }
      )
    }

    const nombreCliente = typeof clientName === 'string' ? clientName.trim() : ''
    if (metodoPago === 'credito' && !nombreCliente) {
      return NextResponse.json(
        { error: 'El nombre del cliente es obligatorio para venta a crédito' },
        { status: 400 }
      )
    }

    const sale = await prisma.$transaction(async (tx) => {
      let customerId: string | null = null
      let finalClientName: string | null = nombreCliente || null

      if (metodoPago === 'credito') {
        const nameNorm = normalizeName(nombreCliente)
        let customer = await tx.customer.findFirst({ where: { nameNorm } })
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: nombreCliente,
              nameNorm,
            },
          })
        }
        customerId = customer.id
        finalClientName = customer.name
        await tx.customer.update({
          where: { id: customer.id },
          data: { balance: { increment: total } },
        })
      }

      const newSale = await tx.sale.create({
        data: {
          clientName: finalClientName,
          total,
          paymentMethod: metodoPago,
          bank: metodoPago === 'transferencia' ? banco : null,
          customerId,
        },
      })
      for (const it of itemsToCreate) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            price: it.price,
            subtotal: it.subtotal,
          },
        })
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        })
      }
      return newSale
    })

    const fullSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: { items: { include: { product: true } }, customer: true },
    })
    return NextResponse.json(fullSale, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear venta:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
