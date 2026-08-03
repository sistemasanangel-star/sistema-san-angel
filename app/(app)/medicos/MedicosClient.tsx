"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { CATEGORIAS_LUGAR, categoriaLabel, categoriaColor, categoriaIcon } from "@/lib/constants";

type Doctor = {
  id: string;
  nombre: string;
  especialidad: string | null;
  categoria: string;
  perteneceA: string;
  direccion: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  telefono: string | null;
  horarioAtencion: string | null;
  notas: string | null;
};

export default function MedicosClient({ role }: { role: string }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [perteneceOptions, setPerteneceOptions] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoria) params.set("categoria", categoria);
    const res = await fetch(`/api/doctors?${params.toString()}`);
    const data = await res.json();
    setDoctors(data.doctors ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/doctors/pertenece")
      .then((r) => r.json())
      .then((d) => setPerteneceOptions(d.values ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoria]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function handleDelete(doc: Doctor) {
    if (role === "ADMIN") {
      if (!confirm(`¿Eliminar "${doc.nombre}"? Esta acción no se puede deshacer.`)) return;
      const res = await fetch(`/api/doctors/${doc.id}`, { method: "DELETE" });
      if (res.ok) {
        setToast("Médico eliminado.");
        load();
      }
      return;
    }
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "DOCTOR",
        targetId: doc.id,
        targetLabel: doc.nombre,
      }),
    });
    const data = await res.json();
    setToast(res.ok ? "Solicitud de eliminación enviada al administrador." : data.error);
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="card p-3 text-sm text-brand-blue bg-blue-50">{toast}</div>
      )}

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <input
            className="input-field max-w-xs"
            placeholder="Buscar por nombre, lugar o especialidad..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="input-field max-w-[220px]"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS_LUGAR.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
        >
          + Nuevo médico
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : doctors.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay médicos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => {
            const color = categoriaColor(doc.categoria);
            return (
            <div key={doc.id} className="card card-interactive p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span
                    className="icon-chip"
                    style={{ background: color.bg }}
                  >
                    {categoriaIcon(doc.categoria)}
                  </span>
                  <div>
                    <p className="font-medium text-brand-black">{doc.nombre}</p>
                    {doc.especialidad && (
                      <p className="text-xs text-gray-500">{doc.especialidad}</p>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap"
                  style={{ background: color.bg, color: color.text }}
                >
                  {categoriaLabel(doc.categoria)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{doc.perteneceA}</p>
              {doc.direccion && (
                <p className="text-xs text-gray-500">{doc.direccion}</p>
              )}
              {doc.telefono && (
                <p className="text-xs text-gray-500">📞 {doc.telefono}</p>
              )}
              {doc.horarioAtencion && (
                <p className="text-xs text-gray-500">🕐 {doc.horarioAtencion}</p>
              )}
              <p className="text-xs">
                {doc.gpsLat != null ? (
                  <span className="badge-ok px-2 py-0.5 rounded-full">GPS ✓</span>
                ) : (
                  <span className="badge-pending px-2 py-0.5 rounded-full">Sin GPS</span>
                )}
              </p>
              {doc.notas && (
                <p className="text-xs text-gray-400 line-clamp-2">{doc.notas}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditing(doc);
                    setShowForm(true);
                  }}
                  className="flex-1 text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-blue"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="flex-1 text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-red"
                >
                  {role === "ADMIN" ? "Eliminar" : "Solicitar borrado"}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <DoctorFormModal
          doctor={editing}
          perteneceOptions={perteneceOptions}
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

function DoctorFormModal({
  doctor,
  perteneceOptions,
  onClose,
  onSaved,
}: {
  doctor: Doctor | null;
  perteneceOptions: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(doctor?.nombre ?? "");
  const [especialidad, setEspecialidad] = useState(doctor?.especialidad ?? "");
  const [categoria, setCategoria] = useState(doctor?.categoria ?? "SANATORIO");
  const [perteneceA, setPerteneceA] = useState(doctor?.perteneceA ?? "");
  const [direccion, setDireccion] = useState(doctor?.direccion ?? "");
  const [telefono, setTelefono] = useState(doctor?.telefono ?? "");
  const [horarioAtencion, setHorarioAtencion] = useState(doctor?.horarioAtencion ?? "");
  const [notas, setNotas] = useState(doctor?.notas ?? "");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(
    doctor?.gpsLat != null && doctor?.gpsLng != null
      ? { lat: doctor.gpsLat, lng: doctor.gpsLng }
      : null
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function captureGps() {
    setError("");
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
        setError("No se pudo obtener la ubicación. Revisa los permisos.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nombre || !categoria || !perteneceA) {
      setError("Nombre, categoría y 'a qué pertenece' son obligatorios");
      return;
    }
    if (!gps) {
      setError("Debes capturar la ubicación GPS");
      return;
    }
    setSaving(true);
    const payload = {
      nombre,
      especialidad,
      categoria,
      perteneceA,
      direccion,
      telefono,
      horarioAtencion,
      notas,
      gpsLat: gps.lat,
      gpsLng: gps.lng,
    };
    const res = await fetch(doctor ? `/api/doctors/${doctor.id}` : "/api/doctors", {
      method: doctor ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    <Modal title={doctor ? "Editar médico" : "Nuevo médico"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Nombre del médico/persona *</label>
            <input
              className="input-field mt-1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Especialidad</label>
            <input
              className="input-field mt-1"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Categoría de lugar *</label>
            <select
              className="input-field mt-1"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS_LUGAR.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">A qué pertenece *</label>
            <input
              className="input-field mt-1"
              list="pertenece-options"
              value={perteneceA}
              onChange={(e) => setPerteneceA(e.target.value)}
              placeholder="Buscar o escribir nuevo..."
              required
            />
            <datalist id="pertenece-options">
              {perteneceOptions.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <input
              className="input-field mt-1"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dirección / referencia</label>
            <input
              className="input-field mt-1"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Horario de atención</label>
            <input
              className="input-field mt-1"
              value={horarioAtencion}
              onChange={(e) => setHorarioAtencion(e.target.value)}
              placeholder="Ej. Lun-Vie 8:00-17:00"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notas</label>
          <textarea
            className="input-field mt-1"
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={captureGps}
            disabled={gpsLoading}
            className="px-3 py-2 text-sm rounded-xl border btn-outline btn-outline-blue"
          >
            {gpsLoading ? "Obteniendo..." : "📍 Obtener ubicación GPS"}
          </button>
          {gps && (
            <span className="badge-ok text-xs px-2 py-1 rounded-full">
              GPS capturado ({gps.lat.toFixed(5)}, {gps.lng.toFixed(5)})
            </span>
          )}
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
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
