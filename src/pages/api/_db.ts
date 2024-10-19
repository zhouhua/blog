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

const db = createKysely<Database>();

export default db;
