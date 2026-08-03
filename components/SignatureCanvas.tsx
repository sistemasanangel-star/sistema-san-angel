"use client";

import { useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";

export default function SignatureCanvas({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
    }

    const pad = new SignaturePadLib(canvas, { penColor: "#1A1A1A" });
    padRef.current = pad;
    pad.addEventListener("endStroke", () => {
      onChange(pad.isEmpty() ? null : pad.toDataURL("image/png"));
    });

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-gray-300 rounded-xl bg-white">
        <canvas ref={canvasRef} className="w-full h-40 rounded-xl touch-none" />
      </div>
      <button
        type="button"
        onClick={() => {
          padRef.current?.clear();
          onChange(null);
        }}
        className="self-start text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600"
      >
        Limpiar firma
      </button>
    </div>
  );
}
