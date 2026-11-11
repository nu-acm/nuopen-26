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
import { CV_ERRORS, CV_MAX_MB, CV_UPLOAD_HINT } from '@/lib/cv';
import { deleteCvFile, getCvSelectionError, uploadCvFile } from '@/lib/cv-client';

type Pending = 'upload' | 'delete' | null;

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
    const selectionError = getCvSelectionError(files);
    if (selectionError) return reportError(selectionError);
    const file = files[0];
    setUploadName(file.name);
    return run('upload', () => uploadCvFile(file), 'Your CV was uploaded.');
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
            ? CV_UPLOAD_HINT
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
                onConfirm={() => run('delete', deleteCvFile, 'Your CV was deleted.')}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
