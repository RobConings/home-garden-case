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

export const gardenEditorShapeResponseSchema = gardenEditorShapeSchema.safeExtend({
  gardenEditorShapeId: z.number(),
});

export const gardenEditorShapesResponseSchema = z.array(gardenEditorShapeResponseSchema);

z.globalRegistry.add(replaceGardenEditorShapesSchema, { id: 'ReplaceGardenEditorShapes' });
z.globalRegistry.add(gardenEditorShapesResponseSchema, { id: 'GardenEditorShapes' });

export type GardenEditorShapePayload = z.infer<typeof gardenEditorShapeSchema>;
export type ReplaceGardenEditorShapesPayload = z.infer<typeof replaceGardenEditorShapesSchema>;
