"use client";

import { useEffect, useState } from "react";

type Opinion = {
  id: string;
  tipo: string;
  descripcion: string;
  fotoUrl: string | null;
  atendido: boolean;
  fecha: string;
  habitacion: string | null;
  doctor: { nombre: string; perteneceA: string } | null;
};

export default function OpinionesClient() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [zoomed, setZoomed] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("tipo", filter);
    const res = await fetch(`/api/opinions?${params.toString()}`);
    const data = await res.json();
    setOpinions(data.opinions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function toggleAtendido(o: Opinion) {
    await fetch(`/api/opinions/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atendido: !o.atendido }),
    });
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      <select className="input-field max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">Todas</option>
        <option value="POSITIVA">Positivas</option>
        <option value="NEGATIVA">Negativas</option>
      </select>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : opinions.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay opiniones registradas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {opinions.map((o) => (
            <div key={o.id} className="card p-4 flex items-start gap-4">
              {o.fotoUrl && (
                <img
                  src={o.fotoUrl}
                  alt="Evidencia"
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer shrink-0"
                  onClick={() => setZoomed(o.fotoUrl)}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      o.tipo === "POSITIVA" ? "badge-ok" : "badge-pending"
                    }`}
                  >
                    {o.tipo === "POSITIVA" ? "Positiva" : "Negativa"}
                  </span>
                  {o.doctor && (
                    <span className="text-xs text-gray-500">{o.doctor.perteneceA}</span>
                  )}
                  {o.habitacion && (
                    <span className="text-xs text-gray-500">
                      Habitación {o.habitacion}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(o.fecha).toLocaleString("es-GT")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{o.descripcion}</p>
              </div>
              <button
                onClick={() => toggleAtendido(o)}
                className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap ${
                  o.atendido
                    ? "border-gray-300 text-gray-500"
                    : "border-brand-blue text-brand-blue"
                }`}
              >
                {o.atendido ? "Atendido ✓" : "Marcar atendido"}
              </button>
            </div>
          ))}
        </div>
      )}

      {zoomed && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomed(null)}
        >
          <img src={zoomed} alt="Evidencia" className="max-h-[80vh] rounded-lg" />
        </div>
      )}
    </div>
  );
}
