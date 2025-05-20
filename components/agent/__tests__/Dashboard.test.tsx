import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { Property } from '@prisma/client';

// Mock the DeletePropertyModal component
jest.mock('../DeletePropertyModal', () => {
  return function MockDeletePropertyModal({ property, onConfirm, onCancel }: any) {
    return (
      <div data-testid="delete-modal">
        <p>Are you sure you want to delete {property.title}?</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={() => onConfirm(property.id)}>Confirm delete</button>
      </div>
    );
  };
});

// Mock the AnalyticsDashboard component
jest.mock('../AnalyticsDashboard', () => {
  return function MockAnalyticsDashboard() {
    return <div data-testid="analytics-dashboard">Analytics Dashboard</div>;
  };
});

describe('Dashboard', () => {
  const mockProperties: (Property & {
    views?: number;
    inquiryCount?: number;
    daysOnMarket?: number;
  })[] = [
    {
      id: 1,
      title: 'Test Property',
      description: 'Test description',
      price: 500000,
      address: '123 Test St',
      bedrooms: 3,
      bathrooms: 2,
      status: 'active',
      views: 0,
      inquiryCount: 0,
      daysOnMarket: 0,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: 1,
    },
  ];

  const mockOnAddProperty = jest.fn();
  const mockOnEditProperty = jest.fn();
  const mockOnDeleteProperty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with properties', () => {
    render(
      <Dashboard
        properties={mockProperties}
        onAddProperty={mockOnAddProperty}
        onEditProperty={mockOnEditProperty}
        onDeleteProperty={mockOnDeleteProperty}
      />
    );

    expect(screen.getByText('My Properties')).toBeInTheDocument();
    expect(screen.getByText('Add New Property')).toBeInTheDocument();
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onAddProperty when Add New Property button is clicked', () => {
    render(
      <Dashboard
        properties={mockProperties}
        onAddProperty={mockOnAddProperty}
        onEditProperty={mockOnEditProperty}
        onDeleteProperty={mockOnDeleteProperty}
      />
    );

    fireEvent.click(screen.getByText('Add New Property'));
    expect(mockOnAddProperty).toHaveBeenCalledTimes(1);
  });

  it('calls onEditProperty when Edit button is clicked', () => {
    render(
      <Dashboard
        properties={mockProperties}
        onAddProperty={mockOnAddProperty}
        onEditProperty={mockOnEditProperty}
        onDeleteProperty={mockOnDeleteProperty}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEditProperty).toHaveBeenCalledWith(1);
  });

  it('shows delete modal when Delete button is clicked', () => {
    render(
      <Dashboard
        properties={mockProperties}
        onAddProperty={mockOnAddProperty}
        onEditProperty={mockOnEditProperty}
        onDeleteProperty={mockOnDeleteProperty}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete property Test Property' }));
    expect(screen.getByText(/Are you sure you want to delete Test Property/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toBeInTheDocument();
  });
}); 