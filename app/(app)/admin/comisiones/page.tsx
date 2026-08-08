import { requireAdminPage } from "@/lib/auth";
import ComisionesAdminClient from "./ComisionesAdminClient";

export default async function ComisionesAdminPage() {
  await requireAdminPage();
  return (
    <div className="max-w-5xl">
      <p className="text-gray-500 text-sm mb-6">
        Captura el monto cobrado y el porcentaje a pagar por médico cada mes.
      </p>
      <ComisionesAdminClient />
    </div>
  );
}
