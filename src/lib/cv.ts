/** Client-safe CV constants and helpers (no `cloudflare:workers`, no env). */

export const CV_MAX_MB = 5;
export const CV_MAX_BYTES = CV_MAX_MB * 1024 * 1024;

/** Error messages are i18n keys, so the API can return them and the UI can translate them. */
export const CV_ERRORS = {
  notPdf: 'cv.errorNotPdf',
  tooLarge: 'cv.errorTooLarge',
  noProfile: 'cv.errorNoProfile',
  failed: 'cv.errorFailed',
} as const;

export type CvErrorKey = (typeof CV_ERRORS)[keyof typeof CV_ERRORS];

// Every PDF starts with "%PDF-"; the file extension and MIME type can lie.
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];

/** The i18n key of what is wrong with these bytes, or null for a valid PDF. */
export function validateCvBytes(bytes: Uint8Array): CvErrorKey | null {
  if (bytes.length > CV_MAX_BYTES) return CV_ERRORS.tooLarge;
  const isPdf = PDF_MAGIC.every((byte, i) => bytes[i] === byte);
  return isPdf ? null : CV_ERRORS.notPdf;
}

const DRIVE_FILE_ID = /^[\w-]{10,200}$/;
const DRIVE_URL_ID = /\/file\/d\/([\w-]{10,200})/;

export function isDriveFileId(id: unknown): id is string {
  return typeof id === 'string' && DRIVE_FILE_ID.test(id);
}

export function driveFileUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** The Drive file id inside a stored cvUrl, or null for any other link. */
export function driveFileIdFromUrl(url: string): string | null {
  return DRIVE_URL_ID.exec(url)?.[1] ?? null;
}

const FILE_NAME_MAX = 80;

/** "Full Name - 1a2b3c4d.pdf": readable in Drive, unique per participant. */
export function cvFileName(fullName: string, userId: string) {
  const safeName = fullName
    .replace(/[^\p{L}\p{N} ._-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, FILE_NAME_MAX);
  return `${safeName || 'participant'} - ${userId.slice(0, 8)}.pdf`;
}

// Spreading a whole 5 MB array into fromCharCode overflows the call stack.
const BASE64_CHUNK = 0x8000;

export function toBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_CHUNK));
  }
  return btoa(binary);
}
