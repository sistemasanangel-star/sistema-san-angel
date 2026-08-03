"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { QUESTION_TYPES, questionTypeLabel } from "@/lib/constants";

type Question = {
  id: string;
  texto: string;
  tipo: string;
  opciones: string | null;
  orden: number;
  active: boolean;
};

export default function PreguntasClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/questions");
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(q: Question) {
    await fetch(`/api/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !q.active }),
    });
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        className="btn-primary px-4 py-2 text-sm self-start"
      >
        + Nueva pregunta
      </button>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {questions.map((q) => (
            <div key={q.id} className="card p-3 sm:p-4 flex flex-col gap-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-brand-black text-sm sm:text-base line-clamp-2">
                  {q.texto}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    q.active ? "badge-ok" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {q.active ? "Activa" : "Desactivada"}
                </span>
              </div>
              <p className="text-xs text-gray-500">{questionTypeLabel(q.tipo)}</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <button
                  onClick={() => {
                    setEditing(q);
                    setShowForm(true);
                  }}
                  className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-blue"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(q)}
                  className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-red"
                >
                  {q.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <QuestionFormModal
          question={editing}
          nextOrden={questions.length + 1}
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

function QuestionFormModal({
  question,
  nextOrden,
  onClose,
  onSaved,
}: {
  question: Question | null;
  nextOrden: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [texto, setTexto] = useState(question?.texto ?? "");
  const [tipo, setTipo] = useState(question?.tipo ?? "TEXTO");
  const [opciones, setOpciones] = useState(
    question?.opciones ? JSON.parse(question.opciones).join(", ") : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto) {
      setError("El texto de la pregunta es obligatorio");
      return;
    }
    setSaving(true);
    const payload = {
      texto,
      tipo,
      orden: question?.orden ?? nextOrden,
      opciones:
        tipo === "OPCION_MULTIPLE"
          ? opciones.split(",").map((o: string) => o.trim()).filter(Boolean)
          : undefined,
    };
    const res = await fetch(question ? `/api/questions/${question.id}` : "/api/questions", {
      method: question ? "PATCH" : "POST",
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
    <Modal title={question ? "Editar pregunta" : "Nueva pregunta"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium">Texto de la pregunta *</label>
          <input
            className="input-field mt-1"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tipo de respuesta</label>
          <select
            className="input-field mt-1"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        {tipo === "OPCION_MULTIPLE" && (
          <div>
            <label className="text-sm font-medium">Opciones (separadas por coma)</label>
            <input
              className="input-field mt-1"
              value={opciones}
              onChange={(e) => setOpciones(e.target.value)}
              placeholder="Opción 1, Opción 2, Opción 3"
            />
          </div>
        )}

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
