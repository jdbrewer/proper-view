import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyListings from '@/components/properties/PropertyListings';
import { Property } from '@prisma/client';

// Mock the MapView component
jest.mock('@/components/properties/MapView', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="mock-map-view">Map View Mock</div>)
  };
});

describe('Public Listings Page', () => {
  const mockProperties: Property[] = [
    {
      id: 1,
      title: 'Modern Loft',
      price: 750000,
      address: '123 Main St',
      bedrooms: 2,
      bathrooms: 2,
      status: 'active',
      description: 'A modern loft in the city center',
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1,
      views: 0,
      inquiryCount: 0,
      image: '/images/property1.jpg',
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    {
      id: 2,
      title: 'Cozy Cottage',
      price: 350000,
      address: '456 Oak Ave',
      bedrooms: 3,
      bathrooms: 1,
      status: 'pending',
      description: 'A cozy cottage in the suburbs',
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1,
      views: 0,
      inquiryCount: 0,
      image: '/images/property2.jpg',
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
  ];

  const mockFilters = {
    location: '',
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    showAllStatuses: false
  };

  const mockOnFilterChange = jest.fn();
  const mockSetViewMode = jest.fn();

  it('renders a grid of property cards with correct info', () => {
    render(
      <PropertyListings 
        properties={mockProperties} 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        setViewMode={mockSetViewMode}
      />
    );
  
    // the container should have the grid class
    expect(document.querySelector('.grid')).toBeInTheDocument();
  
    // check the Modern Loft card
    const loftCard = screen.getByRole('article', { name: /Modern Loft/i });
    expect(loftCard).toBeInTheDocument();
  
    // now, within that card:
    expect(screen.getByText('$750,000')).toBeInTheDocument();
    expect(screen.getByText('2 bds')).toBeInTheDocument();
    expect(screen.getByText('2 ba')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  
    // check the Cozy Cottage card
    const cottageCard = screen.getByRole('article', { name: /Cozy Cottage/i });
    expect(cottageCard).toBeInTheDocument();
  
    expect(screen.getByText('$350,000')).toBeInTheDocument();
    expect(screen.getByText('3 bds')).toBeInTheDocument();
    expect(screen.getByText('1 ba')).toBeInTheDocument();
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
  });

  it('shows a message if no properties are available', () => {
    render(
      <PropertyListings 
        properties={[]} 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        setViewMode={mockSetViewMode}
      />
    );
    expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
  });

  it('uses grid layout for property cards', () => {
    const { container } = render(
      <PropertyListings 
        properties={mockProperties} 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        setViewMode={mockSetViewMode}
      />
    );
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });
});