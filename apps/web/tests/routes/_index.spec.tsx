import { createRemixStub } from '@remix-run/testing';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import Index from '../../app/routes/_index';
import { AppProviders } from '../../app/providers';

test('renders Rootly landing page', async () => {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: () => (
        <AppProviders user={null}>
          <Index />
        </AppProviders>
      ),
    },
  ]);

  render(<RemixStub />);

  expect(await screen.findByRole('heading', { name: 'Rootly' })).toBeInTheDocument();
  expect(screen.getByText('Garden planning, without guesswork')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Start planning' })).toHaveAttribute(
    'href',
    '/register',
  );
});
