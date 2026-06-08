'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Download, Share2, Trash2, Star, Pencil } from 'lucide-react';
import JSZip from 'jszip';

type UploadedAsset = {
  name: string;
  type?: string;
  category?: 'image' | 'pdf' | 'other' | string;
  dataUrl?: string;
  previewUrl?: string;
  url?: string;
  src?: string;
};

type PreviewPayload = {
  showcase: any;
  uploadedAssets: UploadedAsset[];
  metadata: any;
  generatedAt: string;
};

function getAssetImage(asset: any): string {
  if (!asset) return '';
  if (typeof asset === 'string') return asset;
  return asset.dataUrl || asset.previewUrl || asset.url || asset.src || '';
}

function isImageAsset(asset: UploadedAsset) {
  const imageValue = getAssetImage(asset);

  return (
    asset.category === 'image' ||
    asset.type?.startsWith('image/') ||
    imageValue.startsWith('data:image') ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(asset.name || '')
  );
}

function normalizeName(value?: string) {
  return (value || '')
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findAssetByName(assets: UploadedAsset[], assetName?: string) {
  if (!assetName) return null;

  const target = normalizeName(assetName);

  return (
    assets.find((asset) => normalizeName(asset.name) === target) ||
    assets.find((asset) => normalizeName(asset.name).includes(target)) ||
    assets.find((asset) => target.includes(normalizeName(asset.name))) ||
    null
  );
}

function findBestAssetForPersona(
  assets: UploadedAsset[],
  persona: any,
  fallbackIndex: number
) {
  return (
    findAssetByName(assets, persona.assetName) ||
    findAssetByName(assets, persona.imageAssetName) ||
    findAssetByName(assets, persona.sourceAsset) ||
    findAssetByName(assets, persona.visualReference) ||
    findAssetByName(assets, persona.name) ||
    assets[fallbackIndex] ||
    null
  );
}

function findBestAssetForHighlight(
  assets: UploadedAsset[],
  item: any,
  fallbackIndex: number
) {
  return (
    findAssetByName(assets, item.assetName) ||
    findAssetByName(assets, item.imageAssetName) ||
    findAssetByName(assets, item.sourceAsset) ||
    findAssetByName(assets, item.visualReference) ||
    assets[fallbackIndex] ||
    null
  );
}

function dataUrlToBase64(dataUrl: string) {
  return dataUrl.split(',')[1] || '';
}

function safeFileName(name: string) {
  return name || `toybox-asset-${Date.now()}`;
}

export default function ShowcasePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const memoryPreview = (window as any).__toyboxPreviewShowcase;

    if (memoryPreview) {
      setPayload(memoryPreview);
    } else {
      const stored = localStorage.getItem('toyboxPreviewShowcase');
      if (stored) setPayload(JSON.parse(stored));
    }

    setIsPublished(searchParams.get('mode') === 'published');
  }, []);

  const showcase = payload?.showcase || {};

  const imageAssets = useMemo(() => {
    const assets = payload?.uploadedAssets || [];
    return assets.filter((asset) => isImageAsset(asset) && getAssetImage(asset));
  }, [payload]);

  const heroImage =
    getAssetImage(findAssetByName(imageAssets, showcase.heroAssetName)) ||
    getAssetImage(findAssetByName(imageAssets, showcase.heroImageAssetName)) ||
    getAssetImage(showcase.heroImage) ||
    getAssetImage(showcase.visuals?.heroImage) ||
    getAssetImage(imageAssets[0]);

  const challengeImage =
    getAssetImage(findAssetByName(imageAssets, showcase.challengeAssetName)) ||
    getAssetImage(findAssetByName(imageAssets, showcase.challengeImageAssetName)) ||
    getAssetImage(showcase.challengeImage) ||
    getAssetImage(showcase.visuals?.challengeImage) ||
    getAssetImage(imageAssets[1]) ||
    getAssetImage(imageAssets[0]);

  const handlePublish = () => {
    if (!payload) return;

    setIsPublishing(true);

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

    localStorage.setItem('toyboxPublishedShowcases', JSON.stringify([publishedCard]));
    setIsPublished(true);

    setTimeout(() => router.push('/'), 900);
  };

  const handleDownload = async () => {
    if (!payload) return;

    const zip = new JSZip();

    payload.uploadedAssets.forEach((asset, index) => {
      const fileData = getAssetImage(asset);
      if (!fileData) return;

      zip.file(
        safeFileName(asset.name || `asset-${index + 1}`),
        dataUrlToBase64(fileData),
        { base64: true }
      );
    });

    const urlsText = [
      payload.metadata?.figmaLink,
      ...(payload.metadata?.otherUrls || []),
    ]
      .filter(Boolean)
      .join('\n');

    if (urlsText) zip.file('reference-urls.txt', urlsText);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${showcase.title || 'toybox-showcase'}-assets.zip`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this showcase from Toybox?'
    );

    if (!confirmed) return;

    localStorage.removeItem('toyboxPreviewShowcase');
    localStorage.removeItem('toyboxPublishedShowcases');
    sessionStorage.removeItem('toyboxPublishToastShown');
    (window as any).__toyboxPreviewShowcase = null;

    router.push('/');
  };

  if (!payload) {
    return (
      <div className="min-h-screen bg-white text-slate-950">
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">No preview found</h1>
          <p className="mt-4 text-slate-600">
            Generate a showcase first to preview it here.
          </p>

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

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {isPublishing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
            <h2 className="mt-6 text-2xl font-semibold">Publishing showcase</h2>
            <p className="mt-3 text-sm text-slate-600">
              Adding this showcase to Toybox Discover.
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            ← Back to Toybox
          </Link>

          <div className="flex items-center gap-3">
            {!isPublished ? (
              <>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-300"
                  disabled
                  title="Edit unavailable in MVP"
                >
                  <Pencil size={17} />
                </button>

                <button
                  onClick={handleDelete}
                  className="grid h-10 w-10 place-items-center rounded-full border border-red-200 text-red-500 hover:bg-red-50"
                  title="Delete showcase"
                >
                  <Trash2 size={17} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Bookmark"
                >
                  <Bookmark size={17} />
                </button>

                <div className="flex h-10 items-center gap-1 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                  <Star size={15} className="text-amber-400" />
                  4.9
                </div>

                <button
                  onClick={handleDownload}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Download uploaded artifacts"
                >
                  <Download size={17} />
                </button>

                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Share"
                >
                  <Share2 size={17} />
                </button>

                <div className="mx-1 h-6 w-px bg-slate-200" />

                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-300"
                  disabled
                  title="Edit unavailable in MVP"
                >
                  <Pencil size={17} />
                </button>

                <button
                  onClick={handleDelete}
                  className="grid h-10 w-10 place-items-center rounded-full border border-red-200 text-red-500 hover:bg-red-50"
                  title="Delete showcase"
                >
                  <Trash2 size={17} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_480px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Showcase Preview
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl">
                {showcase.title || payload.metadata?.projectName || 'Generated Showcase'}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {showcase.heroStatement || showcase.subtitle || showcase.overview}
              </p>

              {!isPublished && (
                <div className="mt-8">
                  <button
                    onClick={handlePublish}
                    className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                  >
                    Publish showcase
                  </button>
                </div>
              )}
            </div>

            {heroImage && (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2">
                <img
                  src={heroImage}
                  alt="Hero artifact"
                  className="h-[360px] w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                  Challenge
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                  The experience problem
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                  {showcase.challenge || showcase.problem}
                </p>
              </div>

              {challengeImage && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <img
                    src={challengeImage}
                    alt="Challenge artifact"
                    className="h-[340px] w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
              Overview
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
              What the solution set out to do
            </h2>

            <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600">
              {showcase.overview || showcase.mission}
            </p>
          </div>
        </section>

        {showcase.personas?.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                Personas
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                Who the experience supports
              </h2>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {showcase.personas.map((persona: any, index: number) => {
                  const mappedAsset = findBestAssetForPersona(
                    imageAssets,
                    persona,
                    index
                  );

                  const personaImage = getAssetImage(mappedAsset);

                  return (
                    <article
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                    >
                      {personaImage && (
                        <img
                          src={personaImage}
                          alt={persona.name || 'Persona'}
                          className="mb-5 h-56 w-full rounded-lg object-cover"
                        />
                      )}

                      <h3 className="text-2xl font-semibold">{persona.name}</h3>

                      <p className="mt-1 text-sm font-medium text-cyan-700">
                        {persona.role}
                      </p>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {persona.need}
                      </p>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {persona.solutionSupport}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {showcase.solutionHighlights?.length > 0 && (
          <section className="bg-slate-950 py-16 text-white">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Solution Highlights
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                How the experience comes together
              </h2>

              <div className="mt-10 grid gap-8">
                {showcase.solutionHighlights.map((item: any, index: number) => {
                  const mappedAsset = findBestAssetForHighlight(
                    imageAssets,
                    item,
                    index + (showcase.personas?.length || 0)
                  );

                  const img = getAssetImage(mappedAsset);

                  return (
                    <article
                      key={index}
                      className="grid gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1fr_1fr] lg:items-center"
                    >
                      {img && (
                        <img
                          src={img}
                          alt={item.heading || 'Solution artifact'}
                          className="h-[320px] w-full rounded-lg object-cover"
                        />
                      )}

                      <div>
                        <h3 className="text-2xl font-semibold">
                          {item.heading}
                        </h3>

                        <p className="mt-4 text-base leading-7 text-slate-300">
                          {item.body}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl bg-white p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                  Impact
                </p>

                <p className="mt-5 text-lg leading-8 text-slate-600">
                  {showcase.impact}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                  Design Deliverables
                </p>

                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Concept designs and personas
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  This showcase was shaped by personas, role-based dashboards,
                  annotated screens, workflow concepts, and experience strategy inputs.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    'Personas',
                    'Dashboard concepts',
                    'Annotated screens',
                    'Workflow design',
                    'Experience strategy',
                    'AI insights',
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-xs text-slate-500">
                  Full asset download is available from the top-right download icon.
                </p>
              </div>
            </div>
          </div>
        </section>
{isPublished && (
  <section className="bg-white py-16">
    <div className="mx-auto max-w-7xl px-6 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
        Community Reflections
      </p>

      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
        A thoughtful space for collaborative observations.
      </h2>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        A space for teams, designers, strategists, and collaborators to share observations,
        insights, and reflections around the transformation journey.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ['“Strong systems-thinking approach.”', 'Amina R., Design Operations Partner'],
          ['“Loved the ecosystem mapping work.”', 'Marcus H., Service Strategy Lead'],
          ['“Excellent governance-led experience strategy.”', 'Nina K., Enterprise UX Director'],
        ].map(([quote, person]) => (
          <div key={quote} className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <p className="text-lg leading-7 text-slate-800">{quote}</p>
            <p className="mt-6 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{person.split(',')[0]}</span>,
              {person.split(',').slice(1).join(',')}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-slate-700">Share a reflection</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            disabled
            value="Strong systems-thinking approach."
            className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
          />
          <button
            disabled
            className="rounded-[1rem] bg-slate-950 px-6 py-3 text-sm font-semibold text-white opacity-80"
          >
            Add reflection
          </button>
        </div>
      </div>
    </div>
  </section>
)}
      </main>
    </div>
  );
}