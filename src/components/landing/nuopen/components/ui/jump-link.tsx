import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { crossesAccountBoundary, NAVIGATION_JUMP } from '../../lib/navigation-jump';

export function JumpLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={href}
      className={className}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.defaultPrevented
        )
          return;
        const destination = new URL(href, location.href);
        if (crossesAccountBoundary(location.pathname, destination.pathname))
          dispatchEvent(new CustomEvent(NAVIGATION_JUMP, { detail: destination.pathname }));
      }}
    >
      {children}
    </Link>
  );
}
