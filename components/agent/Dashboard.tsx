import React, { useState } from 'react';
import DeletePropertyModal from './DeletePropertyModal';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Property } from '@prisma/client';

type Props = {
  properties: (Property & {
    views?: number;
    inquiryCount?: number;
    daysOnMarket?: number;
  })[];
  onAddProperty: () => void;
  onEditProperty: (id: number) => void;
  onDeleteProperty: (id: number) => void;
};

export default function Dashboard({ properties, onAddProperty, onEditProperty, onDeleteProperty }: Props) {
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
  };

  const handleDeleteConfirm = async (id: number) => {
    setIsDeleting(true);
    setError(null);

    try {
      onDeleteProperty(id);
    } catch (err) {
      setError('Failed to delete property');
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setPropertyToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <button
          onClick={onAddProperty}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Property
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <AnalyticsDashboard properties={properties} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map(property => (
          <div
            key={property.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{property.address}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="mt-1 text-sm text-gray-900">${property.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{property.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bedrooms</p>
                  <p className="mt-1 text-sm text-gray-900">{property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bathrooms</p>
                  <p className="mt-1 text-sm text-gray-900">{property.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Views</p>
                  <p className="mt-1 text-sm text-gray-900">{property.views || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Inquiries</p>
                  <p className="mt-1 text-sm text-gray-900">{property.inquiryCount || 0}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => onEditProperty(property.id)}
                  className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(property)}
                  disabled={isDeleting}
                  aria-label={`Delete property ${property.title}`}
                  className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {propertyToDelete && (
        <DeletePropertyModal
          property={propertyToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
} 