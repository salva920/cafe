'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { LayoutNav } from './layout-nav'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { FiCoffee } from 'react-icons/fi'

export default function HomePage() {
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await fetch('/api/sales')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })

  const { data: deudores = [], isLoading: loadingDeudores } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })

  const today = new Date().toDateString()
  const ventasHoy = sales.filter((s: any) => new Date(s.createdAt).toDateString() === today)
  const totalHoy = ventasHoy.reduce((sum: number, s: any) => sum + s.total, 0)
  const totalPorCobrar = deudores.reduce((sum: number, c: any) => sum + (c.balance || 0), 0)
  const recentSales = sales.slice(0, 10)
  const isLoading = loadingSales || loadingDeudores

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
          <Heading size="lg" color="gray.800" display="flex" alignItems="center" gap={2}>
            <FiCoffee />
            Inicio
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <StatLabel color="gray.600">Ventas de hoy</StatLabel>
              <StatNumber color="brand.600">{ventasHoy.length}</StatNumber>
            </Stat>
            <Stat bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <StatLabel color="gray.600">Total hoy</StatLabel>
              <StatNumber color="green.600">{formatCurrency(totalHoy)}</StatNumber>
            </Stat>
            <Stat bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <StatLabel color="gray.600">Por cobrar (crédito)</StatLabel>
              <StatNumber color="orange.600">{formatCurrency(totalPorCobrar)}</StatNumber>
              <Text fontSize="xs" color="gray.500" mt={1}>
                <Link href="/cobros">Ir a Cobros</Link>
              </Text>
            </Stat>
          </SimpleGrid>

          <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
            <Heading size="sm" mb={4} color="gray.800">
              Últimas ventas
            </Heading>
            {recentSales.length === 0 ? (
              <Text color="gray.500">No hay ventas. Ve a Ventas para registrar una.</Text>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Cliente</Th>
                    <Th isNumeric>Total</Th>
                    <Th>Fecha</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentSales.map((sale: any) => (
                    <Tr key={sale.id}>
                      <Td>{sale.clientName || '—'}</Td>
                      <Td isNumeric fontWeight="600" color="brand.600">
                        {formatCurrency(sale.total)}
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        {formatDateShort(sale.createdAt)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>

          <Box>
            <Link href="/ventas">
              <Box
                as="button"
                w="full"
                py={4}
                borderRadius="xl"
                bg="brand.500"
                color="white"
                fontWeight="700"
                fontSize="lg"
                _hover={{ bg: 'brand.600' }}
              >
                Nueva venta
              </Box>
            </Link>
          </Box>
        </VStack>
      </Container>
    </>
  )
}
