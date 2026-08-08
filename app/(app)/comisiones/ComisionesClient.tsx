"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import SignatureCanvas from "@/components/SignatureCanvas";
import { DollarSign, MapPin, PenLine } from "lucide-react";

type Commission = {
  id: string;
  mes: string;
  montoCobrado: number;
  porcentaje: number;
  montoComision: number;
  estado: string;
  fechaPago: string | null;
  recibidoPor: string | null;
  pagadoPor: { name: string } | null;
  doctor: { nombre: string; perteneceA: string };
};

function money(n: number) {
  return `Q${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mesLabel(mes: string) {
  const [y, m] = mes.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-GT", { month: "long", year: "numeric" });
}

export default function ComisionesClient() {
  const [pendientes, setPendientes] = useState<Commission[]>([]);
  const [pagadas, setPagadas] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<Commission | null>(null);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    const [pRes, doneRes] = await Promise.all([
      fetch("/api/commissions?estado=PENDIENTE"),
      fetch("/api/commissions?estado=PAGADA"),
    ]);
    const pData = await pRes.json();
    const doneData = await doneRes.json();
    setPendientes(pData.commissions ?? []);
    setPagadas((doneData.commissions ?? []).slice(0, 10));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className="card p-3 text-sm text-brand-blue bg-blue-50">{toast}</div>
      )}

      <div>
        <h2 className="font-medium text-brand-black mb-3">Pendientes de pago</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay comisiones pendientes.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {pendientes.map((c) => (
              <div key={c.id} className="card card-interactive p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="icon-chip" style={{ width: "2rem", height: "2rem" }}>
                    <DollarSign size={16} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-black text-sm sm:text-base truncate">
                      {c.doctor.nombre}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{c.doctor.perteneceA}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 capitalize">{mesLabel(c.mes)}</p>
                <p className="text-lg sm:text-2xl font-semibold text-brand-black">
                  {money(c.montoComision)}
                </p>
                <p className="text-xs text-gray-400">
                  {c.porcentaje}% de {money(c.montoCobrado)} cobrado
                </p>
                <button
                  onClick={() => setPaying(c)}
                  className="btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm mt-2"
                >
                  Pagar comisión
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-medium text-brand-black mb-3">Pagadas recientemente</h2>
        {pagadas.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no has pagado ninguna comisión.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pagadas.map((c) => (
              <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-black">{c.doctor.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {mesLabel(c.mes)} · Recibió: {c.recibidoPor} ·{" "}
                    {c.fechaPago && new Date(c.fechaPago).toLocaleDateString("es-GT")}
                  </p>
                </div>
                <span className="badge-ok text-xs px-2 py-1 rounded-full font-medium">
                  {money(c.montoComision)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {paying && (
        <PagarComisionModal
          commission={paying}
          onClose={() => setPaying(null)}
          onPaid={() => {
            setPaying(null);
            setToast("Comisión pagada correctamente.");
            load();
          }}
        />
      )}
    </div>
  );
}

function PagarComisionModal({
  commission,
  onClose,
  onPaid,
}: {
  commission: Commission;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [recibidoPor, setRecibidoPor] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [firma, setFirma] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function captureGps() {
    if (!navigator.geolocation) {
      setError("Este navegador no soporta geolocalización");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setError("No se pudo obtener la ubicación GPS");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const ready = Boolean(recibidoPor && gps && firma);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSaving(true);
    const res = await fetch(`/api/commissions/${commission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "pagar",
        recibidoPor,
        firmaImagen: firma,
        gpsLat: gps!.lat,
        gpsLng: gps!.lng,
        observaciones,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al registrar el pago");
      return;
    }
    onPaid();
  }

  return (
    <>
      <Modal title={`Pagar comisión — ${commission.doctor.nombre}`} onClose={onClose} wide>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="card p-3 bg-blue-50/50 text-sm">
            Monto a entregar:{" "}
            <span className="font-semibold text-brand-blue">
              {money(commission.montoComision)}
            </span>{" "}
            ({commission.porcentaje}% de {money(commission.montoCobrado)})
          </div>

          <div>
            <label className="text-sm font-medium">Recibido por *</label>
            <input
              className="input-field mt-1"
              value={recibidoPor}
              onChange={(e) => setRecibidoPor(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={captureGps}
              disabled={gpsLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-brand-blue text-brand-blue"
            >
              <MapPin size={14} /> {gpsLoading ? "Obteniendo..." : "Obtener ubicación GPS *"}
            </button>
            {gps && <span className="badge-ok text-xs px-2 py-1 rounded-full">GPS ✓</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSignature(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-brand-blue text-brand-blue"
            >
              <PenLine size={14} /> Firma de quien recibe *
            </button>
            {firma && <span className="badge-ok text-xs px-2 py-1 rounded-full">Firma ✓</span>}
          </div>

          <div>
            <label className="text-sm font-medium">Observaciones (opcional)</label>
            <textarea
              className="input-field mt-1"
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <div className="flex gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${gps ? "badge-ok" : "badge-pending"}`}>
              GPS {gps ? "✓" : "pendiente"}
            </span>
            <span className={`px-2 py-1 rounded-full ${firma ? "badge-ok" : "badge-pending"}`}>
              Firma {firma ? "✓" : "pendiente"}
            </span>
            <span className={`px-2 py-1 rounded-full ${recibidoPor ? "badge-ok" : "badge-pending"}`}>
              Receptor {recibidoPor ? "✓" : "pendiente"}
            </span>
          </div>

          {error && <p className="text-sm text-brand-red">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={!ready || saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? "Guardando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      </Modal>

      {showSignature && (
        <Modal title="Firma de quien recibe" onClose={() => setShowSignature(false)}>
          <SignatureCanvas onChange={setFirma} />
          <div className="flex justify-end mt-4">
            <button onClick={() => setShowSignature(false)} className="btn-primary px-4 py-2 text-sm">
              Listo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
