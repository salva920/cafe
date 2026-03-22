import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDatabaseUrl } from '@/lib/require-database'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dbCheck = requireDatabaseUrl()
  if (dbCheck) return dbCheck
  try {
    const body = await request.json()
    const payAll = body.payAll === true

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    })
    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    let amount = payAll ? customer.balance : parseFloat(body.amount)
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }
    amount = Math.round(amount * 100) / 100
    if (amount > customer.balance) {
      amount = Math.round(customer.balance * 100) / 100
    }
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'El cliente no tiene deuda pendiente' },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.customerPayment.create({
        data: { customerId: customer.id, amount },
      })
      return tx.customer.update({
        where: { id: customer.id },
        data: { balance: { decrement: amount } },
      })
    })

    return NextResponse.json({
      ok: true,
      paid: amount,
      balance: updated.balance,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error'
    console.error('Error al registrar abono:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
