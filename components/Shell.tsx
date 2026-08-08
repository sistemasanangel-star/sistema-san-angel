"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  DollarSign,
  MapPin,
  BarChart3,
  KeyRound,
  Map,
  MessageSquare,
  HelpCircle,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import Logo from "./Logo";
import type { SessionUser } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_COMMON: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/medicos", label: "Médicos", icon: Stethoscope },
];

const NAV_VISITADORA_ONLY: NavItem[] = [
  { href: "/visitas-medicos", label: "Visitas a médicos", icon: ClipboardList },
  { href: "/visitas-pacientes", label: "Visitas a pacientes", icon: HeartPulse },
  { href: "/comisiones", label: "Comisiones", icon: DollarSign },
  { href: "/jornada", label: "Mi jornada", icon: MapPin },
];

const NAV_TAIL_COMMON: NavItem[] = [
  { href: "/informes", label: "Informes", icon: BarChart3 },
  { href: "/solicitudes", label: "Solicitudes de borrado", icon: KeyRound },
];

const NAV_ADMIN_EXTRA: NavItem[] = [
  { href: "/mapa", label: "Mapa en vivo", icon: Map },
  { href: "/admin/comisiones", label: "Comisiones", icon: DollarSign },
  { href: "/opiniones", label: "Opiniones QR", icon: MessageSquare },
  { href: "/admin/preguntas", label: "Preguntas (visitas)", icon: HelpCircle },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

const ALL_ITEMS = [
  ...NAV_COMMON,
  ...NAV_VISITADORA_ONLY,
  ...NAV_TAIL_COMMON,
  ...NAV_ADMIN_EXTRA,
];

function pageTitle(pathname: string) {
  return ALL_ITEMS.find((i) => i.href === pathname)?.label ?? "";
}

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

  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-1">
      {/* Icon rail — desktop */}
      <aside className="hidden md:flex md:w-[68px] md:flex-col items-center bg-brand-black shrink-0 py-4">
        <Link href="/dashboard" className="mb-4">
          <Logo size={30} />
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-gray-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={1.75} />
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex items-center justify-center w-11 h-11 rounded-lg text-gray-500 hover:bg-white/[0.08] hover:text-gray-200"
        >
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-brand-black text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-semibold text-sm">San Ángel</span>
        </div>
        <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="p-1">
          <Menu size={22} />
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
              <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      active ? "bg-brand-blue text-white" : "text-gray-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.75} />
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
                className="mt-2 w-full text-left text-sm px-2 py-2 rounded-lg hover:bg-white/[0.06] text-gray-200"
              >
                Cerrar sesión
              </button>
              <a
                href="https://www.codenest.business/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-1.5 px-2 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                Desarrollado por
                <span className="font-semibold text-gray-300">code</span>
                <span className="font-semibold" style={{ color: "#A78BFA" }}>nest</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0">
        {/* Top bar — desktop */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white shrink-0">
          <h1 className="text-base font-semibold text-brand-black">
            {pageTitle(pathname)}
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="https://www.codenest.business/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
            >
              Desarrollado por{" "}
              <span className="font-semibold" style={{ color: "#7C3AED" }}>
                codenest
              </span>
            </a>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-brand-black">{user.name}</p>
              <p className="text-xs text-gray-400">
                {user.role === "ADMIN" ? "Administrador" : "Visitadora"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-blue-light text-brand-blue flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:bg-brand-blue-light hover:text-brand-blue transition-colors"
            >
              <LogOut size={18} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden overflow-y-auto">
          <div key={pathname} className="animate-page">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
