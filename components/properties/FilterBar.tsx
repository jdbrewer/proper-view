import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
 * @property {(mode: 'list' | 'map') => void} setViewMode - Callback function to set view mode
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
const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, setViewMode }) => {
  const [isBedroomDropdownOpen, setIsBedroomDropdownOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Local state for all filters
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  // For mobile, keep a separate draft state
  const [mobileDraftFilters, setMobileDraftFilters] = useState<Filters>(filters);

  // Sync local state with filters if filters change externally
  useEffect(() => {
    setLocalFilters(filters);
    setMobileDraftFilters(filters);
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

  // On desktop, update immediately; on mobile, only update draft
  const handleShowAllStatusesChange = useCallback(() => {
    if (isMobile) {
      setMobileDraftFilters(prev => ({ ...prev, showAllStatuses: !prev.showAllStatuses }));
    } else {
      setLocalFilters(prev => ({ ...prev, showAllStatuses: !prev.showAllStatuses }));
    }
  }, [isMobile]);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isMobile) {
      setMobileDraftFilters(prev => ({ ...prev, location: e.target.value }));
    } else {
      setLocalFilters(prev => ({ ...prev, location: e.target.value }));
    }
  }, [isMobile]);

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
    if (isMobile) {
      setMobileDraftFilters(prev => ({ ...prev, minPrice: value }));
    } else {
      setLocalFilters(prev => ({ ...prev, minPrice: value }));
    }
  }, [isMobile]);

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
    if (isMobile) {
      setMobileDraftFilters(prev => ({ ...prev, maxPrice: value }));
    } else {
      setLocalFilters(prev => ({ ...prev, maxPrice: value }));
    }
  }, [isMobile]);

  const handleBedroomSelect = useCallback((bedrooms: number) => {
    setIsBedroomDropdownOpen(false);
    if (isMobile) {
      setMobileDraftFilters(prev => ({ ...prev, bedrooms }));
    } else {
      setLocalFilters(prev => ({ ...prev, bedrooms }));
    }
  }, [isMobile]);

  // On desktop, submit changes immediately
  useEffect(() => {
    if (!isMobile) {
      if (localFilters.showAllStatuses !== filters.showAllStatuses ||
          localFilters.bedrooms !== filters.bedrooms ||
          localFilters.location !== filters.location ||
          localFilters.minPrice !== filters.minPrice ||
          localFilters.maxPrice !== filters.maxPrice) {
        onFilterChange(localFilters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters, isMobile]);

  // Handle form submit (Apply Filters on mobile, Search on desktop)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isMobile) {
      onFilterChange(mobileDraftFilters);
      setIsMobileFiltersOpen(false);
      setViewMode?.('list');
    } else {
      onFilterChange(localFilters);
    }
  }, [isMobile, mobileDraftFilters, localFilters, onFilterChange, setViewMode]);

  // When closing mobile drawer with X, discard changes
  const handleMobileDrawerClose = useCallback(() => {
    setIsMobileFiltersOpen(false);
    setMobileDraftFilters(filters); // Reset to last applied filters
  }, [filters]);

  // When opening the mobile drawer, always reset mobileDraftFilters to the latest filters
  const handleOpenMobileDrawer = useCallback(() => {
    setMobileDraftFilters(filters);
    setIsMobileFiltersOpen(true);
  }, [filters]);

  // Switch UI
  const Switch = (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-auto">
      <span>Show Sold & Pending</span>
      <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          checked={isMobile ? !!mobileDraftFilters.showAllStatuses : !!localFilters.showAllStatuses}
          onChange={handleShowAllStatusesChange}
          className="sr-only"
        />
        <span
          className={`block w-10 h-6 rounded-full transition-colors duration-200 ${
            (isMobile ? mobileDraftFilters.showAllStatuses : localFilters.showAllStatuses) ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        ></span>
        <span
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform duration-200 ${
            (isMobile ? mobileDraftFilters.showAllStatuses : localFilters.showAllStatuses) ? 'translate-x-4' : ''
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
      className={`fixed inset-0 z-50 md:hidden ${
        isMobileFiltersOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          ref={filtersRef}
          className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
            <button
              type="button"
              onClick={handleMobileDrawerClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* Mobile Filter Form Content */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={mobileDraftFilters.location}
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
                        value={mobileDraftFilters.minPrice || ''}
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
                        value={mobileDraftFilters.maxPrice || ''}
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
                    {mobileDraftFilters.bedrooms && mobileDraftFilters.bedrooms > 0
                      ? `${mobileDraftFilters.bedrooms}+`
                      : 'Any'}
                  </button>
                  {isBedroomDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      <button
                        type="button"
                        onClick={() => { handleBedroomSelect(0); setIsBedroomDropdownOpen(false); }}
                        className={`w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                          mobileDraftFilters.bedrooms === 0 ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
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
                            mobileDraftFilters.bedrooms === opt ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''
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

          {/* Show All Statuses Switch */}
          {Switch}

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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