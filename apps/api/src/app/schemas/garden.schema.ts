import { z } from 'zod/v4';
import {
  optionalPlainTextSchema,
  nullablePlainTextResponseSchema,
  plainTextResponseSchema,
  requiredPlainTextSchema,
  textLimits,
} from '../shared/plain-text';

export const gardenIdParamsSchema = z.object({
  gardenId: z.coerce.number().int().positive('Garden ID must be a positive integer'),
});

z.globalRegistry.add(gardenIdParamsSchema, { id: 'GardenId' });

const sunDirectionSchema = z.enum(['north', 'east', 'south', 'west']);

const coordinateSchema = {
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .nullable()
    .optional(),
};

export const createGardenSchema = z
  .object({
    gardenName: requiredPlainTextSchema('Garden name', textLimits.name),
    totalWidth: z.number().positive('Total width must be greater than zero'),
    totalHeight: z.number().positive('Total height must be greater than zero'),
    gridSizeCm: z.number().int().positive().default(25),
    locationDescription: optionalPlainTextSchema('Location description', textLimits.description),
    sunDirection: sunDirectionSchema,
    ...coordinateSchema,
  })
  .refine(
    (data) => {
      const hasLat = data.latitude !== null && data.latitude !== undefined;
      const hasLng = data.longitude !== null && data.longitude !== undefined;
      // Both must be provided together or neither
      return hasLat === hasLng;
    },
    {
      message: 'Both latitude and longitude must be provided together',
    },
  );

z.globalRegistry.add(createGardenSchema, { id: 'CreateGarden' });

export type CreateGardenPayload = z.infer<typeof createGardenSchema>;

export const updateGardenSchema = createGardenSchema;

z.globalRegistry.add(updateGardenSchema, { id: 'UpdateGarden' });

export type UpdateGardenPayload = z.infer<typeof updateGardenSchema>;

export const gardenResponseSchema = z.object({
  gardenName: plainTextResponseSchema(textLimits.name),
  totalSurfaceArea: z.number().nonnegative(),
  totalWidth: z.number().nonnegative(),
  totalHeight: z.number().nonnegative(),
  gridSizeCm: z.number().int().positive(),
  locationDescription: nullablePlainTextResponseSchema(textLimits.description),
  sunDirection: sunDirectionSchema,
  ...coordinateSchema,
  gardenId: z.number(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

z.globalRegistry.add(gardenResponseSchema, { id: 'Garden' });

export const gardensResponseSchema = z.array(gardenResponseSchema);

z.globalRegistry.add(gardensResponseSchema, { id: 'Gardens' });
