import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#FDF4F3',
      100: '#FCE8E6',
      200: '#F9D5D1',
      300: '#F4B5AE',
      400: '#EC8A80',
      500: '#C45A4F',
      600: '#A34A41',
      700: '#883E36',
      800: '#72352F',
      900: '#5F2E29',
    },
  },
  styles: {
    global: {
      'html, body': { bg: 'gray.50' },
    },
  },
  components: {
    Button: {
      baseStyle: { fontWeight: '600', borderRadius: 'xl' },
      defaultProps: { colorScheme: 'brand' },
    },
    Input: {
      defaultProps: { focusBorderColor: 'brand.500', borderRadius: 'lg' },
    },
    Select: {
      defaultProps: { focusBorderColor: 'brand.500', borderRadius: 'lg' },
    },
  },
})

export default theme
