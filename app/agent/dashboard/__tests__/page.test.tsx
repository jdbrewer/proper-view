import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AgentDashboardPage from '../page';
import { useAuth } from '@/lib/mockAuth';

(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock our auth hook
jest.mock('@/lib/mockAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/agent/Dashboard', () => ({
  __esModule: true,
  default: ({
    properties,
    onAddProperty,
    onEditProperty,
    onDeleteProperty,
  }: any) => (
    <div>
      <button onClick={onAddProperty}>Add New Property</button>
      {properties.map((p: any) => (
        <div key={p.id}>
          <span>{p.title}</span>
          <span>{p.address}</span>
          <span>${p.price.toLocaleString()}</span>
          {/* render status, bedrooms, bathrooms */}
          <span>{p.status}</span>
          <span>{p.bedrooms}</span>
          <span>{p.bathrooms}</span>
          <button onClick={() => onEditProperty(Number(p.id))}>Edit</button>
          <button aria-label={`Delete property ${p.title}`}>Delete property {p.title}</button>
          <button onClick={() => onDeleteProperty(Number(p.id))} aria-label="Confirm delete">
            Confirm delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Stub fetch
global.fetch = jest.fn();

describe('AgentDashboardPage', () => {
  const mockRouter = { push: jest.fn(), replace: jest.fn() };

  const mockProperties = [
    {
      id: '1',
      title: 'Test Property',
      price: 500000,
      address: '123 Test St',
      bedrooms: 3,
      bathrooms: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // logged in
    (useAuth as jest.Mock).mockReturnValue({
      hydrated: true,
      isAuthenticated: true,
      user: 'AgentName'
    });
    // first fetch → agent ID
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 })
      })
      // second fetch → properties
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProperties)
      });
  });

  it('redirects to login if not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      hydrated: true,
      isAuthenticated: false,
      user: null
    });
    render(<AgentDashboardPage />);
    expect(mockRouter.replace).toHaveBeenCalledWith('/agent/login');
  });

  it('fetches and displays properties', async () => {
    render(<AgentDashboardPage />);
    // wait until your dashboard has rendered the property
    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('123 Test St')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText(/active/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('handles property actions', async () => {
    // ensure we’re logged in & have data
    render(<AgentDashboardPage />);
    await waitFor(() => screen.getByText('Test Property'));

    // Add
    fireEvent.click(screen.getByText('Add New Property'));
    expect(mockRouter.push).toHaveBeenCalledWith('/agent/properties/new');

    // Edit
    fireEvent.click(screen.getByText('Edit'));
    expect(mockRouter.push).toHaveBeenCalledWith('/agent/properties/1/edit');

    // Delete → force confirm to succeed
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /delete property test property/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/properties/1', { method: 'DELETE' });
    });
  });
});