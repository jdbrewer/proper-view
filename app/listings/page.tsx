import { prisma } from '@/lib/prisma';
import ListingsClient from '@/components/properties/ListingsClient';

export default async function ListingsPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ListingsClient properties={properties} />
      </div>
    </main>
  );
} 