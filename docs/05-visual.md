# Dirección visual

## Identidad: **Postre** 🍮
- La app se llama **Postre**. Concepto: un **flan con dulce de leche**.
- **Estilo/estructura de Splash** (cartoon, wordmarks exagerados, ilustraciones 3D), pero con **paleta propia crema + dulce de leche + caramelo**. Splash es referencia de *layout y tono*, no de colores.
- Las fotos de perfil salen del **Instagram de cada invitado** (se bajan más adelante).

### Paleta Postre
| Token | Hex | Uso |
|---|---|---|
| `crema` | `#FFF4DC` | Fondo claro principal, texto sobre oscuro |
| `vainilla` | `#FBE3B0` | Superficies suaves, inputs |
| `flan` | `#F6C76B` | Amarillo flan, acentos, wordmarks |
| `caramelo` | `#E39A3B` | Primario, degradés |
| `dulce-de-leche` | `#B8692A` | Primario fuerte, contornos de títulos |
| `cafe` | `#5A3216` | Texto oscuro, sombras duras de wordmarks |
| `chocolate` | `#2B1A10` | Cards "oscuras" (reemplaza el `#1C1C1E` de Splash), CTA |
| `frutilla` | `#E8505B` | Acento picante/hot, check, espía |

- Fondos por juego = **degradés de la paleta** (crema → flan, flan → caramelo, caramelo → dulce de leche). Picante/espía puede ir a `frutilla` (como "salsa de frutilla" del postre).
- Wordmarks: relleno `crema`/`flan`, contorno `cafe`, sombra dura `dulce-de-leche`. Efecto "caramelo chorreado" opcional en el logo.
- Todo lo que abajo dice "card oscura" se lee como `chocolate`; "negro" del CTA → `chocolate`.

---
Referencia de estilo (Splash):

Referencia principal: app **Splash** (party games). Capturas en [`/inspo`](../inspo). Look: **iOS nativo limpio + títulos cartoon exagerados + ilustraciones 3D estilo Pixar**.

## Lenguaje general
- **Mobile-first, una columna**, márgenes ~16px, mucho aire. Pensado para iPhone.
- **Fondo = color del juego** a pantalla completa (sólido o degradé vertical). La card oscura flota encima.
- **Cards oscuras** `#1C1C1E`-ish, radio grande (~24px), listas estilo iOS Settings con separadores finos, chevron `>` a la derecha y valor gris.
- **Emojis como íconos** de fila (☝️ Jugadores, 😈 Mentirosos, 🐼 Categorías, 🌶️ Picante…).
- **CTA principal**: pastilla negra centrada abajo, "Comienza el juego", texto blanco semibold.
- Botones circulares translúcidos (glass) arriba: back `<`, ♥, `?`.
- Tipografía de UI: sistema (SF Pro / `system-ui`), blanco sobre color.

## Títulos de juego (lo más "cartoon")
- Wordmark por juego, **bold condensado itálico/extrabold, todo mayúsculas**, con **contorno grueso oscuro + sombra dura** desplazada, levemente inclinado. Dos líneas con colores distintos:
  - `¿QUIÉN MIENTE?` blanco / `IMPOSTOR` azul claro.
  - `VERDAD o` amarillo / `RETO` blanco.
  - `YO NUNCA` naranja/blanco sobre amarillo.
- Debajo, una línea de copy corta y con humor, centrada, blanco con opacidad.

## Color por juego en Splash (solo referencia — usar paleta Postre)
| Juego | Fondo |
|---|---|
| Verdad o Reto | Azul sólido `#3D8BF2` |
| Impostor / Espía | Degradé violeta `#7B7CF5` → azul `#3D8BF2` |
| Yo Nunca / Picantes | Degradé amarillo `#F7D046` → naranja → rojo `#EA4040` |
| Home / perfil | Negro/dark `#111` |

## Home
- Header: título de la app centrado, a la derecha pastilla con 🔍 + avatar del usuario.
- **Carruseles horizontales** por sección con título + `>` ("Mind Games", "Elegidos para vos hoy", "Jugados hace poco"). Personalizar los títulos con el nombre ("Para vos, Tincho").
- **Cards de juego** verticales (~3:4), radio grande, borde claro fino, **ilustración 3D de 2 personajes con caras exageradas** + wordmark del juego encima. Badge opcional tipo "TOP 10".
- Botón flotante abajo (pastilla con degradé violeta→rosa, ej. "Splash Party 🪐") → para nosotros: "Armar sala 🎉".

## Pantallas de juego (patrón común)
1. **Setup**: wordmark + card con filas (Jugadores N >, Categorías >, extras como Mentirosos) + copy + CTA "Comienza el juego".
2. **Jugadores**: card oscura con lista de nombres + handle de reordenar, badge contador (`7/20`), link "Recientes >" (= nuestras **salas**), input pastilla abajo color cian claro con `+` → acá va el **`GuestPicker`** en vez de texto libre.
3. **Categorías**: lista con emoji + título + descripción de 1–2 líneas, check rojo ✓ en las seleccionadas (multi-select). Esto **reemplaza el selector de intensidad**: las categorías son el nivel (Clásico → Fiesta → Atrevido → Hardcore).

## Perfil
- Avatar circular grande sobre fondo verde menta, lápiz de editar. Avatares **3D estilo Pixar/Memoji** (podemos generar uno por invitado o usar caricaturas).
- Fila "Tu nombre > valor". Card promo con borde degradé naranja→rosa→violeta y botón degradé.
- En nuestro caso el perfil muestra las etiquetas que armó el anfitrión (solo lectura) + "No soy yo".

## Tokens iniciales (Tailwind)
- Radios: card `rounded-3xl`, botones `rounded-full`.
- Surface `chocolate`, separador `crema/10`, texto secundario `crema/60`.
- Acento check: `frutilla`. Degradé "party": `flan → caramelo → dulce-de-leche`.
- Animaciones: entrada con rebote, cartas que se dan vuelta, confeti en "Cumplí".

## Qué NO copiar
- Nada de login/ID/monetización (Splash ID, recompensas, códigos de creador).
- Sin tutorial en video.
