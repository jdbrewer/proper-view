"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Property } from '@prisma/client';
import { HomeIcon, CalendarIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import InquiryForm, { InquiryData } from '../agent/InquiryForm';
import Image from 'next/image';

/**
 * Props for the PropertyDetail component
 * @interface PropertyDetailProps
 * @property {(Property & { features?: string[] }) | null | undefined} property - The property data to display, including optional features array
 */
interface PropertyDetailProps {
  property: (Property & { features?: string[] }) | null | undefined;
}

/**
 * Status style mapping for property status badges
 * @constant
 */
const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  sold: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200'
  },
};

/**
 * PropertyDetail Component
 * 
 * Displays detailed information about a property, including images, description,
 * features, and an inquiry form. Tracks property views and handles inquiry submissions.
 * 
 * @component
 * @param {PropertyDetailProps} props - Component props
 * @returns {JSX.Element} A detailed view of the property with inquiry form
 * 
 * @example
 * ```tsx
 * const property = {
 *   id: '1',
 *   title: 'Modern Apartment',
 *   price: 500000,
 *   bedrooms: 2,
 *   bathrooms: 2,
 *   status: 'active',
 *   image: '/images/property1.jpg',
 *   address: '123 Main St',
 *   description: 'Beautiful modern apartment...',
 *   features: ['Parking', 'Pool', 'Gym']
 * };
 * 
 * return <PropertyDetail property={property} />;
 * ```
 */
const PropertyDetail: React.FC<PropertyDetailProps> = ({ property }) => {
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (property && property.id && !hasTrackedView.current) {
      fetch(`/api/properties/${property.id}/view`, { method: 'POST' })
        .catch(error => {
          console.error('Failed to track property view:', error);
        });
      hasTrackedView.current = true;
    }
  }, [property]);

  if (property === undefined) {
    return (
      <div 
        data-testid="property-detail-loading" 
        className="w-full min-h-[400px] flex items-center justify-center"
        role="status"
        aria-label="Loading property details"
      >
        <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
      </div>
    );
  }

  if (property === null) {
    return (
      <div 
        data-testid="property-detail-error" 
        className="w-full min-h-[400px] flex items-center justify-center"
        role="alert"
        aria-label="Property not found"
      >
        <p className="text-gray-600 dark:text-gray-400">Property not found</p>
      </div>
    );
  }

  const status = statusStyles[property.status] || statusStyles.sold;
  const propertyDescription = `${property.bedrooms} bedroom, ${property.bathrooms} bathroom ${property.status} property at ${property.address}`;

  /**
   * Handles the submission of an inquiry form
   * @param {InquiryData} data - The inquiry form data
   */
  const handleInquirySubmit = async (data: InquiryData) => {
    setInquiryError(null);
    setIsSubmitting(true);
    setAnnouncement('Submitting your inquiry...');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to submit inquiry');
      }
      
      setInquirySuccess(true);
      setAnnouncement('Inquiry submitted successfully! We will be in touch soon.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit inquiry. Please try again.';
      setInquiryError(errorMessage);
      setAnnouncement(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Status Announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Image Gallery */}
      <div 
        data-testid="property-image-gallery" 
        className="relative w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-8 overflow-hidden"
        role="img"
        aria-label={`Image of ${property.title}`}
      >
        {property.image ? (
          <Image
            src={property.image}
            alt={`${property.title} - ${propertyDescription}`}
            fill
            className="object-cover rounded-xl"
            priority
            aria-hidden="false"
          />
        ) : (
          <div 
            data-testid="property-image-placeholder" 
            className="absolute inset-0 flex items-center justify-center"
            role="img"
            aria-label="No image available"
          >
            <HomeIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Property Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{property.address}</p>
          </div>
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text} ${status.border} border`}
            role="status"
            aria-label={`Property status: ${property.status}`}
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${property.price.toLocaleString()}</p>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">About this home</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{property.description}</p>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <HomeIcon className="h-6 w-6" aria-hidden="true" />
              <span aria-label={`${property.bedrooms} bedrooms`}>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <HomeModernIcon className="h-6 w-6" aria-hidden="true" />
              <span aria-label={`${property.bathrooms} bathrooms`}>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CalendarIcon className="h-6 w-6" aria-hidden="true" />
              <span>Listed on {property.createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div data-testid="property-features" className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Features</h3>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Property features">
                {property.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    role="listitem"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-fit"
          role="complementary"
          aria-labelledby="inquiry-form-title"
        >
          <h3 id="inquiry-form-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Interested in this property?
          </h3>
          {inquirySuccess ? (
            <div 
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-400"
              role="alert"
              aria-label="Success message"
            >
              Thank you for your inquiry! We will be in touch soon.
            </div>
          ) : (
            <>
              {inquiryError && (
                <div 
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400"
                  role="alert"
                  aria-label="Error message"
                >
                  {inquiryError}
                </div>
              )}
              <InquiryForm
                property={property}
                onSubmit={handleInquirySubmit}
                onCancel={() => {}}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 