'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  VStack,
  HStack,
  Spinner,
  Center,
  Text,
  IconButton,
} from '@chakra-ui/react'
import { LayoutNav } from '../layout-nav'
import { formatCurrency, CATEGORIAS } from '@/lib/utils'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function ProductosPage() {
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', category: 'cafe', price: '', stock: '0' })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          price: parseFloat(data.price) || 0,
          stock: parseFloat(data.stock) || 0,
        }),
      })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
      setForm({ name: '', category: 'cafe', price: '', stock: '0' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          price: data.price !== undefined ? parseFloat(String(data.price)) : undefined,
          stock: data.stock !== undefined ? parseFloat(String(data.stock)) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
      setEditingId(null)
      setForm({ name: '', category: 'cafe', price: '', stock: '0' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const handleOpenNew = () => {
    setEditingId(null)
    setForm({ name: '', category: 'cafe', price: '', stock: '0' })
    onOpen()
  }

  const handleOpenEdit = (p: { id: string; name: string; category: string; price: number; stock: number }) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
    })
    onOpen()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
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
      <Container maxW="container.xl" py={6} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
            <Heading size="lg" color="brand.800">
              Productos
            </Heading>
            <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleOpenNew} w={{ base: 'full', sm: 'auto' }}>
              Agregar producto
            </Button>
          </Box>

          <Box bg="white" borderRadius="2xl" shadow="montilla" borderWidth="1px" borderColor="blackAlpha.100" overflow="hidden">
            {products.length === 0 ? (
              <Box p={8} textAlign="center" color="gray.500">
                <Text>No hay productos. Agrega el primero para empezar a vender.</Text>
              </Box>
            ) : (
              <>
                <VStack display={{ base: 'flex', md: 'none' }} align="stretch" spacing={3} p={4}>
                  {products.map((p: { id: string; name: string; category: string; price: number; stock: number }) => (
                    <Box key={p.id} p={4} bg="brand.50" borderRadius="xl" borderWidth="1px" borderColor="blackAlpha.100">
                      <Text fontWeight="700" color="brand.800" fontSize="md">
                        {p.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {CATEGORIAS.find((c) => c.value === p.category)?.label ?? p.category}
                      </Text>
                      <HStack justify="space-between" mt={3} flexWrap="wrap" gap={2}>
                        <Text fontWeight="600" color="brand.600">
                          {formatCurrency(p.price)}
                        </Text>
                        <Text fontSize="sm">
                          Stock: <strong>{p.stock}</strong>
                        </Text>
                        <HStack>
                          <IconButton
                            aria-label="Editar"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="solid"
                            colorScheme="brand"
                            onClick={() => handleOpenEdit(p)}
                          />
                          <IconButton
                            aria-label="Eliminar"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="solid"
                            colorScheme="red"
                            onClick={() => deleteMutation.mutate(p.id)}
                          />
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
                <TableContainer display={{ base: 'none', md: 'block' }} overflowX="auto">
                  <Table size="sm" minW="640px">
                    <Thead bg="brand.50">
                      <Tr>
                        <Th>Nombre</Th>
                        <Th>Categoría</Th>
                        <Th isNumeric>Precio</Th>
                        <Th isNumeric>Stock</Th>
                        <Th w="100px" />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {products.map(
                        (p: { id: string; name: string; category: string; price: number; stock: number }) => (
                          <Tr key={p.id}>
                            <Td fontWeight="500">{p.name}</Td>
                            <Td>{CATEGORIAS.find((c) => c.value === p.category)?.label ?? p.category}</Td>
                            <Td isNumeric fontWeight="600" color="brand.600">
                              {formatCurrency(p.price)}
                            </Td>
                            <Td isNumeric>{p.stock}</Td>
                            <Td>
                              <IconButton
                                aria-label="Editar"
                                icon={<FiEdit2 />}
                                size="sm"
                                variant="ghost"
                                mr={1}
                                onClick={() => handleOpenEdit(p)}
                              />
                              <IconButton
                                aria-label="Eliminar"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => deleteMutation.mutate(p.id)}
                              />
                            </Td>
                          </Tr>
                        )
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: 0, md: '2xl' }} m={{ base: 0, md: undefined }}>
          <ModalHeader>{editingId ? 'Editar producto' : 'Nuevo producto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Café con leche"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Precio (USD)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Stock inicial</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="brand"
                  w="full"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Guardar' : 'Crear'}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
