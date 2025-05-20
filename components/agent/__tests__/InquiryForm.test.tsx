import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InquiryForm from '../InquiryForm';
import { Property } from '@prisma/client';

describe('InquiryForm', () => {
  const mockProperty = {
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
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    agentId: 1,
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required fields', () => {
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit inquiry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation errors for missing fields', async () => {
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    const form = screen.getByTestId('inquiry-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+15555555555' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
    
    const form = screen.getByTestId('inquiry-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid phone', async () => {
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
    
    const form = screen.getByTestId('inquiry-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data and resets the form', async () => {
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+15555555555' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'I am interested!' } });
    
    const form = screen.getByTestId('inquiry-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+15555555555',
        message: 'I am interested!',
        propertyId: mockProperty.id,
      });
    });
    
    // After submit, fields should be reset
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('');
    expect(screen.getByLabelText(/message/i)).toHaveValue('');
  });

  it('shows error notification if onSubmit throws', async () => {
    mockOnSubmit.mockImplementationOnce(() => Promise.reject('API error'));
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+15555555555' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'I am interested!' } });
    
    const form = screen.getByTestId('inquiry-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to submit inquiry/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <InquiryForm property={mockProperty} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 