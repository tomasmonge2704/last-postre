// Verdad o Reto: tipos y categorías. Las cartas viven en la base (game_cards) y se editan en /admin/juegos.
// Placeholders: {yo} jugador de turno, {otro} un varón, {otra} una mujer, {random} cualquiera.
// physical: involucra contacto con otra persona (no le sale a quien está de novio/a, salvo con su pareja).
// forGuest: carta dedicada, sale con prioridad cuando le toca a ese invitado.

export type Category = "clasico" | "fiesta" | "atrevido" | "hardcore";
export type CardType = "verdad" | "reto";

export type Card = {
  id: string;
  type: CardType;
  category: Category;
  text: string;
  physical?: boolean;
  forGuest?: string;
};

export const categories: { id: Category; emoji: string; title: string; description: string }[] = [
  { id: "clasico", emoji: "🍮", title: "Clásico", description: "Para arrancar tranqui, apto todo público." },
  { id: "fiesta", emoji: "🎉", title: "Fiesta", description: "Ya con un par de vasos encima." },
  { id: "atrevido", emoji: "💋", title: "Atrevido", description: "Se pone picante. Ojo con lo que contestás." },
  { id: "hardcore", emoji: "🌶️", title: "Hardcore", description: "Sin filtro. Solo para valientes." },
];
