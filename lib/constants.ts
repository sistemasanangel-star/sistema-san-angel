export const CATEGORIAS_LUGAR = [
  { value: "SANATORIO", label: "Sanatorio" },
  { value: "CLINICA_PRIVADA", label: "Clínica privada" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CENTRO_SALUD", label: "Centro de salud (público)" },
  { value: "COMADRONA", label: "Comadrona" },
  { value: "FARMACIA", label: "Farmacia" },
  { value: "LABORATORIO", label: "Laboratorio clínico" },
  { value: "CONSULTORIO", label: "Consultorio particular" },
  { value: "OTRO", label: "Otro" },
] as const;

export function categoriaLabel(value: string) {
  return CATEGORIAS_LUGAR.find((c) => c.value === value)?.label ?? value;
}

export const QUESTION_TYPES = [
  { value: "TEXTO", label: "Texto libre" },
  { value: "SI_NO", label: "Sí / No" },
  { value: "OPCION_MULTIPLE", label: "Opción múltiple" },
  { value: "ESCALA", label: "Escala (1-5)" },
  { value: "NUMERO", label: "Número" },
] as const;

export function questionTypeLabel(value: string) {
  return QUESTION_TYPES.find((c) => c.value === value)?.label ?? value;
}

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50212345678";

export const TARGET_TYPE_LABEL: Record<string, string> = {
  DOCTOR: "Médico / lugar",
  PATIENT_VISIT: "Visita a paciente",
  DOCTOR_VISIT: "Visita a médico",
};
