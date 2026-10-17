import { EntryForm } from "./EntryForm";

export default function EntrarPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-crema via-vainilla to-flan px-4 pt-16 pb-10 text-cafe">
      <h1 className="wordmark animate-pop-in text-center text-7xl text-flan">
        Postre
        <span className="block text-4xl text-crema">la previa</span>
      </h1>
      <p className="mt-8 mb-6 text-center font-semibold text-cafe/80">
        Buscate y entrá. Sin contraseñas, todo bien. 🍮
      </p>
      <EntryForm />
    </main>
  );
}
