"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

type Admission = {
  id: string;
  paciente: string;
  habitacion: string;
  fechaIngreso: string;
  fechaAlta: string | null;
  activo: boolean;
  visitadora: { name: string };
};

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
  admission: { habitacion: string } | null;
  answers: { valor: string; question: { texto: string } }[];
};

function todayInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function dayRange(dia: string) {
  const start = new Date(`${dia}T00:00:00`);
  const end = new Date(`${dia}T23:59:59`);
  return { from: start.toISOString(), to: end.toISOString() };
}

function diasInternado(fechaIngreso: string) {
  const days = Math.floor(
    (Date.now() - new Date(fechaIngreso).getTime()) / (1000 * 60 * 60 * 24)
  );
  return days <= 0 ? "hoy" : `${days} día(s)`;
}

export default function VisitasPacientesClient({ role }: { role: string }) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [visitAdmission, setVisitAdmission] = useState<Admission | null>(null);
  const [toast, setToast] = useState("");
  const [dia, setDia] = useState(todayInput());

  async function load() {
    setLoading(true);
    const { from, to } = dayRange(dia);
    const [admRes, visitRes] = await Promise.all([
      fetch("/api/patient-admissions?activo=1"),
      fetch(`/api/patient-visits?from=${from}&to=${to}`),
    ]);
    const admData = await admRes.json();
    const visitData = await visitRes.json();
    setAdmissions(admData.admissions ?? []);
    setTodayVisits(visitData.visits ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia]);

  const esHoy = dia === todayInput();

  async function darDeAlta(a: Admission) {
    if (!confirm(`¿Marcar a "${a.paciente}" sin seguimiento (dar de alta)? Ya no aparecerá en la lista activa, pero su historial se conserva.`))
      return;
    await fetch(`/api/patient-admissions/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "alta" }),
    });
    setToast(`${a.paciente} marcado como sin seguimiento.`);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className="card p-3 text-sm text-brand-blue bg-blue-50">{toast}</div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-brand-black">Pacientes internados</h2>
          <button
            onClick={() => setShowNewPatient(true)}
            className="btn-primary px-4 py-2 text-sm"
          >
            + Nuevo paciente
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : admissions.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay pacientes internados activos.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {admissions.map((a) => (
              <div key={a.id} className="card p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-black">{a.paciente}</p>
                  <p className="text-xs text-gray-500">
                    Habitación {a.habitacion} · Ingresó{" "}
                    {new Date(a.fechaIngreso).toLocaleString("es-GT")} ·{" "}
                    {diasInternado(a.fechaIngreso)} internado
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setVisitAdmission(a)}
                    className="text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-blue"
                  >
                    Registrar visita
                  </button>
                  <button
                    onClick={() => darDeAlta(a)}
                    className="text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-red whitespace-nowrap"
                  >
                    Ya no hay seguimiento
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-medium text-brand-black">
            {esHoy ? "Visitas de hoy" : "Visitas del día seleccionado"}
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input-field max-w-[160px]"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            />
            {!esHoy && (
              <button
                onClick={() => setDia(todayInput())}
                className="text-sm px-3 py-2 rounded-xl border btn-outline btn-outline-blue whitespace-nowrap"
              >
                Volver a hoy
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : todayVisits.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Aún no hay visitas registradas {esHoy ? "hoy" : "ese día"}. El historial
            completo está disponible en Informes.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {todayVisits.map((v) => (
              <div key={v.id} className="card p-4">
                <p className="font-medium text-brand-black">
                  {v.paciente}
                  {v.admission && (
                    <span className="text-xs text-gray-500 font-normal">
                      {" "}
                      · Habitación {v.admission.habitacion}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(v.fecha).toLocaleString("es-GT")} · {v.visitadora.name}
                  {v.doctor ? ` · ${v.doctor.nombre}` : ""}
                </p>
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
      </div>

      {showNewPatient && (
        <NewPatientModal
          onClose={() => setShowNewPatient(false)}
          onSaved={(admission) => {
            setShowNewPatient(false);
            load();
            setVisitAdmission(admission);
          }}
        />
      )}

      {visitAdmission && (
        <NewVisitModal
          admission={visitAdmission}
          onClose={() => setVisitAdmission(null)}
          onSaved={() => {
            setVisitAdmission(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewPatientModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (admission: Admission) => void;
}) {
  const [paciente, setPaciente] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paciente || !habitacion) {
      setError("Paciente y habitación son obligatorios");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/patient-admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paciente, habitacion, fechaIngreso }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    const data = await res.json();
    onSaved(data.admission);
  }

  return (
    <Modal title="Nuevo paciente internado" onClose={onClose}>
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
          <label className="text-sm font-medium">Habitación *</label>
          <input
            className="input-field mt-1"
            value={habitacion}
            onChange={(e) => setHabitacion(e.target.value)}
            placeholder="Ej. 204-B"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Día y hora de ingreso</label>
          <input
            type="datetime-local"
            className="input-field mt-1"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
          />
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
            {saving ? "Guardando..." : "Guardar y continuar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NewVisitModal({
  admission,
  onClose,
  onSaved,
}: {
  admission: Admission;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
    setSaving(true);
    const res = await fetch("/api/patient-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admissionId: admission.id,
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
    <Modal
      title={`Nueva visita — ${admission.paciente} (Hab. ${admission.habitacion})`}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            className="px-3 py-2 text-sm rounded-xl border btn-outline btn-outline-blue"
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
