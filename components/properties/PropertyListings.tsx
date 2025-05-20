'use client';

import React, { useState } from 'react';
import { Property } from '@prisma/client';
import PropertyCard from '@/components/properties/PropertyCard';
import MapView from '@/components/properties/MapView';
import { MapIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';

/**
 * Props for the PropertyListings component
 * @interface PropertyListingsProps
 * @property {Property[]} properties - Array of property objects to be displayed
 * @property {string} [location] - Optional location search term to determine if map view should be shown
 */
interface PropertyListingsProps {
  properties: Property[];
  location?: string;
}

/**
 * PropertyListings Component
 * 
 * Displays a grid of property cards with optional map view. If no properties are provided, shows a message.
 * 
 * @component
 * @param {PropertyListingsProps} props - Component props
 * @returns {JSX.Element} A grid of property cards or a "no properties" message
 * 
 * @example
 * ```tsx
 * const properties = [
 *   {
 *     id: '1',
 *     title: 'Modern Apartment',
 *     price: 500000,
 *     // ... other property fields
 *   }
 * ];
 * 
 * return <PropertyListings properties={properties} location="Chicago" />;
 * ```
 */
const PropertyListings: React.FC<PropertyListingsProps> = React.memo(({ properties, location }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Show map view if location is provided
  React.useEffect(() => {
    if (location) {
      setViewMode('map');
    }
  }, [location]);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No properties found</p>
      </div>
    );
  }

  const handlePropertySelect = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
  };

  return (
    <div className="w-full">
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ViewColumnsIcon className="w-5 h-5 inline-block mr-1" />
            List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapIcon className="w-5 h-5 inline-block mr-1" />
            Map
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`${viewMode === 'map' ? 'flex gap-4' : ''}`}>
        {viewMode === 'map' && (
          <div className="w-2/3 h-[600px] rounded-xl overflow-hidden border border-gray-200">
            <MapView
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={handlePropertySelect}
            />
          </div>
        )}
        <div className={`${viewMode === 'map' ? 'w-1/3' : 'w-full'}`}>
          <div className={`grid gap-5 ${viewMode === 'map' ? '' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {properties.map((property) => (
              <div
                key={property.id}
                className={`transition-all duration-200 ${
                  selectedPropertyId === property.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyListings.displayName = 'PropertyListings';

export default PropertyListings; 