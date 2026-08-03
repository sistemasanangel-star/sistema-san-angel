import { getCurrentUser } from "@/lib/auth";
import SolicitudesClient from "./SolicitudesClient";

export default async function SolicitudesPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-brand-black mb-1">
        Solicitudes de borrado
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {user?.role === "ADMIN"
          ? "Aprueba o rechaza solicitudes de eliminación de tus visitadoras."
          : "Solicita un token de un solo uso para eliminar un registro, y úsalo aquí cuando el administrador lo apruebe."}
      </p>
      <SolicitudesClient role={user?.role ?? "VISITADORA"} />
    </div>
  );
}
