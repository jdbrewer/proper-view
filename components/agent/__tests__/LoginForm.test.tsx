import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    render(<LoginForm onLogin={() => {}} />);
    expect(screen.getByLabelText(/agent login form/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls onLogin with the entered name', async () => {
    const onLogin = jest.fn();
    const mockAgent = { id: 1, name: 'Agent Smith' };
    
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAgent),
    });

    render(<LoginForm onLogin={onLogin} />);
    
    const nameInput = screen.getByLabelText(/agent name/i);
    fireEvent.change(nameInput, { target: { value: 'Agent Smith' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(mockAgent);
    });
  });
}); 