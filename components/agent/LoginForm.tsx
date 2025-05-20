import React, { useState, useCallback } from 'react';

/**
 * Props for the LoginForm component
 * @interface LoginFormProps
 * @property {(agent: { name: string; id: number }) => void} onLogin - Callback function when login is successful
 */
interface LoginFormProps {
  onLogin: (agent: { name: string; id: number }) => void;
}

/**
 * LoginForm Component
 * 
 * Provides a form for agent login with name-based authentication.
 * Includes accessibility features and error handling.
 * 
 * @component
 * @param {LoginFormProps} props - Component props
 * @returns {JSX.Element} A form for agent login
 * 
 * @example
 * ```tsx
 * const handleLogin = (agent) => {
 *   console.log('Logged in as:', agent.name);
 * };
 * 
 * return <LoginForm onLogin={handleLogin} />;
 * ```
 */
export default function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnnouncement('');

    if (!name.trim()) {
      setError('Please enter your name');
      setAnnouncement('Error: Please enter your name');
      return;
    }

    setLoading(true);
    setAnnouncement('Logging in...');

    try {
      const res = await fetch(`/api/agents?name=${encodeURIComponent(name.trim())}`);
      if (!res.ok) {
        throw new Error('Agent not found. Please enter a valid agent name.');
      }
      const agent = await res.json();
      localStorage.setItem('agentId', agent.id);
      localStorage.setItem('agentName', agent.name);
      setAnnouncement(`Successfully logged in as ${agent.name}`);
      onLogin(agent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error logging in. Please try again.';
      setError(errorMessage);
      setAnnouncement(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [name, onLogin]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Status Announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        aria-label="Agent login form"
        noValidate
      >
        <div>
          <label 
            htmlFor="agent-name" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Agent Name
          </label>
          <input
            id="agent-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
            disabled={loading}
          />
        </div>

        {error && (
          <div 
            id="login-error"
            className="p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-label="Error message"
          >
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          aria-label={loading ? 'Logging in...' : 'Log in'}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
} 