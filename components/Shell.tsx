"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import type { SessionUser } from "@/lib/auth";

const NAV_COMMON = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/medicos", label: "Médicos", icon: "🩺" },
];

const NAV_VISITADORA_ONLY = [
  { href: "/visitas-medicos", label: "Visitas a médicos", icon: "📋" },
  { href: "/visitas-pacientes", label: "Visitas a pacientes", icon: "🧑‍🤝‍🧑" },
  { href: "/jornada", label: "Mi jornada", icon: "📍" },
];

const NAV_TAIL_COMMON = [
  { href: "/informes", label: "Informes", icon: "📊" },
  { href: "/solicitudes", label: "Solicitudes de borrado", icon: "🔑" },
];

const NAV_ADMIN_EXTRA = [
  { href: "/mapa", label: "Mapa en vivo", icon: "🗺️" },
  { href: "/opiniones", label: "Opiniones QR", icon: "💬" },
  { href: "/admin/preguntas", label: "Preguntas (visitas)", icon: "❓" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙️" },
];

export default function Shell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items =
    user.role === "ADMIN"
      ? [...NAV_COMMON, ...NAV_TAIL_COMMON, ...NAV_ADMIN_EXTRA]
      : [...NAV_COMMON, ...NAV_VISITADORA_ONLY, ...NAV_TAIL_COMMON];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-brand-black text-white shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <Logo size={32} />
          <span className="font-semibold text-sm leading-tight">
            Hospital
            <br />
            San Ángel
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-gray-400 px-2">
            {user.name} · {user.role === "ADMIN" ? "Administrador" : "Visitadora"}
          </p>
          <button
            onClick={logout}
            className="mt-2 w-full text-left text-sm px-2 py-2 rounded-lg hover:bg-white/10 text-gray-200"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-brand-black text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-semibold text-sm">San Ángel</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-xl" aria-label="Abrir menú">
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 modal-overlay bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="modal-panel absolute right-0 top-0 h-full w-72 bg-brand-black text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-semibold text-sm">Menú</span>
              <button onClick={() => setOpen(false)} className="text-xl">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active ? "bg-brand-blue text-white" : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/10">
              <p className="text-xs text-gray-400 px-2">
                {user.name} · {user.role === "ADMIN" ? "Administrador" : "Visitadora"}
              </p>
              <button
                onClick={logout}
                className="mt-2 w-full text-left text-sm px-2 py-2 rounded-lg hover:bg-white/10 text-gray-200"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-16 md:pt-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
