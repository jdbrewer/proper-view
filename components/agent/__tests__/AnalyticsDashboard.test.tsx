import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalyticsDashboard from '../AnalyticsDashboard';
import { Property } from '@prisma/client';

// Mock the chart component since we don't need to test the actual chart rendering
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Label: () => <div data-testid="label" />,
}));

describe('AnalyticsDashboard', () => {
  const mockProperties: (Property & {
    views?: number;
    inquiryCount?: number;
    daysOnMarket?: number;
  })[] = [
    {
      id: 1,
      title: 'Luxury Villa',
      description: 'Beautiful luxury villa',
      price: 1000000,
      address: '123 Luxury Lane',
      bedrooms: 4,
      bathrooms: 3,
      status: 'active',
      views: 50,
      inquiryCount: 10,
      daysOnMarket: 30,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1,
    },
    {
      id: 2,
      title: 'Modern Apartment',
      description: 'Stylish modern apartment',
      price: 500000,
      address: '456 Modern St',
      bedrooms: 2,
      bathrooms: 2,
      status: 'active',
      views: 40,
      inquiryCount: 8,
      daysOnMarket: 45,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1,
    },
  ];

  it('renders analytics overview', () => {
    render(<AnalyticsDashboard properties={mockProperties} />);
    
    expect(screen.getByText('Property Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Views: 90')).toBeInTheDocument();
    expect(screen.getByText('Total Inquiries: 18')).toBeInTheDocument();
    expect(screen.getByText('Average Days on Market: 38')).toBeInTheDocument();
  });

  it('renders property charts', () => {
    render(<AnalyticsDashboard properties={mockProperties} />);
    
    expect(screen.getByText('Views by Property')).toBeInTheDocument();
    expect(screen.getByText('Inquiries by Property')).toBeInTheDocument();
    expect(screen.getByText('Days on Market')).toBeInTheDocument();
  });

  it('filters properties by status', () => {
    render(<AnalyticsDashboard properties={mockProperties} />);
    
    const statusFilter = screen.getByLabelText('Filter by Status:');
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    // Should still show all properties since both are active
    expect(screen.getByText('Total Views: 90')).toBeInTheDocument();
  });

  it('handles empty properties array', () => {
    render(<AnalyticsDashboard properties={[]} />);
    
    expect(screen.getByText('No properties to display')).toBeInTheDocument();
    expect(screen.getByText('Total Views: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Inquiries: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Days on Market: 0')).toBeInTheDocument();
  });

  it('toggles between top 10 and all properties', () => {
    // Create 15 properties to test the toggle
    const manyProperties = Array.from({ length: 15 }, (_, i) => ({
      ...mockProperties[0],
      id: i + 1,
      title: `Property ${i + 1}`,
    }));

    render(<AnalyticsDashboard properties={manyProperties} />);
    
    // Initially shows "Show All" button
    expect(screen.getByText('Show All (15)')).toBeInTheDocument();
    
    // Click to show all
    fireEvent.click(screen.getByText('Show All (15)'));
    
    // Button text changes
    expect(screen.getByText('Show Top 10')).toBeInTheDocument();
  });

  it('renders charts for each metric', () => {
    render(<AnalyticsDashboard properties={mockProperties} />);
    
    // Check for chart containers
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(3); // Views, Inquiries, and Days on Market
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
  });
}); 