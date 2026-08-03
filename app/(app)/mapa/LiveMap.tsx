"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import type { Visitadora } from "./MapaClient";

const DEFAULT_CENTER: [number, number] = [14.6349, -90.5069];

export default function LiveMap({ visitadoras }: { visitadoras: Visitadora[] }) {
  const center: [number, number] =
    visitadoras.length > 0
      ? [visitadoras[0].ultimaUbicLat, visitadoras[0].ultimaUbicLng]
      : DEFAULT_CENTER;

  return (
    <div className="card overflow-hidden h-[520px]">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
