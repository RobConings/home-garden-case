import { apiRequest } from '@/lib/api.server';

export type SunDirection = 'north' | 'east' | 'south' | 'west';

export type Garden = {
  gardenId: number;
  gardenName: string;
  totalSurfaceArea: number;
  totalWidth: number;
  totalHeight: number;
  gridSizeCm: number;
  locationDescription: string | null;
  sunDirection: SunDirection;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateGardenPayload = {
  gardenName: string;
  locationDescription?: string | null;
  totalWidth: number;
  totalHeight: number;
  gridSizeCm: number;
  sunDirection: SunDirection;
};

export type UpdateGardenPayload = CreateGardenPayload;

export async function getGardens() {
  return await apiRequest<Garden[]>('/gardens');
}

export async function getGarden(gardenId: number) {
  return await apiRequest<Garden>(`/gardens/${gardenId}`);
}

export async function createGarden(payload: CreateGardenPayload) {
  return await apiRequest<Garden>('/gardens', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGarden(gardenId: number, payload: UpdateGardenPayload) {
  return await apiRequest<Garden>(`/gardens/${gardenId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteGarden(gardenId: number) {
  return await apiRequest<void>(`/gardens/${gardenId}`, {
    method: 'DELETE',
  });
}
