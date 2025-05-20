import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
      <span className="inline-block align-middle">
        {/* Light mode logo */}
        <img
          src="/images/proper_view_logo.png"
          alt="ProperView logo"
          width={64}
          height={64}
          className="h-42 w-42 object-contain mx-auto block dark:hidden"
          style={{ minWidth: 64 }}
        />
        {/* Dark mode logo */}
        <img
          src="/images/proper_view_logo_w.png"
          alt="ProperView logo (dark)"
          width={64}
          height={64}
          className="h-42 w-42 object-contain mx-auto hidden dark:block"
          style={{ minWidth: 64 }}
        />
      </span>
    </Link>
  );
} 