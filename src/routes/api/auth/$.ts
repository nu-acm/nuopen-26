import { createFileRoute } from '@tanstack/react-router';
import { getAuth } from '@/lib/auth.server';

/** Catch-all for Better Auth's endpoints. Serves /api/auth/*. */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => getAuth().handler(request),
      POST: async ({ request }) => getAuth().handler(request),
    },
  },
});
