import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';

import * as schema from '@/db/schema';
import * as authSchema from '@/db/auth-schema';

/** App tables and Better Auth tables, merged for Drizzle's query API. */
export const fullSchema = {
  ...schema,
  ...authSchema,
};

/**
 * Build a Drizzle client over the D1 binding. Call this inside a request
 * handler, where the binding is available.
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema: fullSchema });
}

export * from '@/db/schema';
export * from '@/db/auth-schema';
