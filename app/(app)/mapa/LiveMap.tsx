"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import type { Visitadora } from "./MapaClient";

const DEFAULT_CENTER: [number, number] = [14.6349, -90.5069];

function AutoFit({ visitadoras }: { visitadoras: Visitadora[] }) {
  const map = useMap();

  useEffect(() => {
    if (visitadoras.length === 0) return;
    if (visitadoras.length === 1) {
      map.setView(
        [visitadoras[0].ultimaUbicLat, visitadoras[0].ultimaUbicLng],
        16,
        { animate: false }
      );
    } else {
      const bounds: [number, number][] = visitadoras.map((v) => [
        v.ultimaUbicLat,
        v.ultimaUbicLng,
      ]);
      map.fitBounds(bounds, { padding: [60, 60], animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(visitadoras.map((v) => [v.ultimaUbicLat, v.ultimaUbicLng]))]);

  return null;
}

export default function LiveMap({ visitadoras }: { visitadoras: Visitadora[] }) {
  return (
    <div className="card overflow-hidden h-[520px]">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFit visitadoras={visitadoras} />
        {visitadoras.map((v) => (
          <CircleMarker
            key={v.id}
            center={[v.ultimaUbicLat, v.ultimaUbicLng]}
            radius={10}
            pathOptions={{ color: "#2E6DA4", fillColor: "#2E6DA4", fillOpacity: 0.8 }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {v.name}
            </Tooltip>
            <Popup>
              <strong>{v.name}</strong>
              <br />
              Última actualización:{" "}
              {new Date(v.ultimaUbicHora).toLocaleTimeString("es-GT")}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
