import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const [doctors, doctorVisitsToday, patientVisitsToday, pacientesInternados, pendingTokens] =
    await Promise.all([
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
    ]);

  const stats = [
    { label: "Médicos / lugares activos", value: doctors, href: "/medicos", icon: "🩺" },
    { label: "Pacientes internados", value: pacientesInternados, href: "/visitas-pacientes", icon: "🛏️" },
    {
      label: "Visitas a médicos hoy",
      value: doctorVisitsToday,
      href: "/visitas-medicos",
      icon: "📋",
    },
    {
      label: "Visitas a pacientes hoy",
      value: patientVisitsToday,
      href: "/visitas-pacientes",
      icon: "🧑‍🤝‍🧑",
    },
  ];

  if (isAdmin) {
    stats.push({
      label: "Solicitudes de borrado pendientes",
      value: pendingTokens,
      href: "/solicitudes",
      icon: "🔑",
    });
  }

  const isEmptySystem = doctors === 0 && pacientesInternados === 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-brand-black">
          Hola, {user?.name}
        </h1>
        <p className="text-gray-500 text-sm">
          Resumen de actividad del sistema
        </p>
      </div>

      {isEmptySystem && (
        <div className="card p-5 flex items-center gap-4 bg-blue-50/50">
          <span className="text-3xl">👋</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-5 hover:shadow-md transition-shadow flex items-start gap-3"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-3xl font-semibold text-brand-blue">
                {s.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-medium text-brand-black mb-3">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/visitas-medicos" className="btn-primary px-4 py-2 text-sm">
            + Registrar visita a médico
          </Link>
          <Link
            href="/visitas-pacientes"
            className="btn-primary px-4 py-2 text-sm"
          >
            + Registrar visita a paciente
          </Link>
          <Link
            href="/medicos"
            className="px-4 py-2 text-sm rounded-xl border border-brand-blue text-brand-blue"
          >
            + Agregar médico
          </Link>
        </div>
      </div>
    </div>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
