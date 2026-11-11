import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { AuthHeader } from '@/components/AuthHeader';
import { Starfield } from '@/components/landing/visuals/Starfield';
import FAQ from '@/components/landing/FAQ';
import { FAQ_TITLE, pageMetadata, SITE_TITLE } from '@/lib/metadata';

export const Route = createFileRoute('/faq')({
  component: FAQPage,
  head: () => ({
    meta: pageMetadata(
      `${FAQ_TITLE} | ${SITE_TITLE}`,
      'Answers about NU Open 2026 eligibility, team size, registration, the November 22 schedule, and prizes.',
    ),
  }),
});

function FAQPage() {
  return (
    <div className="landing-page faq-page">
      <Starfield />
      <AuthHeader />
      <main>
        <div className="landing-container faq-page-back">
          <Link to="/" hash="faq">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to home
          </Link>
        </div>
        <FAQ />
      </main>
      <footer className="landing-container faq-page-footer">
        <p>© 2026 ACM@NU All rights reserved.</p>
        <div>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
