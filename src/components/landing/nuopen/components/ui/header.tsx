import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { useEffect, useRef, useState } from 'react';
import { RegistrationLink } from './registration-link';

import { EVENT } from '@/components/landing/nuopen/content/event';

import { useJump } from '../space/use-jump';
import { SideToggle } from './side-toggle';
import { SoundToggle } from './sound-toggle';

const NAV = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'rules', label: 'Rules' },
  { id: 'faq', label: 'FAQ' },
] as const;

/** The nav section crossing the middle of the screen; null between them. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const targets = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          setCurrent((prev) => (isIntersecting ? target.id : prev === target.id ? null : prev));
        }
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    targets.forEach((t) => watcher.observe(t));
    return () => watcher.disconnect();
  }, []);
  return current;
}

export function Header() {
  const text = useLandingText();
  const jump = useJump();
  const current = useCurrentSection();
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuToggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    jump(e);
  };

  return (
    <header
      data-site-header
      className={`fixed inset-x-0 top-0 z-50 border-b ${
        open
          ? 'border-line bg-space'
          : `nu-transition-background-color-border-color duration-500 ${scrolled ? 'border-line nu-bg-rgb-3-4-10-0-96' : 'border-transparent'}`
      }`}
    >
      <div className="landing-header-inner">
        <a
          href="#top"
          onClick={go}
          className="flex items-baseline gap-2 whitespace-nowrap"
          aria-label={text('{{name}} home', { name: EVENT.name })}
        >
          <span className="header-logo font-logo nu-text-1-05rem nu-tracking-0-02em text-ink">
            NU Open
          </span>
          <span className="font-mono nu-text-0-7rem nu-tracking-0-18em nu-text-var-saber">
            {EVENT.episode}
          </span>
        </a>

        <nav aria-label={text('Sections')} className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={go}
              aria-current={current === item.id ? 'location' : undefined}
              className="site-nav-link"
            >
              {text(item.label)}
            </a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <div className="landing-header-tools">
            <div className="hidden sm:block">
              <SideToggle />
            </div>
            <SoundToggle />
            <button
              type="button"
              aria-expanded={open}
              ref={menuToggle}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center text-ink lg:hidden"
              aria-label={text('Menu')}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
          <div className="landing-header-secondary">
            <div className="landing-header-language">
              <LanguageSwitcher
                onLanguageChange={() => {
                  if (open) {
                    setOpen(false);
                    menuToggle.current?.focus();
                  }
                }}
              />
            </div>
            <RegistrationLink
              compact
              className="site-nav-link site-nav-action landing-header-account"
            >
              {text('Register')}
            </RegistrationLink>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        data-open={open}
        inert={!open}
        className="grid nu-grid-rows-0fr nu-transition-grid-template-rows nu-duration-400ms nu-ease-var-ease-out data-[open=true]:nu-grid-rows-1fr motion-reduce:transition-none lg:hidden"
      >
        <div className="min-h-0 overflow-hidden">
          <div className="nu-max-h-calc-100svh-var-header-h overflow-y-auto overscroll-contain border-t border-line bg-space nu-px-var-gutter pt-2 pb-6">
            <nav aria-label={text('Sections menu')} className="flex flex-col">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={go}
                  className="site-nav-link landing-menu-link"
                >
                  {text(item.label)}
                </a>
              ))}
            </nav>
            <div className="landing-menu-preferences sm:hidden">
              <SideToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
