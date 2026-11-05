import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AuthHeader } from '@/components/AuthHeader';
import { Starfield } from '@/components/landing/visuals/Starfield';
import FAQ from '@/components/landing/FAQ';
import { pageMetadata } from '@/lib/metadata';

export const Route = createFileRoute('/faq')({
  component: FAQPage,
  head: ({ match }) => ({
    meta: pageMetadata(
      `${match.context.i18n.t('faq.allTitle')} | NU Open 2026`,
      match.context.i18n.t('metadata.faqDescription'),
    ),
  }),
});

function FAQPage() {
  const { t } = useTranslation();
  return (
    <div className="landing-page faq-page">
      <Starfield />
      <AuthHeader />
      <main>
        <div className="landing-container faq-page-back">
          <Link to="/" hash="faq">
            <ArrowLeft size={18} aria-hidden="true" />
            {t('faq.backToHome')}
          </Link>
        </div>
        <FAQ full />
      </main>
      <footer className="landing-container faq-page-footer">
        <p>{t('footer.rights')}</p>
        <div>
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
        </div>
      </footer>
    </div>
  );
}
