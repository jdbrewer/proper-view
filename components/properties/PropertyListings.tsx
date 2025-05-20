'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Property } from '@prisma/client';
import PropertyCard from '@/components/properties/PropertyCard';
import MapView from '@/components/properties/MapView';
import { MapIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import FilterBar from '@/components/properties/FilterBar';

/**
 * Props for the PropertyListings component
 * @interface PropertyListingsProps
 * @property {Property[]} properties - Array of property objects to be displayed
 * @property {string} [location] - Optional location search term to determine if map view should be shown
 * @property {any} filters - Filters for filtering properties
 * @property {(filters: any) => void} onFilterChange - Function to change filters
 * @property {(mode: 'list' | 'map') => void} setViewMode - Function to set view mode
 */
interface PropertyListingsProps {
  properties: Property[];
  location?: string;
  filters: any;
  onFilterChange: (filters: any) => void;
  setViewMode: (mode: 'list' | 'map') => void;
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
const PropertyListings: React.FC<PropertyListingsProps> = React.memo(({ properties, location, filters, onFilterChange, setViewMode }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [viewMode, setLocalViewMode] = useState<'list' | 'map'>('list');
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile && selectedPropertyId && cardRefs.current[selectedPropertyId]) {
      cardRefs.current[selectedPropertyId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedPropertyId, isMobile]);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No properties found</p>
      </div>
    );
  }

  const handlePropertySelect = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
  };

  // Sync parent and local viewMode
  const handleSetViewMode = (mode: 'list' | 'map') => {
    setLocalViewMode(mode);
    setViewMode(mode);
  };

  // Mobile floating toggle buttons
  const MobileMapButton = (
    <button
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
      onClick={() => handleSetViewMode('map')}
      aria-label="Show map view"
    >
      <MapIcon className="w-6 h-6" />
      Map
    </button>
  );
  const MobileListButton = (
    <button
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
      onClick={() => handleSetViewMode('list')}
      aria-label="Show list view"
    >
      <ViewColumnsIcon className="w-6 h-6" />
      List
    </button>
  );

  // Determine if we should show split view (map + list) on desktop
  const hasLocation = Boolean(filters.location && filters.location.trim());

  return (
    <div className="w-full">
      {/* View Toggle - Mobile Only */}
      {isMobile && (
        <div className="md:hidden flex justify-center mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
            <button
              onClick={() => handleSetViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ViewColumnsIcon className="w-5 h-5 inline-block mr-1" />
              List
            </button>
            <button
              onClick={() => handleSetViewMode('map')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <MapIcon className="w-5 h-5 inline-block mr-1" />
              Map
            </button>
          </div>
        </div>
      )}

      {/* Desktop View Toggle - hidden on mobile */}
      {!isMobile && (
        <div className="hidden md:flex justify-end mb-4">
          {/* No toggle, just a label or empty space if you want */}
        </div>
      )}

      <FilterBar filters={filters} onFilterChange={onFilterChange} setViewMode={handleSetViewMode} />

      {/* Content */}
      <div className={
        isMobile
          ? `${viewMode === 'map' ? 'md:flex md:gap-4' : ''} ${viewMode === 'map' ? 'h-[calc(100vh-200px)] md:h-[600px]' : ''}`
          : hasLocation ? 'flex gap-4 h-[600px]' : ''
      }>
        {/* Desktop: Split view, only if location is set */}
        {!isMobile && hasLocation && (
          <>
            <div className="w-2/3 h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <MapView
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
              />
            </div>
            <div className="w-1/3 h-full overflow-y-auto overflow-x-hidden relative">
              <div className="flex flex-col gap-5">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    ref={el => { cardRefs.current[property.id] = el; }}
                    className={`mx-1.5 p-1.5 transition-all duration-200 ${
                      selectedPropertyId === property.id
                        ? 'ring-2 ring-blue-500 rounded-2xl'
                        : ''
                    }`}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {/* Desktop: Grid only if no location */}
        {!isMobile && !hasLocation && (
          <div className="w-full">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div key={property.id} className="w-full">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Mobile: Toggle between map and list */}
        {isMobile && viewMode === 'map' && (
          <>
            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <MapView
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
              />
            </div>
            {MobileListButton}
          </>
        )}
        {isMobile && viewMode === 'list' && (
          <>
            <div className="w-full">
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`w-full p-1.5 transition-all duration-200 ${
                      selectedPropertyId === property.id
                        ? 'ring-2 ring-blue-500 rounded-2xl'
                        : ''
                    }`}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
            {MobileMapButton}
          </>
        )}
      </div>
    </div>
  );
});

export default PropertyListings;