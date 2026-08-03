import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const where = user.role === "ADMIN" ? {} : { requestedById: user.id };

  const tokens = await prisma.deleteToken.findMany({
    where,
    include: { requestedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tokens });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { targetType, targetId, targetLabel } = await req.json();
  if (!targetType || !targetId || !targetLabel) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const existing = await prisma.deleteToken.findFirst({
    where: { targetType, targetId, status: { in: ["PENDIENTE", "APROBADO"] } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una solicitud activa para este registro" },
      { status: 409 }
    );
  }

  const request = await prisma.deleteToken.create({
    data: {
      targetType,
      targetId,
      targetLabel,
      requestedById: user.id,
      status: "PENDIENTE",
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
