// lib/mockAuthUtils.ts
export const AGENT_KEY = 'agentName';
export const AGENT_ID_KEY = 'agentId';

// Helper to set a cookie (browser only)
function setCookie(name: string, value: string, days = 7) {
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }
}

// Helper to get a cookie (browser only)
function getCookie(name: string): string | null {
  if (typeof document !== 'undefined') {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, null as string | null);
  }
  return null;
}

// Helper to remove a cookie (browser only)
function removeCookie(name: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export function login(name: string, id: number) {
  setCookie(AGENT_KEY, name);
  setCookie(AGENT_ID_KEY, id.toString());
}

export function logout() {
  removeCookie(AGENT_KEY);
  removeCookie(AGENT_ID_KEY);
}

export function getAgentName(): string | null {
  return getCookie(AGENT_KEY);
}

export function getAgentId(): number | null {
  const id = getCookie(AGENT_ID_KEY);
  return id ? parseInt(id, 10) : null;
}

export function isLoggedIn(): boolean {
  return !!getAgentName();
}

// --- Server-side helpers for API routes (Next.js) ---
// Usage: import { cookies } from 'next/headers';
export function getAgentNameFromCookies(cookiesObj: { get: (name: string) => { value: string } | undefined }): string | null {
  return cookiesObj.get(AGENT_KEY)?.value || null;
}

export function getAgentIdFromCookies(cookiesObj: { get: (name: string) => { value: string } | undefined }): number | null {
  const id = cookiesObj.get(AGENT_ID_KEY)?.value;
  return id ? parseInt(id, 10) : null;
}