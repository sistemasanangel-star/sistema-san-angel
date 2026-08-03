# Hospital San Ángel — Módulo de Visitadoras Médicas

Sistema de gestión para visitadoras médicas: directorio de médicos, visitas a
médicos y pacientes con firma y GPS, informes en Excel, buzón de opinión por
QR con envío a WhatsApp, mapa de ubicación en vivo y control de eliminación
por token.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Prisma ORM + Postgres (Supabase)
- Leaflet / OpenStreetMap (sin costo, sin API key) para el mapa en vivo
- `signature_pad` para la firma del receptor
- `exceljs` para los reportes con formato de marca
- `qrcode` para generar los códigos QR de opinión

## Configuración de la base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com) (gratis).
2. Ve a **Project Settings → Database → Connection string** y copia la cadena
   en modo **Connection pooling** (puerto `6543`), que es la que funciona bien
   con funciones serverless de Vercel.
3. Copia `.env.example` a `.env` y pega esa cadena en `DATABASE_URL`.
4. Crea las tablas en Supabase:
   ```bash
   npx prisma db push
   npm run seed
   ```

## Desarrollo local

```bash
npm install
npm run dev
```

Usuarios de prueba (creados por el seed):

- Admin: `admin` / `admin123`
- Visitadora: `visitadora1` / `visita123`

Ajusta también `NEXT_PUBLIC_WHATSAPP_NUMBER` en `.env` con el número real del
sanatorio.

## Despliegue en Vercel

1. Importa el repositorio de GitHub en Vercel.
2. En **Environment Variables**, agrega:
   - `DATABASE_URL` — la misma cadena de conexión de Supabase (modo pooling).
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — el número real del sanatorio.
3. Deploy. El build corre `prisma generate && next build`; las tablas ya
   deben existir en Supabase (paso anterior con `prisma db push`), así que no
   hace falta ninguna migración en el build.

## Pendientes de decisión (ver spec original)

- Historial de ruta GPS del día (hoy solo se usa el último punto para el
  mapa en vivo; el historial ya se guarda en la tabla `LocationPing` por si
  se quiere una vista de recorrido más adelante).
- Notificaciones push para solicitudes de token (hoy se revisan en
  "Solicitudes de borrado").
