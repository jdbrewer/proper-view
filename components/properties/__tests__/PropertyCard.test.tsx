import React from 'react';
import { render, screen } from '@testing-library/react';
import PropertyCard from '../PropertyCard';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} fill="true" priority="true" />
}));

describe('PropertyCard', () => {
  const mockProperty = {
    id: 1,
    title: 'Modern Downtown Apartment',
    description: 'Beautiful apartment in the heart of downtown',
    price: 500000,
    address: '123 Main St',
    bedrooms: 2,
    bathrooms: 2,
    status: 'active' as const,
    views: 0,
    inquiryCount: 0,
    image: '/images/property1.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    agentId: 1,
    // Add the missing fields (some can be null if your schema allows it):
    latitude: null,
    longitude: null,
    city: 'New York',
    state: 'NY',
    zipCode: '10001'
  };

  it('renders property information with consistent styling', () => {
    render(<PropertyCard property={mockProperty} />);
    
    // Check for required elements
    expect(screen.getByRole('article')).toHaveAttribute('aria-label', `Property: ${mockProperty.title}`);
    expect(screen.getByText(`$${mockProperty.price.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.address)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.bedrooms} bds`)).toBeInTheDocument();
  });

  it('applies responsive design classes', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const card = screen.getByRole('article');
    // Test for the classes that actually exist (removed max-w-xs, added dark mode awareness)
    expect(card).toHaveClass(
      'bg-white', 
      'rounded-2xl', 
      'shadow-lg', 
      'border', 
      'border-gray-200', 
      'overflow-hidden', 
      'transition-transform', 
      'duration-200', 
      'hover:scale-[1.02]', 
      'w-full'
    );
    
    // Also check for dark mode classes
    expect(card).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
  });

  it('shows status indicator with appropriate styling', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const statusElements = screen.getAllByText('Active');
    const status = statusElements[0]; // Get the first status element
    expect(status).toHaveClass(
      'absolute', 
      'top-3', 
      'left-3', 
      'px-3', 
      'py-1', 
      'rounded-full', 
      'text-xs', 
      'font-semibold', 
      'text-white', 
      'shadow', 
      'bg-green-600'
    );
  });

  it('displays property image with proper aspect ratio', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveClass('object-cover');
    expect(image).toHaveAttribute('alt', `${mockProperty.title} - ${mockProperty.bedrooms} bedroom, ${mockProperty.bathrooms} bathroom ${mockProperty.status} property at ${mockProperty.address}`);
  });

  it('applies hover effects for better interactivity', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('transition-transform', 'duration-200', 'hover:scale-[1.02]');
  });

  it('maintains accessibility standards', () => {
    render(<PropertyCard property={mockProperty} />);
    
    // Check for proper ARIA roles and labels
    expect(screen.getByRole('article')).toHaveAttribute('aria-label', `Property: ${mockProperty.title}`);
    expect(screen.getByRole('img')).toHaveAttribute('alt', `${mockProperty.title} - ${mockProperty.bedrooms} bedroom, ${mockProperty.bathrooms} bathroom ${mockProperty.status} property at ${mockProperty.address}`);
    
    // Check for proper heading hierarchy
    expect(screen.getByText(`$${mockProperty.price.toLocaleString()}`)).toHaveClass('text-2xl', 'font-extrabold');
  });

  it('renders non-clickable version when clickable is false', () => {
    render(<PropertyCard property={mockProperty} clickable={false} />);
    
    // Should not have a Link wrapper
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    
    // Should still have the article
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders different status badges correctly', () => {
    const pendingProperty = { ...mockProperty, status: 'pending' };
    const soldProperty = { ...mockProperty, status: 'sold' };
    
    // Test pending status - target the badge specifically by its unique classes
    const { rerender, container } = render(<PropertyCard property={pendingProperty} />);
    const pendingBadge = container.querySelector('.absolute.top-3.left-3');
    expect(pendingBadge).toHaveClass('bg-yellow-500');
    expect(pendingBadge).toHaveTextContent('Pending');
    
    // Test sold status
    rerender(<PropertyCard property={soldProperty} />);
    const soldBadge = container.querySelector('.absolute.top-3.left-3');
    expect(soldBadge).toHaveClass('bg-red-600');
    expect(soldBadge).toHaveTextContent('Sold');
  });
});