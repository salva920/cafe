export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export const CATEGORIAS = [
  { value: 'cafe', label: 'Café' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'comida', label: 'Comida' },
  { value: 'otro', label: 'Otro' },
] as const
