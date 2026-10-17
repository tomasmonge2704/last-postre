# Decisiones y pendientes

## Decididas
- **Auth**: custom mínima (cookie httpOnly con guest id), sin Better Auth. Ver [02](02-acceso-y-sesion.md).
- **Primer juego**: Verdad o Reto.
- **UI**: estilo Splash, ver [05](05-visual.md). Intensidad = categorías multi-select.

- **Stack**: Next.js + Tailwind en Vercel, DB **Neon Postgres + Neon Realtime** (invitados, perfiles, salas, cartas).
- **Modo de juego**: pasar el celu para Verdad o Reto / Acción y Nombre; **realtime multi-dispositivo** (Neon Realtime) para El Impostor / El Espía.
- **`GuestPicker`** único y reutilizable (login + armado de grupos). Salas = grupos con nombre, globales y reusables entre juegos. Ver [07](07-salas-y-selector.md).
- **Perfiles con etiquetas** (género, novio/a, grupos de amigos) armados por el anfitrión; afectan el contenido.
- **Contenido** (preguntas/retos): lo dicta el anfitrión.
- Secretos (connection string Neon) solo en `.env.local`, nunca commiteado.

- **Salas**: tabla `rooms` (`db/003_rooms.sql`), guardan integrantes y cartas ya jugadas.
- **Verdad o Reto**: banco en `src/lib/games/verdad-reto-cards.ts`; la lógica de reparto (placeholders, novios, dedicadas) en `src/lib/games/verdad-reto.ts`.
- **El Espía**: Neon Realtime (`@neon/realtime` + `useLiveQuery`). Tablas en `db/004_spy.sql`; cada celu se suscribe a 3 consultas firmadas (partida, jugadores, su propio rol) en `src/lib/games/espia.ts`. El lugar y el espía solo viajan al revelar. Las consultas en vivo no aceptan funciones no determinísticas (ej. `extract` sobre `timestamptz`).
- Realtime: `allowedOrigins` en `neon.ts` — **sumar el dominio de Vercel** antes de deployar.

- **Admin** (`/admin`, PIN en `ADMIN_PIN`): gestión de perfiles (apodos, nombre, IG, género, novio/a + pareja simétrica, grupos de amigos, etiquetas) y elección de candidatos de Instagram.
- **Neon es la fuente de verdad de los invitados** desde que existe el admin. `npm run db:seed` solo agrega nuevos; `--force` pisa todo con el JSON; `npm run db:export` baja la base a `data/guests.json`.
- **Fotos de perfil en Postgres** (`guest_avatars`, ~7 KB c/u) servidas por `/api/avatars/[id]`: así elegir un candidato funciona también en Vercel.

## Pendientes
- Listado real de invitados y sus etiquetas.
- Banco de cartas de Verdad o Reto.
