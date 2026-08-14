import { apiRequest } from '@/lib/api.server';

export type GardenEditorShapeType =
  | 'blocking_building'
  | 'pathway'
  | 'grass'
  | 'plant_area';

export type GardenEditorPoint = {
  x: number;
  y: number;
};

export type GardenEditorShape = {
  gardenEditorShapeId: number;
  shapeType: GardenEditorShapeType;
  points: GardenEditorPoint[];
};

export type GardenEditorPlant = {
  gardenEditorPlantId: number;
  plantLibraryId: number;
  x: number;
  y: number;
};

export type ReplaceGardenEditorShapesPayload = {
  shapes: Array<{
    shapeType: GardenEditorShapeType;
    points: GardenEditorPoint[];
  }>;
};

export type ReplaceGardenEditorPlantsPayload = {
  plants: Array<{
    plantLibraryId: number;
    x: number;
    y: number;
  }>;
};

export async function getGardenEditorShapes(gardenId: number) {
  return await apiRequest<GardenEditorShape[]>(`/gardens/${gardenId}/editor-shapes`);
}

export async function replaceGardenEditorShapes(
  gardenId: number,
  payload: ReplaceGardenEditorShapesPayload,
) {
  return await apiRequest<GardenEditorShape[]>(`/gardens/${gardenId}/editor-shapes`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getGardenEditorPlants(gardenId: number) {
  return await apiRequest<GardenEditorPlant[]>(`/gardens/${gardenId}/editor-plants`);
}

export async function replaceGardenEditorPlants(
  gardenId: number,
  payload: ReplaceGardenEditorPlantsPayload,
) {
  return await apiRequest<GardenEditorPlant[]>(`/gardens/${gardenId}/editor-plants`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
