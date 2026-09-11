'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const STORAGE_KEY = 'toyboxOnboardingSeen';

// ── Slides ────────────────────────────────────────────────────────────────────

type Bullet = { label: string; detail: string };
type Slide = {
  eyebrow?: string;
  title: string;
  intro: string;
  bullets: Bullet[];
};

const SLIDES: Slide[] = [
  {
    eyebrow: 'Welcome to',
    title: 'Toybox',
    intro: "Slalom builds world-class CX work on every engagement. Most of it disappears into SharePoint. Toybox is different — it is a premium, curated knowledge product, not another repository.",
    bullets: [
      { label: 'Curated, not crowdsourced', detail: 'Every deliverable passes a quality bar — no noise, no clutter' },
      { label: 'Practitioner-first', detail: 'Designed for the people doing the work, not for IT or compliance' },
      { label: 'Collective intelligence', detail: 'The more teams contribute, the smarter and more powerful it gets for everyone' },
    ],
  },
  {
    title: 'Getting Content into Toybox',
    intro: "Three paths to contribute — all designed to minimize effort and maximize quality.",
    bullets: [
      { label: 'Generate with AI', detail: 'Upload any project artifact — PDFs, decks, images — and AI writes the full case study narrative' },
      { label: 'Create manually', detail: 'Step-by-step guided form for teams who prefer to build their own showcase' },
      { label: 'Scan from SharePoint', detail: 'AI screens your existing knowledge repositories and surfaces high-value content for review' },
    ],
  },
  {
    title: 'Showcase and Design Shelf',
    intro: "One publish, two outcomes. Every case study you share does double duty.",
    bullets: [
      { label: 'A living showcase', detail: 'Full case study with challenge, personas, solution highlights, and measurable impact' },
      { label: 'Auto-extracted deliverables', detail: 'Toybox pulls out personas, blueprints, and journey maps automatically on publish' },
      { label: 'Straight to the Design Shelf', detail: 'Tagged by type and industry, searchable and filterable, ready to reuse on your next engagement' },
    ],
  },
  {
    title: 'Experience Accelerator (ExA)',
    intro: "Imagine walking into any client meeting having already surfaced the most relevant Slalom case studies, personas, and frameworks — in seconds. That is ExA.",
    bullets: [
      { label: 'Describe your context', detail: 'Client industry, what you are building: a pitch, a proposal, a new project brief' },
      { label: 'AI browses all of Toybox', detail: 'Finds the most relevant work across all of Slalom, even work you did not know existed' },
      { label: 'White-label output', detail: 'Client-ready content tailored to your context, not a generic search result' },
      { label: 'Gets smarter as Toybox grows', detail: 'Every new showcase makes ExA more powerful for every practitioner' },
    ],
  },
  {
    title: 'Governance and Curation',
    intro: "Toybox is only as valuable as what is inside it. The governance layer is what keeps the quality bar high.",
    bullets: [
      { label: 'Always scanning', detail: 'Connected repositories are continuously monitored for new content' },
      { label: 'Scored automatically', detail: 'Artifacts rated on ExA usefulness, industry signal, and reusability' },
      { label: 'Human review', detail: 'Admins see the highest-scoring items and approve what enters Toybox' },
      { label: 'Quality compounds', detail: 'Better content in means better ExA output and more value for every practitioner' },
    ],
  },
];

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function OnboardingModal({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  useEffect(() => {
    if (forceOpen) { setIdx(0); setOpen(true); }
  }, [forceOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
    onClose?.();
  }

  if (!open) return null;

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 540,
          background: '#111116',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: i === idx ? 22 : 6,
                  background: i === idx ? '#005AFF' : i < idx ? 'rgba(0,90,255,0.4)' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
          <button onClick={dismiss} className="rounded-lg p-1 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#005AFF' }}>
            {idx + 1} of {SLIDES.length}
          </p>
          {slide.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 mb-0.5">{slide.eyebrow}</p>
          )}
          <h2 className="text-xl font-bold text-white leading-snug mb-3">{slide.title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{slide.intro}</p>

          {/* Bullets */}
          <ul className="space-y-2.5">
            {slide.bullets.map(({ label, detail }) => (
              <li key={label} className="flex gap-3">
                <span
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,90,255,0.15)', border: '1px solid rgba(0,90,255,0.3)' }}
                >
                  <span className="block h-1.5 w-1.5 rounded-full" style={{ background: '#005AFF' }} />
                </span>
                <span className="text-sm leading-snug">
                  <span className="font-semibold text-white">{label} </span>
                  <span className="text-slate-400">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-0"
          >
            <ChevronLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={dismiss} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Skip
            </button>
            {isLast ? (
              <button
                onClick={dismiss}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white"
                style={{ background: '#005AFF' }}
              >
                Get started
              </button>
            ) : (
              <button
                onClick={() => setIdx(i => i + 1)}
                className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                style={{ background: '#005AFF' }}
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
