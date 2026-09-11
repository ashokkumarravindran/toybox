'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, User, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal';
import type { ShelfArtifact, ArtifactCategory } from '@/lib/extractArtifacts';

// ── IDB ───────────────────────────────────────────────────────────────────────

function openShowcaseDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('toybox-db', 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('showcases'))
        req.result.createObjectStore('showcases', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getShowcasePayload(previewId: string): Promise<any | null> {
  const db = await openShowcaseDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('showcases', 'readonly').objectStore('showcases').get(previewId);
    req.onsuccess = () => resolve(req.result?.previewPayload || null);
    req.onerror = () => reject(req.error);
  });
}

// ── Static mappings ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  personas: 'Personas',
  'journey-maps': 'Journey Maps',
  'ecosystem-maps': 'Ecosystem Maps',
  'service-blueprints': 'Service Blueprints',
  storyboards: 'Storyboards',
  'heuristic-checklists': 'Heuristic Checklists',
};

// Domain → industry label (for display)
const DOMAIN_INDUSTRY: Record<string, string> = {
  'Public Sector': 'Government & Civic Services',
  'Healthcare': 'Healthcare & Life Sciences',
  'Financial Services': 'Financial Services',
  'Insurance': 'Insurance',
  'Retail': 'Retail & Consumer',
  'Technology': 'Technology & Enterprise',
  'Hospitality': 'Hospitality & Travel',
  'Energy': 'Energy & Utilities',
  'Education': 'Education',
};

// Domain × category → use-case suggestions
const GOOD_FIT_FOR: Record<string, Record<ArtifactCategory, string[]>> = {
  'Public Sector': {
    'personas': ['Citizen services redesign', 'Benefits eligibility workflows', 'Government digital transformation'],
    'journey-maps': ['Service delivery mapping', 'Benefits application flows', 'Agency modernisation'],
    'ecosystem-maps': ['Inter-agency stakeholder mapping', 'Policy impact analysis', 'Civic tech strategy'],
    'service-blueprints': ['Front/back-office alignment', 'Case management design', 'Digital service delivery'],
    'storyboards': ['Policy communication', 'Citizen onboarding storytelling', 'Stakeholder buy-in presentations'],
    'heuristic-checklists': ['Accessibility audits', 'Compliance-driven UX reviews', 'Government portal assessments'],
  },
  'Healthcare': {
    'personas': ['Patient experience strategy', 'Care coordination design', 'Clinical workflow optimisation'],
    'journey-maps': ['Patient pathway mapping', 'Care transition design', 'Clinical operations improvement'],
    'ecosystem-maps': ['Healthcare ecosystem analysis', 'Payer-provider alignment', 'Integrated care strategy'],
    'service-blueprints': ['Care pathway blueprinting', 'Telehealth service design', 'Clinical team alignment'],
    'storyboards': ['Patient scenario validation', 'Clinical education design', 'Executive storytelling'],
    'heuristic-checklists': ['EHR usability audits', 'Clinical UX reviews', 'Regulatory compliance checks'],
  },
  'Financial Services': {
    'personas': ['Digital banking UX', 'Wealth management experience', 'Compliance-driven design'],
    'journey-maps': ['Account opening flows', 'Wealth transfer journeys', 'Fraud resolution experiences'],
    'ecosystem-maps': ['FinTech ecosystem mapping', 'Regulatory landscape analysis', 'Channel strategy'],
    'service-blueprints': ['KYC/onboarding blueprints', 'Advisory service design', 'Digital branch design'],
    'storyboards': ['Investment product storytelling', 'Digital transformation pitches', 'Client onboarding narratives'],
    'heuristic-checklists': ['Accessibility reviews', 'Regulatory UX audits', 'Mobile banking assessments'],
  },
  'Insurance': {
    'personas': ['Claims experience design', 'Self-service portal strategy', 'Agent enablement'],
    'journey-maps': ['Claims filing journeys', 'Policy renewal flows', 'First notice of loss mapping'],
    'ecosystem-maps': ['Claims ecosystem analysis', 'Broker network mapping', 'Digital channel strategy'],
    'service-blueprints': ['Claims handling blueprints', 'Underwriting service design', 'Contact centre alignment'],
    'storyboards': ['Claims scenario validation', 'Agent training narratives', 'Product launch storytelling'],
    'heuristic-checklists': ['Portal usability audits', 'Mobile claims app reviews', 'Accessibility assessments'],
  },
  'Retail': {
    'personas': ['Omnichannel CX strategy', 'Loyalty programme design', 'Personalisation at scale'],
    'journey-maps': ['Shopping journey mapping', 'Returns & fulfilment flows', 'In-store digital experience'],
    'ecosystem-maps': ['Retail partner ecosystem', 'Supply chain experience', 'Marketplace strategy'],
    'service-blueprints': ['Unified commerce design', 'Loyalty service blueprints', 'Click & collect flows'],
    'storyboards': ['Campaign concept validation', 'In-store experience pitches', 'Customer scenario testing'],
    'heuristic-checklists': ['E-commerce UX audits', 'Mobile app reviews', 'Checkout optimisation'],
  },
  'Technology': {
    'personas': ['Enterprise UX strategy', 'Employee experience design', 'SaaS product design'],
    'journey-maps': ['Employee onboarding flows', 'IT service desk journeys', 'Software adoption mapping'],
    'ecosystem-maps': ['Platform ecosystem analysis', 'Vendor landscape mapping', 'API/integration strategy'],
    'service-blueprints': ['IT service design', 'DevOps experience blueprints', 'Enterprise portal design'],
    'storyboards': ['Product vision storytelling', 'Change management narratives', 'Demo scenario design'],
    'heuristic-checklists': ['Enterprise tool audits', 'Internal portal reviews', 'Developer experience assessments'],
  },
  'Hospitality': {
    'personas': ['Guest experience strategy', 'Premium service design', 'Loyalty programme UX'],
    'journey-maps': ['Guest stay journeys', 'F&B experience mapping', 'Event booking flows'],
    'ecosystem-maps': ['Hospitality partner ecosystem', 'Destination strategy mapping', 'OTA channel analysis'],
    'service-blueprints': ['Front-of-house service design', 'Concierge experience blueprints', 'F&B service design'],
    'storyboards': ['Guest scenario validation', 'Brand experience narratives', 'Staff training stories'],
    'heuristic-checklists': ['App usability audits', 'Booking flow reviews', 'Accessibility assessments'],
  },
};

// Default fallbacks when domain is not in the map
const DEFAULT_FIT: Record<ArtifactCategory, string[]> = {
  'personas': ['User research synthesis', 'Stakeholder alignment workshops', 'Journey mapping sessions'],
  'journey-maps': ['Service design workshops', 'Experience strategy', 'Process improvement'],
  'ecosystem-maps': ['Strategic planning', 'Stakeholder mapping', 'Landscape analysis'],
  'service-blueprints': ['Service design', 'Operations alignment', 'Backstage process design'],
  'storyboards': ['Concept validation', 'Stakeholder storytelling', 'Design presentations'],
  'heuristic-checklists': ['UX audits', 'Design reviews', 'Quality assurance'],
};

function getGoodFitFor(domain: string, category: ArtifactCategory): string[] {
  return GOOD_FIT_FOR[domain]?.[category] ?? DEFAULT_FIT[category] ?? [];
}

// ── Asset helper ──────────────────────────────────────────────────────────────

function getAssetSrc(assets: any[], name?: string): string {
  if (!name) return '';
  const norm = (v: string) => v.toLowerCase().replace(/[_\-\s]/g, '').replace(/\.[^.]+$/, '');
  const t = norm(name);
  const hit =
    assets.find((a) => norm(a.name || '') === t) ||
    assets.find((a) => norm(a.name || '').includes(t));
  return hit?.dataUrl || hit?.previewUrl || hit?.url || hit?.src || '';
}

// ── Metadata panel ────────────────────────────────────────────────────────────

function MetaPanel({ artifact, payload }: { artifact: ShelfArtifact; payload: any }) {
  const engagementType: string = payload?.metadata?.engagementType || '';
  const metaTags: string[] = [
    ...(payload?.showcase?.suggestedTags || []),
    ...(payload?.metadata?.tags || []),
  ].filter((v, i, a) => v && a.indexOf(v) === i); // dedupe

  const industry = DOMAIN_INDUSTRY[artifact.domain] || artifact.domain;
  const goodFit = getGoodFitFor(artifact.domain, artifact.category as ArtifactCategory);
  const publishedDate = new Date(artifact.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <aside className="space-y-4 lg:w-72 xl:w-80 shrink-0">

      {/* Domain + Industry */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Domain</p>
        <p className="mt-2 text-sm font-semibold text-slate-950">{artifact.domain}</p>
        <p className="mt-0.5 text-xs text-slate-500">{industry}</p>

        {engagementType && (
          <>
            <hr className="my-4 border-slate-100" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Engagement Type</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{engagementType}</p>
          </>
        )}

        <hr className="my-4 border-slate-100" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Artifact Type</p>
        <span className="mt-2 inline-block rounded-md px-2.5 py-1 text-xs font-semibold text-white" style={{ background: '#005AFF' }}>
          {CATEGORY_LABELS[artifact.category] || artifact.category}
        </span>

        <hr className="my-4 border-slate-100" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Published</p>
        <p className="mt-2 text-xs text-slate-600">{publishedDate}</p>
      </div>

      {/* Good fit for */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Good fit for</p>
        <ul className="mt-3 space-y-2">
          {goodFit.map((use) => (
            <li key={use} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#005AFF' }} />
              {use}
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      {metaTags.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {metaTags.map((tag) => (
              <span key={tag} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}

// ── Persona detail ────────────────────────────────────────────────────────────

function PersonaDetail({ artifact, payload }: { artifact: ShelfArtifact; payload: any }) {
  const persona = payload?.showcase?.personas?.[artifact.sourceIndex];
  const assets: any[] = payload?.uploadedAssets || [];
  const img = getAssetSrc(assets, artifact.assetName);

  if (!persona) return null;

  return (
    <div className="space-y-5 flex-1 min-w-0">

      {/* Header card — archetype, quote, background */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex gap-6 p-6">
          {img ? (
            <img src={img} alt={artifact.name} className="h-24 w-24 shrink-0 rounded-xl object-cover bg-slate-50" />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <User size={36} className="text-slate-300" />
            </div>
          )}
          <div>
            {persona.archetype && (
              <span className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ background: '#005AFF12', color: '#005AFF' }}>
                {persona.archetype}
              </span>
            )}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tech comfort</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{persona.techComfort || '—'}</p>
          </div>
        </div>
        {persona.quote && (
          <div className="border-t border-slate-100 px-6 py-4" style={{ background: '#f8faff' }}>
            <p className="text-base italic leading-7 text-slate-700">"{persona.quote}"</p>
          </div>
        )}
      </div>

      {/* Background */}
      {persona.background && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>Background</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{persona.background}</p>
        </div>
      )}

      {/* Goals + Frustrations side-by-side */}
      {(persona.goals?.length > 0 || persona.frustrations?.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {persona.goals?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Goals</p>
              <ul className="mt-3 space-y-2">
                {persona.goals.map((g: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {persona.frustrations?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">Frustrations</p>
              <ul className="mt-3 space-y-2">
                {persona.frustrations.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Need */}
      {persona.need && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>Core Need</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{persona.need}</p>
        </div>
      )}

      {/* Pain Point */}
      {persona.painPoint && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>Pain Point</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{persona.painPoint}</p>
        </div>
      )}

      {/* Behaviours */}
      {persona.behaviours?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>Observable Behaviours</p>
          <ul className="mt-3 space-y-2">
            {persona.behaviours.map((b: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#005AFF' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Solution Support */}
      {persona.solutionSupport && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>How We Help</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{persona.solutionSupport}</p>
        </div>
      )}
    </div>
  );
}

// ── Visual section detail ─────────────────────────────────────────────────────

function VisualSectionDetail({ artifact, payload }: { artifact: ShelfArtifact; payload: any }) {
  const section = payload?.showcase?.visualSections?.[artifact.sourceIndex];
  const assets: any[] = payload?.uploadedAssets || [];
  const img = getAssetSrc(assets, artifact.assetName);

  return (
    <div className="space-y-5 flex-1 min-w-0">
      {img && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <img src={img} alt={artifact.name} className="mx-auto max-h-[540px] w-full object-contain" />
        </div>
      )}
      {section?.narrative && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>Context</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{section.narrative}</p>
        </div>
      )}
      {section?.visualFocus && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#005AFF' }}>Visual Focus</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{section.visualFocus}</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = use(params);
  const router = useRouter();
  const [artifact, setArtifact] = useState<ShelfArtifact | null>(null);
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    try {
      const all: ShelfArtifact[] = JSON.parse(localStorage.getItem('toyboxShelfArtifacts') || '[]');
      const decodedId = decodeURIComponent(id);
      const found = all.find((a) => a.id === decodedId || a.id === id);
      if (!found) { setLoading(false); return; }
      setArtifact(found);
      getShowcasePayload(found.previewId)
        .then((p) => { setPayload(p); setLoading(false); })
        .catch(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, [id]);

  const categoryLabel = CATEGORY_LABELS[category] || category;

  const handleDelete = () => {
    if (!artifact) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    try {
      const all: ShelfArtifact[] = JSON.parse(localStorage.getItem('toyboxShelfArtifacts') || '[]');
      localStorage.setItem('toyboxShelfArtifacts', JSON.stringify(all.filter((a) => a.id !== id)));
    } catch { /* ignore */ }
    router.push(`/design-shelf/${category}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader category={category} categoryLabel={categoryLabel} artifactName="" />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-[#005AFF]" />
        </div>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader category={category} categoryLabel={categoryLabel} artifactName="" />
        <main className="mx-auto max-w-xl px-6 py-32 text-center sm:px-8">
          <h1 className="text-3xl font-semibold text-slate-950">Artifact not found</h1>
          <p className="mt-3 text-slate-500">It may have been removed or the link is incorrect.</p>
          <Link href={`/design-shelf/${category}`} className="mt-8 inline-flex rounded-lg px-5 py-3 text-sm font-semibold text-white" style={{ background: '#005AFF' }}>
            ← Back to {categoryLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showDeleteModal && artifact && (
        <DeleteConfirmModal
          title={`Delete "${artifact.name}"?`}
          description="This will permanently remove the artifact from your Design Shelf. This action cannot be undone."
          confirmLabel="Delete artifact"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      <PageHeader category={category} categoryLabel={categoryLabel} artifactName={artifact.name} />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">

        {/* Title row */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
              {categoryLabel}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
              {artifact.name}
            </h1>
            {artifact.role && (
              <p className="mt-1 text-lg text-slate-500">{artifact.role}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50"
            title="Delete artifact"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Content + sidebar */}
        <div className="flex gap-8 items-start">
          {artifact.sourceField === 'personas' ? (
            <PersonaDetail artifact={artifact} payload={payload} />
          ) : (
            <VisualSectionDetail artifact={artifact} payload={payload} />
          )}

          <MetaPanel artifact={artifact} payload={payload} />
        </div>

        {/* Case study link */}
        <div className="mt-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Case Study</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{artifact.projectName}</p>
            <p className="mt-0.5 text-sm text-slate-500">
              {artifact.domain} · Published {new Date(artifact.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <Link
            href={`/showcase/preview?mode=published&previewId=${artifact.previewId}`}
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: '#005AFF' }}
          >
            View full showcase <ExternalLink size={14} />
          </Link>
        </div>

      </main>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function PageHeader({ category, categoryLabel, artifactName }: {
  category: string; categoryLabel: string; artifactName: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/96 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex items-center py-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-[15px] font-bold tracking-[-0.02em] lowercase text-slate-950">slalom</span>
            <span className="text-slate-300">|</span>
            <span className="text-[15px] font-medium text-slate-700">Toybox</span>
            <span className="ml-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest leading-none" style={{ background: '#DCFF00', color: '#0A0A0F' }}>Beta</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 pb-2.5 text-sm">
          <Link href="/#design-shelf" className="text-slate-500 transition hover:text-slate-950">Design Shelf</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/design-shelf/${category}`} className="text-slate-500 transition hover:text-slate-950">{categoryLabel}</Link>
          {artifactName && (
            <>
              <span className="text-slate-300">/</span>
              <span className="max-w-[240px] truncate text-slate-500">{artifactName}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
