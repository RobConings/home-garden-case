import { createRemixStub } from '@remix-run/testing';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { DashboardSidebar } from '../../../app/features/dashboard/components/dashboard-sidebar';

function renderSidebar(pathname = '/dashboard/care') {
  const RemixStub = createRemixStub([
    {
      path: '*',
      Component: () => (
        <DashboardSidebar collapsed={false} onCollapsedChange={() => undefined} />
      ),
    },
  ]);

  render(<RemixStub initialEntries={[pathname]} />);
}

describe('DashboardSidebar', () => {
  it('links Care to the care dashboard route', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: /care/i })).toHaveAttribute(
      'href',
      '/dashboard/care',
    );
  });

  it('marks Care as active on the care route', () => {
    renderSidebar('/dashboard/care');

    expect(screen.getByRole('link', { name: /care/i })).toHaveClass(
      'bg-[var(--rootly-primary-soft)]',
    );
  });
});
