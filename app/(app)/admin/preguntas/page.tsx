import { requireAdminPage } from "@/lib/auth";
import PreguntasClient from "./PreguntasClient";

export default async function PreguntasPage() {
  await requireAdminPage();
  return (
    <div className="max-w-3xl">
      <p className="text-gray-500 text-sm mb-6">
        Estas preguntas se muestran a las visitadoras al registrar una visita a
        paciente. Desactivar una pregunta conserva su historial.
      </p>
      <PreguntasClient />
    </div>
  );
}
