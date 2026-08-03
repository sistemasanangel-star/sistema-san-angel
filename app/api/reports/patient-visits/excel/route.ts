import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildStyledWorkbook } from "@/lib/excel";

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

  const visits = await prisma.patientVisit.findMany({
    where,
    include: {
      visitadora: { select: { name: true } },
      doctor: { select: { nombre: true } },
      answers: { include: { question: true } },
    },
    orderBy: { fecha: "desc" },
  });

  const questionTexts = Array.from(
    new Set(visits.flatMap((v) => v.answers.map((a) => a.question.texto)))
  );

  const workbook = await buildStyledWorkbook({
    sheetName: "Visitas a Pacientes",
    title: "Reporte de Visitas a Pacientes — Hospital San Ángel",
    generatedBy: user.name,
    columns: [
      { header: "Fecha", key: "fecha", width: 14 },
      { header: "Hora", key: "hora", width: 10 },
      { header: "Visitadora", key: "visitadora", width: 20 },
      { header: "Paciente", key: "paciente", width: 22 },
      { header: "Médico/Sanatorio asociado", key: "doctor", width: 24 },
      ...questionTexts.map((q, i) => ({ header: q, key: `q${i}`, width: 26 })),
      { header: "GPS", key: "gps", width: 30 },
    ],
    rows: visits.map((v) => {
      const row: Record<string, string> = {
        fecha: v.fecha.toLocaleDateString("es-GT"),
        hora: v.fecha.toLocaleTimeString("es-GT"),
        visitadora: v.visitadora.name,
        paciente: v.paciente,
        doctor: v.doctor?.nombre ?? "",
        gps: v.gpsLat != null ? `https://www.google.com/maps?q=${v.gpsLat},${v.gpsLng}` : "",
      };
      questionTexts.forEach((q, i) => {
        const ans = v.answers.find((a) => a.question.texto === q);
        row[`q${i}`] = ans?.valor ?? "";
      });
      return row;
    }),
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="visitas-pacientes.xlsx"`,
    },
  });
}
