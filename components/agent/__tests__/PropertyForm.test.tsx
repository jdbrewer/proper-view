import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyForm from '../PropertyForm';
import { Property } from '@prisma/client';

describe('PropertyForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockProperty: Property = {
    id: 1,
    title: '',
    description: '',
    price: 0,
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    status: 'AVAILABLE',
    views: 0,
    inquiryCount: 0,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    agentId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(<PropertyForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bedrooms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bathrooms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<PropertyForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    render(<PropertyForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Property' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A great property' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByLabelText(/bedrooms/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/bathrooms/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Test St' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Property',
        description: 'A great property',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        address: '123 Test St',
        status: 'AVAILABLE',
      }));
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(<PropertyForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('initializes form with provided data', async () => {
    const property: Property = {
      ...mockProperty,
      title: 'Initial Property',
      description: 'Initial description',
      price: 600000,
      bedrooms: 4,
      bathrooms: 3,
      address: '456 Initial St',
      status: 'PENDING',
    };

    render(<PropertyForm property={property} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Wait for form to be initialized
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveValue('Initial Property');
    });

    // Check other fields
    expect(screen.getByLabelText(/price/i)).toHaveValue(600000);
    expect(screen.getByLabelText(/address/i)).toHaveValue('456 Initial St');
    expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(4);
    expect(screen.getByLabelText(/bathrooms/i)).toHaveValue(3);
    expect(screen.getByLabelText(/description/i)).toHaveValue('Initial description');
    expect(screen.getByLabelText(/status/i)).toHaveValue('PENDING');
  });
}); 