import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "postre_guest";

export function proxy(request: NextRequest) {
  // /admin tiene su propio acceso por PIN, independiente de la sesión de invitado
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isAdmin = !!process.env.ADMIN_PIN && request.cookies.get("postre_admin")?.value === process.env.ADMIN_PIN;
    const onLogin = request.nextUrl.pathname === "/admin/login";
    if (!isAdmin && !onLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
    if (isAdmin && onLogin) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);
  const onEntry = request.nextUrl.pathname === "/entrar";

  if (!hasSession && !onEntry) return NextResponse.redirect(new URL("/entrar", request.url));
  if (hasSession && onEntry) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
