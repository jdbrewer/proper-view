import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Interface representing the filter criteria for property search
 * @interface Filters
 * @property {string} location - Location search term
 * @property {number} minPrice - Minimum price filter
 * @property {number} maxPrice - Maximum price filter
 * @property {number} bedrooms - Number of bedrooms filter
 * @property {number} bathrooms - Number of bathrooms filter
 * @property {boolean} [showAllStatuses] - Whether to show all property statuses
 */
interface Filters {
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  showAllStatuses?: boolean;
}

/**
 * Props for the FilterBar component
 * @interface FilterBarProps
 * @property {Filters} filters - Current filter values
 * @property {(filters: Filters) => void} onFilterChange - Callback function when filters change
 * @property {(mode: 'list' | 'map') => void} [setViewMode] - Optional callback to set view mode
 */
interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  setViewMode?: (mode: 'list' | 'map') => void;
}

/**
 * Available bedroom options for filtering
 * @constant
 */
const bedroomOptions = [0, 1, 2, 3, 4, 5, 6];

/**
 * Available bathroom options for filtering
 * @constant
 */
const bathroomOptions = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/**
 * FilterBar Component
 * 
 * Provides a form interface for filtering property listings by location, price range,
 * number of bedrooms, bathrooms, and property status. Includes accessibility features and keyboard
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
const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, setViewMode }) => {
  const [isBedroomDropdownOpen, setIsBedroomDropdownOpen] = useState(false);
  const [isBathroomDropdownOpen, setIsBathroomDropdownOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const bathroomsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Local state for all filters (draft state for both mobile and desktop)
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // Sync local state with filters if filters change externally
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    if (!isBedroomDropdownOpen && !isBathroomDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (bedroomsRef.current && !bedroomsRef.current.contains(event.target as Node)) {
        setIsBedroomDropdownOpen(false);
      }
      if (bathroomsRef.current && !bathroomsRef.current.contains(event.target as Node)) {
        setIsBathroomDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBedroomDropdownOpen, isBathroomDropdownOpen]);

  // Handle keyboard navigation for dropdowns
  useEffect(() => {
    if (!isBedroomDropdownOpen && !isBathroomDropdownOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsBedroomDropdownOpen(false);
        setIsBathroomDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBedroomDropdownOpen, isBathroomDropdownOpen]);

  // Handle click outside to close mobile filters
  useEffect(() => {
    if (!isMobileFiltersOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsMobileFiltersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileFiltersOpen]);

  const handleShowAllStatusesChange = useCallback(() => {
    setLocalFilters(prev => ({ ...prev, showAllStatuses: !prev.showAllStatuses }));
  }, []);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, location: e.target.value }));
  }, []);

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
    setLocalFilters(prev => ({ ...prev, minPrice: value }));
  }, []);

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
    setLocalFilters(prev => ({ ...prev, maxPrice: value }));
  }, []);

  const handleBedroomSelect = useCallback((bedrooms: number) => {
    setIsBedroomDropdownOpen(false);
    setLocalFilters(prev => ({ ...prev, bedrooms }));
  }, []);

  const handleBathroomSelect = useCallback((bathrooms: number) => {
    setIsBathroomDropdownOpen(false);
    setLocalFilters(prev => ({ ...prev, bathrooms }));
  }, []);

  // Handle form submit (Apply Filters/Search on both mobile and desktop)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
    if (isMobile) {
      setIsMobileFiltersOpen(false);
      setViewMode?.('list');
    }
  }, [isMobile, localFilters, onFilterChange, setViewMode]);

  // When closing mobile drawer with X, discard changes
  const handleMobileDrawerClose = useCallback(() => {
    setIsMobileFiltersOpen(false);
    setLocalFilters(filters); // Reset to last applied filters
  }, [filters]);

  // When opening the mobile drawer, always reset localFilters to the latest filters
  const handleOpenMobileDrawer = useCallback(() => {
    setLocalFilters(filters);
    setIsMobileFiltersOpen(true);
  }, [filters]);

  // Switch UI
  const Switch = (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-auto">
      <span>Show Sold & Pending</span>
      <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          checked={localFilters.showAllStatuses}
          onChange={handleShowAllStatusesChange}
          className="sr-only"
        />
        <span
          className={`block w-10 h-6 rounded-full transition-colors duration-200 ${
            localFilters.showAllStatuses ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        ></span>
        <span
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform duration-200 ${
            localFilters.showAllStatuses ? 'translate-x-4' : ''
          }`}
        ></span>
      </span>
    </label>
  );

  // Mobile Filter Button
  const MobileFilterButton = (
    <button
      type="button"
      onClick={handleOpenMobileDrawer}
      className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <FunnelIcon className="w-5 h-5" />
      Filters
    </button>
  );

  // Mobile Filter Drawer
  const MobileFilterDrawer = (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity ${
        isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isMobileFiltersOpen}
    >
      <div
        ref={filtersRef}
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl transform transition-transform ${
          isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
              <button
                type="button"
                onClick={handleMobileDrawerClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Search */}
              <div>
                <label htmlFor="mobile-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  id="mobile-location"
                  name="location"
                  type="text"
                  placeholder="City, address, or ZIP"
                  value={localFilters.location}
                  onChange={handleLocationChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        id="mobile-minPrice"
                        name="minPrice"
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={localFilters.minPrice || ''}
                        onChange={handleMinPriceChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        id="mobile-maxPrice"
                        name="maxPrice"
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={localFilters.maxPrice || ''}
                        onChange={handleMaxPriceChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label htmlFor="mobile-bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bedrooms
                </label>
                <div className="relative" ref={bedroomsRef}>
                  <button
                    type="button"
                    onClick={() => setIsBedroomDropdownOpen(!isBedroomDropdownOpen)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {localFilters.bedrooms && localFilters.bedrooms > 0
                      ? `${localFilters.bedrooms}+`
                      : 'Any'}
                  </button>
                  {isBedroomDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      <button
                        type="button"
                        onClick={() => { handleBedroomSelect(0); setIsBedroomDropdownOpen(false); }}
                        className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                          localFilters.bedrooms === 0 ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        Any
                      </button>
                      {bedroomOptions.slice(1).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { handleBedroomSelect(opt); setIsBedroomDropdownOpen(false); }}
                          className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                            localFilters.bedrooms === opt ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          {opt}+
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label htmlFor="mobile-bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bathrooms
                </label>
                <div className="relative" ref={bathroomsRef}>
                  <button
                    type="button"
                    onClick={() => setIsBathroomDropdownOpen(!isBathroomDropdownOpen)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {localFilters.bathrooms && localFilters.bathrooms > 0
                      ? `${localFilters.bathrooms}+`
                      : 'Any'}
                  </button>
                  {isBathroomDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      <button
                        type="button"
                        onClick={() => { handleBathroomSelect(0); setIsBathroomDropdownOpen(false); }}
                        className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                          localFilters.bathrooms === 0 ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        Any
                      </button>
                      {bathroomOptions.slice(1).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { handleBathroomSelect(opt); setIsBathroomDropdownOpen(false); }}
                          className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                            localFilters.bathrooms === opt ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          {opt}+
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Show All Statuses Switch */}
              <div className="pt-2">
                {Switch}
              </div>

              {/* Apply Filters Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      {MobileFilterButton}

      {/* Mobile Filter Drawer */}
      {MobileFilterDrawer}

      {/* Desktop Filter Form */}
      <form 
        className="hidden md:block w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700" 
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Location Search */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <div className="relative">
              <input
                id="location"
                name="location"
                type="text"
                placeholder="City, address, or ZIP"
                value={localFilters.location}
                onChange={handleLocationChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="flex gap-3 min-w-[240px]">
            <div className="flex-1">
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={localFilters.minPrice || ''}
                  onChange={handleMinPriceChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={localFilters.maxPrice || ''}
                  onChange={handleMaxPriceChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms Dropdown */}
          <div className="min-w-[140px]" ref={bedroomsRef}>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bedrooms
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBedroomDropdownOpen(!isBedroomDropdownOpen)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {localFilters.bedrooms && localFilters.bedrooms > 0
                  ? `${localFilters.bedrooms}+`
                  : 'Any'}
              </button>
              {isBedroomDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleBedroomSelect(0)}
                    className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                      localFilters.bedrooms === 0 ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    Any
                  </button>
                  {bedroomOptions.slice(1).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleBedroomSelect(opt)}
                      className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                        localFilters.bedrooms === opt ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      {opt}+
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bathrooms Dropdown */}
          <div className="min-w-[140px]" ref={bathroomsRef}>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bathrooms
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBathroomDropdownOpen(!isBathroomDropdownOpen)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {localFilters.bathrooms && localFilters.bathrooms > 0
                  ? `${localFilters.bathrooms}+`
                  : 'Any'}
              </button>
              {isBathroomDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleBathroomSelect(0)}
                    className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                      localFilters.bathrooms === 0 ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    Any
                  </button>
                  {bathroomOptions.slice(1).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleBathroomSelect(opt)}
                      className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                        localFilters.bathrooms === opt ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      {opt}+
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Show All Statuses Switch */}
          {Switch}

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 dark:text-white dark:hover:text-white dark:border-gray-700 dark:border text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5 inline-block mr-1" />
            Search
          </button>
        </div>
      </form>
    </>
  );
};

export default FilterBar; 