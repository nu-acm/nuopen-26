"use client";

import "./faq.css";

import { useId, useRef, useState } from "react";

import { EVENT } from "@/content/event";

import { reveal } from "../motion/reveal";
import { useGsap } from "../motion/use-gsap";

type Item = (typeof EVENT.faq)[number];

export function Faq() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useGsap(
    ({ reduced }) => {
      if (reduced || !root.current) return;
      reveal(".faq-head > *", root.current);
      if (list.current) reveal(".faq-item", list.current);
    },
    root,
  );

  return (
    <section ref={root} id="faq" aria-labelledby="faq-title" className="section split faq">
      <div className="faq-head split-copy">
        <p className="kicker">The archives</p>
        <h2 id="faq-title" className="h2 font-display">
          The answers you seek
        </h2>
        <p className="lead">The questions we hear most, answered in one place.</p>
        <p className="faq-lost">
          Still lost in space? Write to{" "}
          <a href={`mailto:${EVENT.contacts.email}`}>{EVENT.contacts.email}</a>
        </p>
      </div>

      <div className="faq-body split-main">
        <div ref={list} className="faq-list">
          {EVENT.faq.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const questionId = `${id}-question`;
  const answerId = `${id}-answer`;

  return (
    <div className="faq-item">
      <h3 className="faq-title">
        <button
          id={questionId}
          type="button"
          className="faq-question"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{item.q}</span>
          <svg className="faq-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 8h12" />
            <path className="faq-icon-bar" d="M8 2v12" />
          </svg>
        </button>
      </h3>
      <div id={answerId} role="region" aria-labelledby={questionId} className="faq-panel" data-open={open} inert={!open}>
        <div className="faq-panel-inner">
          <p>{item.a}</p>
        </div>
      </div>
    </div>
  );
}
