import { requireAdminPage } from "@/lib/auth";
import ConfiguracionClient from "./ConfiguracionClient";

export default async function ConfiguracionPage() {
  await requireAdminPage();
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">Configuración</h1>
      <p className="text-gray-500 text-sm mb-6">
        Ajustes generales del sistema.
      </p>
      <ConfiguracionClient />
    </div>
  );
}
