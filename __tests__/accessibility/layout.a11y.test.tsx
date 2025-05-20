import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../../app/layout';

expect.extend(toHaveNoViolations);

describe('Accessibility - Main Layout', () => {
  it('should have no accessibility violations on the main layout', async () => {
    const { container } = render(
      <Layout>
        <main>
          <h1>Welcome to Proper View</h1>
          <p>This is the homepage content.</p>
        </main>
      </Layout>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 