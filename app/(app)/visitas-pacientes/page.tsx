import { getCurrentUser } from "@/lib/auth";
import VisitasPacientesClient from "./VisitasPacientesClient";

export default async function VisitasPacientesPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">
        Visitas a pacientes
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Registra una visita interactiva y consulta el historial.
      </p>
      <VisitasPacientesClient role={user?.role ?? "VISITADORA"} />
    </div>
  );
}
