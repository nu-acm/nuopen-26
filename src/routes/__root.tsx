import { EVENT } from '@/components/landing/nuopen/content/event';
import { SiteExperience } from '@/components/landing/nuopen/components/ui/site-experience';
import { SIDE_SCRIPT } from '@/components/landing/nuopen/lib/side';
import { INTRO_SCRIPT } from '@/components/landing/nuopen/lib/intro';
import type { QueryClient } from '@tanstack/react-query';
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { pageMetadata, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/metadata';
import appCss from '@/styles.css?url';

function NotFoundPage() {
  return (
    <AccountShell>
      <main className="system-page">
        <p className="system-code" aria-hidden="true">
          404
        </p>
        <div className="system-copy">
          <p className="system-eyebrow" aria-hidden="true">
            404
          </p>
          <h1>Page not found</h1>
          <p className="system-lead">The page you’re looking for doesn’t exist or has moved.</p>
          <Link to="/" className={buttonVariants()}>
            Go home
          </Link>
        </div>
      </main>
    </AccountShell>
  );
}

function RootErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <AccountShell>
      <main className="system-page">
        <div className="system-copy">
          <h1>Something went wrong</h1>
          <p className="system-lead">Try again or return to the homepage.</p>
          {/* The raw message helps while developing; users never see internals. */}
          {import.meta.env.DEV && (
            <p className="mb-6 font-mono text-sm wrap-break-word text-destructive">
              {error instanceof Error ? error.message : String(error)}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => reset()}>
              Try again
            </Button>
            <Link to="/" className={buttonVariants({ className: 'flex-1' })}>
              Go home
            </Link>
          </div>
        </div>
      </main>
    </AccountShell>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorPage,
  head: ({ matches }) => {
    const canonicalUrl = new URL(matches.at(-1)?.pathname ?? '/', SITE_URL).href;
    const imageUrl = `${SITE_URL}/social-preview.png`;
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0' },
        ...pageMetadata(SITE_TITLE, SITE_DESCRIPTION),
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: EVENT.name },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: SITE_TITLE },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: SITE_TITLE },
        { name: 'theme-color', content: '#03040a' },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', type: 'image/x-icon', sizes: '16x16 32x32 48x48', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'canonical', href: canonicalUrl },
      ],
    };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-side="light" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: SIDE_SCRIPT + INTRO_SCRIPT }} />
      </head>
      <body>
        <div className="nuopen-landing">
          <SiteExperience />
        </div>
        {children}
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: 'middle-right', hideUntilHover: true }}
            plugins={[{ name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> }]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
