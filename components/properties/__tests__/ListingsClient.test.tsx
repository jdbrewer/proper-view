import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingsClient from '../ListingsClient';
import { Property } from '@prisma/client';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} fill="true" priority="true" />
}));

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
const mockRouter = {
  replace: jest.fn().mockResolvedValue(undefined)
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

describe('ListingsClient', () => {
  const mockProperties: Property[] = [
    {
      id: 1,
      title: 'Modern Downtown Apartment',
      description: 'Beautiful apartment in the heart of downtown',
      price: 500000,
      address: '123 Main St, San Francisco',
      bedrooms: 2,
      bathrooms: 2,
      status: 'active',
      views: 0,
      inquiryCount: 0,
      image: '/images/property1.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1
    },
    {
      id: 2,
      title: 'Luxury Penthouse',
      description: 'Stunning penthouse with city views',
      price: 1000000,
      address: '456 Market St, San Francisco',
      bedrooms: 3,
      bathrooms: 2,
      status: 'pending',
      views: 0,
      inquiryCount: 0,
      image: '/images/property2.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all properties once you show sold & pending', async () => {
    render(<ListingsClient properties={mockProperties} />);
  
    // click the "Show Sold & Pending Properties" toggle
    const statusToggle = screen.getByRole('checkbox', {
      name: /show sold & pending properties/i
    });
    fireEvent.click(statusToggle);
  
    // now both prices should be in the document
    await waitFor(() => {
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });
  });

  it('filters properties by location', async () => {
    render(<ListingsClient properties={mockProperties} />);
    
    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'San Francisco' } });

    // Submit the form by clicking the search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for the filter to be applied
    await waitFor(() => {
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.queryByText('$1,000,000')).not.toBeInTheDocument();
    });
  });

  it('filters properties by price range', async () => {
    render(<ListingsClient properties={mockProperties} />);
    
    const minPriceInput = screen.getByLabelText('Min Price');
    const maxPriceInput = screen.getByLabelText('Max Price');
    
    fireEvent.change(minPriceInput, { target: { value: '600000' } });
    fireEvent.change(maxPriceInput, { target: { value: '1200000' } });
 
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
 
    await waitFor(() => {
      expect(screen.queryByText('$500,000')).not.toBeInTheDocument();
      expect(screen.queryByText('$1,000,000')).not.toBeInTheDocument();
    });
  });

  it('filters properties by number of bedrooms', async () => {
    render(<ListingsClient properties={mockProperties} />);
    
    // Click the bedrooms button to open dropdown
    const bedroomsButton = screen.getByRole('button', { name: /any/i });
    fireEvent.click(bedroomsButton);
  
    // Select 3 bedrooms from dropdown
    const threeBedroomsOption = screen.getByRole('button', { name: /3\+ beds/i });
    fireEvent.click(threeBedroomsOption);
  
    // Submit
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
  
    await waitFor(() => {
     // no active properties match 3+ bedrooms, so both prices should be gone
     expect(screen.queryByText('$500,000')).not.toBeInTheDocument();
     expect(screen.queryByText('$1,000,000')).not.toBeInTheDocument();
     // and the empty-state message should appear
     expect(screen.getByText(/no properties match your search criteria/i)).toBeInTheDocument();
    });
  });

  it('shows only active properties by default', () => {
    render(<ListingsClient properties={mockProperties} />);
    
    // Only the active property should be shown
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.queryByText('$1,000,000')).not.toBeInTheDocument();
  });

  it('shows all properties when show all statuses is toggled', async () => {
    render(<ListingsClient properties={mockProperties} />);
    
    // Initially only active property is shown
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.queryByText('$1,000,000')).not.toBeInTheDocument();

    // Toggle show all statuses
    const statusToggle = screen.getByRole('checkbox', {
      name: /show sold & pending properties/i
    });
    fireEvent.click(statusToggle);

    // Now both properties should be shown
    await waitFor(() => {
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });
  });

  it('updates URL when filters change', async () => {
    render(<ListingsClient properties={mockProperties} />);
    
    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'San Francisco' } });

    // Submit the form by clicking the search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for the URL to be updated
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalled();
    });
  });
});