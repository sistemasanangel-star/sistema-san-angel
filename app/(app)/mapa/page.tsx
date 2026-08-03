import { requireAdminPage } from "@/lib/auth";
import MapaClient from "./MapaClient";

export default async function MapaPage() {
  await requireAdminPage();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-black mb-1">Mapa en vivo</h1>
      <p className="text-gray-500 text-sm mb-6">
        Visitadoras con jornada activa en los últimos minutos.
      </p>
      <MapaClient />
    </div>
  );
}
