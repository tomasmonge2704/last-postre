"use client";

import { useEffect, useState } from "react";
import { subscribePush } from "@/app/actions";
import type { PushSub } from "@/lib/push";

type State = "loading" | "unsupported" | "ios-install" | "off" | "on" | "denied";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

// Tarjeta para activar las notificaciones de match. En iPhone primero hay que instalar la app.
export function PushPrompt() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = matchMedia("(display-mode: standalone)").matches;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      queueMicrotask(() => setState(ios && !standalone ? "ios-install" : "unsupported"));
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (Notification.permission === "denied") setState("denied");
        else if (sub) {
          setState("on");
          subscribePush(sub.toJSON() as PushSub); // por si cambió de usuario en este dispositivo
        } else setState("off");
      })
      .catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await subscribePush(sub.toJSON() as PushSub);
      setState("on");
    } catch {
      setState(Notification.permission === "denied" ? "denied" : "unsupported");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "unsupported" || state === "on") return null;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-3xl bg-crema/10 p-3">
      <span className="text-3xl">🔔</span>
      <div className="min-w-0 flex-1 text-sm">
        {state === "ios-install" && (
          <>
            <p className="font-bold">¿Querés enterarte de tus matches?</p>
            <p className="text-crema/70">
              Tocá <b>Compartir</b> <span className="inline-block">⬆️</span> → <b>Agregar a inicio</b>, abrí Postre desde ahí y activá los avisos.
            </p>
          </>
        )}
        {state === "off" && (
          <>
            <p className="font-bold">Enterate de tus matches</p>
            <p className="text-crema/70">Te avisamos aunque tengas la app cerrada.</p>
          </>
        )}
        {state === "denied" && <p className="text-crema/70">Bloqueaste las notificaciones. Activalas desde los ajustes del navegador.</p>}
      </div>
      {state === "off" && (
        <button onClick={enable} disabled={busy} className="rounded-full bg-flan px-4 py-2 text-sm font-bold text-cafe disabled:opacity-50">
          {busy ? "…" : "Activar"}
        </button>
      )}
    </div>
  );
}
