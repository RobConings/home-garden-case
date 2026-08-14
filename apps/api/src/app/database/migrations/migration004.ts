import { Kysely, sql } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema
    .alterTable('user')
    .addColumn('themePreference', 'text', (col) =>
      col.notNull().defaultTo('light').check(sql`themePreference IN ('light', 'dark')`),
    )
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.alterTable('user').dropColumn('themePreference').execute();
}

export const migration004 = {
  up,
  down,
};
