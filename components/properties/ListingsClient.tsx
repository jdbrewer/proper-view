"use client";

import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyListings from './PropertyListings';
import { Property } from '@prisma/client';

/**
 * Props for the ListingsClient component
 * @interface ListingsClientProps
 * @property {Property[]} properties - Array of properties to display
 */
interface ListingsClientProps {
  properties: Property[];
}

/**
 * Filter criteria for property search
 * @interface Filters
 * @property {string} location - Location search term
 * @property {number} minPrice - Minimum price filter
 * @property {number} maxPrice - Maximum price filter
 * @property {number} bedrooms - Number of bedrooms filter
 * @property {boolean} [showAllStatuses] - Whether to show all property statuses
 */
interface Filters {
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  showAllStatuses?: boolean;
}

/**
 * Parses filter values from URL search parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Filters} Parsed filter values
 */
function parseFiltersFromSearchParams(searchParams: URLSearchParams): Filters {
  return {
    location: searchParams.get('location') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 0,
    bedrooms: Number(searchParams.get('bedrooms')) || 0,
    showAllStatuses: searchParams.get('showAllStatuses') === 'true',
  };
}

/**
 * Converts filter values to URL query string
 * @param {Filters} filters - Filter values to convert
 * @returns {string} URL query string
 */
function filtersToQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.location) params.set('location', filters.location);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.bedrooms) params.set('bedrooms', String(filters.bedrooms));
  if (filters.showAllStatuses) params.set('showAllStatuses', 'true');
  return params.toString();
}

/**
 * Loading state component for the Suspense boundary
 */
function ListingsLoading() {
  return (
    <div className="w-full p-8 text-center">
      <p className="text-gray-600">Loading property listings...</p>
    </div>
  );
}

/**
 * Inner component that uses the useSearchParams hook
 */
function ListingsContent({ properties }: ListingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [announcement, setAnnouncement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL
  const [filters, setFilters] = useState<Filters>(() => parseFiltersFromSearchParams(searchParams));
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Keep filters in sync with URL
  useEffect(() => {
    setFilters(parseFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  // Update URL when filters change
  const handleFilterChange = useCallback(async (newFilters: Filters) => {
    setIsLoading(true);
    setError(null);
    setFilters(newFilters);
    const query = filtersToQuery(newFilters);
    try {
      await router.replace(`?${query}`, { scroll: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update filters. Please try again.';
      setError(errorMessage);
      console.error('Failed to update URL:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Memoize filtered properties to prevent unnecessary recalculations
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Status filter
      if (!filters.showAllStatuses && property.status !== 'active') {
        return false;
      }
      // Location filter (case-insensitive partial match)
      if (filters.location.trim() && !property.address.toLowerCase().includes(filters.location.toLowerCase().trim())) {
        return false;
      }
      // Price range filter
      if (filters.minPrice > 0 && property.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice > 0 && property.price > filters.maxPrice) {
        return false;
      }
      // Bedrooms filter
      if (filters.bedrooms > 0 && property.bedrooms < filters.bedrooms) {
        return false;
      }
      return true;
    });
  }, [properties, filters]);

  // Announce filter results to screen readers
  useEffect(() => {
    const filterDescription = [
      filters.location && `in ${filters.location}`,
      filters.minPrice > 0 && `priced above $${filters.minPrice.toLocaleString()}`,
      filters.maxPrice > 0 && `priced below $${filters.maxPrice.toLocaleString()}`,
      filters.bedrooms > 0 && `with ${filters.bedrooms}+ bedrooms`,
      filters.showAllStatuses && 'including sold and pending properties'
    ].filter(Boolean).join(', ');

    setAnnouncement(
      `Showing ${filteredProperties.length} of ${properties.length} properties${filterDescription ? ` ${filterDescription}` : ''}`
    );
  }, [filteredProperties.length, properties.length, filters]);

  return (
    <>
      {/* Status Announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div 
          className="w-full p-4 bg-blue-50 border border-blue-200 rounded-md mb-4"
          role="status"
          aria-label="Loading properties"
        >
          <p className="text-blue-700">Updating property listings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div 
          className="w-full p-4 bg-red-50 border border-red-200 rounded-md mb-4"
          role="alert"
          aria-label="Error message"
        >
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* <h2 className="text-2xl font-bold text-gray-900 mb-8 mt-8">All Properties</h2> */}
      {/* Results Count */}
      {/* <div 
        className="mb-4 text-gray-500 text-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {filteredProperties.length} of {properties.length} properties
      </div> */}

      {/* Empty State */}
      {filteredProperties.length === 0 ? (
        <div 
          className="w-full p-8 bg-gray-50 rounded-lg text-center"
          role="status"
          aria-label="No properties found"
        >
          <p className="text-gray-600">No properties match your search criteria. Try adjusting your filters.</p>
        </div>
      ) : (
        <PropertyListings 
          properties={filteredProperties}
          location={filters.location}
          filters={filters}
          onFilterChange={handleFilterChange}
          setViewMode={setViewMode}
          aria-label="Property listings grid"
        />
      )}
    </>
  );
}

/**
 * ListingsClient Component
 * 
 * Manages the display and filtering of property listings. Handles URL-based filter state,
 * property filtering, and provides accessibility features for screen readers.
 * 
 * @component
 * @param {ListingsClientProps} props - Component props
 * @returns {JSX.Element} A section containing filtered property listings
 * 
 * @example
 * ```tsx
 * const properties = [
 *   {
 *     id: 1,
 *     title: 'Modern Apartment',
 *     price: 500000,
 *     bedrooms: 2,
 *     status: 'active',
 *     address: '123 Main St'
 *   }
 * ];
 * 
 * return <ListingsClient properties={properties} />;
 * ```
 */
const ListingsClient: React.FC<ListingsClientProps> = ({ properties }) => {
  return (
    <section 
      data-testid="property-listings" 
      className="w-full"
      aria-label="Property listings"
    >
      <Suspense fallback={<ListingsLoading />}>
        <ListingsContent properties={properties} />
      </Suspense>
    </section>
  );
};

export default React.memo(ListingsClient);