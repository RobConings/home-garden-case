import { Garden } from '../database/types';
import { GardenRepository } from '../database/repositories/garden.repository';
import {
  GardenEditorRepository,
  type GardenEditorShapeWithPoints,
} from '../database/repositories/garden-editor.repository';
import {
  replaceGardenEditorShapesSchema,
  replaceGardenEditorPlantsSchema,
  type ReplaceGardenEditorPlantsPayload,
  type ReplaceGardenEditorShapesPayload,
} from '../schemas/garden-editor.schema';
import { PlantLibraryRepository } from '../database/repositories/plant-library.repository';
import { NotFoundError, ValidationError } from '../shared/errors';

export class GardenEditorService {
  private readonly gardenRepository: GardenRepository;
  private readonly gardenEditorRepository: GardenEditorRepository;
  private readonly plantLibraryRepository: PlantLibraryRepository;

  constructor(opts: {
    gardenRepository: GardenRepository;
    gardenEditorRepository: GardenEditorRepository;
    plantLibraryRepository: PlantLibraryRepository;
  }) {
    this.gardenRepository = opts.gardenRepository;
    this.gardenEditorRepository = opts.gardenEditorRepository;
    this.plantLibraryRepository = opts.plantLibraryRepository;
  }

  async getGardenEditorShapes(gardenId: number): Promise<GardenEditorShapeWithPoints[]> {
    await this.ensureGardenExists(gardenId);

    return await this.gardenEditorRepository.findByGardenId(gardenId);
  }

  async replaceGardenEditorShapes(
    gardenId: number,
    data: ReplaceGardenEditorShapesPayload,
  ): Promise<GardenEditorShapeWithPoints[]> {
    const garden = await this.ensureGardenExists(gardenId);
    const validatedData = replaceGardenEditorShapesSchema.parse(data);
    this.validateShapeBounds(garden, validatedData.shapes);

    return await this.gardenEditorRepository.replaceGardenShapes(gardenId, validatedData.shapes);
  }

  async getGardenEditorPlants(gardenId: number) {
    await this.ensureGardenExists(gardenId);

    return await this.gardenEditorRepository.findPlantsByGardenId(gardenId);
  }

  async replaceGardenEditorPlants(gardenId: number, data: ReplaceGardenEditorPlantsPayload) {
    const garden = await this.ensureGardenExists(gardenId);
    const validatedData = replaceGardenEditorPlantsSchema.parse(data);
    const shapes = await this.gardenEditorRepository.findByGardenId(gardenId);
    const plantAreas = shapes.filter((shape) => shape.shapeType === 'plant_area');
    const gridStepMeters = Math.max((garden.gridSizeCm || 25) / 100, 0.05);

    for (const plant of validatedData.plants) {
      if (!isPlantFootprintInsideGarden(plant, garden, gridStepMeters)) {
        throw new ValidationError('Garden editor plants must stay inside the garden dimensions');
      }

      const libraryPlant = await this.plantLibraryRepository.findById(plant.plantLibraryId);
      if (!libraryPlant) {
        throw new NotFoundError(`Plant library entry with ID ${plant.plantLibraryId} not found`);
      }

      if (!isPlantFootprintInsidePlantArea(plant, plantAreas, gridStepMeters)) {
        throw new ValidationError('Garden editor plants must stay inside a plant area');
      }
    }

    for (let index = 0; index < validatedData.plants.length; index += 1) {
      const plant = validatedData.plants[index];

      for (
        let compareIndex = index + 1;
        compareIndex < validatedData.plants.length;
        compareIndex += 1
      ) {
        const otherPlant = validatedData.plants[compareIndex];

        if (doPlantFootprintsOverlap(plant, otherPlant, gridStepMeters)) {
          throw new ValidationError('Garden editor plant grid spaces cannot overlap');
        }
      }
    }

    return await this.gardenEditorRepository.replaceGardenPlants(gardenId, validatedData.plants);
  }

  private async ensureGardenExists(gardenId: number) {
    const garden = await this.gardenRepository.findById(gardenId);

    if (!garden) {
      throw new NotFoundError(`Garden with ID ${gardenId} not found`);
    }

    return garden;
  }

  private validateShapeBounds(garden: Garden, shapes: ReplaceGardenEditorShapesPayload['shapes']) {
    for (const shape of shapes) {
      for (const point of shape.points) {
        if (point.x > garden.totalWidth || point.y > garden.totalHeight) {
          throw new Error('Garden editor points must stay inside the garden dimensions');
        }
      }
    }
  }
}

function isPlantFootprintInsideGarden(
  plant: { x: number; y: number; size: number },
  garden: Garden,
  gridStepMeters: number,
) {
  const footprintMeters = plant.size * gridStepMeters;

  return (
    plant.x >= 0 &&
    plant.y >= 0 &&
    plant.x + footprintMeters <= garden.totalWidth + 0.0001 &&
    plant.y + footprintMeters <= garden.totalHeight + 0.0001
  );
}

function isPlantFootprintInsidePlantArea(
  plant: { x: number; y: number; size: number },
  plantAreas: GardenEditorShapeWithPoints[],
  gridStepMeters: number,
) {
  const samplePoints = getPlantFootprintSamplePoints(plant, gridStepMeters);

  return plantAreas.some((plantArea) =>
    samplePoints.every((point) => isPointInPolygon(point, plantArea.points)),
  );
}

function getPlantFootprintSamplePoints(
  plant: { x: number; y: number; size: number },
  gridStepMeters: number,
) {
  return Array.from({ length: plant.size }).flatMap((_, columnIndex) =>
    Array.from({ length: plant.size }).map((__, rowIndex) => ({
      x: plant.x + columnIndex * gridStepMeters + gridStepMeters / 2,
      y: plant.y + rowIndex * gridStepMeters + gridStepMeters / 2,
    })),
  );
}

function doPlantFootprintsOverlap(
  plant: { x: number; y: number; size: number },
  otherPlant: { x: number; y: number; size: number },
  gridStepMeters: number,
) {
  const plantSizeMeters = plant.size * gridStepMeters;
  const otherPlantSizeMeters = otherPlant.size * gridStepMeters;

  return (
    plant.x < otherPlant.x + otherPlantSizeMeters - 0.0001 &&
    plant.x + plantSizeMeters > otherPlant.x + 0.0001 &&
    plant.y < otherPlant.y + otherPlantSizeMeters - 0.0001 &&
    plant.y + plantSizeMeters > otherPlant.y + 0.0001
  );
}

function isPointInPolygon(
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
) {
  let isInside = false;

  for (let index = 0; index < polygon.length; index += 1) {
    const previousIndex = index === 0 ? polygon.length - 1 : index - 1;
    const currentPoint = polygon[index];
    const previousPoint = polygon[previousIndex];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}
