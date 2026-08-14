import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  getGarden,
  getGardenEditorShapes,
  replaceGardenEditorShapes,
  type Garden,
} from '@/features/gardens/api';
import {
  GardenEditor,
  type GardenEditorActionData,
  type GardenEditorLoaderData,
  type EditorShapeType,
  type GardenEditorShape,
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
  await requireUser(request);
  const gardenId = Number(params.gardenId);

  if (!Number.isFinite(gardenId)) {
    throw redirect('/dashboard/gardens');
  }

  try {
    const garden = await getGarden(gardenId);
    const shapes = await getGardenEditorShapes(gardenId);

    return {
      garden,
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
    validateShapeBounds(garden, shapes);
    const savedShapes = await replaceGardenEditorShapes(gardenId, {
      shapes: shapes.map((shape) => ({
        shapeType: shape.type,
        points: shape.points,
      })),
    });

    return json<GardenEditorActionData>({
      type: 'success',
      message: 'Garden editor saved.',
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

function validateShapeBounds(garden: Garden, shapes: GardenEditorShape[]) {
  for (const shape of shapes) {
    for (const point of shape.points) {
      if (point.x > garden.totalWidth || point.y > garden.totalHeight) {
        throw new Error('Garden editor points must stay inside the garden dimensions.');
      }
    }
  }
}

function isShapeType(value: unknown): value is EditorShapeType {
  return ['blocking_building', 'pathway', 'grass', 'plant_area'].includes(String(value));
}
