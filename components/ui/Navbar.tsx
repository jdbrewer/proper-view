"use client";
import Link from "next/link";
import Logo from './Logo';
import AuthMenu from './AuthMenu';

export default function Navbar() {
  return (
    <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
      {/* Left: Listings link */}
      <div className="flex-1 flex items-end">
        <Link href="/listings" className="text-gray-700 font-medium hover:text-blue-600 text-lg mr-6">Buy</Link>
      </div>
      {/* Centered Brand */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <Logo />
      </div>
      {/* Right side */}
      <div className="flex-1 flex justify-end items-center gap-6">
        <AuthMenu />
      </div>
    </nav>
  );
} 