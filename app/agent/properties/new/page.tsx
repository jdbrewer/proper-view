'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/mockAuth';

export default function NewPropertyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/agent/login');
    }
  }, [isAuthenticated, router]);

  // Fetch agentId by name
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchAgentId = async () => {
      try {
        const res = await fetch(`/api/agents?name=${encodeURIComponent(user)}`);
        if (!res.ok) throw new Error('Failed to fetch agent info');
        const data = await res.json();
        if (data && data.id) {
          setAgentId(data.id);
        } else {
          setAgentId(null);
        }
      } catch (err) {
        setAgentId(null);
      }
    };
    fetchAgentId();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!agentId) {
      setError('Could not determine agent. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const property = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      address: formData.get('address'),
      bedrooms: parseInt(formData.get('bedrooms') as string),
      bathrooms: parseFloat(formData.get('bathrooms') as string),
      status: formData.get('status'),
      agentId: agentId,
    };

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error('Failed to create property');
      }

      router.push('/agent/dashboard');
    } catch (err) {
      setError('Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Property</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              required
              className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="relative">
            <input
              type="text"
              name="address"
              id="address"
              required
              pattern="^[0-9]+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Terrace|Ter|Place|Pl|Square|Sq|Highway|Hwy|Parkway|Pkwy|Suite|Ste|Unit|Floor|Fl|Apartment|Apt|#)[,\s]+[A-Za-z\s]+[,\s]+[A-Z]{2}[,\s]+[0-9]{5}(?:-[0-9]{4})?$"
              title="Please enter a valid address in the format: 1234 Main St, City, ST 12345"
              placeholder="1234 Main St, City, ST 12345"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="group relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="hidden group-hover:block absolute right-0 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                  Format: Street Number, Street Name, City, State ZIP<br/>
                  Example: 3924 Forest View Dr., Washougal, WA 98671
                </div>
              </div>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">Enter the complete address including street number, name, city, state, and ZIP code</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              id="bedrooms"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              id="bathrooms"
              min="0"
              step="0.5"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 