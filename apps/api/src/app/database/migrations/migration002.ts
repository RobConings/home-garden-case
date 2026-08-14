import { Kysely } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema.alterTable('user').addColumn('passwordHash', 'text').execute();
  await db.schema.alterTable('user').dropColumn('age').execute();
  await db.schema
    .createIndex('user_email_address_unique')
    .on('user')
    .column('emailAddress')
    .unique()
    .execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.dropIndex('user_email_address_unique').execute();
  await db.schema.alterTable('user').addColumn('age', 'integer').execute();
  await db.schema.alterTable('user').dropColumn('passwordHash').execute();
}

export const migration002 = {
  up,
  down,
};
