import { createFileRoute } from '@tanstack/react-router';
import { getSession } from '@/lib/auth.server';
import { CvError, deleteCv, uploadCv } from '@/lib/cv.server';
import { CV_ERRORS, CV_MAX_BYTES } from '@/lib/cv';
import { isRegistrationOpen, REGISTRATION_CLOSED_I18N_KEY } from '@/lib/registration.server';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Room for the multipart boundary and headers around the file itself.
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

/**
 * Who is asking, or the error response to send. Cookies are SameSite=Lax, and
 * the Origin check also turns away cross-site form posts.
 */
async function authorize(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return { error: json({ error: 'Forbidden' }, 403) };
  }
  const session = await getSession(request);
  if (!session?.user) return { error: json({ error: 'Unauthorized' }, 401) };
  // Same rule as the profile: frozen once registration closes.
  if (!isRegistrationOpen()) return { error: json({ error: REGISTRATION_CLOSED_I18N_KEY }, 403) };
  return { userId: session.user.id };
}

function failure(err: unknown) {
  if (err instanceof CvError) return json({ error: err.key }, 400);
  console.error('[cv API]', err);
  return json({ error: CV_ERRORS.failed }, 500);
}

/**
 * The signed-in participant's CV. Error bodies carry an i18n key.
 *   POST   multipart/form-data with a `file` field (PDF) — upload or replace
 *   DELETE — remove
 * Serves: /api/cv
 */
export const Route = createFileRoute('/api/cv')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authorize(request);
        if (auth.error) return auth.error;

        const length = Number(request.headers.get('content-length') ?? 0);
        if (length > CV_MAX_BYTES + MULTIPART_OVERHEAD_BYTES) {
          return json({ error: CV_ERRORS.tooLarge }, 413);
        }

        let file: FormDataEntryValue | null;
        try {
          file = (await request.formData()).get('file');
        } catch {
          return json({ error: CV_ERRORS.notPdf }, 400);
        }
        if (!(file instanceof File)) return json({ error: CV_ERRORS.notPdf }, 400);

        try {
          await uploadCv(auth.userId, file);
          return json({ ok: true });
        } catch (err) {
          return failure(err);
        }
      },
      DELETE: async ({ request }) => {
        const auth = await authorize(request);
        if (auth.error) return auth.error;
        try {
          await deleteCv(auth.userId);
          return json({ ok: true });
        } catch (err) {
          return failure(err);
        }
      },
    },
  },
});
