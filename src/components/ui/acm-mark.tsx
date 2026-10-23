import type { SVGProps } from "react";

export function AcmMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="ACM Student Chapter" {...props}>
      <rect x="18" y="18" width="64" height="64" rx="9" fill="currentColor" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="var(--space)" strokeWidth="2.5" />
      <text
        x="50"
        y="50"
        fill="var(--space)"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="24"
        fontWeight="800"
        style={{ fontFamily: "var(--font-archivo), sans-serif" }}
      >
        acm
      </text>
    </svg>
  );
}
