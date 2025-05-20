'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/mockAuth';
import Dashboard from '@/components/agent/Dashboard';
import { Property } from '@prisma/client';

export default function AgentDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, hydrated } = useAuth();
  const [properties, setProperties] = useState<(Property & {
    views?: number;
    inquiryCount?: number;
    daysOnMarket?: number;
  })[]>([]);
  const [agentId, setAgentId] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/agent/login');
      return;
    }
    if (!user) return;

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
  }, [hydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !agentId) return;
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/agent/properties?agentId=${agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        // Calculate daysOnMarket for each property
        const propertiesWithAnalytics = data.map((p: Property) => ({
          ...p,
          daysOnMarket: Math.max(
            0,
            Math.round((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          ),
        }));
        setProperties(propertiesWithAnalytics);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    fetchProperties();
  }, [hydrated, isAuthenticated, agentId]);

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // The effect will redirect
  }

  const handleAddProperty = () => {
    router.push('/agent/properties/new');
  };

  const handleEditProperty = (id: number) => {
    router.push(`/agent/properties/${id}/edit`);
  };

  const handleDeleteProperty = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await fetch(`/api/properties/${id}`, { method: 'DELETE' });
        setProperties(properties.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Dashboard
        properties={properties}
        onAddProperty={handleAddProperty}
        onEditProperty={handleEditProperty}
        onDeleteProperty={handleDeleteProperty}
      />
    </div>
  );
} 