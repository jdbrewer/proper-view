"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/mockAuth';
import PropertyForm from '@/components/agent/PropertyForm';
import { Property } from '@prisma/client';

export default function PropertyEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/agent/login');
      return;
    }

    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError('Failed to load property');
      }
    };

    fetchProperty();
  }, [id, router, isAuthenticated, hydrated]);

  const handleSubmit = async (formData: Partial<Property>) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      router.push('/agent/dashboard');
    } catch (err) {
      setError('Failed to update property');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <PropertyForm
        property={property}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
} 