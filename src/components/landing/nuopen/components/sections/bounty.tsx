import { useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';
import { formatMoney } from '@/components/landing/nuopen/lib/format';

import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';
import { NumberTicker } from '../ui/number-ticker';
import { RegistrationLink } from '../ui/registration-link';

const formatAmount = (amount: number) => formatMoney(amount, '');

export function Reward() {
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced }) => {
    const section = root.current;
    if (reduced || !section) return;
    const panel = section.querySelector<HTMLElement>('.bounty-panel');
    if (panel) reveal('.bounty-copy', panel);
  }, root);

  return (
    <section ref={root} id="bounty" aria-labelledby="bounty-title" className="section bounty">
      <div className="bounty-panel hud">
        <p className="kicker bounty-copy">The reward</p>
        <h2 id="bounty-title" className="bounty-amount font-display">
          <span className="sr-only">{`Prize pool ${EVENT.prize.text}`}</span>
          <span aria-hidden className="bounty-figures">
            <span className="bounty-currency font-sans">{EVENT.prize.currency}</span>
            <NumberTicker value={EVENT.prize.amount} format={formatAmount} />
          </span>
        </h2>
        <p className="lead bounty-copy">{EVENT.prize.extra}</p>
        <p className="label bounty-copy">Prizes go to teams that register and compete on campus.</p>
        <RegistrationLink className="btn bounty-copy">Win it. Register your team</RegistrationLink>
      </div>
    </section>
  );
}
