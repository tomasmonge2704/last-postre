import { ImageResponse } from "next/og";

// Ícono de la app instalada: un flan sobre chocolate.
export function appIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#2b1a10", fontSize: size * 0.62 }}>
        🍮
      </div>
    ),
    { width: size, height: size },
  );
}
