import { prisma } from "@/lib/db";
import OpinionForm from "./OpinionForm";

export default async function OpinionPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true, nombre: true, perteneceA: true },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray px-4 py-8">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-brand-black text-center">
          Hospital San Ángel
        </h1>
        <p className="text-sm text-gray-500 text-center mb-4">
          {doctor ? doctor.perteneceA : "Buzón de opinión"}
        </p>
        <OpinionForm doctorId={doctor?.id ?? null} />
      </div>
    </div>
  );
}
