import { Kysely, Migrator } from 'kysely';
import { migration001 } from './migrations/migration001';
import { migration002 } from './migrations/migration002';
import { migration003 } from './migrations/migration003';
import { migration004 } from './migrations/migration004';
import { migration005 } from './migrations/migration005';
import { migration006 } from './migrations/migration006';
import { migration007 } from './migrations/migration007';
import { migration008 } from './migrations/migration008';
import { Database } from './types';

export class MigratorService {
  private readonly db: Kysely<Database>;

  constructor(opts: { db: Kysely<Database> }) {
    this.db = opts.db;
  }

  async migrateToLatest() {
    const migrator = new Migrator({
      db: this.db,
      provider: {
        getMigrations: async () => ({
      migration001,
      migration002,
      migration003,
      migration004,
      migration005,
      migration006,
      migration007,
      migration008,
        }),
      },
    });

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`migration "${it.migrationName}" was executed successfully`);
      } else if (it.status === 'Error') {
        console.error(`failed to execute migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error('failed to migrate');
      console.error(error);
      process.exit(1);
    }
  }
}
