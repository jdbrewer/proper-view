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
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
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

  // Add local draft state for dropdowns
  const [draftBeds, setDraftBeds] = useState(localFilters.bedrooms);
  const [draftBaths, setDraftBaths] = useState(localFilters.bathrooms);
  const [draftMinPrice, setDraftMinPrice] = useState(localFilters.minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(localFilters.maxPrice);

  // When opening dropdowns, sync draft state
  useEffect(() => {
    if (isBedroomDropdownOpen) {
      setDraftBeds(localFilters.bedrooms);
      setDraftBaths(localFilters.bathrooms);
    }
  }, [isBedroomDropdownOpen, localFilters.bedrooms, localFilters.bathrooms]);
  useEffect(() => {
    if (priceDropdownOpen) {
      setDraftMinPrice(localFilters.minPrice);
      setDraftMaxPrice(localFilters.maxPrice);
    }
  }, [priceDropdownOpen, localFilters.minPrice, localFilters.maxPrice]);

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

  // Helper for summary text
  function bedsBathsSummary() {
    const beds = localFilters.bedrooms > 0 ? `${localFilters.bedrooms}+ Beds` : '';
    const baths = localFilters.bathrooms > 0 ? `${localFilters.bathrooms}+ Baths` : '';
    return beds && baths ? `${beds}, ${baths}` : beds || baths || 'Beds & Baths';
  }
  function priceSummary() {
    if (localFilters.minPrice && localFilters.maxPrice) return `$${localFilters.minPrice.toLocaleString()}–$${localFilters.maxPrice.toLocaleString()}`;
    if (localFilters.minPrice) return `$${localFilters.minPrice.toLocaleString()}+`;
    if (localFilters.maxPrice) return `Up to $${localFilters.maxPrice.toLocaleString()}`;
    return 'Price';
  }

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
                    <div
                      ref={bedroomsRef}
                      className="absolute left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 min-w-[260px] flex flex-col gap-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
                    >
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Bedrooms</div>
                        <div className="flex gap-2">
                          {[0,1,2,3,4,5,6].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDraftBeds(opt)}
                              className={`px-3 py-1 rounded-full border text-xs ${draftBeds === opt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              {opt === 0 ? 'Any' : `${opt}+`}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftBeds(0);
                          }}
                          className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          aria-label="Clear beds and baths filters"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newFilters = { ...localFilters, bedrooms: draftBeds };
                            setLocalFilters(newFilters);
                            setIsBedroomDropdownOpen(false);
                            onFilterChange(newFilters);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
                        >
                          Apply
                        </button>
                      </div>
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
                    <div
                      ref={bathroomsRef}
                      className="absolute left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 min-w-[260px] flex flex-col gap-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
                    >
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Bathrooms</div>
                        <div className="flex gap-2">
                          {[0,1,1.5,2,2.5,3,3.5,4,4.5,5].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDraftBaths(opt)}
                              className={`px-3 py-1 rounded-full border text-xs ${draftBaths === opt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              {opt === 0 ? 'Any' : `${opt}+`}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftBaths(0);
                          }}
                          className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          aria-label="Clear beds and baths filters"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newFilters = { ...localFilters, bathrooms: draftBaths };
                            setLocalFilters(newFilters);
                            setIsBathroomDropdownOpen(false);
                            onFilterChange(newFilters);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
                        >
                          Apply
                        </button>
                      </div>
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

      {/* Desktop Filter Form - Minimal, Elegant, Pill Filter Bar */}
      <form
        className="hidden md:flex w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8 border border-gray-200 dark:border-gray-700 items-center gap-x-3 gap-y-2 flex-wrap"
        onSubmit={handleSubmit}
      >
        {/* Location Search */}
        <div className="flex items-center flex-1 min-w-[220px] max-w-lg relative">
          <input
            id="location"
            name="location"
            type="text"
            placeholder="City, address, or ZIP"
            value={localFilters.location}
            onChange={handleLocationChange}
            className="w-full rounded-full border border-gray-300 dark:border-gray-600 px-5 py-2 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-400 pr-12"
            autoComplete="off"
          />
          {localFilters.location && (
            <button
              type="button"
              onClick={() => setLocalFilters(prev => ({ ...prev, location: '' }))}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear location"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Pill Filter: Price */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsBedroomDropdownOpen(false);
              setIsBathroomDropdownOpen(false);
              setIsMobileFiltersOpen(false);
              setMoreDropdownOpen(false);
              setPriceDropdownOpen(prev => !prev);
            }}
            className={`px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm flex items-center gap-2 transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${priceDropdownOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
          >
            {priceSummary()}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {priceDropdownOpen && (
            <div className="absolute left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 min-w-[260px] flex flex-col gap-3 border border-gray-200 dark:border-gray-700 animate-fade-in">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  placeholder="$ Min"
                  value={draftMinPrice || ''}
                  onChange={e => setDraftMinPrice(Number(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="$ Max"
                  value={draftMaxPrice || ''}
                  onChange={e => setDraftMaxPrice(Number(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[0, 100000, 200000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDraftMinPrice(val)}
                    className={`px-3 py-1 rounded-full border text-xs ${draftMinPrice === val ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {val === 0 ? 'Any' : `$${val.toLocaleString()}`}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[0, 100000, 200000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDraftMaxPrice(val)}
                    className={`px-3 py-1 rounded-full border text-xs ${draftMaxPrice === val ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {val === 0 ? 'Any' : `$${val.toLocaleString()}`}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftMinPrice(0);
                    setDraftMaxPrice(0);
                  }}
                  className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Clear price filters"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newFilters = { ...localFilters, minPrice: draftMinPrice, maxPrice: draftMaxPrice };
                    setLocalFilters(newFilters);
                    setPriceDropdownOpen(false);
                    onFilterChange(newFilters);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pill Filter: Beds & Baths */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPriceDropdownOpen(false);
              setIsBathroomDropdownOpen(false);
              setIsMobileFiltersOpen(false);
              setMoreDropdownOpen(false);
              setIsBedroomDropdownOpen(prev => !prev);
            }}
            className={`px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm flex items-center gap-2 transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isBedroomDropdownOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
          >
            {bedsBathsSummary()}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isBedroomDropdownOpen && (
            <div
              ref={bedroomsRef}
              className="absolute left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 min-w-[260px] flex flex-col gap-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
            >
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Bedrooms</div>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5,6].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDraftBeds(opt)}
                      className={`px-3 py-1 rounded-full border text-xs ${draftBeds === opt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {opt === 0 ? 'Any' : `${opt}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Bathrooms</div>
                <div className="flex gap-2">
                  {[0,1,1.5,2,2.5,3,3.5,4,4.5,5].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDraftBaths(opt)}
                      className={`px-3 py-1 rounded-full border text-xs ${draftBaths === opt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {opt === 0 ? 'Any' : `${opt}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftBeds(0);
                    setDraftBaths(0);
                  }}
                  className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Clear beds and baths filters"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newFilters = { ...localFilters, bedrooms: draftBeds, bathrooms: draftBaths };
                    setLocalFilters(newFilters);
                    setIsBedroomDropdownOpen(false);
                    onFilterChange(newFilters);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pill Filter: More (for advanced filters like status) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPriceDropdownOpen(false);
              setIsBedroomDropdownOpen(false);
              setIsBathroomDropdownOpen(false);
              setIsMobileFiltersOpen(false);
              setMoreDropdownOpen(prev => !prev);
            }}
            className={`px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm flex items-center gap-2 transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${moreDropdownOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
          >
            More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {moreDropdownOpen && (
            <div className="absolute left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 min-w-[220px] flex flex-col gap-3 border border-gray-200 dark:border-gray-700 animate-fade-in">
              <div className="flex items-center gap-2">
                {Switch}
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMoreDropdownOpen(false);
                    onFilterChange(localFilters);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Button (desktop) */}
        <button
          type="submit"
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-full text-base font-semibold shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <MagnifyingGlassIcon className="w-5 h-5 inline-block mr-1" />
          Search
        </button>
      </form>
    </>
  );
};

export default FilterBar; 