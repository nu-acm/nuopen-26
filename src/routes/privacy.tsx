import { createFileRoute } from '@tanstack/react-router';
import { ContactLink, LegalPage, LegalSection } from '@/components/LegalPage';
import { CV_MAX_MB } from '@/lib/cv';
import { CONTACT_EMAIL } from '@/lib/event';
import { pageMetadata, SITE_URL } from '@/lib/metadata';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
  head: () => ({
    meta: pageMetadata(
      'Privacy Policy | NU Open 2026',
      'How NU Open collects, uses and protects your personal data on the event registration platform.',
    ),
  }),
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 11, 2026">
      <LegalSection title="1. Who we are">
        <p>
          The ACM@NU Student Chapter at Nazarbayev University in Astana, Kazakhstan organizes NU
          Open and is responsible for participant data. This policy applies to the NU Open website
          and registration platform at {new URL(SITE_URL).hostname}.
        </p>
      </LegalSection>

      <LegalSection title="2. Data we collect">
        <p className="mb-2">We collect data when you sign in, register or check in at the event.</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong className="text-foreground">Account data:</strong> your email address, and your
            name and profile picture if you sign in with Google.
          </li>
          <li>
            <strong className="text-foreground">Sign-in data:</strong> verification records, session
            cookies, IP address and browser information used to keep you signed in and limit sign-in
            abuse.
          </li>
          <li>
            <strong className="text-foreground">Registration data:</strong> full name, IIN
            (individual identification number), phone number, city, level of study, place of study
            if applicable, and a parent or guardian’s phone number when required by the age check.
          </li>
          <li>
            <strong className="text-foreground">Team data:</strong> your team’s name, members and
            invite link. Once your team is finalized, we store its table number and contest login
            details.
          </li>
          <li>
            <strong className="text-foreground">Optional CV:</strong> a PDF of up to {CV_MAX_MB} MB,
            including any personal information it contains, and its Google Drive link.
          </li>
          <li>
            <strong className="text-foreground">Attendance:</strong> whether you checked in at the
            event.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your data">
        <ul className="list-inside list-disc space-y-1">
          <li>To verify your email, check your age using your IIN and manage registration</li>
          <li>To organize teams and communicate event logistics</li>
          <li>To check you in at the venue</li>
          <li>To review any CV you upload and share it with event partners for recruitment</li>
          <li>To comply with legal obligations and keep the event safe</li>
        </ul>
        <p className="mt-2">
          Your teammates can see your name. Anyone with the team’s invite link can see its name and
          how many members it has.
        </p>
      </LegalSection>

      <LegalSection title="4. Minors">
        <p>
          Participants under 18 on the day of the contest must provide a parent or guardian’s phone
          number so we can reach them about the event. We use the birth date encoded in the IIN for
          this check. If we cannot determine your age from the IIN, we also require a parent or
          guardian’s phone number. ACM@NU obtains consent from a parent or guardian through Telegram
          for participants under 18.
        </p>
      </LegalSection>

      <LegalSection title="5. Legal basis and consent">
        <p>
          Before submitting your registration details, you must agree to the Terms of Service and
          consent to the processing of your personal data as described in this policy. We record
          when you accept and the policy version you accepted. We also record when you acknowledge
          the Code of Conduct and which version you acknowledged. Uploading a CV is optional. By
          uploading one, you agree to its storage, review and sharing as described above. You can
          contact us to withdraw consent. This may affect your ability to take part in the event.
        </p>
      </LegalSection>

      <LegalSection title="6. Storage and security">
        <p>
          We store account and registration data in Cloudflare D1 and keep a copy of participant
          records in Kazakhstan. The website transmits data over HTTPS. We use Google Apps Script to
          send sign-in codes and store uploaded CVs in Google Drive. Organizers control access to
          the CV folder and share uploaded CVs with event partners for recruitment. Organizers can
          export registration data, including IINs, contact details, CV links and attendance, to a
          spreadsheet. We do not sell your data.
        </p>
        <p className="mt-2">
          While registration is open, you can remove your CV from your profile. This moves the file
          to Google Drive’s trash. After registration closes, contact us to request removal.
        </p>
        <p className="mt-2">
          Your browser stores your theme and music preferences and remembers whether you have seen
          the intro during this visit.
        </p>
      </LegalSection>

      <LegalSection title="7. Retention">
        <p>
          We keep your data for the duration of the event and a reasonable period afterwards for
          administrative purposes. You may ask us to delete it at any time.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>
          You may ask to access, correct, block or delete your personal data as provided by
          Kazakhstan’s Law on Personal Data and Its Protection. Contact us at the address below.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For questions about this policy or your data, contact the ACM@NU Student Chapter at{' '}
          <ContactLink email={CONTACT_EMAIL} />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
