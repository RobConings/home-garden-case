import { createRemixStub } from '@remix-run/testing';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import Index from '../../app/routes/_index';

test('renders Rootly landing page', async () => {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: Index,
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
