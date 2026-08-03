import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildStyledWorkbook } from "@/lib/excel";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");

  const commissions = await prisma.commission.findMany({
    where: mes ? { mes } : {},
    include: {
      doctor: { select: { nombre: true, perteneceA: true } },
      pagadoPor: { select: { name: true } },
    },
    orderBy: [{ mes: "desc" }, { createdAt: "desc" }],
  });

  const workbook = await buildStyledWorkbook({
    sheetName: "Comisiones",
    title: `Reporte de Comisiones${mes ? ` — ${mes}` : ""} — Hospital San Ángel`,
    generatedBy: user.name,
    columns: [
      { header: "Mes", key: "mes", width: 10 },
      { header: "Médico", key: "medico", width: 24 },
      { header: "Lugar", key: "lugar", width: 22 },
      { header: "Monto cobrado", key: "montoCobrado", width: 16 },
      { header: "Porcentaje", key: "porcentaje", width: 12 },
      { header: "Comisión", key: "comision", width: 16 },
      { header: "Estado", key: "estado", width: 12 },
      { header: "Fecha de pago", key: "fechaPago", width: 18 },
      { header: "Recibido por", key: "recibidoPor", width: 20 },
      { header: "Entregó (visitadora)", key: "entrego", width: 20 },
    ],
    rows: commissions.map((c) => ({
      mes: c.mes,
      medico: c.doctor.nombre,
      lugar: c.doctor.perteneceA,
      montoCobrado: `Q${c.montoCobrado.toFixed(2)}`,
      porcentaje: `${c.porcentaje}%`,
      comision: `Q${c.montoComision.toFixed(2)}`,
      estado: c.estado === "PAGADA" ? "Pagada" : "Pendiente",
      fechaPago: c.fechaPago ? c.fechaPago.toLocaleString("es-GT") : "",
      recibidoPor: c.recibidoPor ?? "",
      entrego: c.pagadoPor?.name ?? "",
    })),
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="comisiones${mes ? `-${mes}` : ""}.xlsx"`,
    },
  });
}
