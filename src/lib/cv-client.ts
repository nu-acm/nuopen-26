import { CV_ERRORS, CV_MAX_BYTES } from '@/lib/cv';

export function getCvSelectionError(files: File[]) {
  if (files.length !== 1) return 'Please upload one PDF file at a time.';
  const [file] = files;
  if (file.size > CV_MAX_BYTES) return CV_ERRORS.tooLarge;
  if (file.type ? file.type !== 'application/pdf' : !/\.pdf$/i.test(file.name)) {
    return CV_ERRORS.notPdf;
  }
}

async function requestCv(init: RequestInit) {
  let response: Response;
  try {
    response = await fetch('/api/cv', init);
  } catch {
    throw new Error(CV_ERRORS.failed);
  }
  if (response.ok) return;
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(body?.error ?? CV_ERRORS.failed);
}

export function uploadCvFile(file: File) {
  const body = new FormData();
  body.append('file', file);
  return requestCv({ method: 'POST', body });
}

export function deleteCvFile() {
  return requestCv({ method: 'DELETE' });
}
