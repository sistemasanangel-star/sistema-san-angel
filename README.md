# Hospital San Ángel — Módulo de Visitadoras Médicas

Sistema de gestión para visitadoras médicas: directorio de médicos, visitas a
médicos y pacientes con firma y GPS, informes en Excel, buzón de opinión por
QR con envío a WhatsApp, mapa de ubicación en vivo y control de eliminación
por token.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Prisma ORM + SQLite en desarrollo local
- Leaflet / OpenStreetMap (sin costo, sin API key) para el mapa en vivo
- `signature_pad` para la firma del receptor
- `exceljs` para los reportes con formato de marca
- `qrcode` para generar los códigos QR de opinión

## Desarrollo local

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Usuarios de prueba (creados por el seed):

- Admin: `admin` / `admin123`
- Visitadora: `visitadora1` / `visita123`

Variables de entorno: copia `.env.example` a `.env` y ajusta
`NEXT_PUBLIC_WHATSAPP_NUMBER` con el número real del sanatorio.

## Despliegue en Vercel

SQLite no persiste en funciones serverless. Antes de desplegar:

1. Crea una base de datos Postgres (Neon, Vercel Postgres o Supabase).
2. En `prisma/schema.prisma`, cambia `provider = "sqlite"` por
   `provider = "postgresql"`.
3. Define `DATABASE_URL` en Vercel con la cadena de conexión de Postgres.
4. Corre `npx prisma migrate deploy` apuntando a esa base (o vuelve a generar
   la migración inicial con `npx prisma migrate dev` en local contra Postgres
   antes de subir).
5. Ejecuta el seed una vez contra la base de producción si quieres el usuario
   admin inicial.

## Pendientes de decisión (ver spec original)

- Historial de ruta GPS del día (hoy solo se usa el último punto para el
  mapa en vivo; el historial ya se guarda en la tabla `LocationPing` por si
  se quiere una vista de recorrido más adelante).
- Notificaciones push para solicitudes de token (hoy se revisan en
  "Solicitudes de borrado").
