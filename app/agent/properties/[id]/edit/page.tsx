import { use } from 'react';
import PropertyEditPage from '@/components/agent/PropertyEditPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PropertyEditPage id={id} />;
} 