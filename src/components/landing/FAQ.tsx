import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Faq6 } from '@/components/ui/faq-06';
import { EVENT } from '@/components/landing/nuopen/content/event';
import { formatDay } from '@/components/landing/nuopen/lib/schedule';
import { parseTextWithLinks } from '@/lib/text';
import { TELEGRAM_CHAT_URL } from '@/lib/event';
import { ALL_FAQ_QUESTIONS, FEATURED_FAQ_QUESTIONS } from '@/lib/faq';
import { DEFAULT_REGISTRATION_DEADLINE } from '@/lib/registration';

export default function FAQ({ full = false }: { full?: boolean }) {
  const { t, i18n } = useTranslation();
  const questions = full ? ALL_FAQ_QUESTIONS : FEATURED_FAQ_QUESTIONS;
  const deadline = formatDay(DEFAULT_REGISTRATION_DEADLINE.slice(0, 10), 'long', i18n.language);
  return (
    <section
      id="faq"
      className="landing-section landing-container faq-showcase"
      aria-labelledby="faq-title"
    >
      <Faq6
        badge={t('faq.kicker')}
        title={full ? t('faq.allTitle') : t('faq.title')}
        titleId="faq-title"
        headingLevel={full ? 'h1' : 'h2'}
        variant={full ? 'full' : 'preview'}
        faqs={questions.map((key) => ({
          id: key,
          question: t(`faq.questions.${key}.q`),
          answer: parseTextWithLinks(
            t(`faq.questions.${key}.a`, { deadline, prize: EVENT.prize.text }),
          ),
        }))}
        contact={
          <div className="faq-panel-actions">
            {!full && (
              <Link to="/faq" className="landing-cta">
                {t('faq.viewAll')}
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
            <a
              href={TELEGRAM_CHAT_URL}
              className="faq-contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('faq.contactUs')}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        }
      />
    </section>
  );
}
