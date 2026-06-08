'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

type PreviewPayload = {
  showcase: any;
  uploadedAssets: Array<{
    name: string;
    type: string;
    category: 'image' | 'pdf' | 'other';
    dataUrl: string;
  }>;
  metadata: any;
  generatedAt: string;
};

export default function ShowcasePreviewPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [payload, setPayload] = useState<PreviewPayload | null>(null);

  useEffect(() => {
  const memoryPreview = (window as any).__toyboxPreviewShowcase;

  if (memoryPreview) {
    setPayload(memoryPreview);
    return;
  }

  const stored = localStorage.getItem('toyboxPreviewShowcase');

  if (stored) {
    setPayload(JSON.parse(stored));
  }
}, []);

  const imageAssets = useMemo(
    () => payload?.uploadedAssets?.filter((asset) => asset.category === 'image') || [],
    [payload]
  );

  const pdfAssets = useMemo(
    () => payload?.uploadedAssets?.filter((asset) => asset.category === 'pdf') || [],
    [payload]
  );

  const heroImage = imageAssets[0]?.dataUrl;
  const challengeImage = imageAssets[1]?.dataUrl || imageAssets[0]?.dataUrl;
  const solutionImages = imageAssets.slice(2);

  const handlePublish = () => {
  if (!payload) return;

  const showcase = payload.showcase || {};
  const heroImage = imageAssets[0]?.dataUrl || null;

  const published = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');

  const publishedCard = {
    id: Date.now(),
    title: showcase.title || payload.metadata?.projectName || 'Generated Showcase',
    subtitle: showcase.subtitle || showcase.heroStatement || 'AI-generated showcase',
    domain: showcase.domain || payload.metadata?.domain || 'Design',
    overview: showcase.overview || '',
    heroImage,
    publishedAt: new Date().toISOString(),
    tags: showcase.suggestedTags || payload.metadata?.tags || [],
  };

  localStorage.setItem(
    'toyboxPublishedShowcases',
    JSON.stringify([publishedCard, ...published].slice(0, 6))
  );

  router.push('/');
};

  if (!payload) {
    return (
      <div className="min-h-screen bg-white text-slate-950">
        <ToyboxHeader darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold">No preview found</h1>
          <p className="mt-4 text-slate-600">Generate a showcase first to preview it here.</p>
          <Link
            href="/upload/ai"
            className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Back to AI upload
          </Link>
        </main>
      </div>
    );
  }

  const showcase = payload.showcase || {};

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <ToyboxHeader darkMode={darkMode} onDarkModeChange={setDarkMode} />

      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_480px] lg:items-center">
            <div>
              <Link href="/upload/ai" className="text-sm font-medium text-cyan-300">
                ← Back to AI upload
              </Link>

              <p className="mt-10 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Showcase Preview
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl">
                {showcase.title || payload.metadata?.projectName || 'Generated Showcase'}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {showcase.heroStatement || showcase.subtitle || showcase.overview}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  disabled
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/50"
                >
                  Edit unavailable in MVP
                </button>

                <button
                  onClick={handlePublish}
                  className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Publish showcase
                </button>
              </div>
            </div>

            {heroImage && (
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3">
                <img src={heroImage} alt="Hero artifact" className="h-[360px] w-full rounded-[1.5rem] object-cover" />
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Challenge</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">The experience problem</h2>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  {showcase.challenge || showcase.problem || 'Toybox identified the core challenge from the uploaded artifacts.'}
                </p>
              </div>

              {challengeImage && (
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-3">
                  <img src={challengeImage} alt="Challenge artifact" className="h-[340px] w-full rounded-[1.5rem] object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Overview</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">What the solution set out to do</h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600">
              {showcase.overview || showcase.mission || 'The generated showcase summarizes the project vision and design response.'}
            </p>
          </div>
        </section>

        {showcase.personas?.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Personas</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Who the experience supports</h2>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {showcase.personas.map((persona: any, index: number) => (
                  <article key={index} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                    {imageAssets[index] && (
                      <img
                        src={imageAssets[index].dataUrl}
                        alt={persona.name || 'Persona'}
                        className="mb-5 h-56 w-full rounded-[1.5rem] object-cover"
                      />
                    )}

                    <h3 className="text-2xl font-semibold">{persona.name || 'Persona'}</h3>
                    <p className="mt-1 text-sm font-medium text-cyan-700">{persona.role}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{persona.need}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{persona.solutionSupport}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {showcase.solutionHighlights?.length > 0 && (
          <section className="bg-slate-950 py-16 text-white">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Solution Highlights</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">How the experience comes together</h2>

              <div className="mt-10 grid gap-8">
                {showcase.solutionHighlights.map((item: any, index: number) => (
                  <article key={index} className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                    {solutionImages[index] && (
                      <img
                        src={solutionImages[index].dataUrl}
                        alt={item.heading}
                        className="h-[320px] w-full rounded-[1.5rem] object-cover"
                      />
                    )}

                    <div>
                      <h3 className="text-2xl font-semibold">{item.heading}</h3>
                      <p className="mt-4 text-base leading-7 text-slate-300">{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {imageAssets.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Visual Story</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Uploaded artifacts used by Toybox AI</h2>

              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {imageAssets.map((asset, index) => (
                  <div key={index} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                    <img src={asset.dataUrl} alt={asset.name} className="h-64 w-full object-cover" />
                    <div className="p-4">
                      <p className="truncate text-sm font-semibold text-slate-800">{asset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-[2rem] bg-white p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Impact</p>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  {showcase.impact || 'Impact statement will be refined as more project context is added.'}
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Reusable Assets</p>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {payload.uploadedAssets.length} artifacts were used to generate this showcase.
                </p>

                <div className="mt-5 space-y-3">
                  {payload.uploadedAssets.map((asset, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {asset.name}
                    </div>
                  ))}
                </div>

                {pdfAssets.length > 0 && (
                  <p className="mt-4 text-xs text-slate-500">
                    PDF download packaging will be enabled in the next iteration.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                Community Reflections
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Share your thoughts</h2>
              <p className="mt-4 text-slate-600">
                Comments, ratings, and community feedback will be enabled in the next MVP iteration.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}