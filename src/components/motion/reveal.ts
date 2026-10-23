import { gsap } from "./gsap";

/** The house text entrance: rise 24px and fade in once, when the trigger's top reaches 85% of the screen. Call inside useGsap and skip it for reduced motion. */
export function reveal(targets: gsap.TweenTarget, trigger: Element | string, vars: gsap.TweenVars = {}) {
  return gsap.from(targets, {
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.06,
    ...vars,
    scrollTrigger: { trigger, start: "top 85%", once: true },
  });
}
