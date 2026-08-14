import { apiRequest } from '@/lib/api.server';

export type PlantCategory = 'vegetable' | 'fruit' | 'herb' | 'flower';
export type PlantNeed = 'low' | 'moderate' | 'high';
export type SunNeed = 'full_sun' | 'partial_sun' | 'partial_shade';

export type PlantLibraryEntry = {
  plantLibraryId: number;
  commonName: string;
  botanicalName: string | null;
  plantCategory: PlantCategory;
  waterNeed: PlantNeed;
  waterNotes: string;
  sunNeed: SunNeed;
  sunNotes: string;
  nutritionNeed: PlantNeed;
  nutritionNotes: string;
  plantingNotes: string;
  spacingCm: number | null;
  daysToMaturity: number | null;
  source: 'system' | 'user';
  ownerUserId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PlantLibraryPage = {
  items: PlantLibraryEntry[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type PlantLibraryPageOptions = {
  search?: string;
  limit?: number;
  offset?: number;
};

export type CreatePlantLibraryEntryPayload = {
  commonName: string;
  botanicalName?: string | null;
  plantCategory: PlantCategory;
  waterNeed: PlantNeed;
  waterNotes?: string | null;
  sunNeed: SunNeed;
  sunNotes?: string | null;
  nutritionNeed: PlantNeed;
  nutritionNotes?: string | null;
  plantingNotes?: string | null;
  spacingCm?: number | null;
  daysToMaturity?: number | null;
  ownerUserId: number;
};

export type UpdatePlantLibraryEntryPayload = Omit<
  CreatePlantLibraryEntryPayload,
  'ownerUserId'
>;

export async function getPlantLibrary(ownerUserId?: number) {
  const query = ownerUserId ? `?ownerUserId=${ownerUserId}` : '';

  return await apiRequest<PlantLibraryEntry[]>(`/plant-library${query}`);
}

export async function getPlantLibraryPage(
  ownerUserId: number | undefined,
  options: PlantLibraryPageOptions = {},
) {
  const params = new URLSearchParams();

  if (ownerUserId) {
    params.set('ownerUserId', String(ownerUserId));
  }

  if (options.search) {
    params.set('search', options.search);
  }

  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  if (typeof options.offset === 'number') {
    params.set('offset', String(options.offset));
  }

  const query = params.toString();

  return await apiRequest<PlantLibraryPage>(`/plant-library/page${query ? `?${query}` : ''}`);
}

export async function getPlantLibraryEntry(plantLibraryId: number, ownerUserId?: number) {
  const query = ownerUserId ? `?ownerUserId=${ownerUserId}` : '';

  return await apiRequest<PlantLibraryEntry>(`/plant-library/${plantLibraryId}${query}`);
}

export async function createPlantLibraryEntry(payload: CreatePlantLibraryEntryPayload) {
  return await apiRequest<PlantLibraryEntry>('/plant-library', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlantLibraryEntry(
  plantLibraryId: number,
  ownerUserId: number,
  payload: UpdatePlantLibraryEntryPayload,
) {
  return await apiRequest<PlantLibraryEntry>(
    `/plant-library/${plantLibraryId}?ownerUserId=${ownerUserId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

export async function deletePlantLibraryEntry(plantLibraryId: number, ownerUserId: number) {
  return await apiRequest<void>(`/plant-library/${plantLibraryId}?ownerUserId=${ownerUserId}`, {
    method: 'DELETE',
  });
}
