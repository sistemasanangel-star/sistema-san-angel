import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    select: { id: true, nombre: true, perteneceA: true },
  });

  if (!doctor) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ doctor });
}
