import { apiRequest } from '@/lib/api.server';
import { textLimits, toSafeDisplayText } from '@/lib/plain-text';

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
  const gardens = await apiRequest<Garden[]>('/gardens');
  return gardens.map(normalizeGarden);
}

export async function getGarden(gardenId: number) {
  const garden = await apiRequest<Garden>(`/gardens/${gardenId}`);
  return normalizeGarden(garden);
}

export async function createGarden(payload: CreateGardenPayload) {
  const garden = await apiRequest<Garden>('/gardens', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeGarden(garden);
}

export async function updateGarden(gardenId: number, payload: UpdateGardenPayload) {
  const garden = await apiRequest<Garden>(`/gardens/${gardenId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return normalizeGarden(garden);
}

export async function deleteGarden(gardenId: number) {
  return await apiRequest<void>(`/gardens/${gardenId}`, {
    method: 'DELETE',
  });
}

function normalizeGarden(garden: Garden): Garden {
  return {
    ...garden,
    gardenName: toSafeDisplayText(garden.gardenName, textLimits.name),
    locationDescription: garden.locationDescription
      ? toSafeDisplayText(garden.locationDescription, textLimits.description)
      : null,
  };
}
