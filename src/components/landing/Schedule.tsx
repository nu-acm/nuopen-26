import { useTranslation } from 'react-i18next';
import { EVENT_SCHEDULE } from '@/lib/event';
import SectionHeading from '@/components/landing/SectionHeading';

export default function Schedule() {
  const { t } = useTranslation();
  return (
    <section id="schedule" className="landing-section landing-container">
      <p className="landing-eyebrow">{t('schedule.kicker')}</p>
      <SectionHeading title={t('schedule.title')} />
      <ol className="agenda">
        {EVENT_SCHEDULE.map((event) => (
          <li
            key={event.id}
            className="agenda-row"
            data-main={
              ['mathematics', 'programming', 'productDesign'].includes(event.id)
                ? 'true'
                : undefined
            }
          >
            <span className="agenda-time">{event.time}</span>
            <div className="agenda-body">
              <h3 className="agenda-title">{t(`schedule.events.${event.id}`)}</h3>
              <p className="agenda-note">{t(`schedule.venues.${event.venue}`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
