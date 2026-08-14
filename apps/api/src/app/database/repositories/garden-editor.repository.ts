import { Kysely } from 'kysely';
import {
  Database,
  NewGardenEditorPlant,
  NewGardenEditorShape,
  NewGardenEditorShapePoint,
} from '../types';

export type GardenEditorShapeWithPoints = {
  gardenEditorShapeId: number;
  shapeType: NewGardenEditorShape['shapeType'];
  points: Array<{
    x: number;
    y: number;
  }>;
};

export type GardenEditorPlantPlacement = {
  gardenEditorPlantId: number;
  plantLibraryId: number;
  x: number;
  y: number;
};

export class GardenEditorRepository {
  private readonly db: Kysely<Database>;

  constructor(opts: { db: Kysely<Database> }) {
    this.db = opts.db;
  }

  async findByGardenId(gardenId: number): Promise<GardenEditorShapeWithPoints[]> {
    const shapes = await this.db
      .selectFrom('gardenEditorShape')
      .where('gardenId', '=', gardenId)
      .selectAll()
      .orderBy('sortOrder', 'asc')
      .execute();

    if (shapes.length === 0) {
      return [];
    }

    const shapeIds = shapes.map((shape) => shape.gardenEditorShapeId);
    const points = await this.db
      .selectFrom('gardenEditorShapePoint')
      .where('gardenEditorShapeId', 'in', shapeIds)
      .selectAll()
      .orderBy('gardenEditorShapeId', 'asc')
      .orderBy('pointIndex', 'asc')
      .execute();

    return shapes.map((shape) => ({
      gardenEditorShapeId: shape.gardenEditorShapeId,
      shapeType: shape.shapeType,
      points: points
        .filter((point) => point.gardenEditorShapeId === shape.gardenEditorShapeId)
        .map((point) => ({
          x: point.x,
          y: point.y,
        })),
    }));
  }

  async replaceGardenShapes(
    gardenId: number,
    shapes: Array<{
      shapeType: NewGardenEditorShape['shapeType'];
      points: Array<{ x: number; y: number }>;
    }>,
  ): Promise<GardenEditorShapeWithPoints[]> {
    await this.db.transaction().execute(async (trx) => {
      const existingShapes = await trx
        .selectFrom('gardenEditorShape')
        .where('gardenId', '=', gardenId)
        .select(['gardenEditorShapeId'])
        .execute();
      const existingShapeIds = existingShapes.map((shape) => shape.gardenEditorShapeId);

      if (existingShapeIds.length > 0) {
        await trx
          .deleteFrom('gardenEditorShapePoint')
          .where('gardenEditorShapeId', 'in', existingShapeIds)
          .execute();
      }

      await trx
        .deleteFrom('gardenEditorShape')
        .where('gardenId', '=', gardenId)
        .execute();

      for (const [shapeIndex, shape] of shapes.entries()) {
        const insertedShape = await trx
          .insertInto('gardenEditorShape')
          .values({
            gardenId,
            shapeType: shape.shapeType,
            sortOrder: shapeIndex,
          })
          .returning(['gardenEditorShapeId'])
          .executeTakeFirstOrThrow();

        const points: NewGardenEditorShapePoint[] = shape.points.map((point, pointIndex) => ({
          gardenEditorShapeId: insertedShape.gardenEditorShapeId,
          pointIndex,
          x: point.x,
          y: point.y,
        }));

        if (points.length > 0) {
          await trx.insertInto('gardenEditorShapePoint').values(points).execute();
        }
      }
    });

    return await this.findByGardenId(gardenId);
  }

  async findPlantsByGardenId(gardenId: number): Promise<GardenEditorPlantPlacement[]> {
    return await this.db
      .selectFrom('gardenEditorPlant')
      .where('gardenId', '=', gardenId)
      .select(['gardenEditorPlantId', 'plantLibraryId', 'x', 'y'])
      .orderBy('gardenEditorPlantId', 'asc')
      .execute();
  }

  async replaceGardenPlants(
    gardenId: number,
    plants: Array<{
      plantLibraryId: number;
      x: number;
      y: number;
    }>,
  ): Promise<GardenEditorPlantPlacement[]> {
    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom('gardenEditorPlant').where('gardenId', '=', gardenId).execute();

      if (plants.length === 0) {
        return;
      }

      const newPlants: NewGardenEditorPlant[] = plants.map((plant) => ({
        gardenId,
        plantLibraryId: plant.plantLibraryId,
        x: plant.x,
        y: plant.y,
      }));

      await trx.insertInto('gardenEditorPlant').values(newPlants).execute();
    });

    return await this.findPlantsByGardenId(gardenId);
  }
}
