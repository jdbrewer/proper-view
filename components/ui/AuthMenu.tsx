"use client";
import { useAuth } from "@/lib/mockAuth";
import Link from "next/link";
import { useState, useRef } from 'react';

export default function AuthMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {!isAuthenticated ? (
        <Link href="/agent/login" className="text-gray-700 font-medium hover:text-blue-600 text-lg">Sign In</Link>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            className="text-gray-700 font-medium text-lg px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {user}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 animate-fade-in">
              <Link
                href="/agent/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-left w-full"
                onClick={() => setDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
} 