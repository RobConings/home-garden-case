import { Garden } from '../database/types';
import { GardenRepository } from '../database/repositories/garden.repository';
import {
  GardenEditorRepository,
  type GardenEditorShapeWithPoints,
} from '../database/repositories/garden-editor.repository';
import {
  replaceGardenEditorShapesSchema,
  type ReplaceGardenEditorShapesPayload,
} from '../schemas/garden-editor.schema';
import { NotFoundError } from '../shared/errors';

export class GardenEditorService {
  private readonly gardenRepository: GardenRepository;
  private readonly gardenEditorRepository: GardenEditorRepository;

  constructor(opts: {
    gardenRepository: GardenRepository;
    gardenEditorRepository: GardenEditorRepository;
  }) {
    this.gardenRepository = opts.gardenRepository;
    this.gardenEditorRepository = opts.gardenEditorRepository;
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
