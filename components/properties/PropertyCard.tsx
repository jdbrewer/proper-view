import React from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';
import { Property } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Props for the PropertyCard component
 * @interface PropertyCardProps
 * @property {Property} property - The property data to display
 */
interface PropertyCardProps {
  property: Property;
}

/**
 * Status color mapping for property badges
 * @constant
 */
const statusColors = {
  active: 'bg-green-600',
  pending: 'bg-yellow-500',
  sold: 'bg-red-600',
};

/**
 * PropertyCard Component
 * 
 * Displays a single property in a card format with image, price, details, and status.
 * The card is clickable and links to the property's detail page.
 * 
 * @component
 * @param {PropertyCardProps} props - Component props
 * @returns {JSX.Element} A card displaying property information
 * 
 * @example
 * ```tsx
 * const property = {
 *   id: '1',
 *   title: 'Modern Apartment',
 *   price: 500000,
 *   bedrooms: 2,
 *   bathrooms: 2,
 *   status: 'active',
 *   image: '/images/property1.jpg',
 *   address: '123 Main St'
 * };
 * 
 * return <PropertyCard property={property} />;
 * ```
 */
export default function PropertyCard({ property }: PropertyCardProps) {
  const badge = property.status === 'active' ? 'Active' : property.status === 'pending' ? 'Pending' : 'Sold';
  const propertyDescription = `${property.bedrooms} bedroom, ${property.bathrooms} bathroom ${property.status} property at ${property.address}`;
  
  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform duration-200 hover:scale-[1.02] w-full"
      aria-label={`Property: ${property.title}`}
      role="article"
    >
      <Link 
        href={`/properties/${property.id}`} 
        className="block focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`View details for ${property.title}`}
      >
        <div className="relative w-full aspect-[2/1] bg-gray-100 dark:bg-gray-700">
          <Image
            src={property.image || ''}
            alt={`${property.title} - ${propertyDescription}`}
            fill
            className="object-cover"
            priority
            aria-hidden="false"
          />
          <span 
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow ${statusColors[property.status as keyof typeof statusColors]}`}
            aria-label={`Status: ${badge}`}
          >
            {badge}
          </span>
        </div>
        <div className="p-4">
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">${property.price.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-semibold" aria-label={`${property.bedrooms} bedrooms`}>{property.bedrooms} bds</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold" aria-label={`${property.bathrooms} bathrooms`}>{property.bathrooms} ba</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize" aria-label={`Status: ${badge}`}>{badge}</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1 truncate" aria-label={`Address: ${property.address}`}>
            {property.address}
          </div>
        </div>
      </Link>
    </article>
  );
} 