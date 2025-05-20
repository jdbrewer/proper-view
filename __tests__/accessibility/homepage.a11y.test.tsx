import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../components/HomePage';

expect.extend(toHaveNoViolations);

describe('Accessibility - Homepage', () => {
  it('should have no accessibility violations on the homepage', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 