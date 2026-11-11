import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { SideToggle } from '@/components/landing/nuopen/components/ui/side-toggle';
import { SoundToggle } from '@/components/landing/nuopen/components/ui/sound-toggle';

export function AuthHeader() {
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuToggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="auth-header nuopen-landing">
      <div className="auth-header-inner">
        <Link to="/" className="account-brand" aria-label="NU Open home">
          <span className="site-brand-wordmark">NU Open</span>
          <span className="site-brand-edition">VII</span>
        </Link>
        <div className="auth-header-actions">
          <div className="account-header-tools">
            <div className="account-header-side">
              <SideToggle />
            </div>
            <SoundToggle />
            <button
              ref={menuToggle}
              type="button"
              className="account-menu-toggle"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="account-mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
          <div className="account-header-secondary">
            <Link
              to="/"
              className="account-back site-nav-link site-nav-action"
              aria-label="Back to landing page"
            >
              <span aria-hidden="true">←</span> Back to the story
            </Link>
          </div>
        </div>
      </div>
      <div id="account-mobile-menu" className="account-mobile-menu" hidden={!open}>
        <nav aria-label="Account menu">
          <Link
            to="/"
            className="account-back site-nav-link site-nav-action"
            aria-label="Back to landing page"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">←</span> Back to the story
          </Link>
        </nav>
        <div className="account-menu-preferences">
          <SideToggle />
        </div>
      </div>
    </header>
  );
}
