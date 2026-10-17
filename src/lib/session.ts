import { cookies } from "next/headers";
import { getGuest } from "@/lib/guests";

export const SESSION_COOKIE = "postre_guest";

// Sin auth real a propósito: la cookie solo recuerda quién elegiste ser.
export async function getCurrentGuest() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return id ? getGuest(id) : null;
}
