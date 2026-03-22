'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Container, HStack, Text } from '@chakra-ui/react'
import { FiHome, FiPackage, FiShoppingCart, FiDollarSign } from 'react-icons/fi'

const navItems = [
  { href: '/', label: 'Inicio', icon: FiHome },
  { href: '/productos', label: 'Productos', icon: FiPackage },
  { href: '/ventas', label: 'Ventas', icon: FiShoppingCart },
  { href: '/cobros', label: 'Cobros', icon: FiDollarSign },
]

export function LayoutNav() {
  const pathname = usePathname()
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" py={3}>
      <Container maxW="container.xl">
        <HStack spacing={6}>
          <Text fontWeight="800" fontSize="lg" color="brand.600">
            Café
          </Text>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}>
                <HStack
                  spacing={2}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  bg={isActive ? 'brand.50' : 'transparent'}
                  color={isActive ? 'brand.700' : 'gray.600'}
                  fontWeight={isActive ? '600' : '500'}
                  _hover={{ bg: 'gray.50', color: 'brand.600' }}
                >
                  <Icon />
                  <Text>{label}</Text>
                </HStack>
              </Link>
            )
          })}
        </HStack>
      </Container>
    </Box>
  )
}
