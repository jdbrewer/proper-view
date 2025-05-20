"use client";
import Link from "next/link";
import Logo from './Logo';
import AuthMenu from './AuthMenu';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
      {/* Left: Listings link */}
      <div className="flex-1 flex items-end">
        <Link 
          href="/listings" 
          className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 text-lg mr-6"
        >
          Buy
        </Link>
      </div>
      {/* Centered Brand */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <Logo />
      </div>
      {/* Right side */}
      <div className="flex-1 flex justify-end items-center gap-6">
        {/* Theme Toggle */}
        {/* <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button> */}
        <AuthMenu />
      </div>
    </nav>
  );
} 