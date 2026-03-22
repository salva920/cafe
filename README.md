# Café - Sistema de ventas

Sistema simplificado de ventas para un emprendimiento de café. Enfocado en agregar productos y procesar ventas de forma directa.

## Características

- **Inicio:** Resumen del día (ventas y total) y últimas ventas.
- **Productos:** Alta, edición y eliminación. Categorías: Café, Bebida, Comida, Otro. Precio y stock.
- **Ventas:** Procesador directo: agregar productos al carrito, cantidad, cliente (obligatorio si es **crédito**), método de pago (efectivo, transferencia, crédito) y registrar venta. Historial y nota PDF.
- **Cobros:** Clientes con deuda por ventas a crédito; **abonar** monto parcial o **pagar todo** hasta dejar saldo en 0.
- **Inicio:** Incluye total **por cobrar** (suma de deudas a crédito).

Sin lotes, vencimientos, proveedores ni módulo de administración. Ideal para un negocio pequeño de café.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Instalación

```bash
cd cafe-ventas
npm install
```

Crear `.env` en la raíz:

```
DATABASE_URL="mongodb://localhost:27017/cafe_ventas"
```

Sincronizar base de datos:

```bash
npx prisma generate
npx prisma db push
```

## Uso

```bash
npm run dev
```

La app corre en **http://localhost:3001** (puerto 3001 para no chocar con el sistema de alimentos en 3000).

1. Ve a **Productos** y agrega tus productos (café, bebidas, etc.).
2. Ve a **Ventas**, agrega productos al carrito, elige método de pago. Si es **Crédito**, indica el **nombre del cliente** (se crea o reutiliza el mismo cliente si el nombre coincide).
3. En **Cobros** registra abonos o liquida la deuda de cada cliente.
4. En **Inicio** ves el resumen del día, total por cobrar y últimas ventas.

## Estructura

- `src/app/page.tsx` — Inicio / dashboard
- `src/app/productos/page.tsx` — CRUD productos
- `src/app/ventas/page.tsx` — Procesador de ventas + historial
- `src/app/cobros/page.tsx` — Deudas y abonos
- `src/app/api/products` — API productos
- `src/app/api/sales` — API ventas
- `src/app/api/customers` — Listado / alta cliente
- `src/app/api/customers/[id]/payments` — Abonos
- `prisma/schema.prisma` — Product, Sale, SaleItem, Customer, CustomerPayment

---

## Subir a GitHub

### Opción A — Repositorio solo con `cafe-ventas` (recomendado para Vercel simple)

1. Crea un repo vacío en GitHub (sin README si quieres evitar conflictos).
2. En tu PC, dentro de la carpeta del proyecto:

```bash
cd cafe-ventas
git init
git add .
git commit -m "Initial commit: café ventas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

3. **No subas** el archivo `.env` (ya está en `.gitignore`). Copia `.env.example` a `.env` en local y rellena `DATABASE_URL`.

### Opción B — Monorepo (todo `alimentos-app` incluye `cafe-ventas`)

Haz push del repo raíz como siempre. En Vercel debes indicar **Root Directory** = `cafe-ventas` (ver abajo).

---

## Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com), **Add New Project** e importa el repo de GitHub.
2. Si el repo es el monorepo `alimentos-app`: en **Root Directory** elige **`cafe-ventas`**.
3. **Framework Preset:** Next.js (detectado solo).
4. **Build Command:** por defecto usa `npm run build` → ya ejecuta `prisma generate && next build`.
5. **Environment Variables:** añade:
   - `DATABASE_URL` = tu cadena de MongoDB Atlas (la misma que en `.env` local).

6. **MongoDB Atlas:** en *Network Access*, permite IPs de Vercel (suele usarse **0.0.0.0/0** en proyectos pequeños) o la política que recomiende Atlas para serverless.

7. **Esquema en la nube:** la primera vez, con la `DATABASE_URL` de producción, ejecuta en tu máquina (apuntando a esa URL o con un `.env.production` temporal):

```bash
cd cafe-ventas
npx prisma db push
```

   Así se crean colecciones e índices en la base de producción. Luego despliega de nuevo si hace falta.

8. Tras el deploy, la app quedará en `https://tu-proyecto.vercel.app` (Next usa el puerto que asigne Vercel; en local sigues usando `npm run dev` con `-p 3001` si quieres).

### Checklist rápido

- [ ] `.env` no está en el repo
- [ ] `.env.example` sí está (sin secretos)
- [ ] `DATABASE_URL` configurada en Vercel
- [ ] Atlas permite conexiones desde internet (firewall)
- [ ] `npx prisma db push` ejecutado contra la BD de producción al menos una vez
# cafe
