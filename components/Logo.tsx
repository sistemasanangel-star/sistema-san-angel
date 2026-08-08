export default function Logo({ size = 96 }: { size?: number }) {
  return (
    <img
      src="/logo-san-angel.jpg"
      alt="Hospital San Ángel"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain rounded-md"
    />
  );
}
