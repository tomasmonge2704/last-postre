# Acceso y sesión

## Flujo
1. Abrís la web → lo **primero** es un buscador estilo Instagram (input + lista de resultados con avatar, nombre y @).
2. Escribís tu **nombre, @instagram o apodo** (cualquiera matchea).
3. Aparecen candidatos → tocás el tuyo → confirmación graciosa ("¿Seguro que sos vos, @x? 👀") → entrás.
4. La sesión **persiste en ese navegador**: si cerrás y volvés, entrás directo.
5. Opción "No soy yo / cambiar usuario" accesible pero discreta.

## Búsqueda
- Implementado con el componente compartido `GuestPicker` (modo `single`). Ver [07](07-salas-y-selector.md).
- Fuente: listado fijo de invitados del lado del servidor ([04-datos-invitados.md](04-datos-invitados.md)).
- Matching **tolerante**: case-insensitive, sin tildes, sin `@`, por prefijo y substring en nombre, apellido, apodos e IG. Fuzzy leve para typos.
- Resultados desde el primer carácter (o desde 2), máximo ~8.
- Solo se pueden elegir invitados de la lista (no hay registro libre).

## Sesión — decisión
**Auth custom mínima, sin Better Auth.**
- Better Auth resuelve passwords/OAuth/emails/verificación: nada de eso aplica. Agregaría tablas, config y tiempo para nada.
- Implementación: al seleccionar el invitado, el server setea una **cookie httpOnly** (`guest_id` firmado, o un token aleatorio mapeado al invitado), expiración ~24 h.
- Sin passwords. Se acepta explícitamente que alguien pueda entrar como otro.
- Si un día hace falta algo más (ej. un "admin" para el anfitrión), se agrega un PIN simple por env var.

## Admin (opcional, nice-to-have)
- Vista para el anfitrión con PIN: ver quién entró, forzar rondas, cargar retos nuevos en vivo.
