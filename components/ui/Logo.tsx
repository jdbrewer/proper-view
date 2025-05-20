import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
      <span className="inline-block align-middle">
        <img src="/images/proper_view_logo.png" alt="ProperView logo" width={64} height={64} className="h-42 w-42 object-contain mx-auto" style={{ minWidth: 64 }} />
      </span>
    </Link>
  );
} 