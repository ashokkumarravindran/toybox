"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bookmark, Share2, Download, Star, ArrowRight } from 'lucide-react';

type SolutionHighlight = {
  type: string;
  summary: string;
  images: string[]; // data URLs
};

type GeneratedShowcase = {
  slug: string;
  projectName: string;
  domain: string;
  engagementType: string;
  figmaLink?: string;
  tags: string[];
  overview: string;
  challenge: string;
  solutionApproach: string;
  outcome?: string;
  selectedHighlights: string[];
  solutionHighlights: SolutionHighlight[];
  projectArtifacts: any[];
  heroImage?: string | null;
};

export default function GeneratedShowcasePage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug?: string };
  const [showcase, setShowcase] = useState<GeneratedShowcase | null>(null);

  useEffect(() => {
    if (!slug) return;
    if (slug === 'index-composer') {
      router.replace('/showcase/index-composer');
      return;
    }

    const raw = localStorage.getItem('toybox_generated_showcases');
    if (!raw) return;
    try {
      const arr = JSON.parse(raw) as GeneratedShowcase[];
      const found = arr.find((s) => s.slug === slug);
      if (found) setShowcase(found);
    } catch (e) {
      // ignore
    }
  }, [slug, router]);

  if (!slug) return null;

  if (!showcase) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg">Showcase not found.</p>
        <div className="mt-6">
          <Link href="/" className="text-cyan-500">Back to Toybox</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <Link href="/" className="font-semibold hover:text-slate-900 transition">← Back to Toybox</Link>
            <div className="flex items-center gap-3">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100">
                <Bookmark size={18} />
              </button>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                <Star size={16} className="text-amber-500" />
                4.7
              </div>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100">
                <Download size={18} />
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-950 via-slate-950/70 to-transparent" />
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div className="relative z-10">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-semibold">{showcase.domain} · {showcase.engagementType}</p>
                <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[0.98]">{showcase.projectName}</h1>
                <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">{showcase.overview.substring(0, 220)}</p>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">{showcase.solutionApproach}</p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a href={showcase.figmaLink || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                    Launch Story
                    <ArrowRight size={18} />
                  </a>
                  {showcase.projectArtifacts && showcase.projectArtifacts.length > 0 && (
                    <a href="#assets" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10">Download Assets</a>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute right-0 top-0 hidden h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl lg:block" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/20">
                  {showcase.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={showcase.heroImage} alt={showcase.projectName} className="h-full w-full min-h-[420px] object-cover" />
                  ) : (
                    <div className="h-[420px] w-full" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0b1220 100%)' }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="challenge" className="bg-white text-slate-900 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">The Challenge</p>
                <h2 className="mt-6 text-4xl font-semibold leading-tight">{showcase.challenge}</h2>
                <div className="mt-8 space-y-5 text-lg leading-8 text-slate-700">
                  <p>{showcase.challenge}</p>
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
                {showcase.solutionHighlights[0] && showcase.solutionHighlights[0].images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={showcase.solutionHighlights[0].images[0]} alt="challenge" className="h-full w-full min-h-[320px] object-cover" />
                ) : (
                  <div className="h-[320px] bg-slate-100" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Overview</p>
                <h2 className="text-4xl font-semibold">Overview</h2>
                <div className="space-y-4 text-lg leading-8 text-slate-700">
                  <p>{showcase.overview}</p>
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <h3 className="text-2xl font-semibold text-slate-900">Solution approach</h3>
                <div className="mt-6 text-slate-700">
                  {showcase.solutionApproach}
                </div>
              </div>
            </div>
          </div>
        </section>

        {showcase.solutionHighlights && showcase.solutionHighlights.length > 0 && (
          <section className="bg-slate-50 py-24 px-6 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between gap-6 mb-12">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
                  <h2 className="mt-2 text-3xl font-semibold">Highlights</h2>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {showcase.solutionHighlights.map((h) => (
                  <div key={h.type} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">{h.type}</h3>
                    <p className="text-slate-700 mb-6">{h.summary}</p>
                    {h.images && h.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.images[0]} alt={h.type} className="w-full rounded-lg object-cover h-64" />
                    ) : (
                      <div className="h-64 bg-slate-100 rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-24 px-6 sm:px-8">
          <div id="assets" className="mx-auto max-w-7xl">
            <h3 className="text-xl font-semibold mb-4">Assets & Artifacts</h3>
            {showcase.projectArtifacts && showcase.projectArtifacts.length > 0 ? (
              <ul className="space-y-2">
                {showcase.projectArtifacts.map((a, idx) => {
                  const value = a.value as string;
                  const isData = typeof value === 'string' && value.startsWith('data:');
                  const isLink = typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'));
                  return (
                    <li key={idx} className="text-slate-700">
                      {isData ? (
                        <a href={value} download={a.name} className="text-cyan-600">{a.name}</a>
                      ) : isLink ? (
                        <a href={value} target="_blank" rel="noreferrer" className="text-cyan-600">{a.name}</a>
                      ) : (
                        <span>{a.name || a.type}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-600">No artifacts uploaded.</p>
            )}

            {showcase.figmaLink && (
              <div className="mt-6">
                <a href={showcase.figmaLink} target="_blank" rel="noreferrer" className="text-cyan-600">Open Figma / Prototype</a>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
