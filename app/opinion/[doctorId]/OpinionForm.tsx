"use client";

import { useEffect, useState } from "react";

export default function OpinionForm({ doctorId }: { doctorId: string | null }) {
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsappNumber(d.whatsappNumber ?? ""));
  }, []);

  const [tipo, setTipo] = useState<"POSITIVA" | "NEGATIVA" | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

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
    if (!tipo || !descripcion) {
      setError("Selecciona el tipo de opinión y escribe una descripción");
      return;
    }
    setSending(true);
    const res = await fetch("/api/opinions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, tipo, descripcion, fotoUrl: foto }),
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
      <div>
        <label className="text-sm font-medium">Tu opinión</label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => setTipo("POSITIVA")}
            className={`flex-1 py-2 rounded-xl text-sm border ${
              tipo === "POSITIVA"
                ? "bg-brand-green text-white border-brand-green"
                : "border-gray-300 text-gray-600"
            }`}
          >
            🙂 Positiva
          </button>
          <button
            type="button"
            onClick={() => setTipo("NEGATIVA")}
            className={`flex-1 py-2 rounded-xl text-sm border ${
              tipo === "NEGATIVA"
                ? "bg-brand-red text-white border-brand-red"
                : "border-gray-300 text-gray-600"
            }`}
          >
            🙁 Negativa
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
