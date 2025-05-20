import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PropertyEditPage from '../PropertyEditPage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/mockAuth';

// 1. Stub next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// 2. Stub our auth hook
jest.mock('@/lib/mockAuth', () => ({
  useAuth: jest.fn(),
}));

// 3. Stub the form itself
jest.mock('@/components/agent/PropertyForm', () => {
    return function DummyForm({
      property,
      onSubmit,
      onCancel,
    }: {
      property: any;
      onSubmit: (data: any) => Promise<void>;
      onCancel: () => void;
    }) {
      return (
        <div>
          {/* expose the title so we can verify it */}
          <div data-testid="f: title">{property.title}</div>
          <button onClick={() => onSubmit(property)}>Submit</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      );
    };
  });

describe(`<PropertyEditPage />`, () => {
  const mockProperty = {
    id: '1',
    title: 'Test Property',
    price: 500000,
    address: '123 Test St',
    bedrooms: 3,
    bathrooms: 2,
    description: 'A great property',
    status: 'active' as const,
  };
  let mockRouter: { push: jest.Mock; back: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn(), back: jest.fn() };
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter);
    ;(useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      hydrated: true,
    });
    // first fetch (GET /api/properties/1)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProperty),
    });
  });

  it(`redirects to login when not authenticated`, async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      hydrated: true,
    });
    render(<PropertyEditPage id="1" />);
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/agent/login');
    });
  });

  it(`loads and hands data to the form`, async () => {
    render(<PropertyEditPage id="1" />);
    // until fetch resolves, you might see "Loading..."
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // after fetch, our DummyForm should render the title
    await waitFor(() => {
      expect(screen.getByTestId('f: title')).toHaveTextContent('Test Property');
    });
  });

  it(`wires up onSubmit and then navigates`, async () => {
    render(<PropertyEditPage id="1" />);
    // wait for fetch → form
    await waitFor(() => screen.getByTestId('f: title'));

    // next fetch call is the PATCH
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/properties/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '1',
          title: 'Test Property',
          price: 500000,
          address: '123 Test St',
          bedrooms: 3,
          bathrooms: 2,
          description: 'A great property',
          status: 'active',
        }),
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/agent/dashboard');
    });
  });

  it(`calls back() when Cancel is clicked`, async () => {
    render(<PropertyEditPage id="1" />);
    await waitFor(() => screen.getByTestId('f: title'));
    fireEvent.click(screen.getByText(/cancel/i));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it(`shows an error message if initial fetch fails`, async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('uh-oh'));
    render(<PropertyEditPage id="1" />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load property/i)).toBeInTheDocument();
    });
  });
});