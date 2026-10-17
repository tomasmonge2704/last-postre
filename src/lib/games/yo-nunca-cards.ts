// Yo nunca: tipos y categorías. Las cartas viven en la base (game_cards) y se editan en /admin/juegos.
export type YoNuncaCategory = "clasico" | "fiesta" | "picante";

export const yoNuncaCategories: { id: YoNuncaCategory; emoji: string; title: string; description: string }[] = [
  { id: "clasico", emoji: "🍮", title: "Clásico", description: "Para romper el hielo." },
  { id: "fiesta", emoji: "🎉", title: "Fiesta", description: "Historias de previas y boliches." },
  { id: "picante", emoji: "🌶️", title: "Picante", description: "Acá se sabe todo." },
];

export type YoNuncaCard = { id: string; category: YoNuncaCategory; text: string };
