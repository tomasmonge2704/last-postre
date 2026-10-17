# Salas y selector de personas

Los 100 no juegan a la vez: se juega en grupos chicos que se arman rápido.

## Componente `GuestPicker` (reutilizable)
El buscador de entrada ([02](02-acceso-y-sesion.md)) es **un único componente compartido** por login y por todos los juegos.
- Modo `single` (login: elegirte a vos) y modo `multi` (armar grupo: chips de seleccionados, tap para sumar/quitar).
- Mismo matching tolerante: nombre, apodos, @instagram, sin tildes/mayúsculas.
- Muestra avatar + apodo + @ y, en modo multi, etiquetas útiles (ej. grupo de amigos).
- El usuario logueado se incluye por defecto en el grupo.

## Flujo al entrar a un juego
Al tocar un juego (ej. Verdad o Reto) hay 2 opciones:
1. **"Así nomás, rápido"** → grupo ad-hoc: elegís gente con el `GuestPicker` (o jugás solo con vos + random) y arranca. No se guarda como sala (o se ofrece "guardar como sala" al final).
2. **"Armar una sala"** → elegís nombre de sala (o se autogenera uno gracioso) + integrantes con el `GuestPicker`. Se guarda.

## Sala
- **No es realtime ni sincronizada.** Es solo un **grupo de invitados con nombre**, persistido en Neon.
- Es **global del evento**: cualquier usuario la ve y la puede reusar en cualquier juego.
- Lista "Salas del evento" al entrar a un juego: las más recientes / en las que estoy primero.
- Se puede editar (sumar/quitar gente). Sin permisos: es entre amigos.
- El estado del juego (turnos, cartas ya salidas) vive en el celu que está jugando; opcionalmente se guarda en la sala para no repetir cartas entre partidas.

```ts
type Room = {
  id: string;
  name: string;          // "Los del fondo 🍻"
  guestIds: string[];
  createdBy: string;     // guest id
  createdAt: Date;
  usedCardIds?: string[]; // opcional: no repetir cartas en esa sala
};
```

## Modo de juego (decidido)
Depende del juego:
- **Pasar el celu** (Verdad o Reto, Acción y Nombre): sin realtime, la sala es solo la lista de nombres.
- **Multi-dispositivo realtime** (El Impostor / El Espía): cada integrante abre la sala en su celu y recibe su info privada en vivo. Usa **Neon Realtime**. La sala sigue siendo la misma entidad; el juego agrega una "partida" con estado.

```ts
type Match = {           // solo juegos realtime
  id: string;
  roomId: string;
  game: "impostor" | "espia";
  round: number;
  status: "lobby" | "playing" | "reveal";
  // roles/palabras por jugador: tabla aparte, cada cliente solo lee la suya
};
```
