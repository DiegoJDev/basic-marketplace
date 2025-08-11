# Basic Marketplace (Next.js App Router)

Tecnologías: Next.js (App Router), TypeScript, NextAuth (JWT), Prisma ORM (SQLite), Tailwind CSS v4, Headless UI, React Hook Form + Zod.

## Requisitos

- Node 18+
- npm o pnpm

## Configuración (paso a paso)

1. Instalar dependencias

```bash
npm install
```

2. Variables de entorno (.env)
   Crear un archivo `.env` en la raíz con:

```bash
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="dev-secret-change-me"
```

3. Base de datos (migraciones + seed)
   Opción rápida (recrear, migrar y sembrar):

```bash
npx prisma migrate reset --force
```

Esto crea usuarios/tiendas/productos de prueba.

4. Iniciar el servidor

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Usuarios de prueba

- `business@example.com` → rol BUSINESS (acceso a dashboard)
- `client@example.com` → rol CLIENT (cliente)

## Autenticación y roles

- Inicio de sesión por email (Credentials). No hay contraseña; se usa solo el email.
- Nota: Se eligió un flujo sin contraseña deliberadamente por los requisitos de la prueba. Reduce complejidad (sin almacenamiento/hasheado de contraseñas), acelera la evaluación del flujo y mantiene el foco en roles, permisos, UI/UX y checkout, tal como se solicita.
- Registro en `/sign-up` con selección de rol. Tras registrarse:
  - CLIENT: redirige a `/` o al `callbackUrl` si venía de `/cart`.
  - BUSINESS: redirige a `/dashboard/stores`.
- Middleware y guardas de servidor:
  - Solo BUSINESS puede acceder a `/dashboard/*`.
  - Si eres BUSINESS, se bloquean rutas públicas de cliente (`/stores`, `/products`, `/orders`) y se redirige al dashboard equivalente.

## Rutas principales

- Públicas: `/`, `/stores`, `/products`, `/cart`, `/orders`, `/about`.
- Dashboard (BUSINESS): `/dashboard/stores`, `/dashboard/products`, `/dashboard/orders`.

## Cómo probar (checklist rápido)

1. Sin sesión:
   - Visitar `/stores` y `/products` → ver paginación (12 por página) y navegación.
   - Ir a `/cart` y pulsar “Pagar” → redirige a `/sign-in`. Completar login con `client@example.com` → vuelve a `/cart` para finalizar compra.
2. Cliente (CLIENT):
   - Agregar productos al carrito desde cualquier grilla (modal de “Agregar y seguir comprando”).
   - Hacer checkout en `/cart` → crea órdenes y redirige a `/orders` (paginado 5 por página).
3. Negocio (BUSINESS):
   - Iniciar sesión con `business@example.com` → header de negocio y acceso solo a `/dashboard/*`.
   - `/dashboard/stores` → ver tiendas propias (paginado) y crear nuevas.
   - `/dashboard/products` → crear producto (nombre, precio en centavos, tienda, categoría). Los errores aparecen debajo de cada campo.
   - `/dashboard/orders` → ver pedidos a tus tiendas y actualizar estado (Realizada/Procesando/Enviada/Cancelada).

## Comandos útiles

- Ver datos con Prisma Studio:

```bash
npx prisma studio
```

- Resetear base y volver a sembrar:

```bash
npx prisma migrate reset --force
```

## Notas de implementación

- Precios en centavos (Int) con validación Zod (límite seguro de Int).
- La UI está en español; el código, enums y datos en la BD permanecen en inglés. Los helpers en `src/lib/i18n.ts` mapean etiquetas (roles, estados, categorías) y formateos (`formatUsdEs`, `formatDateTimeEs`).
- Paginación consistente vía `?page=` con el componente `Pagination`.
