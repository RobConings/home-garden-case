import { createRemixStub } from '@remix-run/testing';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import DashboardCare, { meta } from '../../app/routes/dashboard.care';

describe('dashboard care route', () => {
  it('renders the care overview route', async () => {
    const RemixStub = createRemixStub([
      {
        path: '/dashboard/care',
        Component: DashboardCare,
      },
    ]);

    render(<RemixStub initialEntries={['/dashboard/care']} />);

    expect(await screen.findByRole('heading', { name: 'Care plan' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Track watering rhythm, sunlight fit, and nutrition timing for the plants in your garden.',
      ),
    ).toBeInTheDocument();
  });

  it('exposes care route metadata', () => {
    expect(meta({} as Parameters<typeof meta>[0])).toEqual([
      { title: 'Care | Rootly' },
      {
        name: 'description',
        content: 'Review watering, sunlight, and nutrition care plans in Rootly.',
      },
    ]);
  });
});
