import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede eliminar directamente. Solicita un token." },
      { status: 403 }
    );
  }

  const { id } = await params;
  await prisma.doctorVisit.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
