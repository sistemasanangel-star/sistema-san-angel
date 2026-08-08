"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import SignatureCanvas from "@/components/SignatureCanvas";
import { MapPin, PenLine } from "lucide-react";

type Doctor = { id: string; nombre: string; perteneceA: string };

type Visit = {
  id: string;
  fecha: string;
  recibidoPor: string;
  observaciones: string | null;
  gpsLat: number;
  gpsLng: number;
  firmaImagen: string;
  visitadora: { name: string };
  doctor: { nombre: string; categoria: string };
};

function todayInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function VisitasMedicosClient({ role }: { role: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [dia, setDia] = useState(todayInput());
  const [verTodas, setVerTodas] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (!verTodas && dia) {
      params.set("from", `${dia}T00:00:00`);
      params.set("to", `${dia}T23:59:59`);
    }
    const res = await fetch(`/api/doctor-visits?${params.toString()}`);
    const data = await res.json();
    setVisits(data.visits ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, verTodas]);

  async function handleDelete(visit: Visit) {
    if (role === "ADMIN") {
      if (!confirm("¿Eliminar esta visita?")) return;
      const res = await fetch(`/api/doctor-visits/${visit.id}`, { method: "DELETE" });
      if (res.ok) {
        setToast("Visita eliminada.");
        load();
      }
      return;
    }
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "DOCTOR_VISIT",
        targetId: visit.id,
        targetLabel: `Visita a médico: ${visit.doctor.nombre} (${new Date(
          visit.fecha
        ).toLocaleDateString("es-GT")})`,
      }),
    });
    const data = await res.json();
    setToast(res.ok ? "Solicitud de eliminación enviada." : data.error);
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="card p-3 text-sm text-brand-blue bg-blue-50">{toast}</div>
      )}

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary px-4 py-2 text-sm self-start"
        >
          + Nueva Visita
        </button>

        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input-field max-w-[160px]"
            value={dia}
            disabled={verTodas}
            onChange={(e) => setDia(e.target.value)}
          />
          <button
            onClick={() => setVerTodas((v) => !v)}
            className={`text-sm px-3 py-2 rounded-xl border btn-outline ${
              verTodas ? "btn-outline-blue" : "border-gray-300 text-gray-600"
            }`}
          >
            {verTodas ? "Viendo todas" : "Ver todas"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : visits.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {verTodas
            ? "Aún no hay visitas registradas."
            : "No hay visitas registradas ese día. Prueba con otra fecha o \"Ver todas\"."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visits.map((v) => (
            <div key={v.id} className="card p-4 flex items-start gap-4">
              <img
                src={v.firmaImagen}
                alt="Firma"
                className="w-24 h-16 object-contain border border-gray-100 rounded-lg bg-white shrink-0"
              />
              <div className="flex-1">
                <p className="font-medium text-brand-black">{v.doctor.nombre}</p>
                <p className="text-xs text-gray-500">
                  {new Date(v.fecha).toLocaleString("es-GT")} · {v.visitadora.name} ·
                  Recibido por: {v.recibidoPor}
                </p>
                {v.observaciones && (
                  <p className="text-xs text-gray-600 mt-1">{v.observaciones}</p>
                )}
                <a
                  className="text-xs text-brand-blue underline"
                  href={`https://www.google.com/maps?q=${v.gpsLat},${v.gpsLng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver ubicación en el mapa
                </a>
              </div>
              <button
                onClick={() => handleDelete(v)}
                className="text-xs px-3 py-1.5 rounded-lg border btn-outline btn-outline-red whitespace-nowrap"
              >
                {role === "ADMIN" ? "Eliminar" : "Solicitar borrado"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <NewDoctorVisitModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewDoctorVisitModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [recibidoPor, setRecibidoPor] = useState("");
  const [firma, setFirma] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors ?? []));
  }, []);

  function captureGps() {
    if (!navigator.geolocation) {
      setError("Este navegador no soporta geolocalización");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setError("No se pudo obtener la ubicación GPS");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const ready = Boolean(doctorId && gps && recibidoPor && firma);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSaving(true);
    const res = await fetch("/api/doctor-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        gpsLat: gps!.lat,
        gpsLng: gps!.lng,
        recibidoPor,
        firmaImagen: firma,
        observaciones,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    onSaved();
  }

  return (
    <>
      <Modal title="Nueva visita a médico" onClose={onClose} wide>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Médico / lugar *</label>
            <select
              className="input-field mt-1"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            >
              <option value="">Seleccionar médico...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} — {d.perteneceA}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={captureGps}
              disabled={gpsLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border btn-outline btn-outline-blue"
            >
              <MapPin size={14} /> {gpsLoading ? "Obteniendo..." : "Obtener ubicación GPS *"}
            </button>
            {gps && <span className="badge-ok text-xs px-2 py-1 rounded-full">GPS ✓</span>}
          </div>

          <div>
            <label className="text-sm font-medium">Recibido por *</label>
            <input
              className="input-field mt-1"
              value={recibidoPor}
              onChange={(e) => setRecibidoPor(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSignature(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border btn-outline btn-outline-blue"
            >
              <PenLine size={14} /> Firma del receptor *
            </button>
            {firma && <span className="badge-ok text-xs px-2 py-1 rounded-full">Firma ✓</span>}
          </div>

          <div>
            <label className="text-sm font-medium">Observaciones (opcional)</label>
            <textarea
              className="input-field mt-1"
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <div className="flex gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${gps ? "badge-ok" : "badge-pending"}`}>
              GPS {gps ? "✓" : "pendiente"}
            </span>
            <span className={`px-2 py-1 rounded-full ${firma ? "badge-ok" : "badge-pending"}`}>
              Firma {firma ? "✓" : "pendiente"}
            </span>
            <span
              className={`px-2 py-1 rounded-full ${recibidoPor ? "badge-ok" : "badge-pending"}`}
            >
              Receptor {recibidoPor ? "✓" : "pendiente"}
            </span>
          </div>

          {error && <p className="text-sm text-brand-red">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border border-gray-300"
            >
              Cancelar
            </button>
            <button type="submit" disabled={!ready || saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? "Guardando..." : "Registrar Visita"}
            </button>
          </div>
        </form>
      </Modal>

      {showSignature && (
        <Modal title="Firma del receptor" onClose={() => setShowSignature(false)}>
          <SignatureCanvas onChange={setFirma} />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowSignature(false)}
              className="btn-primary px-4 py-2 text-sm"
            >
              Listo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
