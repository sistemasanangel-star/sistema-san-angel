"use client";

import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, Clock, BedDouble } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";

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

type Filter = "" | "POSITIVA" | "NEGATIVA";

export default function OpinionesClient() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [filter, setFilter] = useState<Filter>("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zoomed, setZoomed] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/opinions");
    const data = await res.json();
    setOpinions(data.opinions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAtendido(o: Opinion) {
    setOpinions((prev) =>
      prev.map((op) => (op.id === o.id ? { ...op, atendido: !op.atendido } : op))
    );
    await fetch(`/api/opinions/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atendido: !o.atendido }),
    });
  }

  const counts = useMemo(
    () => ({
      total: opinions.length,
      positivas: opinions.filter((o) => o.tipo === "POSITIVA").length,
      negativas: opinions.filter((o) => o.tipo === "NEGATIVA").length,
      pendientes: opinions.filter((o) => !o.atendido).length,
    }),
    [opinions]
  );

  const visible = opinions.filter(
    (o) => (!filter || o.tipo === filter) && (!onlyPending || !o.atendido)
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat label="Total" value={counts.total} color="#2E6DA4" bg="#EAF1F8" />
        <SummaryStat label="Positivas" value={counts.positivas} color="#1e8a53" bg="rgba(59,178,115,0.12)" />
        <SummaryStat label="Negativas" value={counts.negativas} color="#c8443a" bg="rgba(228,87,76,0.12)" />
        <SummaryStat label="Pendientes" value={counts.pendientes} color="#B45309" bg="#FEF3E2" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={filter === ""} onClick={() => setFilter("")}>
          Todas
        </FilterPill>
        <FilterPill active={filter === "POSITIVA"} onClick={() => setFilter("POSITIVA")}>
          <ThumbsUp size={13} /> Positivas
        </FilterPill>
        <FilterPill active={filter === "NEGATIVA"} onClick={() => setFilter("NEGATIVA")}>
          <ThumbsDown size={13} /> Negativas
        </FilterPill>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <FilterPill active={onlyPending} onClick={() => setOnlyPending((v) => !v)}>
          <Clock size={13} /> Solo pendientes
        </FilterPill>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay opiniones que coincidan con el filtro.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((o) => (
            <OpinionCard
              key={o.id}
              opinion={o}
              onToggleAtendido={() => toggleAtendido(o)}
              onZoom={() => o.fotoUrl && setZoomed(o.fotoUrl)}
            />
          ))}
        </div>
      )}

      {zoomed && <ImageLightbox src={zoomed} onClose={() => setZoomed(null)} />}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1.5">{label}</p>
      <span
        className="block h-1 rounded-full mt-3"
        style={{ background: bg }}
      />
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-brand-blue text-white border-brand-blue"
          : "border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function OpinionCard({
  opinion: o,
  onToggleAtendido,
  onZoom,
}: {
  opinion: Opinion;
  onToggleAtendido: () => void;
  onZoom: () => void;
}) {
  const isPositiva = o.tipo === "POSITIVA";
  const initials = o.doctor
    ? o.doctor.nombre
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm"
        style={{
          background: isPositiva ? "rgba(59,178,115,0.12)" : "rgba(228,87,76,0.12)",
          color: isPositiva ? "#1e8a53" : "#c8443a",
        }}
      >
        {initials ?? <BedDouble size={18} strokeWidth={1.75} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-brand-black text-sm">
            {o.doctor ? o.doctor.nombre : "Opinión general"}
          </p>
          <span
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPositiva ? "badge-ok" : "badge-pending"
            }`}
          >
            {isPositiva ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
            {isPositiva ? "Positiva" : "Negativa"}
          </span>
          <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
            {new Date(o.fecha).toLocaleString("es-GT", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {(o.doctor?.perteneceA || o.habitacion) && (
          <p className="text-xs text-gray-500 mt-0.5">
            {o.doctor?.perteneceA}
            {o.doctor?.perteneceA && o.habitacion ? " · " : ""}
            {o.habitacion ? `Habitación ${o.habitacion}` : ""}
          </p>
        )}

        <p className="text-sm text-gray-700 mt-2 leading-relaxed">{o.descripcion}</p>

        {o.fotoUrl && (
          <img
            src={o.fotoUrl}
            alt="Evidencia"
            className="w-20 h-20 object-cover rounded-lg cursor-pointer mt-3"
            onClick={onZoom}
          />
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onToggleAtendido}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
              o.atendido
                ? "border-gray-200 text-gray-500"
                : "btn-outline btn-outline-blue"
            }`}
          >
            {o.atendido ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            {o.atendido ? "Atendido" : "Marcar atendido"}
          </button>
        </div>
      </div>
    </div>
  );
}
