import { getCurrentUser } from "@/lib/auth";
import VisitasPacientesClient from "./VisitasPacientesClient";

export default async function VisitasPacientesPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-4xl">
      <p className="text-gray-500 text-sm mb-6">
        Pacientes internados por habitación y registro de visitas del día. El
        historial completo está en Informes.
      </p>
      <VisitasPacientesClient role={user?.role ?? "VISITADORA"} />
    </div>
  );
}
