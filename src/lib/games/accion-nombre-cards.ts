// Acción y nombre: tipos y categorías. Las acciones viven en la base (game_cards) y se editan en /admin/juegos.
// {nombre} se reemplaza por la persona que salió en la ruleta.
// physical: contacto físico (no sale si alguno está de novio/a y no son pareja).

export type AccionCategory = "suave" | "fiesta" | "picante";

export const accionCategories: { id: AccionCategory; emoji: string; title: string; description: string }[] = [
  { id: "suave", emoji: "🍮", title: "Suave", description: "Para arrancar sin miedo." },
  { id: "fiesta", emoji: "🎉", title: "Fiesta", description: "Más cerca, más divertido." },
  { id: "picante", emoji: "🌶️", title: "Picante", description: "Besos y algo más." },
];

export type Accion = { id: string; category: AccionCategory; emoji: string; text: string; physical?: boolean };
