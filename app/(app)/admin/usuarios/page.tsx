import { requireAdminPage } from "@/lib/auth";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  await requireAdminPage();
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">Usuarios</h1>
      <p className="text-gray-500 text-sm mb-6">
        Administra las cuentas de visitadoras y administradores.
      </p>
      <UsuariosClient />
    </div>
  );
}
