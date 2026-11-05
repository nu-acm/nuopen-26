import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import Scene from '@/components/landing/Scene';
import { cn } from '@/lib/utils';

export type EventStat = {
  id: string;
  icon: IconType;
  accent: 'pink' | 'purple' | 'lime';
  label: string;
  metric: string;
  compactMetric?: boolean;
  subLabel: ReactNode;
  description: ReactNode;
};

/** Watermelon stats-2, adapted to WHD content, tokens and motion preferences.
 * Source: https://registry.watermelon.sh/r/stats-2.json
 */
export default function Stats2({ stats, title }: { stats: EventStat[]; title?: string }) {
  return (
    <div className="briefing-grid reference-split">
      {title && (
        <header className="briefing-head">
          <h2 className="landing-heading">{title}</h2>
        </header>
      )}
      <div className="briefing-target">
        <div className="briefing-frame">
          <Scene variant="briefing" />
          <svg
            className="briefing-reticle"
            viewBox="-50 -50 100 100"
            aria-hidden="true"
            focusable="false"
          >
            <circle r="44" />
            {Array.from({ length: 12 }, (_, index) => index * 30).map((degrees) => (
              <line
                key={degrees}
                transform={`rotate(${degrees})`}
                x1="0"
                y1="-44"
                x2="0"
                y2={degrees % 90 === 0 ? -48 : -46}
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="briefing-readout reference-hud">
        {stats.map((stat, index) => (
          <div key={stat.id} className="briefing-row">
            <p className="landing-label">
              0{index + 1} · {stat.label}
            </p>
            <div>
              <dl>
                <dt className="sr-only">{stat.label}</dt>
                <dd className={cn('briefing-value', stat.compactMetric && 'briefing-place')}>
                  {stat.metric}
                </dd>
              </dl>
              <p className="briefing-detail">{stat.subLabel}</p>
              <div className="event-stat-description">{stat.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
