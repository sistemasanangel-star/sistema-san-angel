"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function OpinionGeneralForm() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [tipo, setTipo] = useState<"POSITIVA" | "NEGATIVA" | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsappNumber(d.whatsappNumber ?? ""));
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!habitacion || !tipo || !descripcion) {
      setError("Escribe el número de habitación, tu opinión y una descripción");
      return;
    }
    setSending(true);
    const res = await fetch("/api/opinions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacion, tipo, descripcion, fotoUrl: foto }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al enviar");
      return;
    }
    setDone(true);

    const lines = [
      `Opinión (${tipo === "POSITIVA" ? "Positiva" : "Negativa"}) — Hospital San Ángel`,
      `Habitación: ${habitacion}`,
      descripcion,
    ];
    if (foto) lines.push("(Evidencia fotográfica registrada en el sistema)");
    const text = encodeURIComponent(lines.join("\n"));

    setTimeout(() => {
      window.location.href = `https://wa.me/${whatsappNumber}?text=${text}`;
    }, 600);
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <p className="text-brand-green font-medium">¡Gracias por tu opinión!</p>
        <p className="text-sm text-gray-500 mt-2">
          Se abrirá WhatsApp para confirmar el envío...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl bg-blue-50 text-brand-blue text-xs text-center py-2 px-3">
        Esta conversación es anónima y segura. Tu mensaje llega directo al
        administrador encargado de quejas.
      </div>

      <div>
        <label className="text-sm font-medium">Número de habitación *</label>
        <input
          className="input-field mt-1"
          value={habitacion}
          onChange={(e) => setHabitacion(e.target.value)}
          placeholder="Ej. 204-B"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tu opinión</label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => setTipo("POSITIVA")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm border ${
              tipo === "POSITIVA"
                ? "bg-brand-green text-white border-brand-green"
                : "border-gray-300 text-gray-600"
            }`}
          >
            <ThumbsUp size={15} /> Positiva
          </button>
          <button
            type="button"
            onClick={() => setTipo("NEGATIVA")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm border ${
              tipo === "NEGATIVA"
                ? "bg-brand-red text-white border-brand-red"
                : "border-gray-300 text-gray-600"
            }`}
          >
            <ThumbsDown size={15} /> Negativa
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Cuéntanos qué pasó *</label>
        <textarea
          className="input-field mt-1"
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Foto (opcional)</label>
        <input type="file" accept="image/*" className="mt-1 text-sm" onChange={handleFile} />
        {foto && <img src={foto} alt="Evidencia" className="mt-2 rounded-lg max-h-32" />}
      </div>

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <button type="submit" disabled={sending} className="btn-primary py-2.5 font-medium">
        {sending ? "Enviando..." : "Enviar opinión"}
      </button>
    </form>
  );
}
