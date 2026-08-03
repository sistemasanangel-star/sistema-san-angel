import { requireAdminPage } from "@/lib/auth";
import OpinionesClient from "./OpinionesClient";

export default async function OpinionesPage() {
  await requireAdminPage();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">Opiniones QR</h1>
      <p className="text-gray-500 text-sm mb-6">
        Opiniones enviadas por pacientes al escanear el QR en cada sanatorio.
      </p>
      <OpinionesClient />
    </div>
  );
}
