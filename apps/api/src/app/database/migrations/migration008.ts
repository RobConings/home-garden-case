import { Kysely, sql } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema
    .createTable('gardenEditorPlant')
    .addColumn('gardenEditorPlantId', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('gardenId', 'integer', (col) =>
      col.references('garden.gardenId').onDelete('cascade').notNull(),
    )
    .addColumn('plantLibraryId', 'integer', (col) =>
      col.references('plantLibrary.plantLibraryId').onDelete('cascade').notNull(),
    )
    .addColumn('x', 'real', (col) => col.notNull())
    .addColumn('y', 'real', (col) => col.notNull())
    .addColumn('createdAt', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createIndex('garden_editor_plant_garden_id_index')
    .on('gardenEditorPlant')
    .column('gardenId')
    .execute();

  await db.schema
    .createIndex('garden_editor_plant_library_id_index')
    .on('gardenEditorPlant')
    .column('plantLibraryId')
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.dropTable('gardenEditorPlant').execute();
}

export const migration008 = {
  up,
  down,
};
