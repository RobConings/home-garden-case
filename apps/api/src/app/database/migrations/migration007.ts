import { Kysely } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema
    .alterTable('garden')
    .addColumn('gridSizeCm', 'integer', (col) => col.notNull().defaultTo(25))
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.alterTable('garden').dropColumn('gridSizeCm').execute();
}

export const migration007 = {
  up,
  down,
};
