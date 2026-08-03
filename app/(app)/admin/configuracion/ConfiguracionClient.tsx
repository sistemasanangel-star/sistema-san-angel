"use client";

import { useEffect, useState } from "react";

export default function ConfiguracionClient() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsappNumber(d.whatsappNumber ?? ""))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber }),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
      return;
    }
    setMessage("Guardado correctamente.");
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium">
            Número de WhatsApp para opiniones QR
          </label>
          <input
            className="input-field mt-1"
            value={loading ? "" : whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="Ej. 50212345678 (código de país + número, sin +)"
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-1">
            Cuando alguien envía una opinión desde el QR, se abrirá WhatsApp con
            este número precargado.
          </p>
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}
        {message && <p className="text-sm text-brand-green">{message}</p>}

        <button
          type="submit"
          disabled={saving || loading}
          className="btn-primary px-4 py-2 text-sm self-start"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
