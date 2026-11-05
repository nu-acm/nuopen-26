import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { participant } from '@/db/schema';
import { callGas } from '@/lib/gas.server';
import {
  CV_ERRORS,
  CV_MAX_BYTES,
  cvFileName,
  driveFileIdFromUrl,
  driveFileUrl,
  isDriveFileId,
  toBase64,
  validateCvBytes,
  type CvErrorKey,
} from '@/lib/cv';

interface AppEnv {
  DB: D1Database;
}

function getAppDb() {
  return getDb((env as unknown as AppEnv).DB);
}

/** A failure that is safe to show the participant; the message is an i18n key. */
export class CvError extends Error {
  constructor(public readonly key: CvErrorKey) {
    super(key);
  }
}

async function getProfile(userId: string) {
  const profile = await getAppDb().query.participant.findFirst({
    where: eq(participant.id, userId),
    columns: { fullName: true, cvUrl: true },
  });
  if (!profile) throw new CvError(CV_ERRORS.noProfile);
  return profile;
}

async function setCvUrl(userId: string, cvUrl: string | null) {
  await getAppDb()
    .update(participant)
    .set({ cvUrl, updatedAt: new Date() })
    .where(eq(participant.id, userId));
}

/** Moves a CV to the Drive trash. Files outside the CV folder are refused by the script. */
async function trashCvFile(fileId: string) {
  await callGas('delete-cv', { fileId });
}

/** Store a participant's PDF in Drive, replacing (and trashing) any previous one. */
export async function uploadCv(userId: string, file: File) {
  if (file.size > CV_MAX_BYTES) throw new CvError(CV_ERRORS.tooLarge);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const invalid = validateCvBytes(bytes);
  if (invalid) throw new CvError(invalid);

  const profile = await getProfile(userId);

  let fileId: unknown;
  try {
    ({ fileId } = await callGas<{ fileId?: unknown }>('upload-cv', {
      fileName: cvFileName(profile.fullName, userId),
      base64: toBase64(bytes),
    }));
  } catch (err) {
    console.error('[cv] upload failed:', err);
    throw new CvError(CV_ERRORS.failed);
  }
  if (!isDriveFileId(fileId)) {
    console.error('[cv] upload returned no usable file id:', fileId);
    throw new CvError(CV_ERRORS.failed);
  }

  await setCvUrl(userId, driveFileUrl(fileId));

  // The new CV is saved; losing the old file is only clutter, so don't fail on it.
  const previousId = profile.cvUrl ? driveFileIdFromUrl(profile.cvUrl) : null;
  if (previousId && previousId !== fileId) {
    await trashCvFile(previousId).catch((err) =>
      console.error('[cv] could not trash the replaced file:', err),
    );
  }
}

/** Remove a participant's CV from Drive and from their profile. */
export async function deleteCv(userId: string) {
  const profile = await getProfile(userId);
  if (!profile.cvUrl) return;

  const fileId = driveFileIdFromUrl(profile.cvUrl);
  if (fileId) {
    try {
      await trashCvFile(fileId);
    } catch (err) {
      console.error('[cv] delete failed:', err);
      throw new CvError(CV_ERRORS.failed);
    }
  }
  await setCvUrl(userId, null);
}
