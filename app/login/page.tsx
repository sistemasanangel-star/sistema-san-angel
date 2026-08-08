"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import CodenestFooter from "@/components/CodenestFooter";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden bg-brand-gray px-4 py-10 animate-page">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-25"
          style={{ background: "#2E6DA4", filter: "blur(70px)" }}
        />
        <div
          className="absolute top-1/3 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: "#7C3AED", filter: "blur(70px)" }}
        />
        <div
          className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full opacity-20"
          style={{ background: "#3BB273", filter: "blur(70px)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(#c7d5e2 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <span className="text-[11px] font-medium tracking-wide text-brand-blue bg-brand-blue-light px-3 py-1 rounded-full">
            ACCESO INTERNO
          </span>
        </div>

        <div className="card w-full p-8 flex flex-col items-center gap-6 animate-pop">
          <Logo size={140} />
          <div className="text-center -mt-2">
            <p className="text-[11px] font-semibold tracking-[0.15em] text-brand-blue uppercase mb-1">
              Codenest Hospitales
            </p>
            <p className="text-sm text-gray-500">Módulo de Visitadoras Médicas</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-brand-black">
                Usuario
              </label>
              <input
                className="input-field mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-black">
                Contraseña
              </label>
              <input
                className="input-field mt-1"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-brand-red">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 font-medium mt-2"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
        <CodenestFooter />
      </div>
    </div>
  );
}
