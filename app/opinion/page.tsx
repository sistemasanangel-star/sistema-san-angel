import OpinionGeneralForm from "./OpinionGeneralForm";

export default function OpinionGeneralPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray px-4 py-8">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-brand-black text-center">
          Hospital San Ángel
        </h1>
        <p className="text-sm text-gray-500 text-center mb-4">Buzón de opinión</p>
        <OpinionGeneralForm />
      </div>
    </div>
  );
}
