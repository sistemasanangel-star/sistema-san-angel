import { requireAdminPage } from "@/lib/auth";
import ComisionesAdminClient from "./ComisionesAdminClient";

export default async function ComisionesAdminPage() {
  await requireAdminPage();
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">Comisiones</h1>
      <p className="text-gray-500 text-sm mb-6">
        Captura el monto cobrado y el porcentaje a pagar por médico cada mes.
      </p>
      <ComisionesAdminClient />
    </div>
  );
}
