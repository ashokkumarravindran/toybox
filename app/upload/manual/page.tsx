'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ToyboxHeader from '@/app/components/ToyboxHeader';
import { saveFile } from '@/lib/idb';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type SolutionHighlight = { type: string; summary: string; images: File[] };
type ProjectArtifact   = { type: 'pdf' | 'ppt' | 'zip' | 'link'; name: string; value: string | File };

type FormData = {
  projectName: string;
  domain: string;
  engagementType: string;
  figmaLink: string;
  tags: string[];
  overview: string;
  challenge: string;
  solutionApproach: string;
  outcome: string;
  selectedHighlights: string[];
  solutionHighlights: SolutionHighlight[];
  projectArtifacts: ProjectArtifact[];
};

// ── Options ──────────────────────────────────────────────────────────────────

const domainOptions = [
  'Banking and Financial Services', 'Healthcare', 'Retail',
  'Manufacturing and Logistics', 'Insurance', 'Media and Entertainment',
  'Technology', 'Public Sector', 'Hospitality', 'Other',
];

const engagementOptions = [
  'UX Strategy', 'Customer Experience', 'Product Design', 'Service Design',
  'Design System', 'Research and Discovery', 'Marketing Experience',
  'Heuristic Evaluation', 'Point of View', 'Prototype', 'Case Study',
];

const suggestedTags = [
  'UX Audit', 'Research', 'Journey Map', 'Service Blueprint', 'Workflow Design',
  'Dashboard', 'Strategy', 'Accessibility', 'Storyboard', 'Concept Design',
  'Prototype', 'Design System', 'AI Experience',
];

const availableHighlights = [
  'Research and discovery', 'Personas', 'Journey map', 'Ecosystem map',
  'Service blueprint', 'Storyboards', 'High fidelity designs', 'Design system',
  'Usability testing', 'Heuristic evaluation', 'Prototype', 'Analytics dashboard',
  'Governance model', 'Content strategy', 'Accessibility review', 'Technical architecture',
];

// ── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Project details' },
  { id: 2, label: 'Narrative' },
  { id: 3, label: 'Highlights' },
  { id: 4, label: 'Assets' },
];

// ── Shared field styles ───────────────────────────────────────────────────────

const inputCls = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#005AFF] focus:ring-2 focus:ring-[#005AFF]/10 transition';
const labelCls = 'block text-sm font-medium text-slate-700';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function createThumb(file: File, maxWidth = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const w = Math.min(maxWidth, img.width);
        const h = Math.round(w / (img.width / img.height));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) return reject(new Error('Canvas error'));
        ctx.drawImage(img, 0, 0, w, h);
        c.toBlob((b) => b ? resolve(b) : reject(new Error('Blob error')), 'image/jpeg', 0.8);
      };
      img.onerror = reject;
      img.src = String(r.result);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function detectArtifactType(name: string): ProjectArtifact['type'] {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'ppt' || ext === 'pptx') return 'ppt';
  return 'zip';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function UploadManual() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    projectName: '', domain: '', engagementType: '', figmaLink: '',
    tags: [], overview: '', challenge: '', solutionApproach: '', outcome: '',
    selectedHighlights: [], solutionHighlights: [], projectArtifacts: [],
  });

  // ── Field helpers ─────────────────────────────────────────────────────────

  const set = (key: keyof FormData, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const toggleTag = (tag: string) => set('tags', form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);

  const toggleHighlight = (h: string) => {
    const active = form.selectedHighlights.includes(h);
    setForm((p) => ({
      ...p,
      selectedHighlights: active ? p.selectedHighlights.filter((x) => x !== h) : [...p.selectedHighlights, h],
      solutionHighlights: active
        ? p.solutionHighlights.filter((x) => x.type !== h)
        : [...p.solutionHighlights, { type: h, summary: '', images: [] }],
    }));
  };

  const updateHighlightSummary = (type: string, summary: string) =>
    setForm((p) => ({ ...p, solutionHighlights: p.solutionHighlights.map((h) => h.type === type ? { ...h, summary } : h) }));

  const addHighlightImages = (type: string, files: FileList | null) => {
    if (!files) return;
    setForm((p) => ({
      ...p,
      solutionHighlights: p.solutionHighlights.map((h) =>
        h.type === type ? { ...h, images: [...h.images, ...Array.from(files)] } : h
      ),
    }));
  };

  const addArtifacts = (files: FileList | null) => {
    if (!files) return;
    const entries: ProjectArtifact[] = Array.from(files).map((f) => ({ type: detectArtifactType(f.name), name: f.name, value: f }));
    setForm((p) => ({ ...p, projectArtifacts: [...p.projectArtifacts, ...entries] }));
  };

  // ── Step validation ───────────────────────────────────────────────────────

  const canAdvance = () => {
    if (step === 1) return form.projectName.trim() && form.domain && form.engagementType;
    if (step === 2) return form.overview.trim() && form.challenge.trim() && form.solutionApproach.trim();
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const slug = form.projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      let heroImage: string | null = null;
      const highlights = await Promise.all(
        form.solutionHighlights.map(async (h) => ({
          type: h.type, summary: h.summary,
          images: await Promise.all(h.images.map(async (file) => {
            const id = await saveFile(file, file.name);
            if (!heroImage) {
              try { const tb = await createThumb(file, 800); heroImage = await saveFile(tb, `thumb-${file.name}`); } catch {}
            }
            return id;
          })),
        }))
      );

      const artifacts = await Promise.all(
        form.projectArtifacts.map(async (a) => {
          if (typeof a.value === 'string') return { ...a };
          const id = await saveFile(a.value as File, a.name);
          return { type: a.type, name: a.name, value: id } as ProjectArtifact;
        })
      );

      const showcase = {
        projectName: form.projectName, domain: form.domain,
        engagementType: form.engagementType, figmaLink: form.figmaLink,
        tags: form.tags, overview: form.overview, challenge: form.challenge,
        solutionApproach: form.solutionApproach, outcome: form.outcome,
        selectedHighlights: form.selectedHighlights,
        solutionHighlights: highlights, projectArtifacts: artifacts,
        heroImage, createdAt: Date.now(),
      };

      const STORAGE_KEY = 'toybox_generated_showcases';
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const uniqueSlug = existing.some((s: any) => s.slug === slug) ? `${slug}-${Date.now()}` : slug;
      localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...showcase, slug: uniqueSlug }, ...existing]));

      setToast('Showcase created — redirecting…');
      await new Promise((r) => setTimeout(r, 700));
      router.push(`/showcase/${uniqueSlug}`);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <ToyboxHeader transparent mode="contextual" backHref="/" backLabel="Discover" pageTitle="Create manually" />

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-24 z-[9999] rounded-xl border border-white/10 bg-slate-950 px-5 py-4 text-white shadow-2xl">
          <p className="text-sm font-semibold">{toast}</p>
        </div>
      )}

      {/* Page header — same dark pattern as AI upload page */}
      <div className="border-b border-white/8 bg-[#0A0A0F]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Showcase Studio</p>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-6xl">Create manually</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-400 leading-8">Build your showcase using a guided four-step form.</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">

        {/* Step indicator */}
        <div className="mb-10 flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className="flex items-center gap-2"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    step > s.id
                      ? 'text-white'
                      : step === s.id
                      ? 'text-white ring-4 ring-[#005AFF]/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                  style={step >= s.id ? { background: 'var(--slalom-blue)' } : {}}
                >
                  {step > s.id ? <Check size={12} /> : s.id}
                </div>
                <span className={`hidden text-xs font-medium sm:inline ${step === s.id ? 'text-slate-950' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 h-px w-8 flex-1 transition ${step > s.id ? 'bg-[#005AFF]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Project details ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-semibold">Project details</h2>
              <p className="mt-1 text-sm text-slate-500">Basic information about this project.</p>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className={labelCls}>Project name <span className="text-red-400">*</span></span>
                  <input
                    type="text"
                    value={form.projectName}
                    onChange={(e) => set('projectName', e.target.value)}
                    placeholder="e.g. Client Portal Redesign"
                    className={inputCls}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>Domain <span className="text-red-400">*</span></span>
                    <select value={form.domain} onChange={(e) => set('domain', e.target.value)} className={inputCls}>
                      <option value="">Select domain</option>
                      {domainOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Engagement type <span className="text-red-400">*</span></span>
                    <select value={form.engagementType} onChange={(e) => set('engagementType', e.target.value)} className={inputCls}>
                      <option value="">Select type</option>
                      {engagementOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className={labelCls}>Figma / prototype URL</span>
                  <input
                    type="url"
                    value={form.figmaLink}
                    onChange={(e) => set('figmaLink', e.target.value)}
                    placeholder="https://www.figma.com/file/..."
                    className={inputCls}
                  />
                </label>

                <div>
                  <span className={labelCls}>Tags</span>
                  <p className="mt-0.5 text-xs text-slate-400">Select all that apply</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          form.tags.includes(tag)
                            ? 'border-[#005AFF] bg-[#EEF3FF] text-[#005AFF]'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Narrative ── */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-semibold">Showcase narrative</h2>
            <p className="mt-1 text-sm text-slate-500">Tell the story of the project.</p>

            <div className="mt-6 space-y-5">
              {[
                { key: 'overview' as const, label: 'Overview', required: true, placeholder: 'Provide a brief overview of the project and its goals…' },
                { key: 'challenge' as const, label: 'Challenge', required: true, placeholder: 'Describe the core challenge or problem you were solving…' },
                { key: 'solutionApproach' as const, label: 'Solution approach', required: true, placeholder: 'Explain the design approach and key decisions made…' },
                { key: 'outcome' as const, label: 'Outcomes & impact', required: false, placeholder: 'Describe the measurable outcomes and business impact…' },
              ].map(({ key, label, required, placeholder }) => (
                <label key={key} className="block">
                  <span className={labelCls}>{label} {required && <span className="text-red-400">*</span>}</span>
                  <textarea
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className={inputCls}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Solution highlights ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-semibold">Solution highlights</h2>
              <p className="mt-1 text-sm text-slate-500">Select the deliverable areas that apply. Only selected sections will appear in the final showcase.</p>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableHighlights.map((h) => (
                  <button
                    key={h}
                    onClick={() => toggleHighlight(h)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                      form.selectedHighlights.includes(h)
                        ? 'border-[#005AFF] bg-[#EEF3FF] text-[#005AFF]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {form.solutionHighlights.length > 0 && (
              <div className="space-y-4">
                {form.solutionHighlights.map((h) => (
                  <div key={h.type} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-sm font-semibold text-slate-950">{h.type}</h3>
                    <textarea
                      value={h.summary}
                      onChange={(e) => updateHighlightSummary(h.type, e.target.value)}
                      placeholder="Briefly describe this section…"
                      rows={3}
                      className={`${inputCls} mt-3`}
                    />
                    <label className="mt-3 block">
                      <span className="text-xs font-medium text-slate-500">Supporting images</span>
                      <div className="relative mt-2">
                        <input
                          type="file" multiple accept=".png,.jpg,.jpeg,.webp"
                          onChange={(e) => addHighlightImages(h.type, e.target.files)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500 hover:border-slate-300 transition">
                          {h.images.length > 0 ? `${h.images.length} image(s) added` : 'Click or drag to upload images'}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {form.selectedHighlights.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">Select at least one highlight above to add details.</p>
            )}
          </div>
        )}

        {/* ── Step 4: Assets ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-semibold">Project artifacts</h2>
              <p className="mt-1 text-sm text-slate-500">Upload supporting files users can reference or download. Optional.</p>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">PDF · PPT · PPTX · ZIP</p>
                <div className="relative mt-3">
                  <input
                    type="file" multiple
                    onChange={(e) => addArtifacts(e.target.files)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center hover:border-slate-300 transition">
                    <p className="text-sm font-medium text-slate-700">Click or drag to upload project files</p>
                    <p className="mt-1 text-xs text-slate-400">Optional — PDF, PPT, ZIP, Figma links</p>
                  </div>
                </div>

                {form.projectArtifacts.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {form.projectArtifacts.map((a, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                        <span className="text-sm text-slate-700">{a.name}</span>
                        <button
                          onClick={() => setForm((p) => ({ ...p, projectArtifacts: p.projectArtifacts.filter((_, j) => j !== i) }))}
                          className="text-xs text-slate-400 hover:text-red-500 transition"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-sm font-semibold text-slate-950">Review before creating</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex gap-3"><dt className="w-32 shrink-0 text-slate-400">Project</dt><dd className="font-medium">{form.projectName || '—'}</dd></div>
                <div className="flex gap-3"><dt className="w-32 shrink-0 text-slate-400">Domain</dt><dd>{form.domain || '—'}</dd></div>
                <div className="flex gap-3"><dt className="w-32 shrink-0 text-slate-400">Type</dt><dd>{form.engagementType || '—'}</dd></div>
                <div className="flex gap-3"><dt className="w-32 shrink-0 text-slate-400">Highlights</dt><dd>{form.selectedHighlights.length} selected</dd></div>
                <div className="flex gap-3"><dt className="w-32 shrink-0 text-slate-400">Artifacts</dt><dd>{form.projectArtifacts.length} files</dd></div>
              </dl>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft size={15} /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => canAdvance() && setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition ${canAdvance() ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'}`}
              style={{ background: 'var(--slalom-blue)' }}
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.projectName.trim()}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition ${submitting || !form.projectName.trim() ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{ background: 'var(--slalom-blue)' }}
            >
              {submitting ? 'Creating…' : 'Create showcase'} {!submitting && <Check size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
