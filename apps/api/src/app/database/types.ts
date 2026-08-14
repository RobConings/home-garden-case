import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
  user: UserTable;
  garden: GardenTable;
  gardenEditorShape: GardenEditorShapeTable;
  gardenEditorShapePoint: GardenEditorShapePointTable;
  plant: PlantTable;
  plantLibrary: PlantLibraryTable;
}

export interface UserTable {
  userId: Generated<number>;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  passwordHash: string | null;
  themePreference: ColumnType<'light' | 'dark', 'light' | 'dark' | undefined, 'light' | 'dark'>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface GardenTable {
  gardenId: Generated<number>;
  gardenName: string;
  totalSurfaceArea: number; // in square meters
  totalWidth: number; // in meters
  totalHeight: number; // in meters
  gridSizeCm: number;
  locationDescription: string | null; // e.g., "Backyard", "Patio"
  sunDirection: 'north' | 'east' | 'south' | 'west';
  latitude: number | null; // optional geographic coordinate
  longitude: number | null; // optional geographic coordinate
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type Garden = Selectable<GardenTable>;
export type NewGarden = Insertable<GardenTable>;
export type GardenUpdate = Updateable<GardenTable>;

export interface GardenEditorShapeTable {
  gardenEditorShapeId: Generated<number>;
  gardenId: number;
  shapeType: 'blocking_building' | 'pathway' | 'grass' | 'plant_area';
  sortOrder: number;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type GardenEditorShape = Selectable<GardenEditorShapeTable>;
export type NewGardenEditorShape = Insertable<GardenEditorShapeTable>;

export interface GardenEditorShapePointTable {
  gardenEditorShapePointId: Generated<number>;
  gardenEditorShapeId: number;
  pointIndex: number;
  x: number;
  y: number;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type GardenEditorShapePoint = Selectable<GardenEditorShapePointTable>;
export type NewGardenEditorShapePoint = Insertable<GardenEditorShapePointTable>;

export interface PlantTable {
  plantId: Generated<number>;
  plantLibraryId: ColumnType<number | null, number | null | undefined, number | null>;
  plantName: string;
  species: string;
  plantType: 'vegetable' | 'fruit' | 'flower';
  plantationDate: ColumnType<Date, string | undefined, never>;
  surfaceAreaRequired: number; // in square meters
  idealHumidityLevel: number;
  gardenId: number; // foreign key to Garden
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type Plant = Selectable<PlantTable>;
export type NewPlant = Insertable<PlantTable>;
export type PlantUpdate = Updateable<PlantTable>;

export interface PlantLibraryTable {
  plantLibraryId: Generated<number>;
  commonName: string;
  botanicalName: string | null;
  plantCategory: 'vegetable' | 'fruit' | 'herb' | 'flower';
  waterNeed: 'low' | 'moderate' | 'high';
  waterNotes: string;
  sunNeed: 'full_sun' | 'partial_sun' | 'partial_shade';
  sunNotes: string;
  nutritionNeed: 'low' | 'moderate' | 'high';
  nutritionNotes: string;
  plantingNotes: string;
  spacingCm: number | null;
  daysToMaturity: number | null;
  source: 'system' | 'user';
  ownerUserId: number | null;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type PlantLibrary = Selectable<PlantLibraryTable>;
export type NewPlantLibrary = Insertable<PlantLibraryTable>;
export type PlantLibraryUpdate = Updateable<PlantLibraryTable>;
