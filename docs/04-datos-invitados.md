# Datos de invitados

~100 personas, ~50/50. El listado lo provee el anfitrión. Vive del lado del servidor (archivo seed o DB).

## Formato propuesto (por invitado)
```ts
type Guest = {
  id: string;            // slug estable, ej "tincho-perez"
  name: string;          // "Martín Pérez"
  nicknames: string[];   // ["Tincho", "Tin"]
  instagram: string;     // "tinchoperez" (sin @)
  phone?: string;        // opcional, NO se muestra en la UI
  gender: "m" | "f";
  tags: string[];        // etiquetas libres que define el anfitrión
  relationship?: {       // si está de novio/a
    status: "single" | "taken";
    partnerId?: string;  // si la pareja también es invitada
  };
  friendGroups: string[]; // grupos a los que pertenece, ej ["facu", "colegio", "rugby"]
  knows?: string[];       // otros grupos que conoce
  avatarUrl?: string;    // opcional (foto de IG o caricatura)
  lookingFor?: "m" | "f" | "any"; // opcional, para acciones en pareja
  funFacts?: string[];   // chistes internos / datos de color para personalizar
};
```

## Fuente actual
- Planilla "Postre Fest - Invitados" (Google Sheets) → [`data/guests.json`](../data/guests.json). 47 mujeres + 51 hombres = 98.
- **El apodo de la planilla es el campo principal** (`nicknames[0]`). Nombre real e @instagram se completan después (`null` por ahora).
- Entradas tipo `Solga (1..4)` = grupo de amigas: la (1) es la referente (`Solga`), las demás son `placeholder: true` ("Amiga 2 de Solga") hasta tener sus nombres. Todas con `friendGroups: ["solga"]`.
- `sheetLabel` guarda el texto original de la planilla para trazabilidad.
- Se sube a Neon con `npm run db:seed` cuando esté completo.

## Perfiles
- **Los arma el anfitrión**, no los usuarios. Los usuarios no editan su perfil.
- Las etiquetas impactan en los juegos: novios → prendas menos picantes con terceros; género; grupos de amigos/conocidos para personalizar.
- Persistencia: tabla en **Neon** (seed inicial desde un archivo).

## Privacidad mínima
- Teléfonos nunca se exponen al cliente.
- La búsqueda devuelve solo id, nombre, apodo principal, @ y avatar.
