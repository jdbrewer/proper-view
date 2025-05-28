"use client";

import React, { useState, useEffect, useRef } from "react";
import { Property } from "@prisma/client";
import PropertyCard from "@/components/properties/PropertyCard";
import MapView from "@/components/properties/MapView";
import {
  MapIcon,
  ViewColumnsIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FilterBar from "@/components/properties/FilterBar";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  setViewMode: (mode: "list" | "map") => void;
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
const PropertyListings: React.FC<PropertyListingsProps> = React.memo(
  ({ properties, location, filters, onFilterChange, setViewMode }) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<
      number | undefined
    >();
    const [viewMode, setLocalViewMode] = useState<"list" | "map">("list");
    const [isMobile, setIsMobile] = useState(false);
    const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [showMapOnly, setShowMapOnly] = useState(false);
    const [forceSplitView, setForceSplitView] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [resetTrigger, setResetTrigger] = useState(0);

    // Restore state from URL on mount
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      const selected = params.get("selected");
      if (view === "split") setForceSplitView(true);
      if (view === "map") setShowMapOnly(true);
      if (selected) setSelectedPropertyId(Number(selected));
    }, []);

    // Update URL when split view, map only, or selected property changes
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (forceSplitView) {
        params.set("view", "split");
      } else if (showMapOnly) {
        params.set("view", "map");
      } else {
        params.delete("view");
      }
      if (selectedPropertyId) {
        params.set("selected", String(selectedPropertyId));
      } else {
        params.delete("selected");
      }
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    }, [forceSplitView, showMapOnly, selectedPropertyId]);

    useEffect(() => {
      const checkMobile = () =>
        setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
      if (
        !isMobile &&
        selectedPropertyId &&
        cardRefs.current[selectedPropertyId]
      ) {
        cardRefs.current[selectedPropertyId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, [selectedPropertyId, isMobile]);

    const selectedProperty = properties.find(
      (p) => p.id === selectedPropertyId
    );

    // ESC-to-close modal
    useEffect(() => {
      if (!selectedProperty) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedPropertyId(undefined);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedProperty]);

    // When modal closes, increment resetTrigger to tell MapView to zoom out
    useEffect(() => {
      if (selectedPropertyId === undefined) {
        setResetTrigger((rt) => rt + 1);
      }
    }, [selectedPropertyId]);

    if (properties.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No properties found
          </p>
        </div>
      );
    }

    const handlePropertySelect = (propertyId: number) => {
      setSelectedPropertyId(propertyId);
      if (!isMobile && !hasLocation && showMapOnly) {
        setShowMapOnly(false);
        setForceSplitView(true);
      }
    };

    // Sync parent and local viewMode
    const handleSetViewMode = (mode: "list" | "map") => {
      setLocalViewMode(mode);
      setViewMode(mode);
    };

    // Mobile floating toggle buttons
    const MobileMapButton = (
      <button
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
        onClick={() => handleSetViewMode("map")}
        aria-label="Show map view"
      >
        <MapIcon className="w-6 h-6" />
        Map
      </button>
    );
    const MobileListButton = (
      <button
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
        onClick={() => handleSetViewMode("list")}
        aria-label="Show list view"
      >
        <ViewColumnsIcon className="w-6 h-6" />
        List
      </button>
    );

    // Determine if we should show split view (map + list) on desktop
    const hasLocation = Boolean(filters.location && filters.location.trim());

    // Bidirectional sync: When a card is clicked, highlight and pan to marker on map (do not navigate)
    const handleCardClick = (propertyId: number) => {
      setSelectedPropertyId(propertyId);
      // If on desktop, no location, and not in split view, reveal split view
      if (!isMobile && !hasLocation && !forceSplitView) {
        setForceSplitView(true);
        setShowMapOnly(false);
      }
      // Optionally, you could trigger a pan/zoom on the map here via a ref/callback to MapView
    };

    return (
      <div className="w-full">
        {/* Modal for selected property with animation and backdrop blur */}
        <AnimatePresence>
          {selectedProperty &&
            (isMobile || (showMapOnly && !forceSplitView)) && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPropertyId(undefined)}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-4 relative"
                  initial={{ scale: 0.95, y: 40, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Property details for ${selectedProperty.title}`}
                >
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                    onClick={() => setSelectedPropertyId(undefined)}
                    aria-label="Close property details"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  <PropertyCard
                    property={selectedProperty}
                    clickable={false}
                    showDetailIcon={true}
                    onDetailClick={() =>
                      router.push(`/properties/${selectedProperty.id}`)
                    }
                  />
                  {/* Modal navigation */}
                  <div className="flex justify-between items-center mt-4">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                      onClick={() => {
                        const idx = properties.findIndex(
                          (p) => p.id === selectedProperty.id
                        );
                        const prevIdx =
                          (idx - 1 + properties.length) % properties.length;
                        setSelectedPropertyId(properties[prevIdx].id);
                      }}
                      aria-label="Show previous property"
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                      onClick={() => {
                        const idx = properties.findIndex(
                          (p) => p.id === selectedProperty.id
                        );
                        const nextIdx = (idx + 1) % properties.length;
                        setSelectedPropertyId(properties[nextIdx].id);
                      }}
                      aria-label="Show next property"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
        {/* View Toggle - Mobile Only */}
        {isMobile && (
          <div className="md:hidden flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
              <button
                onClick={() => handleSetViewMode("list")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <ViewColumnsIcon className="w-5 h-5 inline-block mr-1" />
                List
              </button>
              <button
                onClick={() => handleSetViewMode("map")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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

        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          setViewMode={handleSetViewMode}
        />

        {/* Desktop: Map/List toggle above grid when no location is set */}
        {!isMobile && !hasLocation && (
          <div
            className="mb-4 flex justify-between items-center text-gray-500 text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>{properties.length} properties</span>
            {!showMapOnly && !forceSplitView && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold shadow-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-700"
                onClick={() => {
                  setShowMapOnly(true);
                  setForceSplitView(false);
                }}
                aria-label="Show map view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Map
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={
            isMobile
              ? `${viewMode === "map" ? "md:flex md:gap-4" : ""} ${
                  viewMode === "map" ? "h-[calc(100vh-200px)] md:h-[600px]" : ""
                }`
              : hasLocation || forceSplitView
              ? "flex gap-4 h-[600px]"
              : ""
          }
        >
          {/* Desktop: Split view, only if location is set or forced by map selection */}
          {!isMobile && (hasLocation || forceSplitView) && (
            <>
              <div className="w-2/3 h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <MapView
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onPropertySelect={handlePropertySelect}
                  panToPropertyId={selectedPropertyId}
                  resetTrigger={resetTrigger}
                />
              </div>
              <div className="w-1/3 h-full overflow-y-auto overflow-x-hidden relative">
                <div className="flex flex-col gap-5">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      ref={(el) => {
                        cardRefs.current[property.id] = el;
                      }}
                      className={`mx-1.5 p-1.5 transition-all duration-200 ${
                        selectedPropertyId === property.id
                          ? "ring-2 ring-blue-500 rounded-2xl"
                          : ""
                      }`}
                    >
                      <div className="relative group">
                        <PropertyCard property={property} clickable={false} />
                        <button
                          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-blue-100 text-blue-600 shadow group-hover:scale-110 transition"
                          aria-label="View details"
                          onClick={() =>
                            router.push(`/properties/${property.id}`)
                          }
                        >
                          <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Highlight on map"
                          onClick={() => handleCardClick(property.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Desktop: Map only if toggled and no location and not forced split view */}
          {!isMobile && !hasLocation && showMapOnly && !forceSplitView && (
            <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <MapView
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
                resetTrigger={resetTrigger}
              />
            </div>
          )}
          {/* Desktop: Grid only if no location and not map only and not forced split view */}
          {!isMobile && !hasLocation && !showMapOnly && !forceSplitView && (
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
          {isMobile && viewMode === "map" && (
            <>
              <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <MapView
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onPropertySelect={handlePropertySelect}
                  resetTrigger={resetTrigger}
                />
              </div>
              {MobileListButton}
            </>
          )}
          {isMobile && viewMode === "list" && (
            <>
              <div className="w-full">
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className={`w-full p-1.5 transition-all duration-200 ${
                        selectedPropertyId === property.id
                          ? "ring-2 ring-blue-500 rounded-2xl"
                          : ""
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
  }
);

export default PropertyListings;
