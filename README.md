# MotoCompareBackend

API REST del proyecto MotoCompare (Node + Express + Prisma + PostgreSQL), con arquitectura hexagonal.

## Requisitos

- Node.js
- Docker (para la base de datos)

## Instalación

```bash
npm install
cp .env.example .env   # ajustar valores si hace falta
npm run db:up           # levanta PostgreSQL con docker compose
npm run db:migrate      # aplica las migraciones de Prisma
npm run dev              # servidor en modo desarrollo (tsx watch)
```

## Variables de entorno (`.env`)

- `DATABASE_URL` — cadena de conexión a PostgreSQL
- `JWT_SECRET` — secreto para firmar los tokens de sesión
- `PORT` — puerto del servidor (por defecto 3002)
- `FRONTEND_ORIGIN` — origen permitido para CORS (por defecto `http://localhost:4200`)

## Documentación de la API

Con el servidor corriendo, la documentación interactiva (Swagger) está disponible en `http://localhost:3002/api-docs`.

## Scripts útiles

- `npm run build` — compila TypeScript
- `npm run test` — tests con vitest
- `npm run db:studio` — explorador visual de la base de datos (Prisma Studio)
- `npm run db:seed` — carga datos de ejemplo
- `npm run arquitectura` — verifica que `dominio` y `aplicacion` no dependan de `infraestructura`

## Arquitectura

El proyecto sigue una arquitectura hexagonal (puertos y adaptadores):

- `src/dominio` — entidades y puertos (interfaces), sin dependencias externas
- `src/aplicacion/casos-uso` — la lógica de negocio, orquesta el dominio a través de los puertos
- `src/infraestructura` — adaptadores concretos: HTTP (Express), persistencia (Prisma)
