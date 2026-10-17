import type { ReactNode } from "react";

export function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-chocolate/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up max-h-[88dvh] overflow-y-auto rounded-t-[2rem] bg-vainilla px-4 pt-3 pb-8"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cafe/30" />
        <div className="mb-4 flex items-center justify-between">
          <p className="wordmark text-3xl text-flan">{title}</p>
          <button onClick={onClose} className="font-bold text-cafe">Listo</button>
        </div>
        {children}
      </div>
    </div>
  );
}
