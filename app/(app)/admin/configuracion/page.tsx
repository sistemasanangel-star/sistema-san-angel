import { requireAdminPage } from "@/lib/auth";
import ConfiguracionClient from "./ConfiguracionClient";

export default async function ConfiguracionPage() {
  await requireAdminPage();
  return (
    <div className="max-w-md">
      <p className="text-gray-500 text-sm mb-6">
        Ajustes generales del sistema.
      </p>
      <ConfiguracionClient />
    </div>
  );
}
