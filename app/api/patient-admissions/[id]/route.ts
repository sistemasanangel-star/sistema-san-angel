import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { action, habitacion } = await req.json(); // action: "alta" | "reactivar"

  if (action === "alta") {
    const admission = await prisma.patientAdmission.update({
      where: { id },
      data: { activo: false, fechaAlta: new Date() },
    });
    return NextResponse.json({ admission });
  }

  if (action === "reactivar") {
    const admission = await prisma.patientAdmission.update({
      where: { id },
      data: { activo: true, fechaAlta: null },
    });
    return NextResponse.json({ admission });
  }

  if (habitacion !== undefined) {
    const admission = await prisma.patientAdmission.update({
      where: { id },
      data: { habitacion },
    });
    return NextResponse.json({ admission });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
