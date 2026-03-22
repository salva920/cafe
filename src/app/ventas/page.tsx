'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Container,
  Heading,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  Divider,
  IconButton,
  useToast,
  SimpleGrid,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { LayoutNav } from '../layout-nav'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { jsPDF } from 'jspdf'

type CartItem = { productId: string; productName: string; price: number; quantity: number }

export default function VentasPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [clientName, setClientName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [bank, setBank] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await fetch('/api/sales')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })

  const saleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim() || undefined,
          paymentMethod,
          bank: paymentMethod === 'transferencia' ? bank.trim() : undefined,
          items: cart.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
          })),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al registrar venta')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setCart([])
      setClientName('')
      setBank('')
      setPaymentMethod('efectivo')
      toast({ title: 'Venta registrada', status: 'success', duration: 2000 })
    },
    onError: (e: any) => {
      toast({ title: e.message, status: 'error', duration: 3000 })
    },
  })

  const addToCart = (product: any, qty: number = 1) => {
    if (qty <= 0) return
    const existing = cart.find((it) => it.productId === product.id)
    if (existing) {
      setCart(
        cart.map((it) =>
          it.productId === product.id ? { ...it, quantity: it.quantity + qty } : it
        )
      )
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price: product.price, quantity: qty }])
    }
  }

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((it) => it.productId !== productId))
      return
    }
    setCart(cart.map((it) => (it.productId === productId ? { ...it, quantity } : it)))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((it) => it.productId !== productId))
  }

  const exportarNotaEntrega = (sale: any) => {
    const doc = new jsPDF()
    const fecha = formatDateShort(sale.createdAt)
    const cliente = sale.clientName || 'Cliente general'
    const pago =
      sale.paymentMethod === 'credito'
        ? 'Crédito'
        : sale.paymentMethod === 'transferencia' && sale.bank
          ? `Transferencia - ${sale.bank}`
          : sale.paymentMethod

    doc.setFontSize(16)
    doc.text('Nota de Entrega', 14, 18)
    doc.setFontSize(11)
    doc.text('Cafe Ventas', 14, 26)
    doc.text(`Fecha: ${fecha}`, 14, 33)
    doc.text(`Cliente: ${cliente}`, 14, 40)
    doc.text(`Metodo de pago: ${pago}`, 14, 47)
    doc.text('----------------------------------------------', 14, 53)
    doc.text('Producto', 14, 60)
    doc.text('Cant.', 120, 60)
    doc.text('Subtotal', 155, 60)

    let y = 68
    for (const item of sale.items || []) {
      doc.text(String(item.productName || '-'), 14, y)
      doc.text(String(item.quantity ?? 0), 120, y)
      doc.text(formatCurrency(item.subtotal || 0), 155, y)
      y += 8
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    }

    doc.text('----------------------------------------------', 14, y + 2)
    doc.setFontSize(13)
    doc.text(`TOTAL: ${formatCurrency(sale.total || 0)}`, 14, y + 12)
    doc.setFontSize(10)
    doc.text('Gracias por su compra.', 14, y + 20)

    const idCorto = String(sale.id || 'venta').slice(-6)
    doc.save(`nota-entrega-${idCorto}.pdf`)
  }

  const total = Math.round(cart.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100) / 100

  const isLoading = loadingProducts || loadingSales

  if (isLoading) {
    return (
      <>
        <LayoutNav />
        <Center minH="50vh">
          <Spinner size="xl" color="brand.500" />
        </Center>
      </>
    )
  }

  return (
    <>
      <LayoutNav />
      <Container maxW="container.xl" py={6}>
        <VStack align="stretch" spacing={6}>
          <Heading size="lg" color="gray.800">
            Ventas
          </Heading>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Productos disponibles */}
            <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <Text fontWeight="600" mb={4} color="gray.800">
                Agregar producto
              </Text>
              {products.length === 0 ? (
                <Text color="gray.500">No hay productos. Ve a Productos y agrega algunos.</Text>
              ) : (
                <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
                  {products.filter((p: any) => p.stock > 0).map((p: any) => (
                    <HStack key={p.id} justify="space-between" p={2} bg="gray.50" borderRadius="lg">
                      <Box flex={1}>
                        <Text fontWeight="500">{p.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatCurrency(p.price)} · Stock: {p.stock}
                        </Text>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        leftIcon={<FiPlus />}
                        onClick={() => addToCart(p)}
                        isDisabled={p.stock < 1}
                      >
                        Agregar
                      </Button>
                    </HStack>
                  ))}
                  {products.filter((p: any) => p.stock > 0).length === 0 && products.length > 0 && (
                    <Text color="gray.500">Sin stock disponible.</Text>
                  )}
                </VStack>
              )}
            </Box>

            {/* Carrito y total */}
            <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <Text fontWeight="600" mb={3} color="gray.800">
                Carrito
              </Text>
              {cart.length === 0 ? (
                <Text color="gray.500" py={4}>
                  Agrega productos desde la lista.
                </Text>
              ) : (
                <>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Producto</Th>
                        <Th isNumeric>Precio</Th>
                        <Th w="80px">Cant.</Th>
                        <Th isNumeric>Subtotal</Th>
                        <Th w="40px" />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cart.map((it) => (
                        <Tr key={it.productId}>
                          <Td>{it.productName}</Td>
                          <Td isNumeric>{formatCurrency(it.price)}</Td>
                          <Td>
                            <Input
                              type="number"
                              size="sm"
                              min={0.01}
                              step={0.5}
                              value={it.quantity}
                              onChange={(e) =>
                                updateCartQty(it.productId, parseFloat(e.target.value) || 0)
                              }
                            />
                          </Td>
                          <Td isNumeric fontWeight="600">
                            {formatCurrency(it.price * it.quantity)}
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Quitar"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeFromCart(it.productId)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  <Divider my={4} />
                  <HStack justify="space-between" mb={4}>
                    <Text fontWeight="700" fontSize="lg">
                      Total
                    </Text>
                    <Text fontWeight="700" fontSize="xl" color="brand.600">
                      {formatCurrency(total)}
                    </Text>
                  </HStack>
                  <FormControl mb={3} isRequired={paymentMethod === 'credito'}>
                    <FormLabel fontSize="sm">
                      Cliente {paymentMethod === 'credito' ? '(obligatorio a crédito)' : '(opcional)'}
                    </FormLabel>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nombre del cliente"
                      size="sm"
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel fontSize="sm">Método de pago</FormLabel>
                    <Select
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value)
                        if (e.target.value !== 'transferencia') setBank('')
                      }}
                      size="sm"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="credito">Crédito</option>
                    </Select>
                  </FormControl>
                  {paymentMethod === 'transferencia' && (
                    <FormControl mb={4} isRequired>
                      <FormLabel fontSize="sm">Banco</FormLabel>
                      <Input
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        placeholder="Ej. Banesco, Venezuela, Provincial"
                        size="sm"
                      />
                    </FormControl>
                  )}
                  <Button
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    onClick={() => saleMutation.mutate()}
                    isDisabled={
                      (paymentMethod === 'transferencia' && !bank.trim()) ||
                      (paymentMethod === 'credito' && !clientName.trim())
                    }
                    isLoading={saleMutation.isPending}
                  >
                    Registrar venta
                  </Button>
                </>
              )}
            </Box>
          </SimpleGrid>

          {/* Historial reciente */}
          <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
            <Text fontWeight="600" mb={4} color="gray.800">
              Últimas ventas
            </Text>
            {sales.length === 0 ? (
              <Text color="gray.500">Aún no hay ventas.</Text>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Cliente</Th>
                    <Th>Productos</Th>
                    <Th isNumeric>Total</Th>
                    <Th>Pago</Th>
                    <Th>Fecha</Th>
                    <Th>PDF</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sales.slice(0, 15).map((sale: any) => (
                    <Tr key={sale.id}>
                      <Td>{sale.clientName || '—'}</Td>
                      <Td fontSize="sm">
                        {(sale.items || []).map((i: any) => `${i.productName} × ${i.quantity}`).join(', ') || '—'}
                      </Td>
                      <Td isNumeric fontWeight="600" color="brand.600">
                        {formatCurrency(sale.total)}
                      </Td>
                      <Td>
                        {sale.paymentMethod === 'credito'
                          ? 'Crédito'
                          : sale.paymentMethod === 'transferencia' && sale.bank
                            ? `Transferencia (${sale.bank})`
                            : sale.paymentMethod}
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        {formatDateShort(sale.createdAt)}
                      </Td>
                      <Td>
                        <Button size="xs" colorScheme="brand" variant="outline" onClick={() => exportarNotaEntrega(sale)}>
                          Nota PDF
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </VStack>
      </Container>
    </>
  )
}
