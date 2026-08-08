import JornadaClient from "./JornadaClient";

export default function JornadaPage() {
  return (
    <div className="max-w-md">
      <p className="text-gray-500 text-sm mb-6">
        Comparte tu ubicación mientras estás en jornada activa, para que el
        administrador te vea en el mapa en vivo.
      </p>
      <JornadaClient />
    </div>
  );
}
