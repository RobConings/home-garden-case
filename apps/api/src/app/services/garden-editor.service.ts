import { Garden, PlantLibrary } from '../database/types';
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

    return await this.gardenEditorRepository.replaceGardenShapes(
      gardenId,
      validatedData.shapes,
    );
  }

  async getGardenEditorPlants(gardenId: number) {
    await this.ensureGardenExists(gardenId);

    return await this.gardenEditorRepository.findPlantsByGardenId(gardenId);
  }

  async replaceGardenEditorPlants(
    gardenId: number,
    data: ReplaceGardenEditorPlantsPayload,
  ) {
    const garden = await this.ensureGardenExists(gardenId);
    const validatedData = replaceGardenEditorPlantsSchema.parse(data);
    const shapes = await this.gardenEditorRepository.findByGardenId(gardenId);
    const plantAreas = shapes.filter((shape) => shape.shapeType === 'plant_area');
    const libraryPlants = new Map<number, PlantLibrary>();

    for (const plant of validatedData.plants) {
      if (plant.x > garden.totalWidth || plant.y > garden.totalHeight) {
        throw new ValidationError('Garden editor plants must stay inside the garden dimensions');
      }

      const libraryPlant = await this.plantLibraryRepository.findById(plant.plantLibraryId);
      if (!libraryPlant) {
        throw new NotFoundError(
          `Plant library entry with ID ${plant.plantLibraryId} not found`,
        );
      }

      libraryPlants.set(plant.plantLibraryId, libraryPlant);

      if (!plantAreas.some((shape) => isPointInPolygon(plant, shape.points))) {
        throw new ValidationError('Garden editor plants must stay inside a plant area');
      }
    }

    for (let index = 0; index < validatedData.plants.length; index += 1) {
      const plant = validatedData.plants[index];
      const plantRadius = getPlantSpacingRadiusMeters(libraryPlants.get(plant.plantLibraryId));

      for (
        let compareIndex = index + 1;
        compareIndex < validatedData.plants.length;
        compareIndex += 1
      ) {
        const otherPlant = validatedData.plants[compareIndex];
        const otherPlantRadius = getPlantSpacingRadiusMeters(
          libraryPlants.get(otherPlant.plantLibraryId),
        );
        const distance = Math.hypot(plant.x - otherPlant.x, plant.y - otherPlant.y);

        if (distance < plantRadius + otherPlantRadius) {
          throw new ValidationError('Garden editor plant spacing boundaries cannot overlap');
        }
      }
    }

    return await this.gardenEditorRepository.replaceGardenPlants(
      gardenId,
      validatedData.plants,
    );
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

function getPlantSpacingRadiusMeters(plant: PlantLibrary | undefined) {
  return Math.max((plant?.spacingCm ?? 30) / 100 / 2, 0.15);
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
