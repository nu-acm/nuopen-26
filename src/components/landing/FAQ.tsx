import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Faq6 } from '@/components/ui/faq-06';
import { EVENT } from '@/components/landing/nuopen/content/event';
import { formatDay } from '@/components/landing/nuopen/lib/schedule';
import { CONTACT_EMAIL, TELEGRAM_CHAT_URL } from '@/lib/event';
import { FAQ_TITLE } from '@/lib/metadata';
import { DEFAULT_REGISTRATION_DEADLINE } from '@/lib/registration';

function FAQLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-whd-pink-bright underline decoration-whd-pink-bright/40 underline-offset-4 transition-colors duration-200 hover:text-whd-pink-soft"
    >
      {children}
    </a>
  );
}

const deadline = formatDay(DEFAULT_REGISTRATION_DEADLINE.slice(0, 10), 'long');
const faqs = [
  {
    id: 'whoCanParticipate',
    question: 'Who can participate?',
    answer: 'Anyone aged 16 or older can compete, solo or in a team of up to three.',
  },
  {
    id: 'professional',
    question: 'Do I need to be a professional?',
    answer: 'No experience is required.',
  },
  {
    id: 'noTeam',
    question: "What if I don't have a team?",
    answer: (
      <>
        Create a one-person team to compete solo, or find teammates in the{' '}
        <FAQLink href={TELEGRAM_CHAT_URL}>NU Open Telegram chat</FAQLink>.
      </>
    ),
  },
  {
    id: 'howToParticipate',
    question: 'How can I participate?',
    answer: `Sign in by email, complete your profile, and create or join a team. Registration closes on ${deadline} at 23:59.`,
  },
  {
    id: 'online',
    question: 'Can I participate online?',
    answer: 'No, NU Open 2026 will be held offline at Nazarbayev University, Astana, Kazakhstan.',
  },
  {
    id: 'whatIs',
    question: 'What is NU Open?',
    answer:
      'NU Open 2026 is the seventh annual ICPC-style programming contest. Teams have five hours to solve a problem set.',
  },
  {
    id: 'organizers',
    question: 'Who are the organisers of NU Open?',
    answer: 'The ACM Student Chapter at Nazarbayev University (ACM@NU) organises NU Open.',
  },
  {
    id: 'certificates',
    question: 'Will there be prizes?',
    answer: `The prize pool is ${EVENT.prize.text}.`,
  },
  {
    id: 'noAnswer',
    question: "I didn't find an answer to my question. What should I do?",
    answer: (
      <>
        Ask in the <FAQLink href={TELEGRAM_CHAT_URL}>NU Open Telegram chat</FAQLink> or email{' '}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-whd-pink-bright underline decoration-whd-pink-bright/40 underline-offset-4 transition-colors duration-200 hover:text-whd-pink-soft"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      className="landing-section landing-container faq-showcase"
      aria-labelledby="faq-title"
    >
      <Faq6
        badge="Questions"
        title={FAQ_TITLE}
        titleId="faq-title"
        headingLevel="h1"
        variant="full"
        faqs={faqs}
        contact={
          <div className="faq-panel-actions">
            <a
              href={TELEGRAM_CHAT_URL}
              className="faq-contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact us
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        }
      />
    </section>
  );
}
