"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ImageLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Vista ampliada"
        className="max-h-[80vh] bg-white rounded-lg p-4 animate-pop"
      />
    </div>,
    document.body
  );
}
