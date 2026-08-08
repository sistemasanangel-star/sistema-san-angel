import { requireAdminPage } from "@/lib/auth";
import OpinionesClient from "./OpinionesClient";

export default async function OpinionesPage() {
  await requireAdminPage();
  return (
    <div className="max-w-4xl">
      <p className="text-gray-500 text-sm mb-6">
        Opiniones enviadas por pacientes al escanear el QR en cada sanatorio.
      </p>
      <OpinionesClient />
    </div>
  );
}
