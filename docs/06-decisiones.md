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

## Social (apodos y comentarios)
- Tabla `guest_notes` (`db/006_social.sql`): `kind` es `apodo` (máx. 40) o `comentario` (máx. 280).
- `/social` muestra a todo el evento (sin cupos pendientes) con buscador y un contador de notas. `/social/[id]` es el perfil con los apodos como chips y los comentarios con el autor.
- No podés dejarte notas a vos mismo. Una nota la puede borrar quien la escribió o a quien se la dejaron.
- Por ahora no es en vivo: se actualiza con `refresh()` al escribir o al recargar.

## Matcheá con alguien
- Tabla `swipes(from_id, to_id, liked)` (`db/007_match.sql`). Hay match cuando el like es de ida y vuelta, y nadie ve quién le dio like si no hubo match.
- Solo participan los solteros (`partnerId === null`): quien está de novio/a ve un aviso, y el server también rechaza el swipe.
- La primera vez que entrás elegís Chicas, Chicos o Todos; se guarda en `guests.match_pref` (`db/009_match_pref.sql`) y no se vuelve a preguntar.
- El globito 💘 del home se actualiza en vivo con Realtime (`myMatchesQuery`, que se renueva en `/api/match/live`). El cliente de Realtime se movió a `src/lib/realtime.ts` para compartirlo con El Espía.
- El aviso "¡Es un match!" se escucha en el layout (`src/app/MatchLive.tsx`) con una sola conexión de Realtime, así salta en cualquier pantalla. El globito del home lee del mismo contexto. Solo avisa de los matches nuevos: los que ya había al entrar no generan aviso.

## Notificaciones push (match)
- Web Push con `web-push` y claves VAPID (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` en `.env.local`). **Hay que cargarlas también en Vercel.**
- `public/sw.js` muestra la notificación y, al tocarla, abre el perfil. Las suscripciones van en `push_subscriptions` (`db/008_push.sql`); las que vencen (404/410) se borran solas.
- Cuando hay match, la push le llega a quien dio el primer like. El que da el segundo ya ve el cartel en pantalla.
- En iPhone la push solo funciona con la app agregada al inicio (iOS 16.4+), por eso hay `manifest.ts`, los íconos y `appleWebApp`. La tarjeta "🔔 Activar" está en Matcheá.
- Los avisos flotantes en vivo (`src/app/LiveNotifications.tsx`) cubren matches, apodos y comentarios en tu perfil, con una sola conexión de Realtime. Las consultas se renuevan en `/api/live`. Cuando alguien deja un apodo o comentario también se manda push a quien lo recibe. La tarjeta 🔔 está en el home, en tu perfil y en Matcheá.
