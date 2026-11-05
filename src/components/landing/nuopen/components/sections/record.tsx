import { useTranslation } from 'react-i18next';
import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import './record.css';

import { useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';
import { formatCount } from '@/components/landing/nuopen/lib/format';

import { gsap } from '../motion/gsap';
import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';

const COUNT_SECONDS = 1.8;

/** Six editions in numbers: the figures count up once, but the HTML already carries the final values. */
export function PreviousEpisodes() {
  const text = useLandingText();
  const { i18n } = useTranslation();
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced }) => {
    const section = root.current;
    if (reduced || !section) return;

    section.querySelectorAll<HTMLElement>('.record-num').forEach((el) => {
      const counter = { value: 0 };
      el.textContent = formatCount(0, i18n.language);
      gsap.to(counter, {
        value: Number(el.dataset.value),
        duration: COUNT_SECONDS,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = formatCount(counter.value, i18n.language);
        },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    const copy = section.querySelector<HTMLElement>('.record-copy');
    const stats = section.querySelector<HTMLElement>('.record-stats');
    const frame = section.querySelector<HTMLElement>('.record-frame');
    if (copy) reveal('.record-copy > *', copy);
    if (stats) reveal('.record-stat', stats);
    if (frame) {
      gsap.fromTo(
        '.record-photo',
        { scale: 1.1 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  }, root);

  return (
    <section ref={root} id="record" aria-labelledby="record-title" className="section record">
      <div className="split">
        <div className="split-copy record-copy">
          <p className="kicker">{text('Previous episodes')}</p>
          <h2 id="record-title" className="h2 font-display">
            {text('Six battles behind us')}
          </h2>
          <p className="lead">
            {text(
              'NU Open grows competitive programming in Kazakhstan. For beginners it is the way in. For veterans it is ICPC practice under real pressure. And it is where young coders meet.',
            )}
          </p>
        </div>

        <dl className="split-main record-stats">
          {EVENT.stats.map((stat) => (
            <div key={text(stat.label)} className="record-stat">
              <dt className="label">{text(stat.label)}</dt>
              <dd className="record-figure font-display">
                <span className="record-num" data-value={stat.value}>
                  {formatCount(stat.value, i18n.language)}
                </span>
                {stat.suffix && <span className="record-suffix">{stat.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className="record-frame hud">
        <div className="record-photo-wrap">
          <img
            loading="lazy"
            src="/nuopen/images/nuopen-24.jpg"
            width={1256}
            height={660}
            alt={text('NU Open 2024 teams on stage with the prize boards')}
            sizes="(min-width: 1240px) 1144px, calc(100vw - 32px)"
            className="record-photo"
          />
          <span aria-hidden className="record-grain" />
        </div>
        <figcaption className="label">NU Open ’24 · Nazarbayev University</figcaption>
      </figure>
    </section>
  );
}
