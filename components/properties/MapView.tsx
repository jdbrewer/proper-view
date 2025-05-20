'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@prisma/client';

// You'll need to replace this with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
console.log('Mapbox token:', mapboxgl.accessToken);

type PropertyWithLocation = Property & {
  latitude?: number | null;
  longitude?: number | null;
};

interface MapViewProps {
  properties: PropertyWithLocation[];
  selectedPropertyId?: number;
  onPropertySelect?: (propertyId: number) => void;
}

const MapView: React.FC<MapViewProps> = ({ properties, selectedPropertyId, onPropertySelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-96, 37.8], // Default center of US
      zoom: 3
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each property
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const el = document.createElement('div');
      el.className = `property-marker ${selectedPropertyId === property.id ? 'selected' : ''}`;
      el.innerHTML = `
        <div class="marker-content">
          <span class="price">$${property.price.toLocaleString()}</span>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      if (onPropertySelect) {
        el.addEventListener('click', () => onPropertySelect(property.id));
      }

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [properties, selectedPropertyId, mapLoaded, onPropertySelect]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: 600 }}>
      <style jsx global>{`
        .property-marker {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          border: 2px solid #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
        }
        .mapboxgl-popup {
          max-width: 300px;
        }
        .mapboxgl-popup-content {
          padding: 15px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default MapView; 