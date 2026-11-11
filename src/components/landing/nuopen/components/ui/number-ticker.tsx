import { animate } from 'motion';
import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

export function NumberTicker({
  value,
  format,
}: {
  value: number;
  format: (value: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();
  const finalText = format(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || !inView || reducedMotion) return;

    element.textContent = format(0);
    const animation = animate(0, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (latest) => {
        element.textContent = format(latest);
      },
    });
    return () => {
      animation.stop();
      element.textContent = finalText;
    };
  }, [inView, reducedMotion, value, format, finalText]);

  return (
    <span className="inline-grid tabular-nums">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {finalText}
      </span>
      <span ref={ref} className="col-start-1 row-start-1 text-right">
        {finalText}
      </span>
    </span>
  );
}
