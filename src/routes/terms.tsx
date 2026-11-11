import { createFileRoute } from '@tanstack/react-router';
import { ContactLink, LegalPage, LegalSection } from '@/components/LegalPage';
import {
  CODE_OF_CONDUCT_URL,
  CONTACT_EMAIL,
  MAX_TEAM_SIZE,
  MIN_PARTICIPANT_AGE,
} from '@/lib/event';
import { pageMetadata, SITE_URL } from '@/lib/metadata';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({
    meta: pageMetadata(
      'Terms of Service | NU Open 2026',
      'Rules and conditions for registering for NU Open 2026 and using the event platform.',
    ),
  }),
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 11, 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          These terms apply to registration for NU Open at {new URL(SITE_URL).hostname}. You must
          accept them before submitting your registration details.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least {MIN_PARTICIPANT_AGE} years old on the day of the contest and compete
          in person at Nazarbayev University. Participants who will be under 18 on the contest date
          must provide a parent or guardian’s phone number. The registration form also asks for a
          guardian’s number if it cannot determine your age from your IIN. Organizers verify
          eligibility and obtain guardian consent through Telegram for participants under 18.
        </p>
      </LegalSection>

      <LegalSection title="3. Registration and accuracy">
        <p>
          You agree to provide accurate, complete and up-to-date information during registration.
          False or misleading information may result in disqualification or removal from the event.
        </p>
      </LegalSection>

      <LegalSection title="4. Teams">
        <p>
          Teams can have one to {MAX_TEAM_SIZE} members, including solo participants. The team
          captain may remove members while registration is open.
        </p>
      </LegalSection>

      <LegalSection title="5. Code of conduct">
        <p>
          All participants must follow the{' '}
          <a href={CODE_OF_CONDUCT_URL} className="underline">
            Code of Conduct
          </a>{' '}
          and any instructions from the organizers. Harassment, cheating or disruptive behaviour may
          result in removal from the event.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          Work you create during NU Open remains yours. By participating, you grant the organizers a
          non-exclusive licence to showcase, promote and document it for event-related purposes.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          The ACM@NU Student Chapter and the NU Open organizers are not liable for any loss, damage
          or inconvenience arising from your use of this platform or participation in the event. The
          platform is provided “as is” without warranties of any kind.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          If these terms change, the registration form will ask you to accept the updated version
          when you next submit or edit your registration details.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For questions about these terms, contact the ACM@NU Student Chapter at{' '}
          <ContactLink email={CONTACT_EMAIL} />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
