import { GardenRepository } from '../database/repositories/garden.repository';
import { Garden, GardenUpdate, NewGarden } from '../database/types';
import {
  createGardenSchema,
  type CreateGardenPayload,
  updateGardenSchema,
  type UpdateGardenPayload,
} from '../schemas/garden.schema';
import { NotFoundError } from '../shared/errors';

export class GardenService {
  private readonly gardenRepository: GardenRepository;

  constructor(opts: { gardenRepository: GardenRepository }) {
    this.gardenRepository = opts.gardenRepository;
  }

  /**
   * Get all gardens
   */
  async getAllGardens(): Promise<Garden[]> {
    return await this.gardenRepository.findAll();
  }

  /**
   * Get a garden by ID
   * @throws Error if garden not found
   */
  async getGardenById(gardenId: number): Promise<Garden> {
    const garden = await this.gardenRepository.findById(gardenId);
    if (!garden) {
      throw new NotFoundError(`Garden with ID ${gardenId} not found`);
    }
    return garden;
  }

  /**
   * Create a new garden
   * @throws Error if validation fails
   */
  async createGarden(data: CreateGardenPayload): Promise<Garden> {
    const validatedData = createGardenSchema.parse(data);
    const gardenData: NewGarden = {
      ...validatedData,
      totalSurfaceArea: calculateSurfaceArea(validatedData.totalWidth, validatedData.totalHeight),
    };

    return await this.gardenRepository.create(gardenData);
  }

  /**
   * Update a garden
   * @throws Error if garden not found or validation fails
   */
  async updateGarden(gardenId: number, data: UpdateGardenPayload): Promise<Garden> {
    // Verify garden exists
    const existingGarden = await this.gardenRepository.findById(gardenId);
    if (!existingGarden) {
      throw new NotFoundError(`Garden with ID ${gardenId} not found`);
    }

    const validatedData = updateGardenSchema.parse(data);
    const gardenData: GardenUpdate = {
      ...validatedData,
      totalWidth: existingGarden.totalWidth,
      totalHeight: existingGarden.totalHeight,
      gridSizeCm: existingGarden.gridSizeCm,
      totalSurfaceArea: existingGarden.totalSurfaceArea,
    };

    return await this.gardenRepository.update(gardenId, gardenData);
  }

  /**
   * Delete a garden
   * @throws Error if garden not found
   */
  async deleteGarden(gardenId: number): Promise<void> {
    const garden = await this.gardenRepository.findById(gardenId);
    if (!garden) {
      throw new NotFoundError(`Garden with ID ${gardenId} not found`);
    }

    const deleted = await this.gardenRepository.delete(gardenId);
    if (!deleted) {
      throw new Error(`Failed to delete garden with ID ${gardenId}`);
    }
  }
}

function calculateSurfaceArea(totalWidth: number, totalHeight: number) {
  return totalWidth * totalHeight;
}
