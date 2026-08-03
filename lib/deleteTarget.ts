import { prisma } from "./db";

export async function performDelete(targetType: string, targetId: string) {
  switch (targetType) {
    case "DOCTOR":
      await prisma.doctor.update({
        where: { id: targetId },
        data: { active: false },
      });
      break;
    case "PATIENT_VISIT":
      await prisma.patientVisit.delete({ where: { id: targetId } });
      break;
    case "DOCTOR_VISIT":
      await prisma.doctorVisit.delete({ where: { id: targetId } });
      break;
    default:
      throw new Error("Tipo de objetivo desconocido");
  }
}
