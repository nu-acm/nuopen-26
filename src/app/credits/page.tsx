import "./credits.css";

import type { Metadata } from "next";
import Link from "next/link";

import { EVENT } from "@/content/event";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

export const metadata: Metadata = {
  title: `3D model credits · ${EVENT.name}`,
  description: `The authors and licences of the 3D models on the ${EVENT.name} site.`,
};

export default function Credits() {
  return (
    <main className="credits">
      <div className="credits-head">
        <p className="label">Credits</p>
        <h1 className="h2 font-display">3D models</h1>
        <p className="lead">
          Every ship, helmet and blade on this site was made by an artist on Sketchfab. Compressed and re-oriented for the web.
        </p>
      </div>

      <ul className="credits-list">
        {EVENT.credits.map((credit) => (
          <li key={credit.href} className="credits-row">
            <a href={credit.href} {...EXTERNAL} className="credits-model font-display">
              {credit.model}
            </a>
            <span className="credits-by">by {credit.author}</span>
            <span className="credits-licence font-mono">{credit.license}</span>
          </li>
        ))}
      </ul>

      <Link href="/" className="btn-ghost">
        Back to the landing
      </Link>
    </main>
  );
}
