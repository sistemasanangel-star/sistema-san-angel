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
      {items.map((item) => (
        <div key={item.id} className="card p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-brand-black">{item.targetLabel}</p>
              <p className="text-xs text-gray-500">
                {TARGET_TYPE_LABEL[item.targetType] ?? item.targetType} · Solicitado por{" "}
                {item.requestedBy.name} ·{" "}
                {new Date(item.createdAt).toLocaleString("es-GT")}
              </p>
            </div>
            {statusBadge(item.status)}
          </div>

          {role === "ADMIN" && item.status === "PENDIENTE" && (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => resolve(item.id, "approve")}
                className="btn-primary px-3 py-1.5 text-sm"
              >
                Aprobar
              </button>
              <button
                onClick={() => resolve(item.id, "reject")}
                className="btn-danger px-3 py-1.5 text-sm"
              >
                Rechazar
              </button>
            </div>
          )}

          {role === "ADMIN" && item.status === "APROBADO" && item.token && (
            <p className="text-sm text-gray-600">
              Token de un solo uso:{" "}
              <span className="font-mono font-semibold text-brand-blue">
                {item.token}
              </span>{" "}
              (compártelo con la visitadora)
            </p>
          )}

          {role !== "ADMIN" && item.status === "APROBADO" && (
            <div className="flex gap-2 mt-1">
              <input
                className="input-field text-sm max-w-[160px]"
                placeholder="Ingresar token"
                value={redeemInputs[item.id] ?? ""}
                onChange={(e) =>
                  setRedeemInputs((s) => ({ ...s, [item.id]: e.target.value }))
                }
              />
              <button
                onClick={() => redeem(item.id)}
                className="btn-danger px-3 py-1.5 text-sm"
              >
                Eliminar con token
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
