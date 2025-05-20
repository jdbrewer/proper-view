import React from 'react';
import { render, screen } from '@testing-library/react';
import PropertyDetail from '../PropertyDetail';


// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} fill="true" priority="true" />
}));

describe('PropertyDetail', () => {
  const mockProperty = {
    id: 1,
    title: 'Modern Downtown Apartment',
    description: 'Beautiful apartment in the heart of downtown',
    price: 500000,
    address: '123 Main St',
    bedrooms: 2,
    bathrooms: 2,
    status: 'active',
    views: 0,
    inquiryCount: 0,
    image: '/images/property1.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    agentId: 1,
    features: ['Parking', 'Pool', 'Gym']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all property information correctly', () => {
    render(<PropertyDetail property={mockProperty} />);
    
    expect(screen.getByText(mockProperty.title)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.description)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProperty.price.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.address)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.bedrooms} beds`)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.bathrooms} baths`)).toBeInTheDocument();
  });

  it('displays image gallery placeholder', () => {
    render(<PropertyDetail property={mockProperty} />);
    
    const imageGallery = screen.getByTestId('property-image-gallery');
    expect(imageGallery).toBeInTheDocument();
    expect(imageGallery).toHaveClass('relative', 'w-full', 'h-[400px]', 'bg-gradient-to-br', 'from-gray-100', 'to-gray-200', 'rounded-xl', 'mb-8', 'overflow-hidden');
  });

  it('displays property features in a visually appealing way', () => {
    render(<PropertyDetail property={mockProperty} />);
    
    const features = screen.getByTestId('property-features');
    expect(features).toBeInTheDocument();
    expect(features).toHaveClass('space-y-4');
    
    mockProperty.features?.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('displays property status with appropriate styling', () => {
    render(<PropertyDetail property={mockProperty} />);
    
    const status = screen.getByText('Active');
    expect(status).toHaveClass('inline-flex', 'items-center', 'px-3', 'py-1', 'rounded-full', 'text-sm', 'font-medium', 'bg-green-50', 'text-green-700', 'border-green-200', 'border');
  });

  it('formats price with proper currency and thousands separators', () => {
    render(<PropertyDetail property={mockProperty} />);
    
    expect(screen.getByText('$500,000')).toBeInTheDocument();
  });

  it('displays property listing date in a readable format', () => {
    render(<PropertyDetail property={mockProperty} />);
    
    const date = screen.getByText(/Listed on/);
    expect(date).toBeInTheDocument();
  });
}); 