import { FileText, CircleCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload-2';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { CV_ERRORS, CV_MAX_BYTES, CV_MAX_MB } from '@/lib/cv';

type Pending = 'upload' | 'delete' | null;

async function requestCv(init: RequestInit) {
  let res: Response;
  try {
    res = await fetch('/api/cv', init);
  } catch {
    throw new Error(CV_ERRORS.failed);
  }
  if (res.ok) return;
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  throw new Error(body?.error ?? CV_ERRORS.failed);
}

/**
 * Optional PDF CV, stored in the organisers' Google Drive. The participant can
 * replace or delete it until registration closes; organisers open it from /admin.
 */
export function CvCard({
  hasCv,
  registrationOpen,
  onDone,
  onError,
}: {
  hasCv: boolean;
  registrationOpen: boolean;
  /** Refresh the page data and show `message`. */
  onDone: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const busyRef = useRef(false);
  const [uploadName, setUploadName] = useState('');
  const [error, setError] = useState('');
  const reportError = (message: string) => {
    setError(message);
    onError(message);
  };
  const [pending, setPending] = useState<Pending>(null);

  const run = async (key: Exclude<Pending, null>, action: () => Promise<void>, done: string) => {
    if (busyRef.current || !registrationOpen) return;
    busyRef.current = true;
    setError('');
    setPending(key);
    try {
      await action();
      await onDone(done);
    } catch (err) {
      reportError(err instanceof Error ? err.message : CV_ERRORS.failed);
    } finally {
      busyRef.current = false;
      setPending(null);
      setUploadName('');
    }
  };

  const upload = (files: File[]) => {
    if (busyRef.current || !registrationOpen) return;
    if (files.length !== 1) return reportError('Please upload one PDF file at a time.');
    const file = files[0];
    // Checked again on the server; this just saves a pointless upload.
    if (file.size > CV_MAX_BYTES) return reportError(CV_ERRORS.tooLarge);
    if (
      (file.type && file.type !== 'application/pdf') ||
      (!file.type && !/\.pdf$/i.test(file.name))
    ) {
      return reportError(CV_ERRORS.notPdf);
    }
    setUploadName(file.name);
    const body = new FormData();
    body.append('file', file);
    return run('upload', () => requestCv({ method: 'POST', body }), 'Your CV was uploaded.');
  };

  return (
    <Card variant="cv">
      <CardHeader variant="cv">
        <FileText className="account-section-icon" aria-hidden="true" />
        <div className="account-card-heading">
          <CardTitle variant="account">Your CV</CardTitle>
          <CardAction>
            <Badge variant="status" complete={hasCv}>
              {hasCv && <CircleCheck size={14} aria-hidden="true" />}
              {hasCv ? 'Uploaded' : 'Not uploaded'}
            </Badge>
          </CardAction>
        </div>

        <CardDescription variant="account">
          {registrationOpen
            ? `Optional. Upload a PDF up to ${CV_MAX_MB} MB. It is stored in the organisers’ private Google Drive folder. By uploading, you agree that organisers may review your CV and share it with event partners for recruitment.`
            : 'Registration is closed, so your CV can no longer be changed.'}
        </CardDescription>
      </CardHeader>

      {registrationOpen && (
        <CardContent variant="cv">
          <div className="account-cv-upload">
            <FileUpload
              accept="application/pdf,.pdf"
              onFilesAdded={upload}
              disabled={pending !== null}
              uploading={pending === 'upload'}
              fileName={uploadName}
              title="Drop your CV here"
              hint={`One PDF · up to ${CV_MAX_MB} MB`}
              buttonLabel={hasCv ? 'Replace' : 'Choose file'}
              uploadingLabel="Uploading…"
              error={error}
            />
            {hasCv && (
              <ConfirmButton
                label="Delete"
                confirmLabel="Click again to delete"
                loading={pending === 'delete'}
                loadingLabel="Loading…"
                disabled={pending !== null}
                onConfirm={() =>
                  run('delete', () => requestCv({ method: 'DELETE' }), 'Your CV was deleted.')
                }
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
