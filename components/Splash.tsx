"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function Splash() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), 850);
    const nav = setTimeout(() => router.replace("/login"), 1100);
    return () => {
      clearTimeout(leave);
      clearTimeout(nav);
    };
  }, [router]);

  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-brand-blue transition-opacity duration-300"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="animate-splash">
        <Logo size={120} />
      </div>
      <p className="text-white font-semibold tracking-wide text-lg">
        Hospital San Ángel
      </p>
    </div>
  );
}
