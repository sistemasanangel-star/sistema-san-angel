import { getCurrentUser } from "@/lib/auth";
import VisitasMedicosClient from "./VisitasMedicosClient";

export default async function VisitasMedicosPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-4xl">
      <p className="text-gray-500 text-sm mb-6">
        Registra la visita con firma del receptor y consulta el historial.
      </p>
      <VisitasMedicosClient role={user?.role ?? "VISITADORA"} />
    </div>
  );
}
