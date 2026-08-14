import { Kysely } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema
    .alterTable('gardenEditorPlant')
    .addColumn('size', 'integer', (col) => col.defaultTo(1).notNull())
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.alterTable('gardenEditorPlant').dropColumn('size').execute();
}

export const migration009 = {
  up,
  down,
};
