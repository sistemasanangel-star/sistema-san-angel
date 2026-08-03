import { getCurrentUser } from "@/lib/auth";
import InformesClient from "./InformesClient";

export default async function InformesPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">Informes</h1>
      <p className="text-gray-500 text-sm mb-6">
        Genera y descarga reportes de visitas en Excel.
      </p>
      <InformesClient isAdmin={user?.role === "ADMIN"} />
    </div>
  );
}
