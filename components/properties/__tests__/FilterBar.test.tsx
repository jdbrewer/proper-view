import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../FilterBar';

describe('FilterBar', () => {
  const mockOnFilterChange = jest.fn();
  const initialFilters = {
    location: '',
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    showAllStatuses: false
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders all filter inputs', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByPlaceholderText('City, address, or ZIP')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    expect(screen.getByText('Bedrooms')).toBeInTheDocument();
  });

  it('updates location filter when typing', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    const locationInput = screen.getByPlaceholderText('City, address, or ZIP');
    fireEvent.change(locationInput, { target: { value: 'San Francisco' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      location: 'San Francisco'
    }));
  });

  it('updates min price filter when typing', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    const minPriceInput = screen.getByPlaceholderText('Min');
    fireEvent.change(minPriceInput, { target: { value: '100000' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      minPrice: 100000
    }));
  });

  it('updates max price filter when typing', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    const maxPriceInput = screen.getByPlaceholderText('Max');
    fireEvent.change(maxPriceInput, { target: { value: '500000' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      maxPrice: 500000
    }));
  });

  it('updates bedrooms filter when selecting from dropdown', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Open dropdown
    const bedroomsButton = screen.getByText('Any');
    fireEvent.click(bedroomsButton);
    
    // Select option
    const option = screen.getByText('2+ Beds');
    fireEvent.click(option);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      bedrooms: 2
    }));
  });

  it('validates price inputs to be positive numbers', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    const minPriceInput = screen.getByPlaceholderText('Min');
    fireEvent.change(minPriceInput, { target: { value: '-100000' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      minPrice: 0
    }));
  });

  it('closes bedrooms dropdown when clicking outside', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Open dropdown
    const bedroomsButton = screen.getByText('Any');
    fireEvent.click(bedroomsButton);
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('toggles show all statuses switch', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    const switchInput = screen.getByRole('checkbox');
    fireEvent.click(switchInput);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      showAllStatuses: true
    }));
  });
}); 