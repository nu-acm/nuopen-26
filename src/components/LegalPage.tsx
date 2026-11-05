import { Link } from '@tanstack/react-router';
import { AccountShell } from '@/components/AccountShell';

/** Shared layout for /terms and /privacy. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <AccountShell>
      <main className="legal-main">
        <h1 className="legal-title">{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
        <div className="legal-sections">{children}</div>
        <Link to="/" className="legal-back">
          ← Back to home
        </Link>
      </main>
    </AccountShell>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ContactLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="text-whd-pink-soft underline hover:text-whd-pink-bright">
      {email}
    </a>
  );
}
