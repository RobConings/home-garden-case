import { createRemixStub } from '@remix-run/testing';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { GardenEditor } from '../../../app/features/gardens/components/garden-editor';
import type { Garden } from '../../../app/features/gardens/api';
import { MessageProvider } from '../../../app/providers/message-provider';

vi.mock('react-konva', () => {
  const Component = ({ children }: { children?: ReactNode }) => <div>{children}</div>;

  return {
    Stage: Component,
    Layer: Component,
    Rect: Component,
    Line: Component,
    Circle: Component,
    Text: Component,
    Group: Component,
  };
});

const garden: Garden = {
  gardenId: 1,
  gardenName: 'Kitchen garden',
  totalSurfaceArea: 12,
  totalWidth: 4,
  totalHeight: 3,
  gridSizeCm: 25,
  locationDescription: 'Backyard',
  sunDirection: 'south',
  latitude: null,
  longitude: null,
  createdAt: '2026-08-14T00:00:00.000Z',
  updatedAt: '2026-08-14T00:00:00.000Z',
};

function renderGardenEditor() {
  const RemixStub = createRemixStub([
    {
      path: '/dashboard/gardens/1/editor',
      loader: () => ({
        garden,
        shapes: [],
        plants: [],
        plantLibrary: [
          {
            plantLibraryId: 1,
            commonName: 'Tomato',
            botanicalName: 'Solanum lycopersicum',
            plantCategory: 'vegetable',
            waterNeed: 'moderate',
            waterNotes: 'Keep soil evenly moist.',
            sunNeed: 'full_sun',
            sunNotes: 'Needs full sun.',
            nutritionNeed: 'high',
            nutritionNotes: 'Feed regularly.',
            plantingNotes: 'Plant after frost.',
            spacingCm: 60,
            daysToMaturity: 75,
            source: 'system',
            ownerUserId: null,
            createdAt: '2026-08-14T00:00:00.000Z',
            updatedAt: '2026-08-14T00:00:00.000Z',
          },
        ],
      }),
      Component: () => (
        <MessageProvider>
          <GardenEditor garden={garden} />
        </MessageProvider>
      ),
    },
  ]);

  render(<RemixStub initialEntries={['/dashboard/gardens/1/editor']} />);
}

describe('GardenEditor responsive layout', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {
          return undefined;
        }

        disconnect() {
          return undefined;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a small-screen warning and hides the full editor until xl screens', async () => {
    renderGardenEditor();

    const warning = await screen.findByRole('heading', {
      name: 'Editor available on larger screens',
    });
    expect(warning).toBeInTheDocument();
    expect(
      screen.getByText(
        'Use a desktop or a wider browser window to draw garden zones and place plants.',
      ),
    ).toBeInTheDocument();

    expect(warning.closest('.rounded-lg')).toHaveClass('xl:hidden');
    expect(
      screen.getByRole('heading', { name: 'Drawing board' }).closest('.rounded-lg'),
    ).toHaveClass('hidden', 'xl:flex');
  });
});
