import { Kysely, sql } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema
    .createTable('gardenEditorShape')
    .addColumn('gardenEditorShapeId', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('gardenId', 'integer', (col) =>
      col.references('garden.gardenId').onDelete('cascade').notNull(),
    )
    .addColumn('shapeType', 'text', (col) =>
      col
        .notNull()
        .check(sql`shapeType IN ('blocking_building', 'pathway', 'grass', 'plant_area')`),
    )
    .addColumn('sortOrder', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createIndex('garden_editor_shape_garden_id_index')
    .on('gardenEditorShape')
    .column('gardenId')
    .execute();

  await db.schema
    .createTable('gardenEditorShapePoint')
    .addColumn('gardenEditorShapePointId', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('gardenEditorShapeId', 'integer', (col) =>
      col.references('gardenEditorShape.gardenEditorShapeId').onDelete('cascade').notNull(),
    )
    .addColumn('pointIndex', 'integer', (col) => col.notNull())
    .addColumn('x', 'real', (col) => col.notNull())
    .addColumn('y', 'real', (col) => col.notNull())
    .addColumn('createdAt', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createIndex('garden_editor_shape_point_shape_id_index')
    .on('gardenEditorShapePoint')
    .column('gardenEditorShapeId')
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.dropTable('gardenEditorShapePoint').execute();
  await db.schema.dropTable('gardenEditorShape').execute();
}

export const migration006 = {
  up,
  down,
};
