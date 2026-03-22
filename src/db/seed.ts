import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { projects } from './schema';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const existing = await db.select().from(projects).limit(1);
  if (existing.length === 0) {
    await db.insert(projects).values({ name: 'My Project', description: 'Project timeline' });
    console.log('Default project created');
  } else {
    console.log('Project already exists, skipping seed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
