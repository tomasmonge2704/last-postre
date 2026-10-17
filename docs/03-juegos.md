# Juegos

Orden de construcción: **1. Verdad o Reto** → 2. Acción y Nombre → 3. Picantes → otros.

## 1. Verdad o Reto (MVP)
Mecánica estándar:
- Se arma una **ronda** de jugadores (los presentes en el grupo/mesa, o "todos los conectados").
- Le toca a alguien (sorteo con animación o turno en orden) → elige **Verdad** o **Reto**.
- Sale una carta con el contenido, personalizada con su nombre y, si aplica, con otro invitado real.
- Acciones: **Cumplí ✅** / **Paso (shot 🥃)** / siguiente turno.
- Selector de intensidad: 🙂 suave · 😏 picante · 🔥 hot.

Reglas de contenido:
- Sin repetir cartas en la noche (por grupo/sesión).
- Placeholders en el texto: `{yo}`, `{otro}`, `{otra}`, `{random}` → se reemplazan por invitados reales (apodo preferido).
- Cartas dedicadas: algunas se marcan para un invitado específico y salen con prioridad cuando le toca.

Pantallas (refs en [`/inspo/verdad-reto`](../inspo/verdad-reto)), header "Verdad o reto" + ✕:
1. **Carta de turno**: carta grande con borde blanco grueso, fondo con patrón (escamas/ondas, en Postre: textura de caramelo), **nombre del jugador** arriba en blanco bold, ilustración 3D de 2 personajes en el medio. Abajo 2 botones pastilla: **Verdad** (color claro) y **Reto** (color fuerte/`frutilla`).
2. **Carta de contenido**: carta `chocolate` lisa, nombre arriba chico, texto grande centrado bold — **color distinto según tipo** (verdad = un color, reto = otro; en Splash cian vs rosa), **emoji de la categoría** abajo (💋 atrevido, 🌶️ hardcore). CTA pastilla "Continuar" → siguiente jugador.
3. Transición: la carta se da vuelta (flip) al elegir.

Jugadores y modo:
- Al entrar: **"Así nomás, rápido"** o **"Armar / usar una sala"** ([07](07-salas-y-selector.md)).
- **Un solo celu** por grupo que pasa de mano. Sin realtime.

Filtros por perfil ([04](04-datos-invitados.md)):
- Si el jugador **está de novio/a**, se bajan las prendas picantes que involucren a otra persona (contacto físico, besos, etc.), salvo que la otra persona sea su pareja.
- Se usan género y grupos de amigos para elegir `{otro}`/`{otra}` con sentido (ej. preguntas sobre gente que conoce).

Contenido: **lo escribe el anfitrión**; no inventar cartas por cuenta propia salvo placeholders de prueba.

## 2. Acción y Nombre (inventado por nosotros, sin ref de Splash)
- Setup como los demás: **Jugadores** (rápido o sala) + **Categorías** (🍮 Suave · 🎉 Fiesta · 🌶️ Picante).
- Por turnos: carta "Le toca a {jugador}" → **ruleta de nombres** que frena en alguien → **3 acciones random** con `{nombre}` → elegís una → "¡Cumplí! ✅" / "Paso 🥃".
- **Rápido**: la ruleta sale de **todo el evento** (sin cupos pendientes). **Sala**: solo de la sala.
- Si alguno de los dos está de novio/a y no son pareja → solo acciones sin contacto (`physical`).
- Banco en `src/lib/games/accion-nombre-cards.ts`.

## 3. Picantes
- Variantes 🔥 de los anteriores y juegos tipo "Yo nunca", "¿Quién es más probable que…?" con votación entre invitados.

## Yo Nunca
Refs en [`/inspo/yo-nunca`](../inspo/yo-nunca). Setup solo con **Categorías** (sin jugadores) + "Comienza el juego". Fondo `frutilla`, carta `caramelo` con borde crema: "NUNCA HE" + texto + emoji de categoría. **Tap en la carta o "Siguiente"** → la carta gira y muestra la próxima. Banco en `src/lib/games/yo-nunca-cards.ts`.

## 4. El Impostor / El Espía (realtime)
Referencias del Espía en [`/inspo/espia`](../inspo/espia) (Splash, "¿Quién es el espía?"). Flujo:
1. **Carta privada** con el **nombre del jugador** arriba (grande, color acento) + ilustración 3D; "Deslizá hacia arriba para revelar". Copy: "Que nadie más la vea".
2. Al deslizar, debajo aparece: **lugar** (ej. "Gasolinera") + **rol** (👤 "Camionero"), o si sos espía: **"Espía — Averiguá el lugar sin que te pillen"**. Fondo de la carta = foto del lugar.
3. Pantalla **"¡{nombre} empieza!"** + instrucción ("Hacele la primera pregunta a quien quieras…") + **timer** grande (ej. 07:00) + botón Stop.
4. **Reveal**: "El espía es {nombre}" + botón Reiniciar.
- En Splash es un solo celu; **en Postre cada uno ve su carta en su celu** (realtime) y el timer/reveal se sincroniza para toda la sala. Header "¿Quién es el espía?" + ✕.

- Se juega con una **sala**; cada integrante tiene **su propio celu**.
- Al iniciar la ronda, a cada jugador le llega **en tiempo real y en privado** su rol y palabra (ej. todos reciben "Pileta", el impostor recibe "Sos el impostor 🕵️" o una palabra parecida).
- Nadie ve el rol de otro. El host de la sala inicia/termina rondas y revela.
- Requiere que cada jugador esté logueado y "presente" en la sala desde su celu.
- Detalle de reglas: lo define el anfitrión.

## Backlog de ideas
- "¿Quién es más probable que…?" con votos en vivo.
- Yo nunca nunca.
- Ruleta de shots.
- Match aleatorio de parejas de baile.
