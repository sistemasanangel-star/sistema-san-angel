import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const estado = searchParams.get("estado");

  const commissions = await prisma.commission.findMany({
    where: {
      ...(mes ? { mes } : {}),
      ...(estado ? { estado } : {}),
    },
    include: {
      doctor: { select: { nombre: true, perteneceA: true, categoria: true } },
      pagadoPor: { select: { name: true } },
    },
    orderBy: [{ mes: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ commissions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede registrar comisiones" }, { status: 403 });
  }

  const { doctorId, mes, montoCobrado, porcentaje } = await req.json();

  if (!doctorId || !mes || montoCobrado == null || porcentaje == null) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ error: "Mes inválido" }, { status: 400 });
  }

  const montoComision = (Number(montoCobrado) * Number(porcentaje)) / 100;

  const commission = await prisma.commission.create({
    data: {
      doctorId,
      mes,
      montoCobrado: Number(montoCobrado),
      porcentaje: Number(porcentaje),
      montoComision,
      createdById: user.id,
    },
  });

  return NextResponse.json({ commission }, { status: 201 });
}
