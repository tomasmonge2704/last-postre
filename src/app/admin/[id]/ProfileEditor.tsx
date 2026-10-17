"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { AdminGuest, IgCandidate } from "@/lib/admin";
import { Avatar } from "@/components/Avatar";
import { IgSearch } from "@/components/IgSearch";
import { deleteGuest, discardCandidates, pickCandidate, pickInstagram, saveProfile, searchInstagram } from "../actions";

type Other = { id: string; nickname: string; avatarUrl: string | null; gender: "m" | "f" };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-crema/10 px-4 py-3 last:border-none">
      <p className="mb-2 text-xs font-bold tracking-wide text-crema/50 uppercase">{label}</p>
      {children}
    </div>
  );
}

function ChipsInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
  prefix = "",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  prefix?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const value = v.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft("");
  };
  const rest = suggestions.filter((s) => !values.includes(s));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="rounded-full bg-flan px-3 py-1 text-sm font-semibold text-cafe"
          >
            {prefix}
            {v} ✕
          </button>
        ))}
        {rest.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="rounded-full border border-crema/20 px-3 py-1 text-sm text-crema/60"
          >
            + {s}
          </button>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => add(draft)}
        placeholder={placeholder}
        className="rounded-2xl bg-crema/10 px-4 py-2.5 outline-none placeholder:text-crema/30"
      />
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-crema/10 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full py-2 font-semibold ${value === o.value ? "bg-flan text-cafe" : "text-crema/70"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileEditor({
  guest,
  candidates,
  others,
  groups,
}: {
  guest: AdminGuest;
  candidates: IgCandidate[];
  others: Other[];
  groups: { group: string; count: number }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    nicknames: guest.nicknames,
    name: guest.name ?? "",
    instagram: guest.instagram ?? "",
    gender: guest.gender,
    relationshipStatus: guest.relationshipStatus,
    partnerId: guest.partnerId,
    friendGroups: guest.friendGroups,
    tags: guest.tags,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus(null);
  };
  const partner = others.find((o) => o.id === form.partnerId);

  function run(action: () => Promise<void>, ok: string) {
    startTransition(async () => {
      try {
        await action();
        setStatus(ok);
        router.refresh();
      } catch (error) {
        setStatus(`⚠️ ${error instanceof Error ? error.message : "Algo falló"}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin" className="grid size-11 place-items-center rounded-full bg-crema/60 text-xl font-bold">
        ‹
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar guest={{ id: guest.id, nickname: guest.nicknames[0] ?? guest.id, avatarUrl: guest.avatarUrl }} size={120} />
        <h1 className="wordmark mt-2 text-5xl text-flan">{guest.nicknames[0]}</h1>
        <p className="font-semibold text-cafe/70">
          {guest.instagram ? `@${guest.instagram}` : "sin Instagram"}
          {guest.instagramName && ` · ${guest.instagramName}`}
        </p>
        {guest.sheetLabel && <p className="text-xs text-cafe/50">Planilla: {guest.sheetLabel}</p>}
      </div>

      {candidates.length > 0 && (
        <section className="rounded-3xl bg-chocolate p-4 text-crema">
          <p className="font-bold">🤔 ¿Cuál es su Instagram?</p>
          <p className="mb-3 text-sm text-crema/60">Tocá el correcto: se guarda el @, el nombre y la foto.</p>
          <div className="grid grid-cols-3 gap-3">
            {candidates.map((c) => (
              <button
                key={c.username}
                disabled={pending}
                onClick={() => run(() => pickCandidate(guest.id, c.username), `✅ @${c.username} guardado`)}
                className="flex flex-col items-center gap-1 rounded-2xl bg-crema/5 p-2 active:bg-crema/15 disabled:opacity-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/admin/ig-pic?guest=${encodeURIComponent(guest.id)}&u=${encodeURIComponent(c.username)}`} alt="" className="size-16 rounded-full border-2 border-flan object-cover" />
                <span className="w-full truncate text-xs font-semibold">@{c.username}</span>
                <span className="w-full truncate text-[11px] text-crema/50">{c.fullName ?? "—"}</span>
              </button>
            ))}
          </div>
          <button
            disabled={pending}
            onClick={() => run(() => discardCandidates(guest.id), "Candidatos descartados")}
            className="mt-3 w-full py-2 text-sm text-crema/60 underline"
          >
            Ninguno es
          </button>
        </section>
      )}

      <IgSearch
        initial={guest.nicknames[0] ?? guest.name ?? ""}
        search={searchInstagram}
        pending={pending}
        onPick={(r) => run(() => pickInstagram(guest.id, r), `✅ @${r.username} guardado`)}
      />

      <section className="overflow-hidden rounded-3xl bg-chocolate text-crema">
        <Row label="Apodos (el primero es el principal)">
          <ChipsInput values={form.nicknames} onChange={(v) => set("nicknames", v)} placeholder="Agregar apodo y Enter" />
        </Row>
        <Row label="Nombre real">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full rounded-2xl bg-crema/10 px-4 py-2.5 outline-none placeholder:text-crema/30"
          />
        </Row>
        <Row label="Instagram">
          <input
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            placeholder="@usuario"
            autoCapitalize="off"
            className="w-full rounded-2xl bg-crema/10 px-4 py-2.5 outline-none placeholder:text-crema/30"
          />
        </Row>
        <Row label="Género">
          <Segmented
            value={form.gender}
            onChange={(v) => set("gender", v)}
            options={[
              { value: "m", label: "👨 Hombre" },
              { value: "f", label: "👩 Mujer" },
            ]}
          />
        </Row>
        <Row label="Situación">
          <Segmented
            value={form.relationshipStatus}
            onChange={(v) => set("relationshipStatus", v)}
            options={[
              { value: "single", label: "🦋 Soltero/a" },
              { value: "taken", label: "💍 De novio/a" },
            ]}
          />
          {form.relationshipStatus === "taken" && (
            <div className="mt-3 flex items-center gap-3">
              {partner && <Avatar guest={partner} size={36} />}
              <select
                value={form.partnerId ?? ""}
                onChange={(e) => set("partnerId", e.target.value || null)}
                className="w-full rounded-2xl bg-crema/10 px-4 py-2.5 outline-none"
              >
                <option value="">Pareja no viene a la previa</option>
                {[...others]
                  .sort((a, b) => a.nickname.localeCompare(b.nickname))
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.gender === "f" ? "👩" : "👨"} {o.nickname}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </Row>
        <Row label="Grupos de amigos">
          <ChipsInput
            values={form.friendGroups}
            onChange={(v) => set("friendGroups", v)}
            placeholder="Nuevo grupo (ej: colegio, rugby)"
            suggestions={groups.map((g) => g.group)}
            prefix="👥 "
          />
        </Row>
        <Row label="Etiquetas">
          <ChipsInput values={form.tags} onChange={(v) => set("tags", v)} placeholder="Ej: tímido, bailarín, cumpleañero" prefix="🏷️ " />
        </Row>
      </section>

      <button
        disabled={pending}
        onClick={() => {
          if (confirm(`¿Eliminar a ${guest.nicknames[0] ?? guest.id}? Se borra de salas y partidas.`)) {
            startTransition(() => deleteGuest(guest.id));
          }
        }}
        className="py-2 font-semibold text-frutilla underline disabled:opacity-50"
      >
        🗑️ Se bajó — eliminar invitado
      </button>

      <div className="fixed inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-flan via-flan/90 to-transparent px-4 pt-6 pb-6">
        {status && <p className="rounded-full bg-chocolate px-4 py-1.5 text-sm font-semibold text-crema">{status}</p>}
        <button
          disabled={pending}
          onClick={() => run(() => saveProfile(guest.id, form), "✅ Guardado")}
          className="rounded-full bg-chocolate px-10 py-4 text-lg font-bold text-crema shadow-lg active:translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

