import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Café Montilla',
    short_name: 'Montilla',
    description: 'Ventas, productos y cobros — Café Montilla',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6F0',
    theme_color: '#5C4033',
    orientation: 'portrait-primary',
    categories: ['business', 'food'],
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: '512x512',
        purpose: 'maskable',
      },
    ],
  }
}
