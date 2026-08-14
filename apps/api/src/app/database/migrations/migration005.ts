import { Kysely, sql } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema
    .alterTable('garden')
    .addColumn('totalWidth', 'real', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable('garden')
    .addColumn('totalHeight', 'real', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable('garden')
    .addColumn('sunDirection', 'text', (col) =>
      col
        .notNull()
        .defaultTo('south')
        .check(sql`sunDirection IN ('north', 'east', 'south', 'west')`),
    )
    .execute();

  await db
    .updateTable('garden')
    .set({
      totalWidth: sql<number>`totalSurfaceArea`,
      totalHeight: 1,
    })
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.alterTable('garden').dropColumn('sunDirection').execute();
  await db.schema.alterTable('garden').dropColumn('totalHeight').execute();
  await db.schema.alterTable('garden').dropColumn('totalWidth').execute();
}

export const migration005 = {
  up,
  down,
};
