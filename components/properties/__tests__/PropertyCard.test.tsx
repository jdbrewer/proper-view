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
    status: 'active',
    views: 0,
    inquiryCount: 0,
    image: '/images/property1.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    agentId: 1
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
    expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-lg', 'border', 'border-gray-200', 'overflow-hidden', 'transition-transform', 'duration-200', 'hover:scale-[1.02]', 'max-w-xs', 'w-full');
  });

  it('shows status indicator with appropriate styling', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const statusElements = screen.getAllByText('Active');
    const status = statusElements[0]; // Get the first status element
    expect(status).toHaveClass('absolute', 'top-3', 'left-3', 'px-3', 'py-1', 'rounded-full', 'text-xs', 'font-semibold', 'text-white', 'shadow', 'bg-green-600');
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
}); 