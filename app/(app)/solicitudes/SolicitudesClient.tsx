"use client";

import { useEffect, useState } from "react";
import { TARGET_TYPE_LABEL } from "@/lib/constants";

type TokenRequest = {
  id: string;
  targetType: string;
  targetLabel: string;
  status: string;
  token: string | null;
  createdAt: string;
  requestedBy: { name: string };
};

export default function SolicitudesClient({ role }: { role: string }) {
  const [items, setItems] = useState<TokenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemInputs, setRedeemInputs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/tokens");
    const data = await res.json();
    setItems(data.tokens ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string, action: "approve" | "reject") {
    await fetch(`/api/tokens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  async function redeem(id: string) {
    setMessage("");
    const token = redeemInputs[id]?.trim();
    if (!token) return;
    const res = await fetch("/api/tokens/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, token }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "No se pudo eliminar");
      return;
    }
    setMessage("Registro eliminado correctamente.");
    load();
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDIENTE: "badge-pending",
      APROBADO: "badge-ok",
      RECHAZADO: "badge-pending",
      USADO: "bg-gray-100 text-gray-500",
    };
    const labels: Record<string, string> = {
      PENDIENTE: "Pendiente",
      APROBADO: "Aprobado",
      RECHAZADO: "Rechazado",
      USADO: "Usado",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) return <p className="text-gray-400 text-sm">Cargando...</p>;

  return (
    <div className="flex flex-col gap-3">
      {message && (
        <div className="card p-3 text-sm text-brand-green bg-green-50">{message}</div>
      )}
      {items.length === 0 && (
        <p className="text-gray-400 text-sm">No hay solicitudes registradas.</p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => (
          <div key={item.id} className="card p-3 sm:p-4 flex flex-col gap-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-brand-black text-sm sm:text-base truncate">
                  {item.targetLabel}
                </p>
                <p className="text-xs text-gray-500">
                  {TARGET_TYPE_LABEL[item.targetType] ?? item.targetType}
                </p>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Solicitado por {item.requestedBy.name} ·{" "}
                  {new Date(item.createdAt).toLocaleString("es-GT")}
                </p>
              </div>
              {statusBadge(item.status)}
            </div>

            {role === "ADMIN" && item.status === "PENDIENTE" && (
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <button
                  onClick={() => resolve(item.id, "approve")}
                  className="btn-primary px-3 py-1.5 text-xs sm:text-sm"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => resolve(item.id, "reject")}
                  className="btn-danger px-3 py-1.5 text-xs sm:text-sm"
                >
                  Rechazar
                </button>
              </div>
            )}

            {role === "ADMIN" && item.status === "APROBADO" && item.token && (
              <p className="text-xs sm:text-sm text-gray-600">
                Token:{" "}
                <span className="font-mono font-semibold text-brand-blue">
                  {item.token}
                </span>
              </p>
            )}

            {role !== "ADMIN" && item.status === "APROBADO" && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  className="input-field text-sm"
                  placeholder="Ingresar token"
                  value={redeemInputs[item.id] ?? ""}
                  onChange={(e) =>
                    setRedeemInputs((s) => ({ ...s, [item.id]: e.target.value }))
                  }
                />
                <button
                  onClick={() => redeem(item.id)}
                  className="btn-danger px-3 py-1.5 text-xs sm:text-sm"
                >
                  Eliminar con token
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
