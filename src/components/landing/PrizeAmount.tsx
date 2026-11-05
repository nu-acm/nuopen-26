import { useRef, type CSSProperties } from 'react';
import { gsap } from './visuals/gsap';
import { useGsap } from './visuals/use-gsap';

const DIGITS = Array.from({ length: 30 }, (_, index) => index % 10);
const landingSpin = (digit: number) => ((20 + digit) * 100) / 30;

/** NUOPEN's prize reels render WHD's translated amount; no event data is imported. */
export default function PrizeAmount({ amount, currency }: { amount: string; currency: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  useGsap(({ reduced }) => {
    if (reduced || !root.current) return;
    const reels = root.current.querySelectorAll<HTMLElement>('.reel-strip');
    gsap.set(reels, { '--spin': 0 });
    const roll = gsap.timeline({
      scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
    });
    reels.forEach((reel, index) => {
      roll.to(
        reel,
        { '--spin': landingSpin(Number(reel.dataset.digit)), duration: 2.4, ease: 'power3.out' },
        index * 0.14,
      );
    });
    roll.fromTo(
      '.reel-scan',
      { top: '0%', opacity: 0.9 },
      { top: '100%', opacity: 0, duration: 0.9, ease: 'power1.inOut' },
      1.6,
    );
  }, root);
  return (
    <p ref={root} className="bento-prize-amount bounty-amount" aria-label={`${amount} ${currency}`}>
      <span className="bounty-figures" aria-hidden="true">
        {amount.split('').map((character, index) =>
          /\d/.test(character) ? (
            <span className="reel" key={index}>
              <span
                className="reel-strip"
                data-digit={character}
                style={{ '--spin': landingSpin(Number(character)) } as CSSProperties}
              >
                {DIGITS.map((digit, position) => (
                  <span key={position}>{digit}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={index}>{character}</span>
          ),
        )}{' '}
        <span className="bounty-currency">{currency}</span>
      </span>
      <span className="reel-scan" aria-hidden="true" />
    </p>
  );
}
