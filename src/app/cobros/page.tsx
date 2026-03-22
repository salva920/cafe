'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Text,
  Spinner,
  Center,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { LayoutNav } from '../layout-nav'
import { formatCurrency } from '@/lib/utils'

export default function CobrosPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [showAll, setShowAll] = useState(false)
  const [abonoCliente, setAbonoCliente] = useState<{ id: string; name: string; balance: number } | null>(null)
  const [montoAbono, setMontoAbono] = useState('')

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', showAll],
    queryFn: async () => {
      const q = showAll ? '?all=1' : ''
      const res = await fetch(`/api/customers${q}`)
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })

  const payMutation = useMutation({
    mutationFn: async ({
      id,
      amount,
      payAll,
    }: {
      id: string
      amount?: number
      payAll?: boolean
    }) => {
      const res = await fetch(`/api/customers/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payAll ? { payAll: true } : { amount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setAbonoCliente(null)
      setMontoAbono('')
      toast({
        title: 'Abono registrado',
        description: `Pagado: ${formatCurrency(data.paid)} · Saldo: ${formatCurrency(data.balance)}`,
        status: 'success',
        duration: 4000,
      })
    },
    onError: (e: Error) => {
      toast({ title: e.message, status: 'error', duration: 4000 })
    },
  })

  const abrirAbono = (c: { id: string; name: string; balance: number }) => {
    setAbonoCliente(c)
    setMontoAbono('')
  }

  const confirmarAbono = () => {
    if (!abonoCliente) return
    const amt = parseFloat(montoAbono)
    if (Number.isNaN(amt) || amt <= 0) {
      toast({ title: 'Ingresa un monto válido', status: 'warning' })
      return
    }
    payMutation.mutate({ id: abonoCliente.id, amount: amt })
  }

  const liquidarTodo = (c: { id: string; name: string; balance: number }) => {
    if (c.balance <= 0) return
    payMutation.mutate({ id: c.id, payAll: true })
  }

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
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Heading size="lg" color="brand.800">
              Cuentas por cobrar
            </Heading>
            <Button size="sm" variant={showAll ? 'solid' : 'outline'} onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Solo con deuda' : 'Ver todos los clientes'}
            </Button>
          </HStack>

          <Text color="gray.600" fontSize="sm">
            Abonos o pago total. Las ventas a crédito suman la deuda automáticamente.
          </Text>

          <Box bg="white" p={5} borderRadius="2xl" shadow="montilla" borderWidth="1px" borderColor="blackAlpha.100" overflowX="auto">
            {customers.length === 0 ? (
              <Text color="gray.500">No hay clientes con deuda pendiente.</Text>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Cliente</Th>
                    <Th isNumeric>Deuda</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((c: { id: string; name: string; balance: number }) => (
                    <Tr key={c.id}>
                      <Td fontWeight="500">{c.name}</Td>
                      <Td isNumeric>
                        <Text fontWeight="700" color={c.balance > 0 ? 'orange.600' : 'green.600'}>
                          {formatCurrency(c.balance)}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2} flexWrap="wrap">
                          <Button
                            size="sm"
                            colorScheme="brand"
                            variant="outline"
                            isDisabled={c.balance <= 0}
                            onClick={() => abrirAbono({ id: c.id, name: c.name, balance: c.balance })}
                          >
                            Abonar
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="green"
                            isDisabled={c.balance <= 0}
                            onClick={() => liquidarTodo({ id: c.id, name: c.name, balance: c.balance })}
                            isLoading={payMutation.isPending}
                          >
                            Pagar todo
                          </Button>
                          {c.balance <= 0 && <Badge colorScheme="green">Al día</Badge>}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </VStack>
      </Container>

      <Modal isOpen={!!abonoCliente} onClose={() => setAbonoCliente(null)}>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Abono — {abonoCliente?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Deuda actual:{' '}
              <strong>{abonoCliente ? formatCurrency(abonoCliente.balance) : '—'}</strong>
            </Text>
            <FormControl mb={4}>
              <FormLabel>Monto a abonar</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={montoAbono}
                onChange={(e) => setMontoAbono(e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <Divider my={3} />
            <HStack spacing={3}>
              <Button flex={1} onClick={() => setAbonoCliente(null)} variant="ghost">
                Cancelar
              </Button>
              <Button
                flex={1}
                colorScheme="brand"
                onClick={confirmarAbono}
                isLoading={payMutation.isPending}
              >
                Registrar abono
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
