export default function Logo({ size = 96 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Hospital San Ángel"
    >
      <circle cx="50" cy="50" r="48" fill="#2E6DA4" />
      <rect x="44" y="20" width="12" height="60" rx="3" fill="#FFFFFF" />
      <rect x="20" y="44" width="60" height="12" rx="3" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="6" fill="#3BB273" />
    </svg>
  );
}
