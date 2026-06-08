"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bookmark, Share2, Download, Star, ArrowRight, Trash2 } from 'lucide-react';
import { getFileUrl, deleteFile } from '@/lib/idb';

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
  heroThumb?: string | null;
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

    (async () => {
      const raw = localStorage.getItem('toybox_generated_showcases');
      if (!raw) return;
      try {
        const arr = JSON.parse(raw) as GeneratedShowcase[];
        const found = arr.find((s) => s.slug === slug);
        if (found) {
          // resolve file ids to object URLs where necessary
          const resolved = { ...found } as any;
          if (found.heroImage && typeof found.heroImage === 'string' && !found.heroImage.startsWith('data:') && !found.heroImage.startsWith('http')) {
            const url = await getFileUrl(found.heroImage);
            resolved.heroImage = url || null;
          }

          resolved.solutionHighlights = await Promise.all(found.solutionHighlights.map(async (h) => {
            const imgs = await Promise.all(h.images.map(async (img: string) => {
              if (typeof img !== 'string') return img;
              if (img.startsWith('data:') || img.startsWith('http')) return img;
              const url = await getFileUrl(img);
              return url || img;
            }));
            return { ...h, images: imgs };
          }));

          resolved.projectArtifacts = await Promise.all((found.projectArtifacts || []).map(async (a: any) => {
            const value = a.value as string;
            if (typeof value === 'string' && !value.startsWith('data:') && !value.startsWith('http')) {
              const url = await getFileUrl(value);
              return { ...a, value: url || value };
            }
            return a;
          }));

          setShowcase(resolved);
        }
      } catch (e) {
        // ignore
      }
    })();
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
              <button
                onClick={async () => {
                  if (!confirm('Delete this generated showcase? This cannot be undone.')) return;
                  try {
                    const raw = localStorage.getItem('toybox_generated_showcases');
                    if (raw) {
                      const arr = JSON.parse(raw) as any[];
                      const found = arr.find((s) => s.slug === slug);
                      if (found) {
                        // delete files
                        if (found.heroImage) await deleteFile(found.heroImage).catch(() => {});
                        if (found.heroThumb) await deleteFile(found.heroThumb).catch(() => {});
                        for (const h of (found.solutionHighlights || [])) {
                          for (const imgId of (h.images || [])) {
                            if (typeof imgId === 'string') await deleteFile(imgId).catch(() => {});
                          }
                        }
                        for (const a of (found.projectArtifacts || [])) {
                          const v = a.value;
                          if (typeof v === 'string' && !v.startsWith('http') && !v.startsWith('data:')) {
                            await deleteFile(v).catch(() => {});
                          }
                        }
                        const remaining = arr.filter((s) => s.slug !== slug);
                        localStorage.setItem('toybox_generated_showcases', JSON.stringify(remaining));
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                  router.push('/');
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 lg:py-24">
            <div className="grid gap-12 items-center lg:grid-cols-[0.55fr_0.45fr]">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-semibold">{showcase.domain} · {showcase.engagementType}</p>
                <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[0.98]">{showcase.projectName}</h1>
                <p className="mt-6 text-xl leading-9 text-slate-200">{showcase.overview.substring(0, 220)}</p>
                <p className="mt-6 text-base leading-8 text-slate-300">{showcase.solutionApproach}</p>
                {showcase.projectArtifacts && showcase.projectArtifacts.length > 0 && (
                  <div className="mt-10">
                    <a href="#assets" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10">Download Assets</a>
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/20">
                {showcase.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={showcase.heroImage} alt={showcase.projectName} className="h-full w-full min-h-[420px] object-cover" />
                ) : (
                  <div className="h-[420px] w-full bg-slate-900" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="challenge" className="bg-white text-slate-900 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 items-center lg:grid-cols-[0.55fr_0.45fr]">
              <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">The Challenge</p>
                <h2 className="mt-6 text-4xl font-semibold leading-tight">{showcase.challenge}</h2>
                <div className="mt-6 text-lg leading-8 text-slate-700">
                  <p>{showcase.challenge}</p>
                </div>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
                {showcase.solutionHighlights[0] && showcase.solutionHighlights[0].images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={showcase.solutionHighlights[0].images[0]} alt="challenge" className="h-[420px] w-full object-cover" />
                ) : (
                  <div className="h-[420px] w-full bg-slate-900" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 items-center lg:grid-cols-[0.55fr_0.45fr]">
              <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Overview</p>
                <h2 className="mt-6 text-4xl font-semibold">Overview</h2>
                <div className="mt-6 text-lg leading-8 text-slate-700">
                  <p>{showcase.overview}</p>
                </div>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
                {showcase.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={showcase.heroImage} alt="overview" className="h-[420px] w-full object-cover" />
                ) : (
                  <div className="h-[420px] w-full bg-slate-900" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 items-center lg:grid-cols-[0.55fr_0.45fr]">
              <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution approach</p>
                <h2 className="mt-6 text-4xl font-semibold">Solution approach</h2>
                <div className="mt-6 text-lg leading-8 text-slate-700">
                  <p>{showcase.solutionApproach}</p>
                </div>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
                {showcase.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={showcase.heroImage} alt="solution approach" className="h-[420px] w-full object-cover" />
                ) : (
                  <div className="h-[420px] w-full bg-slate-900" />
                )}
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
