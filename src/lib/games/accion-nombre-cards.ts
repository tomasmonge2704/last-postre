// Acciones de "Acción y nombre". Las escribe el anfitrión: las de abajo son solo de prueba.
// {nombre} se reemplaza por la persona que salió en la ruleta.
// physical: contacto físico (no sale si alguno está de novio/a y no son pareja).

export type AccionCategory = "suave" | "fiesta" | "picante";

export const accionCategories: { id: AccionCategory; emoji: string; title: string; description: string }[] = [
  { id: "suave", emoji: "🍮", title: "Suave", description: "Para arrancar sin miedo." },
  { id: "fiesta", emoji: "🎉", title: "Fiesta", description: "Más cerca, más divertido." },
  { id: "picante", emoji: "🌶️", title: "Picante", description: "Besos y algo más." },
];

export type Accion = { id: string; category: AccionCategory; emoji: string; text: string; physical?: boolean };

export const acciones: Accion[] = [
  { id: "a-prueba-1", category: "suave", emoji: "💃", text: "(prueba) Bailá una canción con {nombre}" },
  { id: "a-prueba-2", category: "suave", emoji: "🗣️", text: "(prueba) Decile un piropo a {nombre}" },
  { id: "a-prueba-3", category: "suave", emoji: "🥂", text: "(prueba) Brindá y tomá un shot con {nombre}" },
  { id: "a-prueba-4", category: "suave", emoji: "🤳", text: "(prueba) Sacate una selfie con {nombre}" },
  { id: "a-prueba-5", category: "fiesta", emoji: "💆", text: "(prueba) Hacele masajes a {nombre}", physical: true },
  { id: "a-prueba-6", category: "fiesta", emoji: "🤗", text: "(prueba) Abrazá a {nombre} 10 segundos", physical: true },
  { id: "a-prueba-7", category: "fiesta", emoji: "🎤", text: "(prueba) Cantale una canción a {nombre}" },
  { id: "a-prueba-8", category: "picante", emoji: "💋", text: "(prueba) Dale un beso en el cuello a {nombre}", physical: true },
  { id: "a-prueba-9", category: "picante", emoji: "😘", text: "(prueba) Dale un beso en la boca a {nombre}", physical: true },
  { id: "a-prueba-10", category: "picante", emoji: "🔥", text: "(prueba) Sentate en las piernas de {nombre}", physical: true },
];
