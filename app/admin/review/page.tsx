'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles, Zap, ChevronRight, Mail, Bookmark, Star, Download, Share2, MessageSquare, Trash2, Pencil } from 'lucide-react';

// Source file lookup for view mode (candidates that may have been published before uploadedAssets was stored)
const CANDIDATE_SOURCES: Record<string, { fileName: string; webUrl: string; vertical: string }> = {
  'wex-onboarding': {
    fileName: 'WEX Onboarding New Customers — Case Study.pptx',
    webUrl: 'https://twodegrees1.sharepoint.com/sites/Capability-CX/CX Library/Transforming Onboarding of New Customers/WEX Onboarding New Customers - Case Study_Santiago Caicedo.pptx',
    vertical: 'Financial Services',
  },
  'fs-story-collection': {
    fileName: 'Financial Services Story Collection.pptx',
    webUrl: 'https://twodegrees1.sharepoint.com/teams/SalesforceGo-to-MarketContentCenter/Shared Documents/Financial Services Story Collection.pptx',
    vertical: 'Financial Services',
  },
  'nyl-cx-transform': {
    fileName: 'New York Life — CX Transform Proposal Response.pptx',
    webUrl: 'https://twodegrees1.sharepoint.com/teams/NewYorkLifeCXRFP/Shared Documents/Financial Services Story Collection.pptx',
    vertical: 'Insurance',
  },
  'frankenmuth-cx': {
    fileName: 'Frankenmuth Insurance — CX Digital Strategy.pptx',
    webUrl: 'https://twodegrees1.sharepoint.com/teams/NewYorkLifeCXRFP/Shared Documents/New York Life CX RFP/NYL RFP July 2026/Client Stories/Frankenmuth CX Digital Strategy Response Final.pptx',
    vertical: 'Insurance',
  },
};

// ── saveAndPublish (duplicated here to avoid cross-file client import) ────────
async function saveAndPublish(
  showcase: any,
  candidateId: string,
  sourceFile?: { name: string; webUrl: string },
  vertical?: string,
): Promise<{ previewId: string }> {
  const { extractArtifacts, mergeIntoShelf } = await import('@/lib/extractArtifacts');

  const db: IDBDatabase = await new Promise((res, rej) => {
    const req = indexedDB.open('toybox-db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('showcases', { keyPath: 'id' });
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

  const previewId = `sharepoint-${candidateId}-${Date.now()}`;
  const uploadedAssets = sourceFile
    ? [{ name: sourceFile.name, type: 'application/vnd.ms-powerpoint', category: 'pdf', url: sourceFile.webUrl, src: sourceFile.webUrl, previewUrl: '' }]
    : [];

  const previewPayload = {
    showcase,
    uploadedAssets,
    metadata: { projectName: showcase.title, domain: showcase.domain },
    generatedAt: new Date().toISOString(),
  };

  await new Promise<void>((res, rej) => {
    const tx = db.transaction('showcases', 'readwrite');
    tx.objectStore('showcases').put({ id: previewId, previewPayload, imageOverrides: {}, savedAt: new Date().toISOString() });
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });

  localStorage.setItem('toyboxActivePreviewId', previewId);

  const publishedCard = {
    id: previewId,
    title: showcase.title || 'Imported Showcase',
    subtitle: showcase.subtitle || '',
    domain: vertical || showcase.domain || '',
    heroImage: `/api/og?title=${encodeURIComponent(showcase.title || '')}&domain=${encodeURIComponent(vertical || showcase.domain || '')}&tags=${encodeURIComponent((showcase.suggestedTags || []).slice(0, 3).join(','))}`,
    previewId,
    tags: showcase.suggestedTags || [],
    publishedAt: new Date().toISOString(),
    source: 'sharepoint',
    showcase,
    uploadedAssets,
    vertical: vertical || '',
    candidateId,
  };

  const existing = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');
  // Dedup by both previewId and candidateId — prevents duplicate cards when re-publishing same candidate
  const safe = existing
    .filter((item: any) => item.id !== previewId && item.candidateId !== candidateId)
    .map((item: any) => ({
      id: item.id, title: item.title, subtitle: item.subtitle, domain: item.domain,
      heroImage: item.heroImage, publishedAt: item.publishedAt, tags: item.tags || [],
      previewId: item.previewId, showcase: item.showcase, uploadedAssets: item.uploadedAssets || [], vertical: item.vertical || '', candidateId: item.candidateId || '',
    }));
  localStorage.setItem('toyboxPublishedShowcases', JSON.stringify([publishedCard, ...safe]));

  const extracted = extractArtifacts({ showcase, showcaseId: previewId, previewId, projectName: publishedCard.title, domain: publishedCard.domain, publishedAt: publishedCard.publishedAt });
  const existingShelf = JSON.parse(localStorage.getItem('toyboxShelfArtifacts') || '[]');
  // Also dedup shelf artifacts by candidateId pattern to remove stale entries from previous publish of same candidate
  const cleanedShelf = existingShelf.filter((a: any) => !a.showcaseId?.includes(`-${candidateId}-`));
  localStorage.setItem('toyboxShelfArtifacts', JSON.stringify(mergeIntoShelf(cleanedShelf, extracted)));

  return { previewId };
}

// ── Inline editable field ─────────────────────────────────────────────────────
function EF({ value, onChange, isEditing, multiline = false }: { value: string; onChange: (v: string) => void; isEditing: boolean; multiline?: boolean }) {
  const v = value || '';
  if (!isEditing) return <>{v}</>;
  const cls = 'bg-transparent w-full outline-none border-b border-dashed border-[#005AFF]/50 focus:border-[#005AFF] transition-colors';
  if (multiline) return <textarea value={v} onChange={e => onChange(e.target.value)} rows={Math.max(2, Math.ceil(v.length / 80))} className={`${cls} resize-none`} onClick={e => e.stopPropagation()} />;
  return <input type="text" value={v} onChange={e => onChange(e.target.value)} className={cls} onClick={e => e.stopPropagation()} />;
}

// ── Collapsible Persona Card ──────────────────────────────────────────────────
function PersonaCard({ p, index }: { p: any; index: number }) {
  const [open, setOpen] = useState(false);
  const initials = p.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const techColor = p.techComfort === 'Expert' ? '#005AFF' : p.techComfort === 'High' ? '#16A34A' : p.techComfort === 'Medium' ? '#D97706' : '#94A3B8';
  const hasDetail = p.quote || p.background || p.goals?.length || p.frustrations?.length || p.need || p.painPoint || p.behaviours?.length || p.solutionSupport;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
      {/* Summary row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left group"
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: '#005AFF', color: '#fff' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
            {p.archetype && (
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border" style={{ background: 'rgba(0,90,255,0.06)', color: '#005AFF', borderColor: 'rgba(0,90,255,0.2)' }}>
                {p.archetype}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {p.role && <span className="text-xs text-slate-400">{p.role}</span>}
            {p.techComfort && (
              <>
                <span className="text-slate-200">·</span>
                <span className="text-xs font-semibold" style={{ color: techColor }}>{p.techComfort} tech comfort</span>
              </>
            )}
          </div>
          {p.quote && (
            <p className="text-xs text-slate-400 italic mt-1.5 truncate max-w-xl">"{p.quote}"</p>
          )}
        </div>
        <ChevronRight
          size={16}
          className="shrink-0 text-slate-300 group-hover:text-slate-500 transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Expanded detail */}
      {open && hasDetail && (
        <div className="border-t border-slate-100">
          <div className="px-6 pt-5 pb-4 space-y-4">
            {p.quote && (
              <blockquote className="rounded-xl px-4 py-3 italic text-sm leading-6 text-slate-700" style={{ background: 'rgba(0,90,255,0.04)', borderLeft: '3px solid #005AFF' }}>
                "{p.quote}"
              </blockquote>
            )}
            {p.background && (
              <p className="text-sm text-slate-600 leading-6">{p.background}</p>
            )}
          </div>

          {((p.goals?.length > 0) || (p.frustrations?.length > 0)) && (
            <div className="grid grid-cols-2 gap-0 border-t border-slate-100">
              {p.goals?.length > 0 && (
                <div className="p-5 border-r border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Goals</p>
                  <ul className="space-y-2">
                    {p.goals.map((g: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#16A34A' }} />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.frustrations?.length > 0 && (
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Frustrations</p>
                  <ul className="space-y-2">
                    {p.frustrations.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#DC2626' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 px-6 py-5 space-y-4">
            {p.need && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Core Need</p>
                <p className="text-sm text-slate-700 leading-5">{p.need}</p>
              </div>
            )}
            {p.painPoint && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Pain Point</p>
                <p className="text-sm text-slate-700 leading-5">{p.painPoint}</p>
              </div>
            )}
            {p.behaviours?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Observable Behaviours</p>
                <ul className="space-y-1.5">
                  {p.behaviours.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-5">
                      <ChevronRight size={12} className="shrink-0 mt-0.5 text-slate-300" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.solutionSupport && (
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(0,90,255,0.04)', borderLeft: '3px solid #005AFF' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#005AFF' }}>How We Help</p>
                <p className="text-sm text-slate-700 leading-5">{p.solutionSupport}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ReviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewPreviewId = searchParams.get('previewId');
  const [data, setData] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const publishingRef = useRef(false);
  const [publishError, setPublishError] = useState('');
  const [reflections, setReflections] = useState<{ id: string; quote: string; author: string; role: string }[]>([]);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [edits, setEdits] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function handleDelete() {
    if (!data) return;
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    setShowDeleteModal(false);
    try {
      const all = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');
      localStorage.setItem('toyboxPublishedShowcases', JSON.stringify(
        all.filter((s: any) => s.previewId !== viewPreviewId && s.id !== viewPreviewId)
      ));
    } catch { /* ignore */ }
    router.push('/');
  }

  useEffect(() => {
    if (viewPreviewId) {
      // View-only mode: load published showcase from localStorage, with IDB fallback
      const loadEntry = async () => {
        try {
          const published = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');
          const entry = published.find((p: any) => p.previewId === viewPreviewId || p.id === String(viewPreviewId));

          const resolveEntry = (showcase: any, entry: any) => {
            const storedCandidateId = entry?.candidateId || (entry?.previewId || entry?.id || '').toString().replace(/^sharepoint-/, '').replace(/-\d+$/, '');
            const knownSource = CANDIDATE_SOURCES[storedCandidateId];
            const resolvedDomain = entry?.domain || entry?.vertical || knownSource?.vertical || '';
            const resolvedAssets: any[] = entry?.uploadedAssets?.length
              ? entry.uploadedAssets
              : knownSource
                ? [{ name: knownSource.fileName, url: knownSource.webUrl, src: knownSource.webUrl, type: 'application/vnd.ms-powerpoint' }]
                : [];
            setData({ showcase, sourceFile: null, candidateId: storedCandidateId, candidateMeta: null, viewOnly: true, uploadedAssets: resolvedAssets, domain: resolvedDomain });
          };

          if (entry?.showcase) {
            resolveEntry(entry.showcase, entry);
          } else {
            // Fallback: load full payload from IndexedDB
            const db: IDBDatabase = await new Promise((res, rej) => {
              const req = indexedDB.open('toybox-db', 1);
              req.onupgradeneeded = () => req.result.createObjectStore('showcases', { keyPath: 'id' });
              req.onsuccess = () => res(req.result);
              req.onerror = () => rej(req.error);
            });
            const idbEntry: any = await new Promise((res, rej) => {
              const tx = db.transaction('showcases', 'readonly');
              const req = tx.objectStore('showcases').get(viewPreviewId);
              req.onsuccess = () => res(req.result);
              req.onerror = () => rej(req.error);
            });
            if (idbEntry?.previewPayload?.showcase) {
              resolveEntry(idbEntry.previewPayload.showcase, entry || {});
            } else {
              router.replace('/');
            }
          }
        } catch { router.replace('/'); }
      };
      loadEntry();
      return;
    }
    const raw = sessionStorage.getItem('toyboxReviewShowcase');
    if (!raw) { router.replace('/admin'); return; }
    setData(JSON.parse(raw));
  }, [router, viewPreviewId]);

  if (!data) return null;

  const { showcase: rawShowcase, sourceFile, candidateId, candidateMeta, viewOnly, uploadedAssets: viewAssets, domain: viewDomain } = data;
  const showcase = Object.keys(edits).length > 0 ? { ...rawShowcase, ...edits } : rawShowcase;
  const updateField = (key: string, value: string) => setEdits((p: any) => ({ ...p, [key]: value }));
  const startEditing = () => { setEdits({}); setIsEditing(true); };
  const doneEditing = () => {
    setData((prev: any) => ({ ...prev, showcase: showcase }));
    setEdits({});
    setIsEditing(false);
  };

  async function handlePublish() {
    if (publishingRef.current) return;
    publishingRef.current = true;
    setPublishing(true);
    setPublishError('');
    try {
      const { previewId } = await saveAndPublish(showcase, candidateId, sourceFile, candidateMeta?.vertical);
      const personaCount = showcase.personas?.length ?? 0;
      sessionStorage.removeItem('toyboxReviewShowcase');
      sessionStorage.setItem('toyboxPublishSuccess', JSON.stringify({
        title: showcase.title,
        personaCount,
        previewId,
      }));
      router.push('/');
    } catch (e: any) {
      setPublishError(e.message || 'Publish failed — please retry.');
      setPublishing(false);
    }
  }

  const showcaseTitle = data?.showcase?.title || 'this showcase';

  return (
    <div className="min-h-screen bg-slate-50">
      {showDeleteModal && (
        <DeleteConfirmModal
          title={`Delete "${showcaseTitle}"?`}
          description="This will permanently remove the showcase and its extracted artifacts from Toybox. This action cannot be undone."
          confirmLabel="Delete showcase"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {/* Sticky header — unified across view and publish modes */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <Link href={viewOnly ? '/' : '/admin'} className="font-semibold hover:text-slate-900 transition">
              ← {viewOnly ? 'Back to Toybox' : 'Back to admin'}
            </Link>
            <div className="flex items-center gap-3">
              {viewOnly ? (
                <>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100">
                    <Bookmark size={18} />
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    <Star size={16} className="text-amber-500" />
                    4.6
                  </div>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100">
                    <Download size={18} />
                  </button>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-slate-100">
                    <Share2 size={18} />
                  </button>
                  <Link
                    href="/accelerator"
                    className="inline-flex items-center gap-2 rounded-full px-4 h-11 text-sm font-bold transition hover:opacity-90"
                    style={{ background: '#DCFF00', color: '#0A0A0F' }}
                    title="Launch Experience Accelerator with this showcase"
                  >
                    <Zap size={14} />
                    ExA
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-100 bg-white/95 text-red-400 transition hover:bg-red-50"
                    title="Delete showcase"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <>
                  {publishError && <p className="text-xs text-red-500">{publishError}</p>}
                  {isEditing ? (
                    <button
                      onClick={doneEditing}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                      style={{ background: '#DCFF00', color: '#0A0A0F' }}
                    >
                      <CheckCircle2 size={14} /> Done editing
                    </button>
                  ) : (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition hover:bg-slate-50"
                      style={{ borderColor: '#E2E8F0', color: '#475569' }}
                    >
                      <Pencil size={13} /> Edit copy
                    </button>
                  )}
                  <button
                    onClick={handlePublish}
                    disabled={publishing || isEditing}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition hover:opacity-90"
                    style={{ background: '#005AFF' }}
                  >
                    {publishing ? 'Publishing…' : <><CheckCircle2 size={14} /> Publish to Toybox</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {isEditing && (
        <div className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold" style={{ background: 'rgba(220,255,0,0.12)', borderBottom: '1px solid rgba(220,255,0,0.3)', color: '#4D6600' }}>
          <Pencil size={11} /> Editing mode — click any text field to edit. Press "Done editing" when finished.
        </div>
      )}

      <main className={`mx-auto px-6 sm:px-8 py-12 space-y-14 ${viewOnly ? 'max-w-7xl' : 'max-w-5xl'}`}>

        {/* Hero */}
        <section>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(0,90,255,0.08)', color: '#005AFF', border: '1px solid rgba(0,90,255,0.2)' }}>
              {viewDomain || candidateMeta?.vertical || showcase.domain}
            </span>
            {candidateMeta?.client && <span className="text-sm text-slate-500">{candidateMeta.client}</span>}
            {candidateMeta?.engagementType && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-400">{candidateMeta.engagementType}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 mb-4 leading-tight">
            <EF value={showcase.title} onChange={v => updateField('title', v)} isEditing={isEditing} />
          </h1>
          {(showcase.subtitle || isEditing) && (
            <p className="text-xl text-slate-500 leading-8 mb-4">
              <EF value={showcase.subtitle || ''} onChange={v => updateField('subtitle', v)} isEditing={isEditing} />
            </p>
          )}
          {(showcase.heroStatement || isEditing) && (
            <p className="text-lg font-medium text-slate-700 leading-8 max-w-3xl border-l-4 pl-5 py-1" style={{ borderLeftColor: '#005AFF' }}>
              <EF value={showcase.heroStatement || ''} onChange={v => updateField('heroStatement', v)} isEditing={isEditing} multiline />
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-5">
            {(showcase.suggestedTags || []).map((t: string) => (
              <span key={t} className="rounded-full px-2.5 py-1 text-xs text-slate-500 border border-slate-200 bg-white">{t}</span>
            ))}
          </div>
        </section>

        {/* Overview / Challenge / Mission */}
        <section className="grid gap-6 sm:grid-cols-3">
          {(showcase.overview || isEditing) && (
            <div className="sm:col-span-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Overview</p>
              <p className="text-base text-slate-700 leading-8">
                <EF value={showcase.overview || ''} onChange={v => updateField('overview', v)} isEditing={isEditing} multiline />
              </p>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Challenge</p>
            <p className="text-sm text-slate-600 leading-6">
              <EF value={showcase.challenge || ''} onChange={v => updateField('challenge', v)} isEditing={isEditing} multiline />
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Mission</p>
            <p className="text-sm text-slate-600 leading-6">
              <EF value={showcase.mission || ''} onChange={v => updateField('mission', v)} isEditing={isEditing} multiline />
            </p>
          </div>
          {(showcase.impact || isEditing) && (
            <div className="rounded-2xl p-6" style={{ background: '#F0FDF4', border: '1px solid rgba(22,101,52,0.15)', borderLeftColor: '#166534', borderLeftWidth: 4 }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#166534' }}>Impact</p>
              <p className="text-sm leading-6" style={{ color: '#166534' }}>
                <EF value={showcase.impact || ''} onChange={v => updateField('impact', v)} isEditing={isEditing} multiline />
              </p>
            </div>
          )}
        </section>

        {/* Personas */}
        {showcase.personas?.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
              Personas ({showcase.personas.length}) — will be added to Design Shelf
            </h2>
            <div className="flex flex-col gap-3">
              {showcase.personas.map((p: any, i: number) => (
                <PersonaCard key={i} p={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Solution Highlights */}
        {showcase.solutionHighlights?.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Solution Highlights</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {showcase.solutionHighlights.map((s: any, i: number) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={13} style={{ color: '#005AFF' }} />
                    <h3 className="font-semibold text-slate-900 text-sm">{s.heading}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-6">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Visual Sections */}
        {showcase.visualSections?.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Methodology Artifacts</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.visualSections.map((vs: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-3" style={{ background: '#F1F5F9', color: '#64748B' }}>
                    {vs.sectionType}
                  </span>
                  <p className="font-semibold text-slate-900 text-sm mb-1.5">{vs.sectionTitle}</p>
                  <p className="text-xs text-slate-500 leading-5">{vs.narrative}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Points of Contact */}
        {showcase.pointsOfContact?.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Points of Contact</h2>
            <div className="flex flex-wrap gap-4">
              {showcase.pointsOfContact.map((poc: any, i: number) => {
                const initials = poc.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: '#005AFF', color: '#fff' }}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{poc.name}</p>
                      <p className="text-xs text-slate-500">{poc.role}</p>
                      {poc.email && (
                        <a href={`mailto:${poc.email}`} className="flex items-center gap-1 text-xs mt-1 transition" style={{ color: '#005AFF' }}>
                          <Mail size={11} />{poc.email}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Source Assets */}
        {(() => {
          const assets = viewOnly
            ? (viewAssets || [])
            : sourceFile
              ? [{ name: sourceFile.name, url: sourceFile.webUrl, type: 'application/vnd.ms-powerpoint' }]
              : [];
          const imageExts = /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)$/i;
          const imageMime = /^image\//;
          const downloadable = assets.filter((a: any) =>
            !imageExts.test(a.name || '') && !imageMime.test(a.type || '')
          );
          if (!downloadable.length) return null;
          const extIcon = (name: string) => {
            const ext = (name.split('.').pop() || '').toLowerCase();
            if (ext === 'pdf') return '📄';
            if (['ppt', 'pptx'].includes(ext)) return '📊';
            if (['doc', 'docx'].includes(ext)) return '📝';
            return '🔗';
          };
          return (
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Source Assets</h2>
              <div className="flex flex-wrap gap-3">
                {downloadable.map((a: any, i: number) => {
                  const ext = (a.name?.split('.').pop() || '').toUpperCase();
                  return (
                    <a
                      key={i}
                      href={a.url || a.src || a.webUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 transition hover:border-[#005AFF]/30 hover:bg-[#005AFF]/[0.03] group"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(0,90,255,0.08)', color: '#005AFF' }}>
                        {ext || 'FILE'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-snug">{a.name}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400 group-hover:text-[#005AFF] transition">
                          <Download size={10} /> Download
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* Community Reflections — published view only */}
        {viewOnly && <section className="rounded-3xl overflow-hidden" style={{ background: '#0A0A0F' }}>
          <div className="px-10 pt-12 pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#DCFF00' }}>Community Reflections</p>
            <h2 className="text-3xl font-semibold text-white mb-3">A space for collaborative observations.</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">Share what resonated, what surprised you, or what you'd carry forward. These reflections help the team and future practitioners learn.</p>
          </div>

          <div className="px-10 py-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 'seed-1', quote: 'The persona depth here is something we rarely see — this will save weeks of discovery.', author: 'Priya M.', role: 'CX Strategy Lead' },
              { id: 'seed-2', quote: 'Love how the methodology ties directly back to the business challenge.', author: 'Jordan T.', role: 'Design Director' },
              { id: 'seed-3', quote: 'This is exactly the kind of artifact that makes Toybox worth using.', author: 'Sam R.', role: 'Engagement Manager' },
              ...reflections,
            ].slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-2xl p-6 flex flex-col justify-between gap-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm leading-7 text-white/75 italic">"{item.quote}"</p>
                <div>
                  <p className="text-xs font-semibold text-white">{item.author}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              setReflections(r => [{ id: String(Date.now()), quote: comment.trim(), author: 'You', role: 'Collaborator' }, ...r]);
              setComment('');
            }}
            className="mx-10 mb-10 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4 block">Share a reflection</label>
            <div className="flex gap-3">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What stood out, what you'd take forward…"
                className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:ring-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="submit"
                className="rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                style={{ background: '#DCFF00', color: '#0A0A0F' }}
              >
                Add
              </button>
            </div>
          </form>
        </section>}

        {!viewOnly && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 flex items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Ready to publish?</p>
              <p className="text-sm text-slate-500">This will publish the showcase, add personas to the Design Shelf, and make it available in the ExA knowledge base.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/admin" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-500 hover:text-slate-950 transition">
                Back
              </Link>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition hover:opacity-90"
                style={{ background: '#005AFF' }}
              >
                {publishing ? 'Publishing…' : <><CheckCircle2 size={14} /> Publish to Toybox</>}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewPageInner />
    </Suspense>
  );
}
