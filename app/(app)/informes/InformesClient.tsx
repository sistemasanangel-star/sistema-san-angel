"use client";

import { useEffect, useState } from "react";
import { categoriaLabel } from "@/lib/constants";

type VisitadoraOption = { id: string; name: string };

type DoctorVisitRow = {
  id: string;
  fecha: string;
  recibidoPor: string;
  observaciones: string | null;
  gpsLat: number;
  gpsLng: number;
  visitadora: { name: string };
  doctor: { nombre: string; categoria: string };
};

type PatientVisitRow = {
  id: string;
  fecha: string;
  paciente: string;
  gpsLat: number | null;
  gpsLng: number | null;
  visitadora: { name: string };
  doctor: { nombre: string } | null;
  admission: { habitacion: string } | null;
  answers: { valor: string; question: { texto: string } }[];
};

export default function InformesClient({ isAdmin }: { isAdmin: boolean }) {
  const [tipo, setTipo] = useState<"medicos" | "pacientes">("medicos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visitadoraId, setVisitadoraId] = useState("");
  const [visitadoras, setVisitadoras] = useState<VisitadoraOption[]>([]);
  const [doctorRows, setDoctorRows] = useState<DoctorVisitRow[] | null>(null);
  const [patientRows, setPatientRows] = useState<PatientVisitRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users")
        .then((r) => r.json())
        .then((d) =>
          setVisitadoras(
            (d.users ?? []).filter((u: { role: string }) => u.role === "VISITADORA")
          )
        );
    }
  }, [isAdmin]);

  function buildParams() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (isAdmin && visitadoraId) params.set("visitadoraId", visitadoraId);
    return params;
  }

  async function generar() {
    setLoading(true);
    const params = buildParams();
    const url = tipo === "medicos" ? "/api/doctor-visits" : "/api/patient-visits";
    const res = await fetch(`${url}?${params.toString()}`);
    const data = await res.json();
    if (tipo === "medicos") setDoctorRows(data.visits ?? []);
    else setPatientRows(data.visits ?? []);
    setLoading(false);
  }

  function descargar() {
    const params = buildParams();
    const url =
      tipo === "medicos"
        ? `/api/reports/doctor-visits/excel?${params.toString()}`
        : `/api/reports/patient-visits/excel?${params.toString()}`;
    window.location.href = url;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm font-medium block mb-1">Tipo de reporte</label>
          <select
            className="input-field"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "medicos" | "pacientes")}
          >
            <option value="medicos">Visitas a médicos</option>
            <option value="pacientes">Visitas a pacientes</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Desde</label>
          <input
            type="date"
            className="input-field"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Hasta</label>
          <input
            type="date"
            className="input-field"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        {isAdmin && (
          <div>
            <label className="text-sm font-medium block mb-1">Visitadora</label>
            <select
              className="input-field"
              value={visitadoraId}
              onChange={(e) => setVisitadoraId(e.target.value)}
            >
              <option value="">Todas</option>
              {visitadoras.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={generar} className="btn-primary px-4 py-2 text-sm">
            {loading ? "Generando..." : "Generar informe"}
          </button>
          <button
            onClick={descargar}
            className="px-4 py-2 text-sm rounded-xl border btn-outline btn-outline-blue"
          >
            Descargar Excel
          </button>
        </div>
      </div>

      {tipo === "medicos" && doctorRows && (
        <div className="card p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Visitadora</th>
                <th className="py-2 pr-3">Médico/Lugar</th>
                <th className="py-2 pr-3">Categoría</th>
                <th className="py-2 pr-3">Recibido por</th>
                <th className="py-2 pr-3">GPS</th>
                <th className="py-2 pr-3">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {doctorRows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {new Date(r.fecha).toLocaleString("es-GT")}
                  </td>
                  <td className="py-2 pr-3">{r.visitadora.name}</td>
                  <td className="py-2 pr-3">{r.doctor.nombre}</td>
                  <td className="py-2 pr-3">{categoriaLabel(r.doctor.categoria)}</td>
                  <td className="py-2 pr-3">{r.recibidoPor}</td>
                  <td className="py-2 pr-3">
                    <a
                      className="text-brand-blue underline"
                      href={`https://www.google.com/maps?q=${r.gpsLat},${r.gpsLng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver mapa
                    </a>
                  </td>
                  <td className="py-2 pr-3">{r.observaciones}</td>
                </tr>
              ))}
              {doctorRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">
                    Sin resultados para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tipo === "pacientes" && patientRows && (
        <div className="card p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Visitadora</th>
                <th className="py-2 pr-3">Paciente</th>
                <th className="py-2 pr-3">Habitación</th>
                <th className="py-2 pr-3">Médico asociado</th>
                <th className="py-2 pr-3">Respuestas</th>
              </tr>
            </thead>
            <tbody>
              {patientRows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {new Date(r.fecha).toLocaleString("es-GT")}
                  </td>
                  <td className="py-2 pr-3">{r.visitadora.name}</td>
                  <td className="py-2 pr-3">{r.paciente}</td>
                  <td className="py-2 pr-3">{r.admission?.habitacion ?? "—"}</td>
                  <td className="py-2 pr-3">{r.doctor?.nombre ?? "—"}</td>
                  <td className="py-2 pr-3">
                    {r.answers.map((a, i) => (
                      <p key={i} className="text-xs">
                        <span className="text-gray-400">{a.question.texto}:</span> {a.valor}
                      </p>
                    ))}
                  </td>
                </tr>
              ))}
              {patientRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    Sin resultados para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
