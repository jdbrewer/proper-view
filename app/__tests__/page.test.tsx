import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyListings from '@/components/properties/PropertyListings';
import { Property } from '@prisma/client';

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
      image: '/images/property1.jpg'
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
      image: '/images/property2.jpg'
    },
  ];

  it('renders a grid of property cards with correct info', () => {
    render(<PropertyListings properties={mockProperties} />)
  
    // the container should have the grid class
    expect(document.querySelector('.grid')).toBeInTheDocument()
  
    // check the Modern Loft card
    const loftCard = screen.getByRole('article', { name: /Property: Modern Loft/i })
    expect(loftCard).toBeInTheDocument()
  
    // now, within that card:
    expect(within(loftCard).getByText('$750,000')).toBeInTheDocument()
    expect(within(loftCard).getByText('2 bds')).toBeInTheDocument()
    expect(within(loftCard).getByText('2 ba')).toBeInTheDocument()
    expect(within(loftCard).getByText('123 Main St')).toBeInTheDocument()
  
    // check the Cozy Cottage card
    const cottageCard = screen.getByRole('article', { name: /Property: Cozy Cottage/i })
    expect(cottageCard).toBeInTheDocument()
  
    expect(within(cottageCard).getByText('$350,000')).toBeInTheDocument()
    expect(within(cottageCard).getByText('3 bds')).toBeInTheDocument()
    expect(within(cottageCard).getByText('1 ba')).toBeInTheDocument()
    expect(within(cottageCard).getByText('456 Oak Ave')).toBeInTheDocument()
  })

  it('shows a message if no properties are available', () => {
    render(<PropertyListings properties={[]} />);
    expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
  });

  it('uses grid layout for property cards', () => {
    const { container } = render(<PropertyListings properties={mockProperties} />);
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });
}); 