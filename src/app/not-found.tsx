import "./not-found.css";

import Link from "next/link";

import { EVENT } from "@/content/event";

export default function NotFound() {
  return (
    <main className="nf">
      <p aria-hidden="true" className="nf-code font-display">
        404
      </p>
      <div className="nf-copy">
        <p className="label">404 · Lost in hyperspace</p>
        <h1 className="h2 font-display">These aren&apos;t the pages you&apos;re looking for.</h1>
        <p className="lead">
          This part of the galaxy is still being built. Every fact about <span className="whitespace-nowrap">{EVENT.name}</span> is on the
          landing.
        </p>
        <Link href="/" className="btn">
          Back to the landing
        </Link>
      </div>
    </main>
  );
}
