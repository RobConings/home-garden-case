import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  getGarden,
  getGardenEditorPlants,
  getGardenEditorShapes,
  replaceGardenEditorPlants,
  replaceGardenEditorShapes,
  type Garden,
} from '@/features/gardens/api';
import { getPlantLibrary } from '@/features/plants/api';
import {
  GardenEditor,
  type GardenEditorActionData,
  type GardenEditorLoaderData,
  type EditorShapeType,
  type GardenEditorShape,
  type PlacedPlant,
} from '@/features/gardens/components';
import { ApiClientError } from '@/lib/api.server';
import { requireUser } from '@/lib/session.server';

export const meta: MetaFunction = () => [
  { title: 'Garden Editor | Rootly' },
  {
    name: 'description',
    content: 'Draw simple garden zones in Rootly.',
  },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const gardenId = Number(params.gardenId);

  if (!Number.isFinite(gardenId)) {
    throw redirect('/dashboard/gardens');
  }

  try {
    const garden = await getGarden(gardenId);
    const shapes = await getGardenEditorShapes(gardenId);
    const plants = await getGardenEditorPlants(gardenId);
    const plantLibrary = await getPlantLibrary(user.userId);

    return {
      garden,
      plantLibrary,
      plants: plants.map((plant) => ({
        id: String(plant.gardenEditorPlantId),
        persistedId: plant.gardenEditorPlantId,
        plantLibraryId: plant.plantLibraryId,
        size: normalizePlantSize(plant.size),
        x: plant.x,
        y: plant.y,
      })),
      shapes: shapes.map((shape) => ({
        id: String(shape.gardenEditorShapeId),
        persistedId: shape.gardenEditorShapeId,
        type: shape.shapeType,
        points: shape.points,
      })),
    } satisfies GardenEditorLoaderData;
  } catch {
    throw redirect('/dashboard/gardens');
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUser(request);
  const gardenId = Number(params.gardenId);
  const formData = await request.formData();

  if (!Number.isFinite(gardenId)) {
    throw redirect('/dashboard/gardens');
  }

  try {
    const garden = await getGarden(gardenId);
    const shapes = readShapesPayload(formData);
    const plants = readPlantsPayload(formData);
    validateShapeBounds(garden, shapes);
    validatePlantBounds(garden, plants);
    const savedShapes = await replaceGardenEditorShapes(gardenId, {
      shapes: shapes.map((shape) => ({
        shapeType: shape.type,
        points: shape.points,
      })),
    });
    const savedPlants = await replaceGardenEditorPlants(gardenId, {
      plants: plants.map((plant) => ({
        plantLibraryId: plant.plantLibraryId,
        size: plant.size,
        x: plant.x,
        y: plant.y,
      })),
    });

    return json<GardenEditorActionData>({
      type: 'success',
      message: 'Garden editor saved.',
      plants: savedPlants.map((plant) => ({
        id: String(plant.gardenEditorPlantId),
        persistedId: plant.gardenEditorPlantId,
        plantLibraryId: plant.plantLibraryId,
        size: normalizePlantSize(plant.size),
        x: plant.x,
        y: plant.y,
      })),
      shapes: savedShapes.map((shape) => ({
        id: String(shape.gardenEditorShapeId),
        persistedId: shape.gardenEditorShapeId,
        type: shape.shapeType,
        points: shape.points,
      })),
    });
  } catch (error) {
    const status = error instanceof ApiClientError ? error.status : 400;
    return json<GardenEditorActionData>(
      {
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'We could not save the garden editor right now.',
      },
      { status },
    );
  }
}

export default function DashboardGardenEditorRoute() {
  const { garden } = useLoaderData<typeof loader>();

  return <GardenEditor garden={garden} />;
}

function readShapesPayload(formData: FormData): GardenEditorShape[] {
  const rawShapes = JSON.parse(String(formData.get('shapes') || '[]')) as GardenEditorShape[];

  if (!Array.isArray(rawShapes)) {
    throw new Error('Invalid shapes payload.');
  }

  return rawShapes.map((shape) => {
    if (!isShapeType(shape.type) || !Array.isArray(shape.points) || shape.points.length < 3) {
      throw new Error('Invalid shape.');
    }

    return {
      id: String(shape.id || 'shape'),
      type: shape.type,
      points: shape.points.map((point) => {
        const x = Number(point.x);
        const y = Number(point.y);

        if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0) {
          throw new Error('Invalid shape point.');
        }

        return { x, y };
      }),
    };
  });
}

function readPlantsPayload(formData: FormData): PlacedPlant[] {
  const rawPlants = JSON.parse(String(formData.get('plants') || '[]')) as PlacedPlant[];

  if (!Array.isArray(rawPlants)) {
    throw new Error('Invalid plants payload.');
  }

  return rawPlants.map((plant) => {
    const plantLibraryId = Number(plant.plantLibraryId);
    const size = Number(plant.size ?? 1);
    const x = Number(plant.x);
    const y = Number(plant.y);

    if (
      !Number.isInteger(plantLibraryId) ||
      plantLibraryId <= 0 ||
      !isPlantSize(size) ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 ||
      y < 0
    ) {
      throw new Error('Invalid plant placement.');
    }

    return {
      id: String(plant.id || 'plant'),
      plantLibraryId,
      size,
      x,
      y,
    };
  });
}

function validateShapeBounds(garden: Garden, shapes: GardenEditorShape[]) {
  for (const shape of shapes) {
    for (const point of shape.points) {
      if (point.x > garden.totalWidth || point.y > garden.totalHeight) {
        throw new Error('Garden editor points must stay inside the garden dimensions.');
      }
    }
  }
}

function validatePlantBounds(garden: Garden, plants: PlacedPlant[]) {
  const gridStepMeters = Math.max((garden.gridSizeCm || 25) / 100, 0.05);

  for (const plant of plants) {
    const footprintMeters = plant.size * gridStepMeters;

    if (
      plant.x + footprintMeters > garden.totalWidth + 0.0001 ||
      plant.y + footprintMeters > garden.totalHeight + 0.0001
    ) {
      throw new Error('Garden editor plants must stay inside the garden dimensions.');
    }
  }
}

function isShapeType(value: unknown): value is EditorShapeType {
  return ['blocking_building', 'pathway', 'grass', 'plant_area'].includes(String(value));
}

function isPlantSize(value: number): value is PlacedPlant['size'] {
  return Number.isInteger(value) && value >= 1 && value <= 3;
}

function normalizePlantSize(value: number): PlacedPlant['size'] {
  return isPlantSize(value) ? value : 1;
}
