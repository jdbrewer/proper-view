import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FilterBar from '../FilterBar';

// Mock the HeroIcons
jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <svg data-testid="search-icon" />,
  FunnelIcon: () => <svg data-testid="filter-icon" />,
  XMarkIcon: () => <svg data-testid="xmark-icon" />
}));

describe('FilterBar', () => {
  const mockOnFilterChange = jest.fn();
  const mockSetViewMode = jest.fn();
  const initialFilters = {
    location: '',
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    bathrooms: 0,
    showAllStatuses: false
  };

  // Bedroom options defined in FilterBar component
  const bedroomOptions = [0, 1, 2, 3, 4, 5, 6];
  // Bathroom options defined in FilterBar component
  const bathroomOptions = [0, 1, 2, 3, 4, 5, 6];

  beforeEach(() => {
    mockOnFilterChange.mockClear();
    mockSetViewMode.mockClear();
    
    // Mock window.matchMedia - default to desktop view
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // Desktop view by default
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('renders all filter inputs', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Find inputs by their specific IDs to avoid ambiguity
    expect(container.querySelector('#location')).toBeInTheDocument();
    expect(container.querySelector('#minPrice')).toBeInTheDocument();
    expect(container.querySelector('#maxPrice')).toBeInTheDocument();
    
    // Use getAllByText for elements that might appear multiple times
    const bedroomsLabels = screen.getAllByText('Bedrooms');
    expect(bedroomsLabels.length).toBeGreaterThan(0);
    
    const statusLabels = screen.getAllByText('Show Sold & Pending');
    expect(statusLabels.length).toBeGreaterThan(0);
  });

  it('submits form with updated values when search button is clicked', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Get inputs by their specific IDs
    const locationInput = container.querySelector('#location')!;
    const minPriceInput = container.querySelector('#minPrice')!;
    const maxPriceInput = container.querySelector('#maxPrice')!;
    
    // Update input values
    fireEvent.change(locationInput, { target: { value: 'San Francisco' } });
    fireEvent.change(minPriceInput, { target: { value: '100000' } });
    fireEvent.change(maxPriceInput, { target: { value: '500000' } });
    
    // Find the desktop search button specifically
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    // Check if onFilterChange was called with the updated values
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      location: 'San Francisco',
      minPrice: 100000,
      maxPrice: 500000
    }));
  });

  it('opens and closes bedrooms dropdown', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Find the bedroom button by its label
    const bedroomsLabel = screen.getAllByText('Bedrooms')[0];
    const bedroomsButton = bedroomsLabel.parentElement?.querySelector('button');
    expect(bedroomsButton).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(bedroomsButton!);
    
    // Check if dropdown options are displayed
    const optionElements = screen.getAllByText('2+');
    expect(optionElements.length).toBeGreaterThan(0);
    
    // Click outside to close dropdown
    fireEvent.mouseDown(document.body);
    
    // The dropdown should be closed - options are no longer visible in the document
    const closedOptionElements = screen.queryAllByText('2+');
    expect(closedOptionElements.length).toBeLessThan(optionElements.length);
  });

  it('selects a bedroom option and submits form', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Find the bedroom button by its label
    const bedroomsLabel = screen.getAllByText('Bedrooms')[0];
    const bedroomsButton = bedroomsLabel.parentElement?.querySelector('button');
    expect(bedroomsButton).toBeInTheDocument();
    
    // Open dropdown
    fireEvent.click(bedroomsButton!);
    
    // Find the 2+ option and click it
    const options = screen.getAllByText('2+');
    fireEvent.click(options[0]);
    
    // Find the Search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    // Verify onFilterChange was called with the selected bedrooms value
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      bedrooms: 2
    }));
  });

  it('toggles show all statuses switch and submits form', () => {
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Find all switch labels for "Show Sold & Pending"
    const switchLabels = screen.getAllByText('Show Sold & Pending');
    // Use the desktop one (usually the second one)
    const switchLabel = switchLabels[switchLabels.length > 1 ? 1 : 0];
    
    // Click the switch
    fireEvent.click(switchLabel);
    
    // Find the Search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    // Verify onFilterChange was called with the updated showAllStatuses value
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      showAllStatuses: true
    }));
  });

  it('renders mobile view when screen is small', () => {
    // Mock matchMedia to return true for mobile view
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true, // Mobile view
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} setViewMode={mockSetViewMode} />);
    
    // Find mobile filter button by using the button that has the filter icon
    const filterButtons = screen.getAllByRole('button');
    const filterButton = filterButtons.find(button => button.innerHTML.includes('data-testid="filter-icon"'))!;
    expect(filterButton).toBeInTheDocument();
    
    // Click to open mobile filters
    fireEvent.click(filterButton);
    
    // Check if mobile filter drawer is open
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });

  it('handles form submission on mobile view', () => {
    // Mock matchMedia to return true for mobile view
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true, // Mobile view
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} setViewMode={mockSetViewMode} />);
    
    // Find and open mobile filter drawer
    const filterButtons = screen.getAllByRole('button');
    const filterButton = filterButtons.find(button => button.innerHTML.includes('data-testid="filter-icon"'))!;
    fireEvent.click(filterButton);
    
    // Get the mobile min price input by its ID
    const minPriceInput = container.querySelector('#mobile-minPrice')!;
    fireEvent.change(minPriceInput, { target: { value: '200000' } });
    
    // Submit mobile form by clicking Apply Filters
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);
    
    // Verify onFilterChange and setViewMode were called
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      minPrice: 200000
    }));
    expect(mockSetViewMode).toHaveBeenCalledWith('list');
  });

  it('validates price inputs to be positive numbers', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Get min price input by its ID
    const minPriceInput = container.querySelector('#minPrice')!;
    
    // Try to set a negative value
    fireEvent.change(minPriceInput, { target: { value: '-100000' } });
    
    // Find the Search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    // Verify onFilterChange was called with a non-negative value
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      minPrice: 0
    }));
  });

  it('opens and closes bathrooms dropdown', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Find the bathroom button by its label
    const bathroomsLabel = screen.getAllByText('Bathrooms')[0];
    const bathroomsButton = bathroomsLabel.parentElement?.querySelector('button');
    expect(bathroomsButton).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(bathroomsButton!);
    
    // Check if dropdown options are displayed
    const optionElements = screen.getAllByText('2+');
    expect(optionElements.length).toBeGreaterThan(0);
    
    // Click outside to close dropdown
    fireEvent.mouseDown(document.body);
    
    // The dropdown should be closed - options are no longer visible in the document
    const closedOptionElements = screen.queryAllByText('2+');
    expect(closedOptionElements.length).toBeLessThan(optionElements.length);
  });

  it('selects a bathroom option and submits form', () => {
    const { container } = render(<FilterBar filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Find the bathroom button by its label
    const bathroomsLabel = screen.getAllByText('Bathrooms')[0];
    const bathroomsButton = bathroomsLabel.parentElement?.querySelector('button');
    expect(bathroomsButton).toBeInTheDocument();
    
    // Open dropdown
    fireEvent.click(bathroomsButton!);
    
    // Find the 2+ option and click it
    const options = screen.getAllByText('2+');
    fireEvent.click(options[0]);
    
    // Find the Search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    // Verify onFilterChange was called with the selected bathrooms value
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      bathrooms: 2
    }));
  });
});