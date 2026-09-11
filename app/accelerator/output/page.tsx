'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Mail, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';

type Phase = { phase: string; duration: string; activities: string[]; deliverable: string };
type Persona = { name: string; need: string; tension: string; howWeHelp: string };
type Insight = { insight: string; implication: string };
type Experience = { title: string; description: string; outcome: string; tags: string[] };
type MatchedSource = {
  showcaseRef: number;
  title: string;
  domain: string;
  relevanceScore: 'High' | 'Medium';
  relevanceReason: string;
  keyTransfer: string;
  previewId: string | null;
  showcaseHref: string | null;
};
type Accelerator = {
  headline: string;
  subheadline: string;
  executiveSummary: string;
  whyNow: string;
  relevantExperience: Experience[];
  keyInsights: Insight[];
  proposedApproach: { phases: Phase[] };
  personas: Persona[];
  callToAction: string;
  sourceShowcases: string[];
  matchedSources: MatchedSource[];
  pointsOfContact?: { name: string; role: string; email?: string }[];
};
type AcceleratorStore = {
  input: { targetClient: string; goalContext: string; outputType: string };
  output: Accelerator;
  generatedAt: string;
};

function ShareModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(10,10,15,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-4">✉️</div>
            <h3 className="text-lg font-semibold text-slate-950 mb-2">Shared!</h3>
            <p className="text-slate-500 text-sm mb-6">In a live version, this would send the accelerator link to {email}.</p>
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-700 transition">Close</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-slate-950 mb-1">Share this accelerator</h3>
            <p className="text-sm text-slate-500 mb-6">Send a link to colleagues or clients. (UI preview — not functional in MVP.)</p>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipient email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400 mb-4"
            />
            <label className="block text-sm font-medium text-slate-700 mb-2">Add a note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Here's a thought starter ahead of our meeting..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none mb-6 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm text-slate-500 hover:text-slate-950 transition">Cancel</button>
              <button
                onClick={() => setSent(true)}
                disabled={!email}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 transition flex items-center justify-center gap-2"
                style={{ background: '#005AFF' }}
              >
                <Mail size={14} />
                Send link
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceleratorOutputPage() {
  const router = useRouter();
  const [store, setStore] = useState<AcceleratorStore | null>(null);
  const [showShare, setShowShare] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('toyboxAcceleratorOutput');
    if (!raw) {
      router.replace('/accelerator');
      return;
    }
    setStore(JSON.parse(raw));
  }, [router]);

  if (!store) return null;

  const { input, output: acc, generatedAt } = store;
  const outputLabel =
    input.outputType === 'sales-pitch' ? 'Sales Pitch'
    : input.outputType === 'design-blueprint' ? 'Design Blueprint'
    : input.outputType === 'proposal-response' ? 'Proposal Response'
    : 'Proposal Response';

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: #0f172a !important; }
        }
      `}</style>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/accelerator" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 transition">
                <ArrowLeft size={14} />
                New accelerator
              </Link>
              {store && (
                <>
                  <span className="text-slate-200">/</span>
                  <span className="text-sm text-slate-400 truncate max-w-[200px]">{store.input.targetClient}</span>
                </>
              )}
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border" style={{ background: '#005AFF0D', color: '#005AFF', borderColor: '#005AFF33' }}>
                  <Sparkles size={11} />
                  {outputLabel}
                </span>
                <span>for <span className="font-medium text-slate-700">{input.targetClient}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:text-slate-950 hover:border-slate-400 transition"
              >
                <Mail size={14} />
                Share
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                style={{ background: '#005AFF' }}
              >
                <Download size={14} />
                Export PDF
              </button>
            </div>
          </div>
        </header>

        <div ref={printRef} className="mx-auto max-w-4xl px-6 py-16 space-y-16">
          {/* Hero */}
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">{outputLabel} · {input.targetClient}</p>
            <h1 className="text-5xl font-semibold tracking-[-0.04em] leading-[1.02] text-slate-950 mb-6">
              {acc.headline}
            </h1>
            <p className="text-xl text-slate-600 leading-8 max-w-2xl">
              {acc.subheadline}
            </p>
          </section>

          {/* Executive Summary */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Executive Summary</h2>
            <div className="space-y-4 text-slate-700 leading-8 text-[17px]">
              {acc.executiveSummary.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* Why Now */}
          <section className="rounded-2xl p-8" style={{ background: '#005AFF08', border: '1px solid #005AFF20' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#005AFF' }}>Why Now</p>
            <p className="text-slate-800 text-lg leading-8">{acc.whyNow}</p>
          </section>

          {/* Key Insights */}
          {acc.keyInsights?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Key Insights</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {acc.keyInsights.map((ins, i) => (
                  <div key={i} className="rounded-xl p-6 border border-slate-200 bg-white">
                    <p className="font-semibold text-slate-900 mb-2 leading-snug">{ins.insight}</p>
                    <p className="text-sm text-slate-500 leading-6">{ins.implication}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Relevant Experience */}
          {acc.relevantExperience?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Relevant Experience</h2>
              <div className="space-y-4">
                {acc.relevantExperience.map((exp, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                      <div className="flex gap-1.5 flex-wrap shrink-0">
                        {exp.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 border border-slate-200">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-6 mb-3">{exp.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#005AFF' }}>
                      <ChevronRight size={14} />
                      {exp.outcome}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personas */}
          {acc.personas?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Who We're Designing For</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {acc.personas.map((p, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3" style={{ background: '#005AFF', color: '#fff' }}>
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{p.name}</h3>
                    <p className="text-xs text-slate-500 mb-3 leading-5">{p.tension}</p>
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-400 mb-1">Need</p>
                      <p className="text-xs text-slate-600 leading-5">{p.need}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-slate-400 mb-1">How we help</p>
                      <p className="text-xs leading-5 font-medium" style={{ color: '#005AFF' }}>{p.howWeHelp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Proposed Approach */}
          {acc.proposedApproach?.phases?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Proposed Approach</h2>
              <div className="space-y-3">
                {acc.proposedApproach.phases.map((ph, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-slate-200 text-slate-500">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 text-sm">{ph.phase}</h3>
                        <span className="text-xs text-slate-400">{ph.duration}</span>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {ph.activities.map((act, j) => (
                          <li key={j} className="text-xs text-slate-500 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                            {act}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs font-medium" style={{ color: '#005AFF' }}>↳ {ph.deliverable}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Points of Contact */}
          {acc.pointsOfContact && acc.pointsOfContact.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Key Points of Contact</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {acc.pointsOfContact.map((poc, i) => {
                  const initials = poc.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: '#005AFF', color: '#fff' }}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">{poc.name}</p>
                          <p className="text-xs text-slate-500">{poc.role}</p>
                        </div>
                      </div>
                      {(poc as any).expertise && (
                        <p className="text-xs text-slate-500 leading-5 mb-3">{(poc as any).expertise}</p>
                      )}
                      {poc.email && (
                        <a href={`mailto:${poc.email}`} className="text-xs font-medium transition" style={{ color: '#005AFF' }}>
                          {poc.email}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, #005AFF08 0%, #f8faff 100%)', border: '1px solid #005AFF20' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Next Step</p>
            <p className="text-xl font-semibold text-slate-900 leading-8 max-w-xl mx-auto">{acc.callToAction}</p>
          </section>

          {/* Source material — linked showcase cards */}
          {acc.matchedSources?.length > 0 && (
            <section className="border-t border-slate-200 pt-10">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Source material from Toybox</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {acc.matchedSources.map((src, i) => (
                  <div
                    key={i}
                    className="group rounded-xl border border-slate-200 bg-white p-5 relative"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{src.domain}</span>
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{src.title}</h3>
                      </div>
                      {src.relevanceScore === 'High' && (
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: '#005AFF', color: '#fff' }}>
                          Best fit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-5 mb-4">{src.keyTransfer}</p>
                    {src.showcaseHref ? (
                      <Link
                        href={src.showcaseHref}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition"
                        style={{ color: '#005AFF' }}
                      >
                        View showcase
                        <ArrowUpRight size={12} />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-300">Internal reference</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-slate-400">
                Generated from Slalom Toybox knowledge base · {new Date(generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </section>
          )}
        </div>

        {/* Bottom bar */}
        <div className="no-print border-t border-slate-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
            <Link href="/accelerator">
              <button className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-500 hover:text-slate-950 hover:border-slate-400 transition">
                ← Generate another
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowShare(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:text-slate-950 transition">
                <Mail size={14} />
                Share via email
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition" style={{ background: '#005AFF' }}>
                <Download size={14} />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
