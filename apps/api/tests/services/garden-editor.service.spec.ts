import { describe, expect, it, vi } from 'vitest';
import type { GardenEditorShapeWithPoints } from '../../src/app/database/repositories/garden-editor.repository';
import { GardenEditorService } from '../../src/app/services/garden-editor.service';

const garden = {
  gardenId: 1,
  gardenName: 'Kitchen garden',
  totalSurfaceArea: 36,
  totalWidth: 6,
  totalHeight: 6,
  gridSizeCm: 100,
  locationDescription: null,
  latitude: null,
  longitude: null,
  sunDirection: 'south',
  createdAt: new Date('2026-08-14T00:00:00.000Z'),
  updatedAt: new Date('2026-08-14T00:00:00.000Z'),
};

const plantArea: GardenEditorShapeWithPoints = {
  gardenEditorShapeId: 1,
  shapeType: 'plant_area',
  points: [
    { x: 0, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 6 },
    { x: 0, y: 6 },
  ],
};

function createService({
  shapes = [plantArea],
}: {
  shapes?: Array<{
    gardenEditorShapeId: number;
    shapeType: GardenEditorShapeWithPoints['shapeType'];
    points: Array<{ x: number; y: number }>;
  }>;
} = {}) {
  const replaceGardenPlants = vi.fn(async (_gardenId: number, plants: unknown[]) => plants);

  return {
    replaceGardenPlants,
    service: new GardenEditorService({
      gardenRepository: {
        findById: vi.fn(async () => garden),
      } as never,
      gardenEditorRepository: {
        findByGardenId: vi.fn(async () => shapes),
        replaceGardenPlants,
      } as never,
      plantLibraryRepository: {
        findById: vi.fn(async () => ({ plantLibraryId: 1 })),
      } as never,
    }),
  };
}

describe('GardenEditorService plant footprints', () => {
  it('persists adjacent plant footprints with their sizes', async () => {
    const { replaceGardenPlants, service } = createService();
    const plants = [
      { plantLibraryId: 1, size: 2, x: 0, y: 0 },
      { plantLibraryId: 1, size: 2, x: 2, y: 0 },
      { plantLibraryId: 1, size: 3, x: 0, y: 2 },
    ];

    await expect(
      service.replaceGardenEditorPlants(1, { plants }),
    ).resolves.toEqual(plants);
    expect(replaceGardenPlants).toHaveBeenCalledWith(1, plants);
  });

  it('rejects overlapping plant footprints', async () => {
    const { service } = createService();

    await expect(
      service.replaceGardenEditorPlants(1, {
        plants: [
          { plantLibraryId: 1, size: 2, x: 0, y: 0 },
          { plantLibraryId: 1, size: 1, x: 1, y: 1 },
        ],
      }),
    ).rejects.toThrow('Garden editor plant grid spaces cannot overlap');
  });

  it('rejects plants whose footprint extends beyond the garden dimensions', async () => {
    const { service } = createService();

    await expect(
      service.replaceGardenEditorPlants(1, {
        plants: [{ plantLibraryId: 1, size: 3, x: 4, y: 0 }],
      }),
    ).rejects.toThrow('Garden editor plants must stay inside the garden dimensions');
  });

  it('rejects plants whose footprint is not fully inside a plant area', async () => {
    const { service } = createService({
      shapes: [
        {
          ...plantArea,
          points: [
            { x: 0, y: 0 },
            { x: 4, y: 0 },
            { x: 4, y: 4 },
            { x: 0, y: 4 },
          ],
        },
      ],
    });

    await expect(
      service.replaceGardenEditorPlants(1, {
        plants: [{ plantLibraryId: 1, size: 2, x: 3, y: 3 }],
      }),
    ).rejects.toThrow('Garden editor plants must stay inside a plant area');
  });
});
