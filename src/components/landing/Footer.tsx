import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Mail } from 'lucide-react';
import { FaInstagram, FaTelegramPlane, FaTiktok } from 'react-icons/fa';
import { Footer2 } from '@/components/ui/footer-2';
import { AcmMark } from '@/components/landing/visuals/AcmMark';
import type { Session } from '@/lib/types';
import { SOCIAL_LINKS } from '@/lib/event';

const SOCIALS = [
  { href: SOCIAL_LINKS.instagram, labelKey: 'footer.instagram', icon: FaInstagram },
  { href: SOCIAL_LINKS.telegram, labelKey: 'footer.telegram', icon: FaTelegramPlane },
  { href: SOCIAL_LINKS.tiktok, labelKey: 'footer.tiktok', icon: FaTiktok },
  { href: SOCIAL_LINKS.email, labelKey: 'footer.email', icon: Mail },
] as const;
const SECTIONS = ['about', 'schedule', 'partners', 'benefits', 'gallery', 'faq'] as const;

export default function Footer({
  session,
  registrationOpen,
}: {
  session: Session;
  registrationOpen: boolean;
}) {
  const { t } = useTranslation();
  const isLoggedIn = !!session?.user;
  return (
    <footer id="registration" className="landing-container landing-footer">
      <Footer2
        logo={
          <a href="#top" className="footer-two-logo" aria-label="NU Open">
            <AcmMark className="footer-mark" aria-hidden="true" />
            <span className="landing-label">{t('about.organizers')}</span>
          </a>
        }
        wordmark={
          <p className="footer-wordmark">
            Women’s
            <br />
            Hack Day
          </p>
        }
        tagline={
          registrationOpen ? (
            <Trans
              i18nKey="footer.readyToJoin"
              components={{ event: <span className="footer-two-event-name" /> }}
            />
          ) : (
            t('footer.registrationClosed')
          )
        }
        socialText={t('footer.follow')}
        socialLinks={SOCIALS.map(({ href, labelKey, icon: Icon }) => ({
          href,
          label: t(labelKey),
          icon: <Icon aria-hidden="true" />,
        }))}
        linkGroups={[
          {
            title: t('footer.explore'),
            links: SECTIONS.map((key) => ({
              id: key,
              content: <a href={`#${key}`}>{t(`navbar.${key}`)}</a>,
            })),
          },
          {
            title: t('footer.documents'),
            links: [
              { id: 'privacy', content: <Link to="/privacy">{t('footer.privacy')}</Link> },
              { id: 'terms', content: <Link to="/terms">{t('footer.terms')}</Link> },
              { id: 'credits', content: <a href="/nuopen/models/CREDITS.txt">3D · Credits</a> },
            ],
          },
        ]}
        copyright={t('footer.rights')}
        action={
          <Link to={isLoggedIn ? '/dashboard' : '/login'} className="landing-cta">
            {isLoggedIn
              ? t('footer.dashboard')
              : registrationOpen
                ? t('footer.register')
                : t('footer.signIn')}
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        }
      />
    </footer>
  );
}
