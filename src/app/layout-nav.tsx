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
    <Box
      position="sticky"
      top={0}
      zIndex={100}
      bg="whiteAlpha.900"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="blackAlpha.100"
      boxShadow="0 1px 0 rgba(61, 41, 20, 0.06)"
    >
      <Container maxW="container.xl" py={3}>
        <HStack spacing={{ base: 3, md: 6 }} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
          <Text
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: 'md', md: 'lg' }}
            color="brand.700"
            letterSpacing="-0.02em"
            mr={{ md: 2 }}
          >
            Café Montilla
          </Text>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}>
                <HStack
                  spacing={2}
                  px={3}
                  py={2}
                  borderRadius="xl"
                  bg={isActive ? 'brand.100' : 'transparent'}
                  color={isActive ? 'brand.800' : 'gray.600'}
                  fontWeight={isActive ? '700' : '500'}
                  fontSize="sm"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: isActive ? 'brand.100' : 'brand.50',
                    color: 'brand.700',
                  }}
                >
                  <Icon size={18} />
                  <Text display={{ base: 'none', sm: 'block' }}>{label}</Text>
                </HStack>
              </Link>
            )
          })}
        </HStack>
      </Container>
    </Box>
  )
}
