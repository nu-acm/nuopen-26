import './footer.css';

import { EVENT } from '@/components/landing/nuopen/content/event';

import { AcmMark } from '../ui/acm-mark';

const YEAR = new Date(EVENT.contest.start).getFullYear();
const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-org">
          <AcmMark className="footer-mark" />
          <p className="label">{EVENT.organizer}</p>
        </div>

        <p className="footer-wordmark font-logo outline-crawl">{EVENT.name}</p>
        <p className="footer-episode font-mono">
          {`Episode ${EVENT.episode}`} · {EVENT.subtitle}
        </p>

        <div className="footer-contact">
          <ul className="footer-links" aria-label="Contact">
            <li>
              <a href={`mailto:${EVENT.contacts.email}`}>{EVENT.contacts.email}</a>
            </li>
            <li>
              <a href={EVENT.contacts.phoneHref}>{EVENT.contacts.phone}</a>
            </li>
          </ul>
          <ul className="footer-links" aria-label="Social">
            {EVENT.contacts.social.map((social) => (
              <li key={social.label}>
                <a href={social.href} {...EXTERNAL}>
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-legal font-mono">
          <p>
            © {YEAR} {EVENT.organizer}, {EVENT.venue.name}
          </p>
          <a href="/nuopen/models/CREDITS.txt" className="footer-credits-link">
            3D model credits
          </a>
        </div>
      </div>
    </footer>
  );
}
