"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@prisma/client";
import { useTheme } from "next-themes";

// You'll need to replace this with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
console.log("Mapbox token:", mapboxgl.accessToken);

type PropertyWithLocation = Property & {
  latitude?: number | null;
  longitude?: number | null;
};

interface MapViewProps {
  properties: PropertyWithLocation[];
  selectedPropertyId?: number;
  onPropertySelect?: (propertyId: number) => void;
  panToPropertyId?: number;
  resetTrigger?: number;
}

const MapView: React.FC<MapViewProps> = ({
  properties,
  selectedPropertyId,
  onPropertySelect,
  panToPropertyId,
  resetTrigger,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const previousBounds = useRef<mapboxgl.LngLatBounds | null>(null);
  const [hoveredProperty, setHoveredProperty] =
    useState<PropertyWithLocation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const markerElements = useRef<{ [id: number]: HTMLDivElement }>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        resolvedTheme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
      center: [-96, 37.8], // Default center of US
      zoom: 3,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [resolvedTheme]);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setStyle(
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11"
    );
  }, [resolvedTheme, mapLoaded]);

  // Create markers only when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    markerElements.current = {};

    // Add markers for each property
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const el = document.createElement("div");
      el.className = `property-marker${
        selectedPropertyId === property.id ? " selected" : ""
      }`;
      el.innerHTML = `
        <div class="marker-content">
          <span class="price">${property.price.toLocaleString()}</span>
        </div>
      `;
      markerElements.current[property.id] = el;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      if (onPropertySelect) {
        el.addEventListener("click", () => onPropertySelect(property.id));
      }
      // Tooltip preview on hover (desktop only)
      el.addEventListener("mouseenter", (e: MouseEvent) => {
        if (window.innerWidth > 768) {
          setHoveredProperty(property);
          setTooltipPos({ x: e.clientX, y: e.clientY });
        }
      });
      el.addEventListener("mouseleave", () => {
        setHoveredProperty(null);
        setTooltipPos(null);
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach((marker) => {
        bounds.extend(marker.getLngLat());
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15, // Prevent zooming in too far on mobile
      });
    }
  }, [properties, mapLoaded, onPropertySelect]);

  // Update marker selection class when selectedPropertyId changes
  useEffect(() => {
    Object.entries(markerElements.current).forEach(([id, el]) => {
      if (!el) return;
      if (Number(id) === selectedPropertyId) {
        el.classList.add("selected");
        // Restart pulse animation
        el.style.animation = "none";
        // Force reflow
        void el.offsetWidth;
        el.style.animation = "";
      } else {
        el.classList.remove("selected");
        el.style.animation = "";
      }
    });
  }, [selectedPropertyId]);

  // Pan to property when panToPropertyId changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (panToPropertyId) {
      const property = properties.find((p) => p.id === panToPropertyId);
      if (property && property.latitude && property.longitude) {
        // Store current bounds before zooming in
        if (map.current) {
          previousBounds.current = map.current.getBounds();
        }
        // Check if property is already in view (within bounds)
        const bounds = map.current.getBounds();
        const lng = property.longitude;
        const lat = property.latitude;
        if (bounds && bounds.contains([lng, lat])) {
          // No pan/zoom needed, just highlight marker
          return;
        }
        // Subtle pan/zoom: center on property, keep current zoom if close, otherwise zoom in a bit
        const currentZoom = map.current.getZoom();
        const targetZoom = Math.max(currentZoom, 13); // Don't zoom in too much
        map.current.flyTo({
          center: [lng, lat],
          zoom: targetZoom,
          speed: 2,
          curve: 1.2,
        });
      }
    }
  }, [panToPropertyId, mapLoaded, properties]);

  // Reset to previous bounds when resetTrigger changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !previousBounds.current) return;
    map.current.fitBounds(previousBounds.current, { padding: 50, maxZoom: 15 });
  }, [resetTrigger, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[300px] md:min-h-[600px]"
    >
      {/* Tooltip preview for hovered marker (desktop only) */}
      {hoveredProperty && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 min-w-[220px] max-w-xs"
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 10 }}
        >
          <div className="font-bold text-lg text-blue-700 dark:text-blue-300 mb-1">
            {hoveredProperty.title}
          </div>
          <div className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
            ${hoveredProperty.price.toLocaleString()}
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            {hoveredProperty.address}
          </div>
        </div>
      )}
      <style jsx global>{`
        .property-marker {
          width: 40px;
          height: 40px;
          background: ${resolvedTheme === "dark" ? "#1f2937" : "white"};
          border-radius: 50%;
          border: 2px solid #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .property-marker:hover {
          transform: scale(1.1);
        }
        .property-marker.selected {
          background: #2563eb;
          color: white;
        }
        .marker-content {
          font-size: 12px;
          font-weight: 600;
          color: ${resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937"};
        }
        .mapboxgl-popup {
          max-width: 300px;
        }
        .mapboxgl-popup-content {
          padding: 15px;
          border-radius: 8px;
          background: ${resolvedTheme === "dark" ? "#1f2937" : "white"};
          color: ${resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937"};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .mapboxgl-popup-close-button {
          color: ${resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937"};
          font-size: 16px;
          padding: 4px 8px;
        }
        .mapboxgl-popup-close-button:hover {
          background: ${resolvedTheme === "dark" ? "#374151" : "#f3f4f6"};
        }
        .mapboxgl-ctrl-group {
          background: ${resolvedTheme === "dark" ? "#1f2937" : "white"};
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .mapboxgl-ctrl-group button {
          color: ${resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937"};
        }
        .mapboxgl-ctrl-group button:hover {
          background: ${resolvedTheme === "dark" ? "#374151" : "#f3f4f6"};
        }
      `}</style>
    </div>
  );
};

export default MapView;
