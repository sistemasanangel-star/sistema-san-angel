export default function CodenestFooter() {
  return (
    <a
      href="https://www.codenest.business/"
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center gap-1 mt-6 opacity-90 hover:opacity-100 transition-opacity"
    >
      <img src="/codenest-logo.png" alt="Codenest" className="h-10 w-auto" />
      <span className="text-[11px] text-gray-400">
        Desarrollado por <span className="font-medium text-gray-500">Codenest</span> ·
        codenest.business
      </span>
    </a>
  );
}
