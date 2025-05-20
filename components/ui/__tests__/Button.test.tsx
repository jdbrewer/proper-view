/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with Tailwind classes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
    expect(button).toHaveClass('rounded');
  });
}); 