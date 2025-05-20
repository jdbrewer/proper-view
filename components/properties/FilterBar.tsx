import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * Interface representing the filter criteria for property search
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
 * Props for the FilterBar component
 * @interface FilterBarProps
 * @property {Filters} filters - Current filter values
 * @property {(filters: Filters) => void} onFilterChange - Callback function when filters change
 */
interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

/**
 * Available bedroom options for filtering
 * @constant
 */
const bedroomOptions = [0, 1, 2, 3, 4, 5, 6];

/**
 * FilterBar Component
 * 
 * Provides a form interface for filtering property listings by location, price range,
 * number of bedrooms, and property status. Includes accessibility features and keyboard
 * navigation support.
 * 
 * @component
 * @param {FilterBarProps} props - Component props
 * @returns {JSX.Element} A form containing property search filters
 * 
 * @example
 * ```tsx
 * const filters = {
 *   location: 'New York',
 *   minPrice: 200000,
 *   maxPrice: 500000,
 *   bedrooms: 2,
 *   showAllStatuses: false
 * };
 * 
 * return <FilterBar filters={filters} onFilterChange={handleFilterChange} />;
 * ```
 */
const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const [isBedroomDropdownOpen, setIsBedroomDropdownOpen] = useState(false);
  const bedroomsRef = useRef<HTMLDivElement>(null);

  // Local state for all filters
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // Sync local state with filters if filters change externally
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isBedroomDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (bedroomsRef.current && !bedroomsRef.current.contains(event.target as Node)) {
        setIsBedroomDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBedroomDropdownOpen]);

  // Handle keyboard navigation for dropdown
  useEffect(() => {
    if (!isBedroomDropdownOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsBedroomDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBedroomDropdownOpen]);

  const handleShowAllStatusesChange = useCallback(() => {
    setLocalFilters(prev => {
      // Only update local state, don't call onFilterChange here
      return { ...prev, showAllStatuses: !prev.showAllStatuses };
    });
  }, []);

  // Submit the showAllStatuses change in a useEffect after the render
  useEffect(() => {
    // Skip initial render
    if (localFilters.showAllStatuses !== filters.showAllStatuses) {
      onFilterChange(localFilters);
    }
  }, [localFilters.showAllStatuses, filters.showAllStatuses, localFilters, onFilterChange]);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, location: e.target.value }));
  }, []);

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
    setLocalFilters(prev => ({ ...prev, minPrice: value }));
  }, []);

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
    if (localFilters.minPrice > 0 && value > 0 && value < localFilters.minPrice) {
      return;
    }
    setLocalFilters(prev => ({ ...prev, maxPrice: value }));
  }, [localFilters.minPrice]);

  const handleBedroomSelect = useCallback((bedrooms: number) => {
    setIsBedroomDropdownOpen(false);
    setLocalFilters(prev => ({ ...prev, bedrooms }));
  }, []);

  // Submit the bedroom change in a useEffect after the render
  useEffect(() => {
    // Skip initial render
    if (localFilters.bedrooms !== filters.bedrooms) {
      onFilterChange(localFilters);
    }
  }, [localFilters.bedrooms, filters.bedrooms, localFilters, onFilterChange]);

  // Handle form submit (Enter or Search button)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  // Switch UI
  const Switch = (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 mb-2 ml-auto">
      <span>Show Sold & Pending Properties</span>
      <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          checked={!!localFilters.showAllStatuses}
          onChange={handleShowAllStatusesChange}
          className="sr-only"
        />
        <span
          className={`block w-10 h-6 rounded-full transition-colors duration-200 ${localFilters.showAllStatuses ? 'bg-blue-600' : 'bg-gray-300'}`}
        ></span>
        <span
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform duration-200 ${localFilters.showAllStatuses ? 'translate-x-4' : ''}`}
        ></span>
      </span>
    </label>
  );

  return (
    <form className="w-full bg-white rounded-xl shadow-lg p-6 mb-8 border-t-1 border-gray-100" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Location Search */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="relative">
            <input
              id="location"
              name="location"
              type="text"
              placeholder="City, address, or ZIP"
              value={localFilters.location}
              onChange={handleLocationChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>
        {/* Price Range */}
        <div className="flex gap-3 min-w-[240px]">
          <div className="flex-1">
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="minPrice"
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={handleMinPriceChange}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={handleMaxPriceChange}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
        {/* Bedrooms Dropdown */}
        <div className="min-w-[140px]" ref={bedroomsRef}>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBedroomDropdownOpen(!isBedroomDropdownOpen)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              {localFilters.bedrooms && localFilters.bedrooms > 0
                ? `${localFilters.bedrooms}+`
                : 'Any'}
            </button>
            {isBedroomDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <button
                  type="button"
                  onClick={() => handleBedroomSelect(0)}
                  className={`w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${localFilters.bedrooms === 0 ? 'font-semibold bg-gray-100' : ''}`}
                >
                  Any
                </button>
                {bedroomOptions.slice(1).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleBedroomSelect(opt)}
                    className={`w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${localFilters.bedrooms === opt ? 'font-semibold bg-gray-100' : ''}`}
                  >
                    {opt}+ Beds
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Search Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-6 py-2.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span>Search</span>
        </button>
      </div>
      <div className="flex flex-col gap-2 mt-4 mb-0 sm:flex-row sm:items-center">
        <div className="flex-1" />
        {Switch}
      </div>
    </form>
  );
};

export default FilterBar; 