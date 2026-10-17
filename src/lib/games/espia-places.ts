// Lugares del Espía. De prueba hasta que el anfitrión defina los suyos.
export type Place = { id: string; name: string; emoji: string; roles: string[] };

export const places: Place[] = [
  { id: "gasolinera", name: "Gasolinera", emoji: "⛽", roles: ["Playero", "Camionero", "Cajero", "Turista perdido", "Mecánico", "Motoquero"] },
  { id: "boliche", name: "Boliche", emoji: "🪩", roles: ["DJ", "Patovica", "Barman", "Cumpleañera", "El que no baila", "RRPP"] },
  { id: "playa", name: "Playa", emoji: "🏖️", roles: ["Guardavidas", "Vendedor de choclos", "Surfista", "Turista", "Nene con balde", "Abuela"] },
  { id: "hospital", name: "Hospital", emoji: "🏥", roles: ["Cirujano", "Enfermera", "Paciente", "Visita", "Recepcionista", "Practicante"] },
  { id: "avion", name: "Avión", emoji: "✈️", roles: ["Piloto", "Azafata", "Pasajero con miedo", "Bebé que llora", "Copiloto", "Mochilero"] },
  { id: "estadio", name: "Estadio", emoji: "🏟️", roles: ["Hincha", "Árbitro", "Vendedor de garrapiñada", "Jugador", "Periodista", "Policía"] },
  { id: "colegio", name: "Colegio", emoji: "🏫", roles: ["Directora", "Preceptor", "Alumno", "Profe de gimnasia", "Portero", "Abanderado"] },
  { id: "asado", name: "Asado", emoji: "🥩", roles: ["Asador", "El que trae el hielo", "Tía", "Vecino", "El que critica el punto", "Perro"] },
  { id: "casamiento", name: "Casamiento", emoji: "💒", roles: ["Novia", "Novio", "Cura", "Fotógrafo", "Tío borracho", "Wedding planner"] },
  { id: "banco", name: "Banco", emoji: "🏦", roles: ["Cajero", "Gerente", "Ladrón", "Jubilado", "Guardia", "Cliente apurado"] },
  { id: "supermercado", name: "Supermercado", emoji: "🛒", roles: ["Repositor", "Cajera", "Cliente", "Carnicero", "Seguridad", "Nene perdido"] },
  { id: "previa", name: "Previa", emoji: "🍮", roles: ["Anfitrión", "El del parlante", "La que llega tarde", "El que se duerme", "Vecino quejoso", "El del fernet"] },
];
