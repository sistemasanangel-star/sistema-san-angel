import ComisionesClient from "./ComisionesClient";

export default function ComisionesPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-gray-500 text-sm mb-6">
        Al entregar el pago al médico, la firma de quien recibe y la
        ubicación GPS son obligatorias.
      </p>
      <ComisionesClient />
    </div>
  );
}
