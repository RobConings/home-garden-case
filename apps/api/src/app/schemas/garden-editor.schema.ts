import { z } from 'zod/v4';

export const gardenEditorShapeTypeSchema = z.enum([
  'blocking_building',
  'pathway',
  'grass',
  'plant_area',
]);

export const gardenEditorPointSchema = z.object({
  x: z.number().finite().nonnegative(),
  y: z.number().finite().nonnegative(),
});

export const gardenEditorShapeSchema = z.object({
  shapeType: gardenEditorShapeTypeSchema,
  points: z.array(gardenEditorPointSchema).min(3, 'A shape needs at least 3 points'),
});

export const replaceGardenEditorShapesSchema = z.object({
  shapes: z.array(gardenEditorShapeSchema),
});

export const gardenEditorPlantSchema = z.object({
  plantLibraryId: z.number().int().positive('Plant library ID must be a positive integer'),
  x: z.number().finite().nonnegative(),
  y: z.number().finite().nonnegative(),
});

export const replaceGardenEditorPlantsSchema = z.object({
  plants: z.array(gardenEditorPlantSchema),
});

export const gardenEditorShapeResponseSchema = gardenEditorShapeSchema.safeExtend({
  gardenEditorShapeId: z.number(),
});

export const gardenEditorShapesResponseSchema = z.array(gardenEditorShapeResponseSchema);

export const gardenEditorPlantResponseSchema = gardenEditorPlantSchema.safeExtend({
  gardenEditorPlantId: z.number(),
});

export const gardenEditorPlantsResponseSchema = z.array(gardenEditorPlantResponseSchema);

z.globalRegistry.add(replaceGardenEditorShapesSchema, { id: 'ReplaceGardenEditorShapes' });
z.globalRegistry.add(gardenEditorShapesResponseSchema, { id: 'GardenEditorShapes' });
z.globalRegistry.add(replaceGardenEditorPlantsSchema, { id: 'ReplaceGardenEditorPlants' });
z.globalRegistry.add(gardenEditorPlantsResponseSchema, { id: 'GardenEditorPlants' });

export type GardenEditorShapePayload = z.infer<typeof gardenEditorShapeSchema>;
export type ReplaceGardenEditorShapesPayload = z.infer<typeof replaceGardenEditorShapesSchema>;
export type GardenEditorPlantPayload = z.infer<typeof gardenEditorPlantSchema>;
export type ReplaceGardenEditorPlantsPayload = z.infer<typeof replaceGardenEditorPlantsSchema>;
