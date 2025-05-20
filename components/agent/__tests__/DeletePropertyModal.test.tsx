import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeletePropertyModal from '../DeletePropertyModal';

describe('DeletePropertyModal', () => {
  const mockProperty = {
    id: '1',
    title: 'Test Property',
    price: 500000,
    address: '123 Test St',
    bedrooms: 3,
    bathrooms: 2,
    status: 'active' as const,
  };

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with property details', () => {
    render(
      <DeletePropertyModal
        property={mockProperty}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Delete Property')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete Test Property/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <DeletePropertyModal
        property={mockProperty}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm with property id when Delete button is clicked', () => {
    render(
      <DeletePropertyModal
        property={mockProperty}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnConfirm).toHaveBeenCalledWith(mockProperty.id);
  });
}); 