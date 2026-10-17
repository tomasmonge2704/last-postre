// Banco de "Yo nunca". Lo escribe el anfitrión: las de abajo son solo de prueba.
export type YoNuncaCategory = "clasico" | "fiesta" | "picante";

export const yoNuncaCategories: { id: YoNuncaCategory; emoji: string; title: string; description: string }[] = [
  { id: "clasico", emoji: "🍮", title: "Clásico", description: "Para romper el hielo." },
  { id: "fiesta", emoji: "🎉", title: "Fiesta", description: "Historias de previas y boliches." },
  { id: "picante", emoji: "🌶️", title: "Picante", description: "Acá se sabe todo." },
];

export const yoNuncaCards: { id: string; category: YoNuncaCategory; text: string }[] = [
  { id: "yn-prueba-1", category: "clasico", text: "(prueba) me hice el enfermo para faltar al colegio" },
  { id: "yn-prueba-2", category: "clasico", text: "(prueba) stalkeé a un ex en Instagram" },
  { id: "yn-prueba-3", category: "fiesta", text: "(prueba) me quedé dormido en una previa" },
  { id: "yn-prueba-4", category: "fiesta", text: "(prueba) me colé en una fiesta sin invitación" },
  { id: "yn-prueba-5", category: "picante", text: "(prueba) mandé un mensaje del que me arrepentí al otro día" },
  { id: "yn-prueba-6", category: "picante", text: "(prueba) me chapé a alguien de esta previa" },
];
