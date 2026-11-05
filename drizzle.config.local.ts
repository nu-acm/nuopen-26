import { defineConfig } from 'drizzle-kit';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Points drizzle-kit at the SQLite file wrangler creates for local dev,
 * so `db:studio:local` inspects the same database the dev server uses.
 */
const d1Dir = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
const sqliteFile = fs.existsSync(d1Dir)
  ? fs.readdirSync(d1Dir).find((f) => f.endsWith('.sqlite'))
  : undefined;

export default defineConfig({
  out: './drizzle',
  schema: ['./src/db/schema.ts', './src/db/auth-schema.ts'],
  dialect: 'sqlite',
  ...(sqliteFile && { dbCredentials: { url: path.join(d1Dir, sqliteFile) } }),
});
