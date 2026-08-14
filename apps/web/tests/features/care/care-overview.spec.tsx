import { render } from '@testing-library/react';
import { screen, within } from '@testing-library/dom';
import { CareOverview } from '../../../app/features/care/components';

describe('CareOverview', () => {
  it('shows watering, sunlight, nutrition, and upcoming care details', () => {
    render(<CareOverview />);

    expect(screen.getByRole('heading', { name: 'Care plan' })).toBeInTheDocument();
    expect(screen.getByText('Water today')).toBeInTheDocument();
    expect(screen.getByText('Average sun')).toBeInTheDocument();
    expect(screen.getByText('Due tomorrow')).toBeInTheDocument();

    const tomatoCard = screen.getByRole('heading', { name: 'Tomato' }).closest('.rounded-lg');
    expect(tomatoCard).not.toBeNull();

    const tomato = within(tomatoCard as HTMLElement);
    expect(tomato.getByText('Every 2 days')).toBeInTheDocument();
    expect(tomato.getByText('7.5 h observed')).toBeInTheDocument();
    expect(tomato.getByText('8 h recommended')).toBeInTheDocument();
    expect(tomato.getByText('Every 14 days')).toBeInTheDocument();
    expect(tomato.getByText('0.5 h short')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Upcoming care' })).toBeInTheDocument();
    expect(screen.getByText('Water tomatoes and lettuce')).toBeInTheDocument();
    expect(screen.getByText('Feed peppers')).toBeInTheDocument();
  });
});
