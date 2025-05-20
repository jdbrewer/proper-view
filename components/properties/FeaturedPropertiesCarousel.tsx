"use client";
import React, { useRef } from "react";
import { Property } from "@prisma/client";
import Link from "next/link";
import PropertyCard from './PropertyCard';

interface FeaturedPropertiesCarouselProps {
  properties: Property[];
}

const FeaturedPropertiesCarousel: React.FC<FeaturedPropertiesCarouselProps> = ({ properties }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!properties || properties.length === 0) return null;
  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            style={{ display: properties.length > 1 ? 'block' : 'none' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" className="text-gray-700 dark:text-gray-200" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            style={{ display: properties.length > 1 ? 'block' : 'none' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" className="text-gray-700 dark:text-gray-200" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {properties.map((property) => (
          <div key={property.id} className="min-w-[320px] max-w-xs flex-shrink-0 snap-start" style={{ scrollSnapAlign: "start" }}>
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPropertiesCarousel; 