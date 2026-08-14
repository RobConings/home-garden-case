import { Kysely } from 'kysely';
import { Database, NewPlantLibrary, PlantLibrary, PlantLibraryUpdate } from '../types';

export class PlantLibraryRepository {
  private readonly db: Kysely<Database>;

  constructor(opts: { db: Kysely<Database> }) {
    this.db = opts.db;
  }

  async findVisibleToUser(ownerUserId?: number): Promise<PlantLibrary[]> {
    if (ownerUserId) {
      return await this.db
        .selectFrom('plantLibrary')
        .selectAll()
        .where((eb) =>
          eb.or([
            eb('source', '=', 'system'),
            eb.and([eb('source', '=', 'user'), eb('ownerUserId', '=', ownerUserId)]),
          ]),
        )
        .orderBy('commonName')
        .execute();
    } else {
      return await this.db
        .selectFrom('plantLibrary')
        .selectAll()
        .where('source', '=', 'system')
        .orderBy('commonName')
        .execute();
    }
  }

  async findById(plantLibraryId: number): Promise<PlantLibrary | undefined> {
    return await this.db
      .selectFrom('plantLibrary')
      .where('plantLibraryId', '=', plantLibraryId)
      .selectAll()
      .executeTakeFirst();
  }

  async create(data: NewPlantLibrary): Promise<PlantLibrary> {
    return await this.db
      .insertInto('plantLibrary')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(plantLibraryId: number, data: PlantLibraryUpdate): Promise<PlantLibrary> {
    return await this.db
      .updateTable('plantLibrary')
      .set(data)
      .where('plantLibraryId', '=', plantLibraryId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(plantLibraryId: number): Promise<boolean> {
    const result = await this.db
      .deleteFrom('plantLibrary')
      .where('plantLibraryId', '=', plantLibraryId)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}
