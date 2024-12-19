import type { ColumnType } from 'kysely';
import { createKysely } from '@vercel/postgres-kysely';

interface Link {
  key: string;
  value: string;
  last_use: ColumnType<Date>;
}

interface Database {
  links: Link;
}

const db = createKysely<Database>(
  import.meta.env.DEV
    ? {
        connectionString: import.meta.env.POSTGRES_URL,
      }
    : undefined,
);

export default db;
