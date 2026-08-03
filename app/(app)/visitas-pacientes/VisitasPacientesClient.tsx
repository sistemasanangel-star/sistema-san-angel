"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

type Question = {
  id: string;
  texto: string;
  tipo: string;
  opciones: string | null;
};

type Doctor = { id: string; nombre: string };

type Visit = {
  id: string;
  paciente: string;
  fecha: string;
  visitadora: { name: string };
  doctor: { nombre: string } | null;
  answers: { valor: string; question: { texto: string } }[];
};

export default function VisitasPacientesClient({ role }: { role: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/patient-visits");
    const data = await res.json();
    setVisits(data.visits ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(visit: Visit) {
    if (role === "ADMIN") {
      if (!confirm(`¿Eliminar la visita de "${visit.paciente}"?`)) return;
      const res = await fetch(`/api/patient-visits/${visit.id}`, { method: "DELETE" });
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
        targetType: "PATIENT_VISIT",
        targetId: visit.id,
        targetLabel: `Visita a paciente: ${visit.paciente}`,
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

      <button
        onClick={() => setShowForm(true)}
        className="btn-primary px-4 py-2 text-sm self-start"
      >
        + Nueva visita a paciente
      </button>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : visits.length === 0 ? (
        <p className="text-gray-400 text-sm">Aún no hay visitas registradas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visits.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-black">{v.paciente}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(v.fecha).toLocaleString("es-GT")} · {v.visitadora.name}
                    {v.doctor ? ` · ${v.doctor.nombre}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(v)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-brand-red text-brand-red whitespace-nowrap"
                >
                  {role === "ADMIN" ? "Eliminar" : "Solicitar borrado"}
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {v.answers.map((a, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    <span className="text-gray-400">{a.question.texto}:</span> {a.valor}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <NewVisitModal
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

function NewVisitModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [paciente, setPaciente] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/questions?active=1")
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []));
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors ?? []));
  }, []);

  function captureGps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("No se pudo obtener la ubicación GPS")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paciente) {
      setError("El nombre del paciente es obligatorio");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/patient-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente,
        doctorId: doctorId || null,
        gpsLat: gps?.lat,
        gpsLng: gps?.lng,
        answers: Object.entries(answers).map(([questionId, valor]) => ({
          questionId,
          valor,
        })),
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
    <Modal title="Nueva visita a paciente" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium">Paciente *</label>
          <input
            className="input-field mt-1"
            value={paciente}
            onChange={(e) => setPaciente(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Médico / sanatorio asociado (opcional)
          </label>
          <select
            className="input-field mt-1"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Sin asociar</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={captureGps}
            className="px-3 py-2 text-sm rounded-xl border border-brand-blue text-brand-blue"
          >
            📍 Obtener ubicación GPS
          </button>
          {gps && <span className="badge-ok text-xs px-2 py-1 rounded-full">GPS ✓</span>}
        </div>

        <hr className="border-gray-100" />

        {questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={answers[q.id] ?? ""}
            onChange={(v) => setAnswers((s) => ({ ...s, [q.id]: v }))}
          />
        ))}

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
            {saving ? "Guardando..." : "Guardar visita"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const opciones: string[] = question.opciones ? JSON.parse(question.opciones) : [];

  return (
    <div>
      <label className="text-sm font-medium">{question.texto}</label>
      {question.tipo === "TEXTO" && (
        <input className="input-field mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {question.tipo === "NUMERO" && (
        <input
          type="number"
          className="input-field mt-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {question.tipo === "SI_NO" && (
        <div className="flex gap-2 mt-1">
          {["Sí", "No"].map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-4 py-1.5 rounded-lg text-sm border ${
                value === opt
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {question.tipo === "ESCALA" && (
        <div className="flex gap-2 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => onChange(String(n))}
              className={`w-9 h-9 rounded-full text-sm border ${
                value === String(n)
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
      {question.tipo === "OPCION_MULTIPLE" && (
        <select className="input-field mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seleccionar...</option>
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
