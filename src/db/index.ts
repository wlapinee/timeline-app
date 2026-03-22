import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function getDb() {
  // Neon's HTTP driver works best with the non-pooled connection string.
  // Strip -pooler suffix and channel_binding param if present.
  const url = (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!)
    .replace('-pooler', '')
    .replace('&channel_binding=require', '')
    .replace('?channel_binding=require', '');
  const sql = neon(url);
  return drizzle(sql, { schema });
}
