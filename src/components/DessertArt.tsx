// Ilustraciones de los juegos: cada uno es un postre con personalidad.
// Estilo cartoon de la app: contorno café grueso, colores de la paleta, sombras planas.

const O = "#5a3216"; // contorno (cafe)
const line = { stroke: O, strokeWidth: 4, strokeLinejoin: "round", strokeLinecap: "round" } as const;

type ArtProps = { className?: string };

function Face({ x = 60, y = 70, mood = "smirk" }: { x?: number; y?: number; mood?: "smirk" | "happy" | "open" }) {
  return (
    <g>
      <ellipse cx={x - 10} cy={y + 6} rx="5" ry="3" fill="#e8505b" opacity="0.5" />
      <ellipse cx={x + 10} cy={y + 6} rx="5" ry="3" fill="#e8505b" opacity="0.5" />
      {mood === "smirk" && <path d={`M${x - 7} ${y + 6} Q${x} ${y + 12} ${x + 8} ${y + 3}`} fill="none" {...line} strokeWidth={3.5} />}
      {mood === "happy" && <path d={`M${x - 7} ${y + 5} Q${x} ${y + 13} ${x + 7} ${y + 5} Z`} fill="#2b1a10" {...line} strokeWidth={3} />}
      {mood === "open" && <ellipse cx={x} cy={y + 8} rx="4" ry="5" fill="#2b1a10" {...line} strokeWidth={3} />}
    </g>
  );
}

// Verdad o reto: un flan diablito con cuernos y tridente.
export function DevilFlan({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="60" cy="104" rx="46" ry="8" fill="#2b1a10" opacity="0.25" />
      {/* tridente */}
      <path d="M100 30 V100" {...line} strokeWidth={5} />
      <path d="M92 24 V34 Q100 42 108 34 V24 M100 18 V34" fill="none" {...line} />
      {/* plato */}
      <ellipse cx="56" cy="98" rx="44" ry="9" fill="#fff4dc" {...line} />
      {/* cuernos */}
      <path d="M34 40 Q26 22 36 14 Q38 28 46 36 Z" fill="#e8505b" {...line} />
      <path d="M78 40 Q86 22 76 14 Q74 28 66 36 Z" fill="#e8505b" {...line} />
      {/* flan */}
      <path d="M28 94 L36 44 Q56 34 76 44 L84 94 Q56 102 28 94 Z" fill="#f6c76b" {...line} />
      {/* caramelo */}
      <path d="M36 44 Q56 34 76 44 L78 54 Q74 60 70 54 Q66 62 60 54 Q54 64 50 54 Q44 62 40 54 Q36 60 34 54 Z" fill="#b8692a" {...line} />
      {/* ojos pícaros */}
      <path d="M42 68 Q47 64 52 68" fill="none" {...line} strokeWidth={3.5} />
      <path d="M60 68 Q65 64 70 68" fill="none" {...line} strokeWidth={3.5} />
      <path d="M40 62 L52 64 M72 62 L60 64" {...line} strokeWidth={3} />
      <Face x={56} y={72} mood="smirk" />
    </svg>
  );
}

// ¿Quién es el espía?: un cupcake detective con sombrero, anteojos y lupa.
export function SpyCupcake({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="60" cy="108" rx="40" ry="7" fill="#2b1a10" opacity="0.25" />
      {/* pirotin */}
      <path d="M30 70 L38 106 H82 L90 70 Z" fill="#e8505b" {...line} />
      <path d="M44 72 L48 104 M60 72 V104 M76 72 L72 104" {...line} strokeWidth={3} />
      {/* crema */}
      <path d="M26 72 Q20 58 34 54 Q32 40 48 42 Q54 30 68 38 Q84 34 86 50 Q100 56 92 72 Z" fill="#fff4dc" {...line} />
      {/* sombrero */}
      <path d="M22 40 Q60 28 98 40 Q60 48 22 40 Z" fill="#2b1a10" {...line} />
      <path d="M38 38 Q38 14 60 14 Q82 14 82 38" fill="#5a3216" {...line} />
      <path d="M39 32 Q60 26 81 32" fill="none" stroke="#e39a3b" strokeWidth="5" />
      {/* anteojos */}
      <rect x="34" y="52" width="20" height="12" rx="5" fill="#2b1a10" {...line} strokeWidth={3} />
      <rect x="62" y="52" width="20" height="12" rx="5" fill="#2b1a10" {...line} strokeWidth={3} />
      <path d="M54 57 H62" {...line} strokeWidth={3} />
      <path d="M38 55 L44 55" stroke="#fff4dc" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 55 L72 55" stroke="#fff4dc" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 68 Q58 72 66 66" fill="none" {...line} strokeWidth={3.5} />
      {/* lupa */}
      <path d="M94 96 L108 112" {...line} strokeWidth={6} />
      <circle cx="88" cy="88" r="12" fill="#fbe3b0" fillOpacity="0.7" {...line} />
      <path d="M82 84 Q84 80 88 80" fill="none" stroke="#fff4dc" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Acción y nombre: una frutilla bañada en chocolate, guiñando, entre llamas y un beso.
export function SpicyStrawberry({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="58" cy="110" rx="30" ry="6" fill="#2b1a10" opacity="0.25" />
      {/* llamas */}
      <path d="M14 100 Q4 82 16 68 Q16 80 24 82 Q20 70 30 58 Q32 74 38 84 Q42 96 32 104 Q20 108 14 100 Z" fill="#e39a3b" {...line} strokeWidth={3.5} />
      <path d="M22 100 Q18 90 24 84 Q26 92 30 92 Q34 98 28 102 Z" fill="#f6c76b" />
      <path d="M96 104 Q88 96 94 84 Q96 92 100 92 Q98 82 106 74 Q110 88 112 94 Q114 104 104 108 Q98 108 96 104 Z" fill="#e39a3b" {...line} strokeWidth={3.5} />
      {/* frutilla */}
      <path d="M58 108 Q30 96 28 64 Q28 40 58 38 Q88 40 88 64 Q86 96 58 108 Z" fill="#e8505b" {...line} />
      {/* baño de chocolate */}
      <path d="M30 56 Q34 40 58 38 Q82 40 86 56 Q84 66 78 60 Q76 72 70 62 Q64 70 58 62 Q52 72 46 62 Q40 70 36 60 Q32 66 30 56 Z" fill="#5a3216" {...line} />
      <path d="M40 48 Q48 42 58 43" fill="none" stroke="#b8692a" strokeWidth="3" strokeLinecap="round" />
      {/* semillitas */}
      <path d="M40 80 l2 3 M74 80 l-2 3 M50 94 l2 3 M66 94 l-2 3 M58 84 l0 3" stroke="#fbe3b0" strokeWidth="3" strokeLinecap="round" />
      {/* hojitas */}
      <path d="M58 40 Q46 26 36 32 Q46 34 50 40 Q44 24 58 18 Q72 24 66 40 Q70 34 80 32 Q70 26 58 40 Z" fill="#7cc36b" {...line} strokeWidth={3.5} />
      {/* guiño + ceja pícara */}
      <path d="M42 70 Q47 66 52 70" fill="none" {...line} strokeWidth={3.5} />
      <ellipse cx="68" cy="69" rx="4" ry="5" fill="#2b1a10" />
      <circle cx="69.5" cy="67" r="1.5" fill="#fff4dc" />
      <path d="M62 60 L74 62" {...line} strokeWidth={3} />
      {/* boca mordiéndose el labio */}
      <path d="M48 82 Q58 90 68 80" fill="#2b1a10" {...line} strokeWidth={3} />
      <path d="M53 84 L56 81 L59 85" fill="#fff4dc" stroke="none" />
      <ellipse cx="42" cy="78" rx="5" ry="3" fill="#fff4dc" opacity="0.35" />
      {/* beso */}
      <g transform="translate(96 30) rotate(18)">
        <path d="M-12 0 Q-6 -8 0 -3 Q6 -8 12 0 Q6 4 0 2 Q-6 4 -12 0 Z" fill="#e8505b" {...line} strokeWidth={2.5} />
        <path d="M-12 1 Q0 14 12 1 Q6 6 0 4 Q-6 6 -12 1 Z" fill="#e8505b" {...line} strokeWidth={2.5} />
      </g>
      {/* chispa */}
      <path d="M22 26 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#f6c76b" {...line} strokeWidth={2} />
    </svg>
  );
}

// Yo nunca: un helado tapándose los ojos, muerto de vergüenza.
export function ShyIceCream({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="60" cy="112" rx="22" ry="5" fill="#2b1a10" opacity="0.25" />
      {/* cucurucho */}
      <path d="M34 64 L60 112 L86 64 Z" fill="#e39a3b" {...line} />
      <path d="M44 66 L66 104 M58 66 L74 90 M72 66 L80 78 M76 66 L54 104 M62 66 L46 90 M48 66 L40 78" stroke="#b8692a" strokeWidth="3" />
      {/* bocha frutilla */}
      <path d="M28 66 Q20 50 32 40 Q34 18 60 18 Q86 18 88 40 Q100 50 92 66 Q86 72 80 66 Q72 74 66 66 Q60 74 54 66 Q46 74 40 66 Q34 72 28 66 Z" fill="#f2a1b8" {...line} />
      {/* cereza */}
      <path d="M62 18 Q64 8 72 4" fill="none" {...line} strokeWidth={3} />
      <circle cx="60" cy="16" r="7" fill="#e8505b" {...line} strokeWidth={3} />
      {/* chispas */}
      <path d="M40 34 l4 -2 M78 30 l3 3 M84 50 l-4 2" stroke="#fff4dc" strokeWidth="3" strokeLinecap="round" />
      {/* boca */}
      <ellipse cx="60" cy="58" rx="5" ry="4" fill="#2b1a10" {...line} strokeWidth={3} />
      <ellipse cx="44" cy="54" rx="6" ry="3" fill="#e8505b" opacity="0.6" />
      <ellipse cx="76" cy="54" rx="6" ry="3" fill="#e8505b" opacity="0.6" />
      {/* manitos tapando los ojos */}
      <path d="M30 46 Q30 34 42 36 L54 38 Q58 44 54 48 L36 50 Q30 50 30 46 Z" fill="#fff4dc" {...line} strokeWidth={3.5} />
      <path d="M90 46 Q90 34 78 36 L66 38 Q62 44 66 48 L84 50 Q90 50 90 46 Z" fill="#fff4dc" {...line} strokeWidth={3.5} />
      <path d="M42 38 V48 M48 38 V48 M78 38 V48 M72 38 V48" stroke={O} strokeWidth="2" />
      {/* gota de vergüenza */}
      <path d="M96 28 Q100 36 96 40 Q92 36 96 28 Z" fill="#6ec6ff" {...line} strokeWidth={2.5} />
    </svg>
  );
}

// Matcheá: dos macarons enamorados.
export function LoveMacarons({ className }: ArtProps) {
  const macaron = (fill: string, cream: string) => (
    <>
      <path d="M-24 4 Q-24 -16 0 -16 Q24 -16 24 4 Z" fill={fill} {...line} />
      <rect x="-24" y="2" width="48" height="8" rx="3" fill={cream} {...line} strokeWidth={3} />
      <path d="M-24 10 Q-24 26 0 26 Q24 26 24 10 Z" fill={fill} {...line} />
      <path d="M-10 -4 Q-6 -8 -2 -4 Q-6 2 -10 -4 Z M2 -4 Q6 -8 10 -4 Q6 2 2 -4 Z" fill="#e8505b" />
      <path d="M-6 16 Q0 21 6 16" fill="none" {...line} strokeWidth={3} />
    </>
  );
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="60" cy="104" rx="46" ry="7" fill="#2b1a10" opacity="0.25" />
      <g transform="translate(36 72) rotate(-14)">{macaron("#f2a1b8", "#fff4dc")}</g>
      <g transform="translate(84 72) rotate(14)">{macaron("#f6c76b", "#fff4dc")}</g>
      <path d="M60 40 C60 32 48 28 46 38 C44 46 60 54 60 54 C60 54 76 46 74 38 C72 28 60 32 60 40 Z" fill="#e8505b" {...line} strokeWidth={3.5} />
      <path d="M30 26 C30 22 24 20 23 25 C22 29 30 33 30 33 C30 33 38 29 37 25 C36 20 30 22 30 26 Z" fill="#e8505b" {...line} strokeWidth={2.5} />
      <path d="M92 22 C92 19 87 17 86 21 C85 24 92 27 92 27 C92 27 99 24 98 21 C97 17 92 19 92 22 Z" fill="#e8505b" {...line} strokeWidth={2.5} />
    </svg>
  );
}
