import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Stethoscope,
  BedDouble,
  ClipboardList,
  HeartPulse,
  KeyRound,
  Hand,
} from "lucide-react";
import { categoriaLabel, categoriaColor } from "@/lib/constants";
import { WeekVisitsChart, CategoryDonutChart } from "./DashboardCharts";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const sevenDaysAgo = startOfDay(daysAgo(6));

  const [
    doctors,
    doctorVisitsToday,
    patientVisitsToday,
    pacientesInternados,
    pendingTokens,
    doctorVisitsWeek,
    patientVisitsWeek,
    categoriaGroups,
  ] = await Promise.all([
    prisma.doctor.count({ where: { active: true } }),
    prisma.doctorVisit.count({
      where: { fecha: { gte: startOfToday() } },
    }),
    prisma.patientVisit.count({
      where: { fecha: { gte: startOfToday() } },
    }),
    prisma.patientAdmission.count({ where: { activo: true } }),
    isAdmin
      ? prisma.deleteToken.count({ where: { status: "PENDIENTE" } })
      : Promise.resolve(0),
    prisma.doctorVisit.findMany({
      where: { fecha: { gte: sevenDaysAgo } },
      select: { fecha: true },
    }),
    prisma.patientVisit.findMany({
      where: { fecha: { gte: sevenDaysAgo } },
      select: { fecha: true },
    }),
    prisma.doctor.groupBy({
      by: ["categoria"],
      where: { active: true },
      _count: { _all: true },
    }),
  ]);

  const weekData = buildWeekData(doctorVisitsWeek, patientVisitsWeek);
  const categoryData = categoriaGroups
    .map((g) => ({
      name: categoriaLabel(g.categoria),
      value: g._count._all,
      color: categoriaColor(g.categoria).text,
    }))
    .sort((a, b) => b.value - a.value);

  const stats = [
    {
      label: "Médicos activos",
      value: doctors,
      href: "/medicos",
      icon: Stethoscope,
      bg: "#EAF1F8",
      color: "#2E6DA4",
    },
    {
      label: "Pacientes internados",
      value: pacientesInternados,
      href: "/visitas-pacientes",
      icon: BedDouble,
      bg: "#FDECF3",
      color: "#DB2777",
    },
    {
      label: "Visitas a médicos hoy",
      value: doctorVisitsToday,
      href: "/visitas-medicos",
      icon: ClipboardList,
      bg: "#F1EBFC",
      color: "#7C3AED",
    },
    {
      label: "Visitas a pacientes hoy",
      value: patientVisitsToday,
      href: "/visitas-pacientes",
      icon: HeartPulse,
      bg: "#E7F8F5",
      color: "#0E9488",
    },
    ...(isAdmin
      ? [
          {
            label: "Solicitudes pendientes",
            value: pendingTokens,
            href: "/solicitudes",
            icon: KeyRound,
            bg: pendingTokens > 0 ? "rgba(228,87,76,0.1)" : "#FEF3E2",
            color: pendingTokens > 0 ? "#c8443a" : "#B45309",
            alert: pendingTokens > 0,
          },
        ]
      : []),
  ];

  const isEmptySystem = doctors === 0 && pacientesInternados === 0;
  const recentActivity = isAdmin ? await getRecentActivity() : [];
  const today = new Date().toLocaleDateString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-brand-black">
          Hola, {user?.name?.split(" ")[0] ?? "de nuevo"}
        </h1>
        <p className="text-sm text-gray-500 capitalize">{today}</p>
      </div>

      {isEmptySystem && (
        <div className="card p-5 flex items-center gap-4 bg-blue-50/40 animate-pop">
          <span className="icon-chip" style={{ width: "3rem", height: "3rem" }}>
            <Hand size={22} strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-medium text-brand-black">
              Aún no hay nada registrado
            </p>
            <p className="text-sm text-gray-500">
              Empieza agregando un médico o registrando tu primera visita con
              los botones de abajo.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <span
                className="icon-chip"
                style={{ width: "2.25rem", height: "2.25rem", background: s.bg, color: s.color }}
              >
                <Icon size={17} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-2xl font-semibold leading-none text-brand-black">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-brand-black">
              Visitas de la semana
            </h2>
          </div>
          <div className="p-4">
            <WeekVisitsChart data={weekData} />
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-brand-black">
              Médicos por categoría
            </h2>
          </div>
          <div className="p-4">
            <CategoryDonutChart data={categoryData} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {isAdmin ? (
          <>
            <Link href="/medicos" className="btn-primary px-4 py-2 text-sm">
              + Agregar médico
            </Link>
            <Link
              href="/informes"
              className="px-4 py-2 text-sm rounded-lg border btn-outline btn-outline-blue"
            >
              Ver informes
            </Link>
            <Link
              href="/solicitudes"
              className="px-4 py-2 text-sm rounded-lg border btn-outline btn-outline-blue"
            >
              Revisar solicitudes
            </Link>
          </>
        ) : (
          <>
            <Link href="/visitas-medicos" className="btn-primary px-4 py-2 text-sm">
              + Registrar visita a médico
            </Link>
            <Link href="/visitas-pacientes" className="btn-primary px-4 py-2 text-sm">
              + Registrar visita a paciente
            </Link>
            <Link
              href="/medicos"
              className="px-4 py-2 text-sm rounded-lg border btn-outline btn-outline-blue"
            >
              + Agregar médico
            </Link>
          </>
        )}
      </div>

      {isAdmin && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-brand-black">
              Actividad reciente de las visitadoras
            </h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm px-5 py-6">Sin actividad reciente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="font-medium px-5 py-2.5">Tipo</th>
                    <th className="font-medium px-5 py-2.5">Descripción</th>
                    <th className="font-medium px-5 py-2.5">Visitadora</th>
                    <th className="font-medium px-5 py-2.5 whitespace-nowrap">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-2.5 text-gray-500">
                        {a.type === "medico" ? "Médico" : "Paciente"}
                      </td>
                      <td className="px-5 py-2.5 text-brand-black">{a.description}</td>
                      <td className="px-5 py-2.5 text-gray-600">{a.visitadora}</td>
                      <td className="px-5 py-2.5 text-gray-400 whitespace-nowrap">
                        {a.fecha.toLocaleString("es-GT", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildWeekData(
  doctorVisits: { fecha: Date }[],
  patientVisits: { fecha: Date }[]
) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    return {
      key: dayKey(d),
      label: d.toLocaleDateString("es-GT", { weekday: "short" }),
      medicos: 0,
      pacientes: 0,
    };
  });
  const index = new Map(days.map((d, i) => [d.key, i]));

  for (const v of doctorVisits) {
    const i = index.get(dayKey(v.fecha));
    if (i !== undefined) days[i].medicos++;
  }
  for (const v of patientVisits) {
    const i = index.get(dayKey(v.fecha));
    if (i !== undefined) days[i].pacientes++;
  }

  return days;
}

async function getRecentActivity() {
  const [doctorVisits, patientVisits] = await Promise.all([
    prisma.doctorVisit.findMany({
      take: 8,
      orderBy: { fecha: "desc" },
      include: { visitadora: { select: { name: true } }, doctor: { select: { nombre: true } } },
    }),
    prisma.patientVisit.findMany({
      take: 8,
      orderBy: { fecha: "desc" },
      include: {
        visitadora: { select: { name: true } },
        admission: { select: { habitacion: true } },
      },
    }),
  ]);

  const merged = [
    ...doctorVisits.map((v) => ({
      id: `dv-${v.id}`,
      type: "medico" as const,
      description: `Visita a médico: ${v.doctor.nombre}`,
      visitadora: v.visitadora.name,
      fecha: v.fecha,
    })),
    ...patientVisits.map((v) => ({
      id: `pv-${v.id}`,
      type: "paciente" as const,
      description: `Visita a paciente: ${v.paciente}${
        v.admission ? ` (Hab. ${v.admission.habitacion})` : ""
      }`,
      visitadora: v.visitadora.name,
      fecha: v.fecha,
    })),
  ];

  return merged.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 8);
}
