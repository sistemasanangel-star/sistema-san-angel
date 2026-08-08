import { getCurrentUser } from "@/lib/auth";
import MedicosClient from "./MedicosClient";

export default async function MedicosPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Directorio de médicos, sanatorios, clínicas y otros lugares visitados.
      </p>
      <MedicosClient role={user?.role ?? "VISITADORA"} />
    </div>
  );
}
