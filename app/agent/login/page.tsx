'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/agent/LoginForm';
import { useAuth } from '@/lib/mockAuth';
import { useEffect } from 'react';

export default function AgentLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuth();

  const handleLogin = (agent: { name: string; id: number }) => {
    login(agent.name);
  };

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/agent/dashboard');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return null; 

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Agent Sign-In 
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your name to access the agent dashboard
          </p>
        </div>
        <div className="flex justify-center">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    </main>
  );
} 