// Banco de cartas de Verdad o Reto. Lo escribe el anfitrión: las de abajo son solo de prueba.
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

export const cards: Card[] = [
  { id: "v-prueba-1", type: "verdad", category: "clasico", text: "(prueba) {yo}, ¿qué es lo más vergonzoso que te pasó en una previa?" },
  { id: "v-prueba-2", type: "verdad", category: "fiesta", text: "(prueba) ¿Qué pensaste la primera vez que viste a {random}?" },
  { id: "v-prueba-3", type: "verdad", category: "atrevido", text: "(prueba) ¿Con quién de esta ronda te darías un beso?" },
  { id: "r-prueba-1", type: "reto", category: "clasico", text: "(prueba) Imitá a {random} hasta que alguien adivine quién es." },
  { id: "r-prueba-2", type: "reto", category: "fiesta", text: "(prueba) Bailá 20 segundos con {random} sin música." },
  { id: "r-prueba-3", type: "reto", category: "atrevido", text: "(prueba) Dale un beso en el cachete a {otra}.", physical: true },
  { id: "r-prueba-4", type: "reto", category: "atrevido", text: "(prueba) Dale un beso en el cachete a {otro}.", physical: true },
  { id: "r-prueba-5", type: "reto", category: "hardcore", text: "(prueba) Sentate en las piernas de {random} hasta tu próximo turno.", physical: true },
];
