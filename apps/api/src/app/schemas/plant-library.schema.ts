import { z } from 'zod/v4';

export const plantLibraryIdParamsSchema = z.object({
  plantLibraryId: z.coerce.number().int().positive('Plant library ID must be a positive integer'),
});

z.globalRegistry.add(plantLibraryIdParamsSchema, { id: 'PlantLibraryId' });

export const plantLibraryOwnerQuerySchema = z.object({
  ownerUserId: z.coerce.number().int().positive('User ID must be a positive integer').optional(),
});

z.globalRegistry.add(plantLibraryOwnerQuerySchema, { id: 'PlantLibraryOwnerQuery' });

export const plantLibraryPageQuerySchema = plantLibraryOwnerQuerySchema.extend({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});

z.globalRegistry.add(plantLibraryPageQuerySchema, { id: 'PlantLibraryPageQuery' });

export const plantLibraryOwnerRequiredQuerySchema = z.object({
  ownerUserId: z.coerce.number().int().positive('User ID must be a positive integer'),
});

z.globalRegistry.add(plantLibraryOwnerRequiredQuerySchema, {
  id: 'PlantLibraryOwnerRequiredQuery',
});

export const plantCategorySchema = z.enum(['vegetable', 'fruit', 'herb', 'flower'], {
  message: 'Plant category must be vegetable, fruit, herb, or flower',
});

export const waterNeedSchema = z.enum(['low', 'moderate', 'high'], {
  message: 'Water need must be low, moderate, or high',
});

export const sunNeedSchema = z.enum(['full_sun', 'partial_sun', 'partial_shade'], {
  message: 'Sun need must be full_sun, partial_sun, or partial_shade',
});

export const nutritionNeedSchema = z.enum(['low', 'moderate', 'high'], {
  message: 'Nutrition need must be low, moderate, or high',
});

export const createPlantLibrarySchema = z.object({
  commonName: z.string().min(1, 'Common name is required').trim(),
  botanicalName: z.string().trim().nullable().optional(),
  plantCategory: plantCategorySchema,
  waterNeed: waterNeedSchema,
  waterNotes: z.string().trim().nullable().optional(),
  sunNeed: sunNeedSchema,
  sunNotes: z.string().trim().nullable().optional(),
  nutritionNeed: nutritionNeedSchema,
  nutritionNotes: z.string().trim().nullable().optional(),
  plantingNotes: z.string().trim().nullable().optional(),
  spacingCm: z.number().positive('Spacing must be positive').nullable().optional(),
  daysToMaturity: z
    .number()
    .int()
    .positive('Days to maturity must be positive')
    .nullable()
    .optional(),
  ownerUserId: z.number().int().positive('User ID must be a positive integer'),
});

z.globalRegistry.add(createPlantLibrarySchema, { id: 'CreatePlantLibrary' });

export const updatePlantLibrarySchema = createPlantLibrarySchema.omit({ ownerUserId: true });

z.globalRegistry.add(updatePlantLibrarySchema, { id: 'UpdatePlantLibrary' });

export const plantLibraryResponseSchema = z.object({
  plantLibraryId: z.number(),
  commonName: z.string(),
  botanicalName: z.string().nullable(),
  plantCategory: plantCategorySchema,
  waterNeed: waterNeedSchema,
  waterNotes: z.string(),
  sunNeed: sunNeedSchema,
  sunNotes: z.string(),
  nutritionNeed: nutritionNeedSchema,
  nutritionNotes: z.string(),
  plantingNotes: z.string(),
  spacingCm: z.number().nullable(),
  daysToMaturity: z.number().nullable(),
  source: z.enum(['system', 'user']),
  ownerUserId: z.number().nullable(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

z.globalRegistry.add(plantLibraryResponseSchema, { id: 'PlantLibrary' });

export const plantLibraryListResponseSchema = z.array(plantLibraryResponseSchema);

z.globalRegistry.add(plantLibraryListResponseSchema, { id: 'PlantLibraryList' });

export const plantLibraryPageResponseSchema = z.object({
  items: plantLibraryListResponseSchema,
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

z.globalRegistry.add(plantLibraryPageResponseSchema, { id: 'PlantLibraryPage' });
