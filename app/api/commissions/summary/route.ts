import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");

  const commissions = await prisma.commission.findMany({
    where: mes ? { mes } : {},
    include: { doctor: { select: { nombre: true, perteneceA: true } } },
  });

  const byDoctor = new Map<
    string,
    { doctorId: string; nombre: string; perteneceA: string; montoCobrado: number; montoComision: number; pagado: number; pendiente: number; count: number }
  >();

  for (const c of commissions) {
    const key = c.doctorId;
    if (!byDoctor.has(key)) {
      byDoctor.set(key, {
        doctorId: c.doctorId,
        nombre: c.doctor.nombre,
        perteneceA: c.doctor.perteneceA,
        montoCobrado: 0,
        montoComision: 0,
        pagado: 0,
        pendiente: 0,
        count: 0,
      });
    }
    const entry = byDoctor.get(key)!;
    entry.montoCobrado += c.montoCobrado;
    entry.montoComision += c.montoComision;
    entry.count += 1;
    if (c.estado === "PAGADA") entry.pagado += c.montoComision;
    else entry.pendiente += c.montoComision;
  }

  const porMedico = Array.from(byDoctor.values()).sort(
    (a, b) => b.montoComision - a.montoComision
  );

  const totales = commissions.reduce(
    (acc, c) => {
      acc.montoCobrado += c.montoCobrado;
      acc.montoComision += c.montoComision;
      if (c.estado === "PAGADA") acc.pagado += c.montoComision;
      else acc.pendiente += c.montoComision;
      return acc;
    },
    { montoCobrado: 0, montoComision: 0, pagado: 0, pendiente: 0 }
  );

  const meses = Array.from(
    new Set((await prisma.commission.findMany({ select: { mes: true } })).map((m) => m.mes))
  ).sort((a, b) => b.localeCompare(a));

  return NextResponse.json({ porMedico, totales, meses });
}
