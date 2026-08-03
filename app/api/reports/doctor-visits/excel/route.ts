import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildStyledWorkbook } from "@/lib/excel";
import { categoriaLabel } from "@/lib/constants";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const visitadoraId = searchParams.get("visitadoraId");

  const where: Record<string, unknown> = {};
  if (user.role !== "ADMIN") where.visitadoraId = user.id;
  else if (visitadoraId) where.visitadoraId = visitadoraId;

  if (from || to) {
    where.fecha = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
    };
  }

  const visits = await prisma.doctorVisit.findMany({
    where,
    include: { visitadora: { select: { name: true } }, doctor: true },
    orderBy: { fecha: "desc" },
  });

  const workbook = await buildStyledWorkbook({
    sheetName: "Visitas a Médicos",
    title: "Reporte de Visitas a Médicos — Hospital San Ángel",
    generatedBy: user.name,
    columns: [
      { header: "Fecha", key: "fecha", width: 14 },
      { header: "Hora", key: "hora", width: 10 },
      { header: "Visitadora", key: "visitadora", width: 20 },
      { header: "Médico/Lugar", key: "medico", width: 24 },
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Recibido por", key: "recibidoPor", width: 20 },
      { header: "Firmado", key: "firmado", width: 10 },
      { header: "GPS", key: "gps", width: 30 },
      { header: "Observaciones", key: "observaciones", width: 30 },
    ],
    rows: visits.map((v) => ({
      fecha: v.fecha.toLocaleDateString("es-GT"),
      hora: v.fecha.toLocaleTimeString("es-GT"),
      visitadora: v.visitadora.name,
      medico: v.doctor.nombre,
      categoria: categoriaLabel(v.doctor.categoria),
      recibidoPor: v.recibidoPor,
      firmado: "Sí",
      gps: `https://www.google.com/maps?q=${v.gpsLat},${v.gpsLng}`,
      observaciones: v.observaciones ?? "",
    })),
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="visitas-medicos.xlsx"`,
    },
  });
}
