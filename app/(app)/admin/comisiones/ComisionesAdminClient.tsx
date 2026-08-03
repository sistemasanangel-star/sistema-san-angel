"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import ImageLightbox from "@/components/ImageLightbox";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Doctor = { id: string; nombre: string; perteneceA: string };

type Commission = {
  id: string;
  mes: string;
  montoCobrado: number;
  porcentaje: number;
  montoComision: number;
  estado: string;
  recibidoPor: string | null;
  fechaPago: string | null;
  firmaImagen: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  doctor: { nombre: string; perteneceA: string };
  pagadoPor: { name: string } | null;
};

type PorMedico = {
  doctorId: string;
  nombre: string;
  perteneceA: string;
  montoCobrado: number;
  montoComision: number;
  pagado: number;
  pendiente: number;
  count: number;
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function money(n: number) {
  return `Q${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ComisionesAdminClient() {
  const [mes, setMes] = useState(currentMonth());
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [porMedico, setPorMedico] = useState<PorMedico[]>([]);
  const [totales, setTotales] = useState({ montoCobrado: 0, montoComision: 0, pagado: 0, pendiente: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  const [zoomed, setZoomed] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [cRes, sRes] = await Promise.all([
      fetch(`/api/commissions?mes=${mes}`),
      fetch(`/api/commissions/summary?mes=${mes}`),
    ]);
    const cData = await cRes.json();
    const sData = await sRes.json();
    setCommissions(cData.commissions ?? []);
    setPorMedico(sData.porMedico ?? []);
    setTotales(sData.totales ?? { montoCobrado: 0, montoComision: 0, pagado: 0, pendiente: 0 });
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  async function handleDelete(c: Commission) {
    if (!confirm(`¿Eliminar la comisión de ${c.doctor.nombre}?`)) return;
    const res = await fetch(`/api/commissions/${c.id}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  const chartData = porMedico.map((p) => ({
    nombre: p.nombre.length > 14 ? p.nombre.slice(0, 14) + "…" : p.nombre,
    nombreCompleto: p.nombre,
    Pagado: Math.round(p.pagado * 100) / 100,
    Pendiente: Math.round(p.pendiente * 100) / 100,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <input
          type="month"
          className="input-field max-w-[180px]"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
        <div className="flex gap-2">
          <a
            href={`/api/reports/commissions/excel?mes=${mes}`}
            className="px-4 py-2 text-sm rounded-xl border btn-outline btn-outline-blue"
          >
            Descargar Excel
          </a>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary px-4 py-2 text-sm">
            + Nueva comisión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1" style={{ background: "#2E6DA4" }} />
          <p className="text-2xl font-semibold" style={{ color: "#2E6DA4" }}>{money(totales.montoCobrado)}</p>
          <p className="text-sm text-gray-500 mt-1">Total cobrado</p>
        </div>
        <div className="card p-5 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1" style={{ background: "#7C3AED" }} />
          <p className="text-2xl font-semibold" style={{ color: "#7C3AED" }}>{money(totales.montoComision)}</p>
          <p className="text-sm text-gray-500 mt-1">Total comisión</p>
        </div>
        <div className="card p-5 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1" style={{ background: "#279257" }} />
          <p className="text-2xl font-semibold" style={{ color: "#279257" }}>{money(totales.pagado)}</p>
          <p className="text-sm text-gray-500 mt-1">Pagado</p>
        </div>
        <div className="card p-5 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1" style={{ background: "#B45309" }} />
          <p className="text-2xl font-semibold" style={{ color: "#B45309" }}>{money(totales.pendiente)}</p>
          <p className="text-sm text-gray-500 mt-1">Pendiente</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-medium text-brand-black mb-4">
          Comisión generada por médico ({mes})
        </h2>
        {chartData.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin comisiones registradas este mes.</p>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={((value: unknown) => money(Number(value))) as never}
                  labelFormatter={((label: string, payload: unknown) => {
                    const p = payload as { payload?: { nombreCompleto?: string } }[] | undefined;
                    return p?.[0]?.payload?.nombreCompleto ?? label;
                  }) as never}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee" }}
                />
                <Legend />
                <Bar dataKey="Pagado" stackId="a" fill="#3BB273" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pendiente" stackId="a" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-medium text-brand-black mb-3">Detalle del mes</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : commissions.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay comisiones registradas para este mes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {commissions.map((c) => (
              <div key={c.id} className="card p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-black">{c.doctor.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {c.doctor.perteneceA} · Cobrado {money(c.montoCobrado)} · {c.porcentaje}% ·{" "}
                    <span className="font-semibold text-brand-black">{money(c.montoComision)}</span>
                  </p>
                  {c.estado === "PAGADA" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pagado {c.fechaPago && new Date(c.fechaPago).toLocaleString("es-GT")} · Recibió:{" "}
                      {c.recibidoPor} · Entregó: {c.pagadoPor?.name}
                      {c.firmaImagen && (
                        <button
                          onClick={() => setZoomed(c.firmaImagen)}
                          className="ml-2 text-brand-blue underline"
                        >
                          Ver firma
                        </button>
                      )}
                      {c.gpsLat != null && (
                        <a
                          className="ml-2 text-brand-blue underline"
                          href={`https://www.google.com/maps?q=${c.gpsLat},${c.gpsLng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver mapa
                        </a>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      c.estado === "PAGADA" ? "badge-ok" : "badge-pending"
                    }`}
                  >
                    {c.estado === "PAGADA" ? "Pagada" : "Pendiente"}
                  </span>
                  {c.estado === "PENDIENTE" && (
                    <>
                      <button
                        onClick={() => { setEditing(c); setShowForm(true); }}
                        className="text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-blue"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-red"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CommissionFormModal
          commission={editing}
          defaultMes={mes}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {zoomed && <ImageLightbox src={zoomed} onClose={() => setZoomed(null)} />}
    </div>
  );
}

function CommissionFormModal({
  commission,
  defaultMes,
  onClose,
  onSaved,
}: {
  commission: Commission | null;
  defaultMes: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [mes, setMes] = useState(defaultMes);
  const [montoCobrado, setMontoCobrado] = useState(
    commission ? String(commission.montoCobrado) : ""
  );
  const [porcentaje, setPorcentaje] = useState(commission ? String(commission.porcentaje) : "10");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors ?? []));
  }, []);

  const comisionCalculada =
    montoCobrado && porcentaje
      ? (Number(montoCobrado) * Number(porcentaje)) / 100
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commission && !doctorId) {
      setError("Selecciona un médico");
      return;
    }
    if (!montoCobrado || !porcentaje) {
      setError("Completa el monto cobrado y el porcentaje");
      return;
    }
    setSaving(true);
    const payload = commission
      ? { action: "editar", doctorId, mes, montoCobrado, porcentaje }
      : { doctorId, mes, montoCobrado, porcentaje };
    const res = await fetch(
      commission ? `/api/commissions/${commission.id}` : "/api/commissions",
      {
        method: commission ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    onSaved();
  }

  return (
    <Modal title={commission ? "Editar comisión" : "Nueva comisión"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium">Médico *</label>
          <select
            className="input-field mt-1"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={!!commission}
          >
            <option value="">Seleccionar médico...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} — {d.perteneceA}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Mes *</label>
          <input
            type="month"
            className="input-field mt-1"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Monto cobrado (Q) *</label>
          <input
            type="number"
            step="0.01"
            className="input-field mt-1"
            value={montoCobrado}
            onChange={(e) => setMontoCobrado(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Porcentaje a pagar (%) *</label>
          <input
            type="number"
            step="0.01"
            className="input-field mt-1"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
          />
        </div>

        <div className="card p-3 bg-blue-50/50 text-sm">
          Comisión a pagar:{" "}
          <span className="font-semibold text-brand-blue">{money(comisionCalculada)}</span>
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-300">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
