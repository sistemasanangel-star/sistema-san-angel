"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="card h-[520px] flex items-center justify-center text-gray-400 text-sm">
      Cargando mapa...
    </div>
  ),
});

export type Visitadora = {
  id: string;
  name: string;
  ultimaUbicLat: number;
  ultimaUbicLng: number;
  ultimaUbicHora: string;
};

export default function MapaClient() {
  const [visitadoras, setVisitadoras] = useState<Visitadora[]>([]);

  async function load() {
    const res = await fetch("/api/location/live");
    const data = await res.json();
    setVisitadoras(data.visitadoras ?? []);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">
        {visitadoras.length === 0
          ? "No hay visitadoras activas en este momento."
          : `${visitadoras.length} visitadora(s) activa(s)`}
      </p>
      <LiveMap visitadoras={visitadoras} />
    </div>
  );
}
