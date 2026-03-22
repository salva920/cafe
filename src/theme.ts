import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

/** Paleta café Montilla: marrón espresso, crema, acento terracota */
const theme = extendTheme({
  config,
  fonts: {
    heading: 'var(--font-fraunces), Georgia, serif',
    body: 'var(--font-dm-sans), system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#FAF6F0',
      100: '#F0E8DC',
      200: '#E0D0BC',
      300: '#C4A882',
      400: '#A67C52',
      500: '#7D5A3C',
      600: '#5C4033',
      700: '#453025',
      800: '#2E201A',
      900: '#1A120E',
    },
    espresso: {
      500: '#3D2914',
      600: '#2A1C0E',
    },
    cream: {
      50: '#FFFDF9',
      100: '#FAF6F0',
    },
  },
  styles: {
    global: {
      'html, body': {
        bg: 'cream.100',
        color: 'espresso.600',
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'xl',
        _focusVisible: { boxShadow: '0 0 0 3px rgba(92, 64, 51, 0.35)' },
      },
      defaultProps: { colorScheme: 'brand' },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
        borderRadius: 'lg',
        bg: 'white',
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.500',
        borderRadius: 'lg',
        bg: 'white',
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        letterSpacing: '-0.02em',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          boxShadow: '0 4px 24px -4px rgba(45, 32, 20, 0.08), 0 2px 8px -2px rgba(45, 32, 20, 0.06)',
          border: '1px solid',
          borderColor: 'blackAlpha.100',
          bg: 'white',
        },
      },
    },
  },
  shadows: {
    montilla: '0 8px 32px -8px rgba(61, 41, 20, 0.12), 0 4px 16px -4px rgba(61, 41, 20, 0.08)',
  },
  radii: {
    xl: '14px',
    '2xl': '20px',
  },
})

export default theme
