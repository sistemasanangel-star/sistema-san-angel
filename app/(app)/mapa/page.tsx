import { requireAdminPage } from "@/lib/auth";
import MapaClient from "./MapaClient";

export default async function MapaPage() {
  await requireAdminPage();
  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Visitadoras con jornada activa en los últimos minutos.
      </p>
      <MapaClient />
    </div>
  );
}
