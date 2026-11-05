import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { NEXT_STEP_ROUTE, type NextStep } from '@/lib/next-step';
import type { RegistrationStatus } from '@/lib/registration';
import { JumpLink } from './jump-link';

const RegistrationContext = createContext<{ nextStep: NextStep; open: boolean }>({
  nextStep: 'register',
  open: true,
});
export function RegistrationProvider({
  nextStep,
  registration,
  children,
}: {
  nextStep: NextStep;
  registration: RegistrationStatus;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(registration.open);
  useEffect(() => {
    if (!registration.open || !registration.deadline) return;
    const timer = setTimeout(
      () => setOpen(false),
      Math.max(0, Date.parse(registration.deadline) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [registration.open, registration.deadline]);
  return <RegistrationContext value={{ nextStep, open }}>{children}</RegistrationContext>;
}
export function RegistrationLink({
  children,
  className,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const text = useLandingText();
  const { nextStep, open } = useContext(RegistrationContext);
  if (!open && nextStep === 'onboarding') return null;
  const label =
    nextStep === 'register'
      ? open
        ? children
        : text('Sign in')
      : nextStep === 'onboarding'
        ? compact
          ? text('My profile')
          : text('Complete profile')
        : nextStep === 'team'
          ? compact
            ? text('Join team')
            : text('Create or join team')
          : compact
            ? text('My team')
            : text('Manage team');
  return (
    <JumpLink href={NEXT_STEP_ROUTE[nextStep]} className={className}>
      {label}
    </JumpLink>
  );
}
