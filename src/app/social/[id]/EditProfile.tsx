"use client";

import { useRef, useState, useTransition } from "react";
import type { PublicGuest } from "@/lib/guests";
import { updateMyProfile } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";

const input = "w-full rounded-2xl bg-crema px-4 py-3 text-cafe outline-none placeholder:text-cafe/40";

// Achica la foto en el navegador (lado mayor 640px, JPEG) para no subir 5 MB desde el celu.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

export function EditProfileButton({ me }: { me: PublicGuest }) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(me.nickname);
  const [name, setName] = useState(me.name ?? "");
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const data = new FormData();
      data.set("nickname", nickname);
      data.set("name", name);
      if (photo) data.set("photo", photo.blob, "avatar.jpg");
      try {
        await updateMyProfile(data);
        setOpen(false);
        setPhoto(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo falló");
      }
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Editar perfil" className="grid size-10 place-items-center rounded-full bg-crema/10 text-lg">
        ✏️
      </button>
      {open && (
        <BottomSheet title="Tu perfil" onClose={() => setOpen(false)}>
          <div className="flex flex-col items-center gap-3 text-cafe">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt="" className="size-28 rounded-full border-2 border-cafe object-cover" />
              ) : (
                <Avatar guest={me} size={112} />
              )}
              <span className="absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border-2 border-cafe bg-flan">📷</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const blob = await shrink(file);
                setPhoto({ blob, url: URL.createObjectURL(blob) });
              }}
            />
            <label className="w-full text-sm font-bold">
              ¿Cómo te dicen?
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={30} className={`${input} mt-1`} />
            </label>
            <label className="w-full text-sm font-bold">
              Nombre y apellido
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Opcional" className={`${input} mt-1`} />
            </label>
            {error && <p className="font-semibold text-frutilla">{error}</p>}
            <button
              onClick={save}
              disabled={pending || !nickname.trim()}
              className="mt-2 w-full rounded-full bg-chocolate py-4 text-lg font-bold text-crema shadow-[0_4px_0_var(--color-cafe)] disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
