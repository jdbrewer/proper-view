import React, { useState, useCallback } from 'react';
import { Property } from '@prisma/client';

/**
 * Props for the PropertyForm component
 * @interface PropertyFormProps
 * @property {Property | null} property - The property to edit, or null for new properties
 * @property {(property: Partial<Property>) => Promise<void>} onSubmit - Callback function when form is submitted
 * @property {() => void} onCancel - Callback function when form is cancelled
 */
interface PropertyFormProps {
  property: Property | null;
  onSubmit: (property: Partial<Property>) => Promise<void>;
  onCancel: () => void;
}

/**
 * PropertyForm Component
 * 
 * A form for creating or editing property listings with comprehensive validation
 * and accessibility features.
 * 
 * @component
 * @param {PropertyFormProps} props - Component props
 * @returns {JSX.Element} A form for property management
 * 
 * @example
 * ```tsx
 * const handleSubmit = async (property) => {
 *   await saveProperty(property);
 * };
 * 
 * return <PropertyForm 
 *   property={null} 
 *   onSubmit={handleSubmit} 
 *   onCancel={() => history.back()} 
 * />;
 * ```
 */
export default function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const [formData, setFormData] = useState<Partial<Property>>(
    property || {
      title: '',
      description: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      address: '',
      status: 'AVAILABLE',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.bedrooms || formData.bedrooms < 0) {
      newErrors.bedrooms = 'Number of bedrooms must be 0 or greater';
    }
    if (!formData.bathrooms || formData.bathrooms < 0) {
      newErrors.bathrooms = 'Number of bathrooms must be 0 or greater';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncement('');

    if (!validateForm()) {
      setAnnouncement('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setAnnouncement('Saving property...');

    try {
      await onSubmit(formData);
      setAnnouncement('Property saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving property';
      setErrors(prev => ({ ...prev, submit: errorMessage }));
      setAnnouncement(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, validateForm]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms'
        ? Number(value)
        : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Status Announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        aria-label={`${property ? 'Edit' : 'Create'} property form`}
        noValidate
      >
        <div>
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full border rounded-md px-3 py-2 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            disabled={loading}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full border rounded-md px-3 py-2 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            disabled={loading}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label 
              htmlFor="price" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full border rounded-md px-3 py-2 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-required="true"
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
              disabled={loading}
            />
            {errors.price && (
              <p id="price-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="bedrooms" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleInputChange}
              min="0"
              className={`w-full border rounded-md px-3 py-2 ${
                errors.bedrooms ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-required="true"
              aria-invalid={!!errors.bedrooms}
              aria-describedby={errors.bedrooms ? 'bedrooms-error' : undefined}
              disabled={loading}
            />
            {errors.bedrooms && (
              <p id="bedrooms-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.bedrooms}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="bathrooms" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleInputChange}
              min="0"
              step="0.5"
              className={`w-full border rounded-md px-3 py-2 ${
                errors.bathrooms ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-required="true"
              aria-invalid={!!errors.bathrooms}
              aria-describedby={errors.bathrooms ? 'bathrooms-error' : undefined}
              disabled={loading}
            />
            {errors.bathrooms && (
              <p id="bathrooms-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.bathrooms}
              </p>
            )}
          </div>
        </div>

        <div>
          <label 
            htmlFor="address" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full border rounded-md px-3 py-2 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-required="true"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? 'address-error' : undefined}
            disabled={loading}
          />
          {errors.address && (
            <p id="address-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.address}
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="status" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="AVAILABLE">Available</option>
            <option value="PENDING">Pending</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>

        {errors.submit && (
          <div 
            className="p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-label="Form submission error"
          >
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            aria-label={loading ? 'Saving property...' : 'Save property'}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
} 