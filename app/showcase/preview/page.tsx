'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Download, Share2, Trash2, Pencil, Printer, ImagePlus, LayoutTemplate, ExternalLink, CheckCheck } from 'lucide-react';
import JSZip from 'jszip';

// ── Types ─────────────────────────────────────────────────────────────────────

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

type Template = 'editorial' | 'cinematic' | 'compact' | 'minimal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAssetImage(asset: any): string {
  if (!asset) return '';
  if (typeof asset === 'string') return asset;
  return asset.dataUrl || asset.previewUrl || asset.url || asset.src || '';
}

function isImageAsset(asset: UploadedAsset) {
  const v = getAssetImage(asset);
  return (
    asset.category === 'image' ||
    asset.type?.startsWith('image/') ||
    v.startsWith('data:image') ||
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

function findAssetByName(assets: UploadedAsset[], name?: string) {
  if (!name) return null;
  const t = normalizeName(name);
  return (
    assets.find((a) => normalizeName(a.name) === t) ||
    assets.find((a) => normalizeName(a.name).includes(t)) ||
    assets.find((a) => t.includes(normalizeName(a.name))) ||
    null
  );
}

function findBestForPersona(assets: UploadedAsset[], persona: any, idx: number) {
  return (
    findAssetByName(assets, persona.assetName) ||
    findAssetByName(assets, persona.imageAssetName) ||
    findAssetByName(assets, persona.name) ||
    assets[idx] || null
  );
}

function findBestForHighlight(assets: UploadedAsset[], item: any, idx: number) {
  return (
    findAssetByName(assets, item.assetName) ||
    findAssetByName(assets, item.imageAssetName) ||
    assets[idx] || null
  );
}

function dataUrlToBase64(dataUrl: string) {
  return dataUrl.split(',')[1] || '';
}

// ── IndexedDB ─────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('toybox-db', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('showcases')) {
        db.createObjectStore('showcases', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function savePreviewToIDB(id: string, payload: PreviewPayload) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('showcases', 'readwrite');
    tx.objectStore('showcases').put({ id, previewPayload: payload, savedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPreviewFromIDB(id: string): Promise<PreviewPayload | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('showcases', 'readonly');
    const req = tx.objectStore('showcases').get(id);
    req.onsuccess = () => resolve(req.result?.previewPayload || null);
    req.onerror = () => reject(req.error);
  });
}

// ── Swappable image wrapper ───────────────────────────────────────────────────

type SwappableImageProps = {
  src: string;
  alt: string;
  className?: string;
  slotKey: string;
  overrides: Record<string, string>;
  onSwap: (key: string, src: string) => void;
  onExpand: (src: string) => void;
};

function SwappableImage({ src, alt, className, slotKey, overrides, onSwap, onExpand }: SwappableImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const activeSrc = overrides[slotKey] || src;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSwap(slotKey, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl">
      <img
        src={activeSrc}
        alt={alt}
        className={`${className} cursor-zoom-in`}
        onClick={() => onExpand(activeSrc)}
      />
      {/* Swap overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end gap-2 p-3 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur transition hover:bg-white"
        >
          <ImagePlus size={12} /> Replace
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Template picker ───────────────────────────────────────────────────────────

const TEMPLATES: { id: Template; label: string; desc: string }[] = [
  { id: 'minimal', label: 'Minimal', desc: 'Why · What · WOW — pure text, references, and assets. Clean Apple-style.' },
  { id: 'editorial', label: 'Editorial', desc: 'Clean white with strong typography and structured sections.' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Dark hero, immersive image sections, dramatic type.' },
];

// ── Inline editable field ─────────────────────────────────────────────────────

function EF({
  value,
  onChange,
  isEditing,
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  multiline?: boolean;
}) {
  const v = value || '';
  if (!isEditing) return <>{v}</>;
  const cls =
    'bg-transparent w-full outline-none border-b border-dashed border-[#005AFF]/50 focus:border-[#005AFF] transition-colors';
  if (multiline) {
    return (
      <textarea
        value={v}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(2, Math.ceil(v.length / 80))}
        className={`${cls} resize-none`}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return (
    <input
      type="text"
      value={v}
      onChange={(e) => onChange(e.target.value)}
      className={cls}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function ShowcasePreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [template, setTemplate] = useState<Template>('cinematic');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showcaseEdits, setShowcaseEdits] = useState<any>({});

  useEffect(() => {
    const loadPreview = async () => {
      const activeId = localStorage.getItem('toyboxActivePreviewId');
      if (activeId) {
        const idbPayload = await getPreviewFromIDB(activeId);
        if (idbPayload) {
          setPayload(idbPayload);
          setShowcaseEdits(JSON.parse(JSON.stringify(idbPayload.showcase || {})));
          setIsPublished(searchParams.get('mode') === 'published');
          return;
        }
      }
      const mem = (window as any).__toyboxPreviewShowcase;
      if (mem) {
        setPayload(mem);
        setShowcaseEdits(JSON.parse(JSON.stringify(mem.showcase || {})));
      } else {
        const stored = localStorage.getItem('toyboxPreviewShowcase');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPayload(parsed);
          setShowcaseEdits(JSON.parse(JSON.stringify(parsed.showcase || {})));
        }
      }
      setIsPublished(searchParams.get('mode') === 'published');
    };
    loadPreview();
  }, [searchParams]);

  // sc is the source of truth for rendered text — edits are always live in showcaseEdits
  const showcase = showcaseEdits && Object.keys(showcaseEdits).length > 0 ? showcaseEdits : (payload?.showcase || {});

  const updateField = (key: string, value: string) =>
    setShowcaseEdits((prev: any) => ({ ...prev, [key]: value }));

  const updatePersona = (i: number, key: string, value: string) =>
    setShowcaseEdits((prev: any) => {
      const personas = [...(prev.personas || [])];
      personas[i] = { ...personas[i], [key]: value };
      return { ...prev, personas };
    });

  const updateHighlight = (i: number, key: string, value: string) =>
    setShowcaseEdits((prev: any) => {
      const highlights = [...(prev.solutionHighlights || [])];
      highlights[i] = { ...highlights[i], [key]: value };
      return { ...prev, solutionHighlights: highlights };
    });

  const imageAssets = useMemo(() => {
    return (payload?.uploadedAssets || []).filter((a) => isImageAsset(a) && getAssetImage(a));
  }, [payload]);

  const heroImage =
    getAssetImage(findAssetByName(imageAssets, showcase.heroAssetName)) ||
    getAssetImage(findAssetByName(imageAssets, showcase.heroImageAssetName)) ||
    getAssetImage(imageAssets[0]);

  const challengeImage =
    getAssetImage(findAssetByName(imageAssets, showcase.challengeAssetName)) ||
    getAssetImage(imageAssets[1]) ||
    getAssetImage(imageAssets[0]);

  // Reference URLs from intake
  const referenceUrls: { label: string; href: string }[] = [];
  const figmaLink = payload?.metadata?.figmaLink;
  const otherUrls: string[] = payload?.metadata?.otherUrls || [];
  if (figmaLink) referenceUrls.push({ label: 'Figma / Prototype', href: figmaLink });
  otherUrls.forEach((u, i) => u && referenceUrls.push({ label: `Reference ${i + 1}`, href: u }));

  const handleSwapImage = (key: string, src: string) => {
    setImageOverrides((prev) => ({ ...prev, [key]: src }));
  };

  const handlePublish = async () => {
    if (!payload) return;
    setIsPublishing(true);
    try {
      // Merge any inline edits into the payload before saving
      const publishPayload: PreviewPayload = { ...payload, showcase: { ...payload.showcase, ...showcaseEdits } };
      const previewId = `preview-${Date.now()}`;
      await savePreviewToIDB(previewId, publishPayload);

      const effectiveHero = imageOverrides['hero'] || heroImage;

      const publishedCard = {
        id: Date.now(),
        previewId,
        title: showcase.title || payload.metadata?.projectName || 'Generated Showcase',
        subtitle: showcase.subtitle || showcase.heroStatement || '',
        domain: showcase.domain || payload.metadata?.domain || 'Design',
        overview: showcase.overview || '',
        heroImage: effectiveHero,
        publishedAt: new Date().toISOString(),
        tags: showcase.suggestedTags || payload.metadata?.tags || [],
      };

      const existing = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');
      const safe = existing.map((item: any) => ({
        id: item.id, previewId: item.previewId, title: item.title,
        subtitle: item.subtitle, domain: item.domain, overview: item.overview,
        heroImage: item.heroImage, publishedAt: item.publishedAt, tags: item.tags || [],
      }));
      localStorage.setItem('toyboxPublishedShowcases', JSON.stringify([publishedCard, ...safe]));
      localStorage.setItem('toyboxActivePreviewId', previewId);

      // ── Extract Design Shelf artifacts from this showcase ─────────────────
      const shelfArtifacts = JSON.parse(localStorage.getItem('toyboxShelfArtifacts') || '[]');
      const projectName = publishedCard.title;
      const domain = publishedCard.domain;
      const publishedAt = publishedCard.publishedAt;
      const showcaseId = String(publishedCard.id);

      // Extract personas
      if (showcase.personas?.length > 0) {
        showcase.personas.forEach((p: any, i: number) => {
          if (!p.name) return;
          shelfArtifacts.push({
            id: `${showcaseId}-persona-${i}`,
            category: 'personas',
            name: p.name,
            role: p.role || '',
            description: [p.need, p.painPoint].filter(Boolean).join(' — ') || p.solutionSupport || '',
            projectName,
            domain,
            publishedAt,
            previewId,
            // carry the matched asset name so the image can be shown
            assetName: p.assetName || '',
          });
        });
      }

      // Extract journey map / visual sections that look like journey maps
      const journeyTypes = ['journey', 'journey-map', 'journeymap', 'swimlane'];
      const journeySections = (showcase.visualSections || []).filter((s: any) =>
        journeyTypes.some((t) => (s.sectionType || '').toLowerCase().includes(t))
      );
      journeySections.forEach((s: any, i: number) => {
        shelfArtifacts.push({
          id: `${showcaseId}-journey-${i}`,
          category: 'journey-maps',
          name: s.sectionTitle || `Journey — ${projectName}`,
          description: s.narrative || '',
          projectName,
          domain,
          publishedAt,
          previewId,
          assetName: s.assetName || '',
        });
      });

      // Extract solution highlights that look like service blueprints
      const blueprintTypes = ['blueprint', 'service', 'process', 'workflow'];
      const blueprintSections = (showcase.visualSections || []).filter((s: any) =>
        blueprintTypes.some((t) => (s.sectionType || '').toLowerCase().includes(t))
      );
      blueprintSections.forEach((s: any, i: number) => {
        shelfArtifacts.push({
          id: `${showcaseId}-blueprint-${i}`,
          category: 'service-blueprints',
          name: s.sectionTitle || `Blueprint — ${projectName}`,
          description: s.narrative || '',
          projectName,
          domain,
          publishedAt,
          previewId,
          assetName: s.assetName || '',
        });
      });

      localStorage.setItem('toyboxShelfArtifacts', JSON.stringify(shelfArtifacts));
      // ─────────────────────────────────────────────────────────────────────

      setIsPublished(true);
      setTimeout(() => router.push('/'), 900);
    } catch (err) {
      console.error('Publish failed', err);
      alert('Publishing failed. Please try again.');
      setIsPublishing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!payload) return;
    const zip = new JSZip();
    payload.uploadedAssets.forEach((asset, i) => {
      const data = getAssetImage(asset);
      if (data) zip.file(asset.name || `asset-${i + 1}`, dataUrlToBase64(data), { base64: true });
    });
    const urls = [figmaLink, ...otherUrls].filter(Boolean).join('\n');
    if (urls) zip.file('reference-urls.txt', urls);
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${showcase.title || 'toybox-showcase'}-assets.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handlePrintPDF = () => window.print();

  const handleDelete = () => {
    if (!window.confirm('Delete this showcase from Toybox?')) return;
    localStorage.removeItem('toyboxPreviewShowcase');
    localStorage.removeItem('toyboxPublishedShowcases');
    localStorage.removeItem('toyboxActivePreviewId');
    sessionStorage.removeItem('toyboxPublishToastShown');
    (window as any).__toyboxPreviewShowcase = null;
    router.push('/');
  };

  if (!payload) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-xl px-6 py-32 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Showcase Studio</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">No preview found</h1>
          <p className="mt-3 text-slate-500">Generate a showcase first to preview it here.</p>
          <Link href="/upload/ai" className="mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-semibold text-white" style={{ background: '#005AFF' }}>
            Back to AI upload
          </Link>
        </main>
      </div>
    );
  }

  // ── Template helpers ─────────────────────────────────────────────────────────

  const isCinematic = template === 'cinematic';
  const isEditorial = template === 'editorial';
  const isCompact   = template === 'compact';
  const isMinimal   = template === 'minimal';

  const heroBg    = isCinematic ? 'bg-[#0E1628] text-white'        : isEditorial ? 'bg-white text-slate-950 border-b border-slate-200' : 'bg-slate-950 text-white';
  const sectionA  = isCinematic ? 'bg-white'                        : isEditorial ? 'bg-slate-50'                                          : 'bg-white';
  const sectionB  = isCinematic ? 'bg-slate-50'                     : isEditorial ? 'bg-white'                                             : 'bg-slate-50';
  const sectionDk = isCinematic ? 'bg-[#0A0A0F] text-white'         : isEditorial ? 'bg-slate-950 text-white'                              : 'bg-slate-100';
  const labelColor = 'text-[#005AFF]';

  return (
    <div className="min-h-screen bg-white text-slate-950">

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-8" onClick={() => setSelectedImage(null)}>
          <button className="absolute right-6 top-6 text-3xl text-white" onClick={() => setSelectedImage(null)}>×</button>
          <img src={selectedImage} alt="Expanded" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Publishing overlay */}
      {isPublishing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-[#005AFF]" />
            <h2 className="mt-6 text-xl font-semibold">Publishing showcase</h2>
            <p className="mt-2 text-sm text-slate-500">Adding to Toybox Discover.</p>
          </div>
        </div>
      )}

      {/* Template picker panel */}
      {showTemplatePicker && (
        <div className="no-print fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplatePicker(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Showcase Studio</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Choose a template</h2>
            <div className="mt-5 grid gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTemplate(t.id); setShowTemplatePicker(false); }}
                  className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                    template === t.id ? 'border-[#005AFF] bg-[#EEF3FF]' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-950">{t.label}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{t.desc}</p>
                  </div>
                  {template === t.id && (
                    <div className="h-5 w-5 rounded-full flex-shrink-0" style={{ background: '#005AFF' }}>
                      <svg viewBox="0 0 20 20" fill="white" className="h-5 w-5"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/96 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3 sm:px-8">

          {/* Left: logo + back */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-[15px] font-bold tracking-[-0.02em] lowercase text-slate-950">slalom</span>
            <span className="text-slate-300">|</span>
            <span className="text-[15px] font-medium text-slate-700">Toybox</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-950 transition">← Discover</Link>

          <div className="ml-auto flex items-center gap-2">
            {/* Template picker — shows current template with label */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-1 py-1">
              <span className="pl-2 text-xs text-slate-400 hidden sm:block">Template:</span>
              <button
                onClick={() => setShowTemplatePicker(true)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                <LayoutTemplate size={13} />
                {TEMPLATES.find((t) => t.id === template)?.label}
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200" />

            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isEditing
                  ? 'border-[#005AFF] bg-[#EEF3FF] text-[#005AFF]'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isEditing ? <CheckCheck size={13} /> : <Pencil size={13} />}
              {isEditing ? 'Done editing' : 'Edit copy'}
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {!isPublished ? (
              <>
                <button onClick={handlePrintPDF} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Printer size={13} /> Export PDF
                </button>
                <button onClick={handleDelete} className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
                <button onClick={handlePublish} className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#005AFF' }}>
                  Publish showcase
                </button>
              </>
            ) : (
              <>
                <button onClick={handlePrintPDF} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Printer size={13} /> Export PDF
                </button>
                <button onClick={handleDownloadZip} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50">
                  <Download size={14} />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"><Bookmark size={14} /></button>
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"><Share2 size={14} /></button>
                <button onClick={handleDelete} className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50"><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>

        {/* ── MINIMAL TEMPLATE ── */}
        {isMinimal && (
          <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">

            {/* Header */}
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
              {payload.metadata?.engagementType || 'Showcase'}
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              <EF value={showcase.title || payload.metadata?.projectName || 'Generated Showcase'} onChange={(v) => updateField('title', v)} isEditing={isEditing} />
            </h1>
            {payload.metadata?.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {payload.metadata.tags.map((tag: string) => (
                  <span key={tag} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{tag}</span>
                ))}
              </div>
            )}

            <hr className="my-10 border-slate-200" />

            {/* WHY */}
            <section className="mb-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Why</p>
              <h2 className="text-xl font-semibold text-slate-950">The Problem</h2>
              <p className="mt-4 text-base leading-8 text-slate-600"><EF value={showcase.challenge || showcase.overview || ''} onChange={(v) => updateField('challenge', v)} isEditing={isEditing} multiline /></p>
            </section>

            {/* WHAT */}
            <section className="mb-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">What</p>
              <h2 className="text-xl font-semibold text-slate-950">The Approach</h2>
              <p className="mt-4 text-base leading-8 text-slate-600"><EF value={showcase.mission || showcase.overview || ''} onChange={(v) => updateField('mission', v)} isEditing={isEditing} multiline /></p>
              {showcase.solutionHighlights?.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {showcase.solutionHighlights.map((h: any, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#005AFF]" />
                      <div>
                        <p className="font-semibold text-slate-950"><EF value={h.heading || ''} onChange={(v) => updateHighlight(i, 'heading', v)} isEditing={isEditing} /></p>
                        <p className="mt-1 text-sm leading-7 text-slate-600"><EF value={h.body || ''} onChange={(v) => updateHighlight(i, 'body', v)} isEditing={isEditing} multiline /></p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* WOW */}
            <section className="mb-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">WOW</p>
              <h2 className="text-xl font-semibold text-slate-950">The Impact</h2>
              <p className="mt-4 text-base leading-8 text-slate-600"><EF value={showcase.impact || ''} onChange={(v) => updateField('impact', v)} isEditing={isEditing} multiline /></p>
            </section>

            {/* References */}
            {referenceUrls.length > 0 && (
              <>
                <hr className="mb-8 border-slate-200" />
                <section className="mb-12">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">References</p>
                  <div className="space-y-3">
                    {referenceUrls.map((r) => (
                      <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: '#005AFF' }}>
                        ↗ {r.label}
                      </a>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Assets */}
            {imageAssets.length > 0 && (
              <>
                <hr className="mb-8 border-slate-200" />
                <section>
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Project Assets</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imageAssets.map((asset, i) => (
                      <SwappableImage
                        key={i} src={getAssetImage(asset)} alt={asset.name} slotKey={`asset-${i}`}
                        className="h-52 w-full rounded-xl object-contain bg-slate-50"
                        overrides={imageOverrides} onSwap={handleSwapImage} onExpand={setSelectedImage}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* ── ALL OTHER TEMPLATES ── */}
        {!isMinimal && (
        <><section className={`${heroBg} py-16`}>
          <div className={`mx-auto max-w-7xl px-6 sm:px-8 ${isCompact ? 'grid gap-10 lg:grid-cols-2 lg:items-center' : 'grid gap-10 lg:grid-cols-[1fr_480px] lg:items-center'}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${isCinematic ? 'text-slate-400' : isEditorial ? labelColor : 'text-slate-400'}`}>
                {payload.metadata?.engagementType || 'Showcase Preview'}
              </p>
              <h1 className={`mt-4 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl ${isEditorial ? 'text-slate-950' : ''}`}>
                <EF value={showcase.title || payload.metadata?.projectName || 'Generated Showcase'} onChange={(v) => updateField('title', v)} isEditing={isEditing} />
              </h1>
              <p className={`mt-5 max-w-2xl text-lg leading-8 ${isCinematic ? 'text-slate-300' : isEditorial ? 'text-slate-600' : 'text-slate-300'}`}>
                <EF value={showcase.heroStatement || showcase.subtitle || showcase.overview || ''} onChange={(v) => updateField('heroStatement', v)} isEditing={isEditing} multiline />
              </p>
              {payload.metadata?.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {payload.metadata.tags.map((tag: string) => (
                    <span key={tag} className={`rounded-md px-2.5 py-1 text-xs font-medium ${isCinematic ? 'bg-white/10 text-slate-300' : isEditorial ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-slate-300'}`}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {heroImage && (
              <div className={`overflow-hidden rounded-xl border p-4 ${isCinematic ? 'border-white/10 bg-white/5' : isEditorial ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
                <SwappableImage
                  src={heroImage} alt="Hero artifact" slotKey="hero"
                  className="h-[340px] w-full object-contain transition hover:scale-[1.01]"
                  overrides={imageOverrides} onSwap={handleSwapImage} onExpand={setSelectedImage}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Challenge ── */}
        {(showcase.challenge || showcase.problem) && (
          <section className={`${sectionA} py-16`}>
            <div className={`mx-auto max-w-7xl px-6 sm:px-8 ${isCompact ? 'grid gap-8 lg:grid-cols-2 lg:items-start' : 'grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Challenge</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-slate-950">The experience problem</h2>
                <p className="mt-5 text-lg leading-8 text-slate-600"><EF value={showcase.challenge || showcase.problem || ''} onChange={(v) => updateField('challenge', v)} isEditing={isEditing} multiline /></p>
              </div>
              {challengeImage && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <SwappableImage
                    src={challengeImage} alt="Challenge artifact" slotKey="challenge"
                    className="h-[300px] w-full object-contain transition hover:scale-[1.01]"
                    overrides={imageOverrides} onSwap={handleSwapImage} onExpand={setSelectedImage}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Overview ── */}
        {(showcase.overview || showcase.mission) && (
          <section className={`${sectionB} py-16`}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Overview</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-slate-950">What the solution set out to do</h2>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600"><EF value={showcase.overview || showcase.mission || ''} onChange={(v) => updateField('overview', v)} isEditing={isEditing} multiline /></p>
            </div>
          </section>
        )}

        {/* ── Personas ── */}
        {showcase.personas?.length > 0 && (
          <section className={`${sectionA} py-16`}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Personas</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-slate-950">Who the experience supports</h2>
              <div className={`mt-10 grid gap-6 ${isCompact ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {showcase.personas.map((persona: any, i: number) => {
                  const mapped = findBestForPersona(imageAssets, persona, i);
                  const img = getAssetImage(mapped);
                  return (
                    <article key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                      {img && (
                        <SwappableImage
                          src={img} alt={persona.name || 'Persona'} slotKey={`persona-${i}`}
                          className="mb-4 h-48 w-full object-contain"
                          overrides={imageOverrides} onSwap={handleSwapImage} onExpand={setSelectedImage}
                        />
                      )}
                      <h3 className="text-xl font-semibold text-slate-950"><EF value={persona.name || ''} onChange={(v) => updatePersona(i, 'name', v)} isEditing={isEditing} /></h3>
                      <p className="mt-0.5 text-sm font-medium" style={{ color: '#005AFF' }}><EF value={persona.role || ''} onChange={(v) => updatePersona(i, 'role', v)} isEditing={isEditing} /></p>
                      <p className="mt-3 text-sm leading-6 text-slate-600"><EF value={persona.need || ''} onChange={(v) => updatePersona(i, 'need', v)} isEditing={isEditing} multiline /></p>
                      {(persona.solutionSupport || isEditing) && <p className="mt-3 text-sm leading-6 text-slate-600"><EF value={persona.solutionSupport || ''} onChange={(v) => updatePersona(i, 'solutionSupport', v)} isEditing={isEditing} multiline /></p>}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Solution Highlights ── */}
        {showcase.solutionHighlights?.length > 0 && (
          <section className={`${sectionDk} py-16`}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${isCinematic || isEditorial ? 'text-slate-400' : labelColor}`}>Solution Highlights</p>
              <h2 className={`mt-3 text-4xl font-semibold tracking-[-0.03em] ${isCompact ? 'text-slate-950' : 'text-white'}`}>How the experience comes together</h2>
              <div className="mt-10 grid gap-8">
                {showcase.solutionHighlights.map((item: any, i: number) => {
                  const mapped = findBestForHighlight(imageAssets, item, i + (showcase.personas?.length || 0));
                  const img = getAssetImage(mapped);
                  return (
                    <article
                      key={i}
                      className={`grid gap-8 rounded-2xl p-6 ${isCompact ? 'border border-slate-200 bg-white' : 'border border-white/8 bg-white/5'} lg:grid-cols-2 lg:items-center`}
                    >
                      {img && (
                        <SwappableImage
                          src={img} alt={item.heading || 'Solution artifact'} slotKey={`highlight-${i}`}
                          className={`h-[300px] w-full object-contain ${isCompact ? '' : 'brightness-90'}`}
                          overrides={imageOverrides} onSwap={handleSwapImage} onExpand={setSelectedImage}
                        />
                      )}
                      <div>
                        <h3 className={`text-2xl font-semibold ${isCompact ? 'text-slate-950' : 'text-white'}`}><EF value={item.heading || ''} onChange={(v) => updateHighlight(i, 'heading', v)} isEditing={isEditing} /></h3>
                        <p className={`mt-4 text-base leading-7 ${isCompact ? 'text-slate-600' : 'text-slate-300'}`}><EF value={item.body || ''} onChange={(v) => updateHighlight(i, 'body', v)} isEditing={isEditing} multiline /></p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Impact ── */}
        {showcase.impact && (
          <section className={`${sectionB} py-16`}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <div className={`grid gap-6 ${isCompact ? 'lg:grid-cols-2' : 'lg:grid-cols-[1.2fr_0.8fr]'}`}>
                <div className="rounded-2xl border border-slate-200 bg-white p-8">
                  <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Impact</p>
                  <p className="mt-5 text-lg leading-8 text-slate-700"><EF value={showcase.impact || ''} onChange={(v) => updateField('impact', v)} isEditing={isEditing} multiline /></p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8">
                  <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Design Deliverables</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(showcase.suggestedTags || payload.metadata?.tags || [
                      'Personas', 'Dashboard', 'Annotated screens', 'Workflow design',
                    ]).map((tag: string) => (
                      <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── References & URLs ── */}
        {referenceUrls.length > 0 && (
          <section className={`${sectionA} py-16 print-page-break`}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor} print-blue-label`}>References</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Linked resources</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {referenceUrls.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{label}</p>
                      <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-400">{href}</p>
                    </div>
                    <ExternalLink size={14} className="shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Asset gallery ── */}
        {imageAssets.length > 1 && (
          <section className={`${sectionB} py-16`}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Assets</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Uploaded artifacts</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {imageAssets.map((asset, i) => {
                  const src = getAssetImage(asset);
                  return (
                    <SwappableImage
                      key={i} src={src} alt={asset.name} slotKey={`gallery-${i}`}
                      className="h-48 w-full rounded-xl object-cover"
                      overrides={imageOverrides} onSwap={handleSwapImage} onExpand={setSelectedImage}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Community Reflections (published only) ── */}
        {isPublished && !isMinimal && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${labelColor}`}>Community</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-slate-950">Team reflections</h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-500">
                A space for designers, strategists, and collaborators to share observations from this work.
              </p>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {[
                  ['"Strong systems-thinking approach."', 'Amina R.', 'Design Operations Partner'],
                  ['"Loved the ecosystem mapping work."', 'Marcus H.', 'Service Strategy Lead'],
                  ['"Excellent governance-led experience strategy."', 'Nina K.', 'Enterprise UX Director'],
                ].map(([quote, name, role]) => (
                  <div key={String(quote)} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="text-base leading-7 text-slate-800">{quote}</p>
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-slate-950">{name}</p>
                      <p className="text-xs text-slate-400">{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        </>)}
      </main>
    </div>
  );
}

export default function ShowcasePreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShowcasePreviewContent />
    </Suspense>
  );
}
