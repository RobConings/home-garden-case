import { PlantLibraryRepository } from '../database/repositories/plant-library.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { PlantLibrary } from '../database/types';
import {
  createPlantLibrarySchema,
  updatePlantLibrarySchema,
} from '../schemas/plant-library.schema';
import { NotFoundError, ValidationError } from '../shared/errors';
import type { z } from 'zod/v4';

type CreatePlantLibraryInput = z.infer<typeof createPlantLibrarySchema>;
type UpdatePlantLibraryInput = z.infer<typeof updatePlantLibrarySchema>;

type PlantLibraryPageOptions = {
  search?: string;
  limit: number;
  offset: number;
};

export class PlantLibraryService {
  private readonly plantLibraryRepository: PlantLibraryRepository;
  private readonly userRepository: UserRepository;

  constructor(opts: {
    plantLibraryRepository: PlantLibraryRepository;
    userRepository: UserRepository;
  }) {
    this.plantLibraryRepository = opts.plantLibraryRepository;
    this.userRepository = opts.userRepository;
  }

  async getVisiblePlants(ownerUserId?: number): Promise<PlantLibrary[]> {
    if (ownerUserId) {
      await this.ensureUserExists(ownerUserId);
    }

    return await this.plantLibraryRepository.findVisibleToUser(ownerUserId);
  }

  async getVisiblePlantPage(ownerUserId: number | undefined, options: PlantLibraryPageOptions) {
    if (ownerUserId) {
      await this.ensureUserExists(ownerUserId);
    }

    const plants = await this.plantLibraryRepository.findVisibleToUser(ownerUserId);
    const searchTerms = getSearchTerms(options.search);
    const filteredPlants = searchTerms.length
      ? plants.filter((plant) => matchesPlantSearch(plant, searchTerms))
      : plants;
    const total = filteredPlants.length;
    const items = filteredPlants.slice(options.offset, options.offset + options.limit);

    return {
      items,
      total,
      limit: options.limit,
      offset: options.offset,
      hasMore: options.offset + items.length < total,
    };
  }

  async getPlantById(plantLibraryId: number): Promise<PlantLibrary> {
    const plant = await this.plantLibraryRepository.findById(plantLibraryId);

    if (!plant) {
      throw new NotFoundError(`Plant library entry with ID ${plantLibraryId} not found`);
    }

    return plant;
  }

  async getVisiblePlantById(plantLibraryId: number, ownerUserId?: number): Promise<PlantLibrary> {
    if (ownerUserId) {
      await this.ensureUserExists(ownerUserId);
    }

    const plant = await this.getPlantById(plantLibraryId);
    const isVisible =
      plant.source === 'system' || Boolean(ownerUserId && plant.ownerUserId === ownerUserId);

    if (!isVisible) {
      throw new NotFoundError(`Plant library entry with ID ${plantLibraryId} not found`);
    }

    return plant;
  }

  async createCustomPlant(data: CreatePlantLibraryInput): Promise<PlantLibrary> {
    const validatedData = createPlantLibrarySchema.parse(data);
    await this.ensureUserExists(validatedData.ownerUserId);

    return await this.plantLibraryRepository.create({
      ...validatedData,
      botanicalName: validatedData.botanicalName ?? null,
      waterNotes: validatedData.waterNotes ?? '',
      sunNotes: validatedData.sunNotes ?? '',
      nutritionNotes: validatedData.nutritionNotes ?? '',
      plantingNotes: validatedData.plantingNotes ?? '',
      spacingCm: validatedData.spacingCm ?? null,
      daysToMaturity: validatedData.daysToMaturity ?? null,
      source: 'user',
      ownerUserId: validatedData.ownerUserId,
    });
  }

  async updateCustomPlant(
    plantLibraryId: number,
    ownerUserId: number,
    data: UpdatePlantLibraryInput,
  ): Promise<PlantLibrary> {
    await this.ensureUserExists(ownerUserId);
    const existingPlant = await this.getEditableCustomPlant(plantLibraryId, ownerUserId);
    const validatedData = updatePlantLibrarySchema.parse(data);

    return await this.plantLibraryRepository.update(existingPlant.plantLibraryId, {
      ...validatedData,
      botanicalName: validatedData.botanicalName ?? null,
      waterNotes: validatedData.waterNotes ?? '',
      sunNotes: validatedData.sunNotes ?? '',
      nutritionNotes: validatedData.nutritionNotes ?? '',
      plantingNotes: validatedData.plantingNotes ?? '',
      spacingCm: validatedData.spacingCm ?? null,
      daysToMaturity: validatedData.daysToMaturity ?? null,
    });
  }

  async deleteCustomPlant(plantLibraryId: number, ownerUserId: number): Promise<void> {
    await this.ensureUserExists(ownerUserId);
    const existingPlant = await this.getEditableCustomPlant(plantLibraryId, ownerUserId);
    const deleted = await this.plantLibraryRepository.delete(existingPlant.plantLibraryId);

    if (!deleted) {
      throw new Error(`Failed to delete plant library entry with ID ${plantLibraryId}`);
    }
  }

  private async ensureUserExists(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
  }

  private async getEditableCustomPlant(plantLibraryId: number, ownerUserId: number) {
    const plant = await this.getVisiblePlantById(plantLibraryId, ownerUserId);

    if (plant.source !== 'user' || plant.ownerUserId !== ownerUserId) {
      throw new ValidationError('Only custom plants owned by this user can be changed');
    }

    return plant;
  }
}

function getSearchTerms(search?: string) {
  return (search ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function matchesPlantSearch(plant: PlantLibrary, searchTerms: string[]) {
  if (!matchesCarePairing(plant, searchTerms)) {
    return false;
  }

  const searchableText = [
    plant.commonName,
    plant.botanicalName,
    plant.plantCategory,
    plant.waterNeed,
    `${plant.waterNeed} water`,
    `water ${plant.waterNeed}`,
    plant.waterNotes,
    plant.sunNeed,
    formatSearchValue(plant.sunNeed),
    `${formatSearchValue(plant.sunNeed)} sun`,
    `sun ${formatSearchValue(plant.sunNeed)}`,
    plant.sunNotes,
    plant.nutritionNeed,
    `${plant.nutritionNeed} nutrition`,
    `nutrition ${plant.nutritionNeed}`,
    plant.nutritionNotes,
    plant.plantingNotes,
    plant.source,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchTerms.every((term) => searchableText.includes(term));
}

function matchesCarePairing(plant: PlantLibrary, searchTerms: string[]) {
  const needTerm = searchTerms.find(
    (term) => term === 'low' || term === 'moderate' || term === 'high',
  );

  if (needTerm && searchTerms.includes('water') && plant.waterNeed !== needTerm) {
    return false;
  }

  if (needTerm && searchTerms.includes('nutrition') && plant.nutritionNeed !== needTerm) {
    return false;
  }

  if (searchTerms.includes('sun')) {
    if (searchTerms.includes('full') && plant.sunNeed !== 'full_sun') {
      return false;
    }

    if (searchTerms.includes('shade') && plant.sunNeed !== 'partial_shade') {
      return false;
    }

    if (
      searchTerms.includes('partial') &&
      !searchTerms.includes('shade') &&
      plant.sunNeed !== 'partial_sun'
    ) {
      return false;
    }
  }

  return true;
}

function formatSearchValue(value: string) {
  return value.replace(/_/g, ' ');
}
