import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PropertyDetail from '@/components/properties/PropertyDetail';
import { Property } from '@prisma/client';
import { Metadata } from 'next';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProperty(id: string): Promise<Property | null> {
  const property = await prisma.property.findUnique({
    where: { id: parseInt(id) }
  });
  return property;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);
  
  if (!property) {
    return {
      title: 'Property Not Found'
    };
  }

  return {
    title: `${property.title} - ProperView`,
    description: property.description
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);

  if (!property) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <PropertyDetail property={property} />
    </main>
  );
} 