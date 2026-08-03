"use client";

import { useEffect, useRef, useState } from "react";

const PING_INTERVAL_MS = 15000;

export default function JornadaClient() {
  const [active, setActive] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const watchRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function sendPing() {
    if (!navigator.geolocation) {
      setError("Este navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetch("/api/location/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        });
        setLastSent(new Date());
        setError("");
      },
      () => setError("No se pudo obtener tu ubicación. Revisa los permisos."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function start() {
    setError("");
    await fetch("/api/location/jornada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    });
    setActive(true);
    sendPing();
    intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);
  }

  async function stop() {
    await fetch("/api/location/jornada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop" }),
    });
    setActive(false);
    setLastSent(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  return (
    <div className="card p-6 flex flex-col items-center gap-4 text-center">
      <div
        className={`w-4 h-4 rounded-full ${active ? "bg-brand-green animate-pulse" : "bg-gray-300"}`}
      />
      <p className="font-medium text-brand-black">
        {active ? "Jornada activa — compartiendo ubicación" : "Jornada no iniciada"}
      </p>
      {lastSent && (
        <p className="text-xs text-gray-500">
          Última actualización: {lastSent.toLocaleTimeString("es-GT")}
        </p>
      )}
      {error && <p className="text-sm text-brand-red">{error}</p>}

      {active ? (
        <button onClick={stop} className="btn-danger px-6 py-2.5 font-medium">
          Finalizar jornada
        </button>
      ) : (
        <button onClick={start} className="btn-primary px-6 py-2.5 font-medium">
          Iniciar jornada
        </button>
      )}
    </div>
  );
}
