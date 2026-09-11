'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Download, Sparkles, CheckCircle2, AlertCircle, Clock, Database, Zap, FileText, ArrowRight, Search, Brain, Lightbulb, Target, Globe, TrendingUp, Layers, PenLine, Link2, Users, LayoutTemplate, Scissors } from 'lucide-react';
import ToyboxHeader from '@/app/components/ToyboxHeader';
import { extractArtifacts, mergeIntoShelf } from '@/lib/extractArtifacts';

type ExaReadiness = 'high' | 'medium' | 'low';
type FitScore = 1 | 2 | 3 | 4 | 5;
type ImportStatus = 'idle' | 'loading' | 'done' | 'error';

type ImportStats = {
  previewId: string;
  title: string;
  domain: string;
  personaCount: number;
  personaNames: string[];
  shelfCount: number;
  shelfCategories: string[];
  tags: string[];
};

type Candidate = {
  id: string;
  fileName: string;
  sourcePath: string;
  client: string;
  engagementType: string;
  vertical: 'Financial Services' | 'Insurance';
  lastModified: string;
  fileType: string;
  fitScore: FitScore;
  exaReadiness: ExaReadiness;
  toyboxFitReason: string;
  exaReason: string;
  gemSignals: string[];
  artifacts: string[];
  status: 'ready' | 'needs-review' | 'proposal';
  webUrl: string;
};

const REVIEW_FACTS = [
  { Icon: Brain, text: 'The average user forms a first impression of a digital interface in just 50 milliseconds — before they\'ve read a single word.' },
  { Icon: Target, text: 'Fitts\'s Law (1954): the time to reach a target depends on its size and distance. It still governs every button placement in modern UI design.' },
  { Icon: Users, text: 'Nielsen\'s research shows that 5 usability test participants uncover ~85% of usability problems. More participants rarely reveal proportionally more issues.' },
  { Icon: Lightbulb, text: 'The "7±2" rule by George Miller (1956) found that working memory can hold roughly 7 chunks of information. Good UX design respects this cognitive limit.' },
  { Icon: Layers, text: 'The Gestalt principle of proximity means users group nearby elements together automatically — layout alone communicates relationships without a word of copy.' },
  { Icon: Zap, text: 'The Doherty Threshold: if a system responds in under 400ms, users enter a state of flow. Above that, they start multitasking — and rarely come back focused.' },
  { Icon: Globe, text: 'Eye-tracking studies show Western users typically scan screens in an F-pattern: two horizontal sweeps across the top, then a vertical scan down the left edge.' },
  { Icon: TrendingUp, text: 'The ROI of UX: IBM found that every $1 invested in UX returns $100. Fixing a usability problem after launch costs 100× more than catching it in design.' },
  { Icon: PenLine, text: 'Don Norman coined "user experience" at Apple in 1993. He wanted a term broader than "usability" — one that included emotion, meaning, and the whole system.' },
  { Icon: Search, text: 'Hick\'s Law: doubling the number of choices increases decision time logarithmically. Every extra option in a menu has a measurable cost to the user.' },
  { Icon: Link2, text: 'The Von Restorff effect: items that stand out are more memorable. That\'s why a single CTA on a page outperforms five equally-styled ones every time.' },
  { Icon: FileText, text: 'Reading on screens is ~25% slower than reading on paper. Users don\'t read — they scan. Short paragraphs and bold key terms are accessibility, not style.' },
  { Icon: LayoutTemplate, text: 'The Aesthetic-Usability Effect: users perceive visually pleasing designs as more usable, even when they\'re functionally identical to plainer alternatives.' },
  { Icon: Scissors, text: 'Jakob\'s Law: users spend most of their time on other sites. They expect your site to work the same way. Convention beats originality in navigation.' },
];

const candidates: Candidate[] = [
  {
    id: 'wex-onboarding',
    fileName: 'WEX Onboarding New Customers — Case Study',
    sourcePath: 'Capability-CX / CX Library / Transforming Onboarding of New Customers',
    client: 'WEX Inc.',
    engagementType: 'CX Strategy + Implementation',
    vertical: 'Financial Services',
    lastModified: 'Aug 28, 2025',
    fileType: 'pptx',
    fitScore: 5,
    exaReadiness: 'high',
    toyboxFitReason:
      'Explicitly structured as a case study with a full customer lifecycle map, two-phase engagement arc (strategic recommendations → implementation), named team, and clear scope boundaries. The cleanest Toybox candidate in the CX Library.',
    exaReason:
      'The CX onboarding pattern — first 90-120 days, digital touchpoints, billing cycle monitoring — is directly transferable to any financial services client improving post-sale retention. Anonymizable and industry-portable.',
    gemSignals: [
      'Full challenge → approach → outcome narrative arc',
      'Extractable customer lifecycle map (8-stage pre/post-sale)',
      'Measurable engagement scope (6-month, two-phase)',
      'Persona-level detail on Small Business segment',
    ],
    artifacts: ['Customer lifecycle map', 'Onboarding journey (first 90 days)', 'CX recommendations deck', 'Implementation plan'],
    status: 'ready',
    webUrl: 'https://twodegrees1.sharepoint.com/sites/Capability-CX/CX Library/Transforming Onboarding of New Customers/WEX Onboarding New Customers - Case Study_Santiago Caicedo.pptx',
  },
  {
    id: 'fs-story-collection',
    fileName: 'Financial Services Story Collection',
    sourcePath: 'Salesforce Go-to-Market Content Center / Shared Documents',
    client: 'Multiple FS Clients',
    engagementType: 'CX Transformation · Multi-client',
    vertical: 'Financial Services',
    lastModified: 'Dec 3, 2025',
    fileType: 'pptx',
    fitScore: 4,
    exaReadiness: 'high',
    toyboxFitReason:
      'A curated compilation of multiple FS client stories in one deck. High vertical coverage across banking, payments, and wealth management. Requires curation to split into individual showcases — some stories are flagged internal-use-only and need client name masking.',
    exaReason:
      'Multiple anonymized engagement patterns across FS sub-verticals makes this a strong ExA knowledge source. Pattern density (many engagements, same vertical) is exactly what the accelerator needs to generate credible proposals.',
    gemSignals: [
      'Multi-client FS story collection — high pattern density',
      'Covers banking, payments, and wealth management sub-verticals',
      'Stories pre-formatted for sales use — already pitch-ready',
      'Anonymization guidance included in the deck',
    ],
    artifacts: ['Individual FS client stories', 'Impact metrics per engagement', 'Solution approach summaries'],
    status: 'needs-review',
    webUrl: 'https://twodegrees1.sharepoint.com/teams/SalesforceGo-to-MarketContentCenter/Shared Documents/Financial Services Story Collection.pptx',
  },
  {
    id: 'nyl-cx-transform',
    fileName: 'New York Life — CX Transform Proposal Response',
    sourcePath: 'NewYorkLifeCXRFP / NYL RFP July 2026 / Response Materials',
    client: 'New York Life Insurance',
    engagementType: 'CX Strategy & Brand-to-Experience Translation',
    vertical: 'Insurance',
    lastModified: 'Aug 12, 2026',
    fileType: 'pptx',
    fitScore: 4,
    exaReadiness: 'high',
    toyboxFitReason:
      "Rich CX methodology deck anchored to a named insurance client. Contains a Brand-to-Experience framework, experience principles, advisor persona (Sarah), and 'moments that matter' mapping. Strong narrative and visual structure — ideal for Toybox's cinematic showcase format.",
    exaReason:
      'The Brand-to-Experience Translation framework is the most reusable asset here — directly applicable to any insurance or financial services CX pitch. Experience principles + persona + journey moments = a complete ExA building block.',
    gemSignals: [
      'Brand-to-Experience framework (reusable methodology)',
      'Named advisor persona with full context and behavioral signals',
      '"Moments that matter" customer journey mapping',
      'Experience principles that map to any life insurance client',
    ],
    artifacts: ['Brand positioning pyramid', 'Experience principles', 'Advisor persona (Sarah)', 'Moments that matter map'],
    status: 'needs-review',
    webUrl: 'https://twodegrees1.sharepoint.com/teams/NewYorkLifeCXRFP/Shared Documents/New York Life CX RFP/NYL RFP July 2026/Response Materials/02 - NYL CX RFP Transform Proposal Response.pptx',
  },
  {
    id: 'frankenmuth-cx',
    fileName: 'Frankenmuth Insurance — CX Digital Strategy',
    sourcePath: 'NewYorkLifeCXRFP / Client Stories',
    client: 'Frankenmuth Mutual Insurance',
    engagementType: 'CX Strategy Proposal · P&C Insurance',
    vertical: 'Insurance',
    lastModified: 'Jul 14, 2026',
    fileType: 'pptx',
    fitScore: 3,
    exaReadiness: 'medium',
    toyboxFitReason:
      'A P&C insurance CX strategy proposal with solid methodology — service-centric CX framework, work plan, and sample deliverables. Not a completed case study (no outcomes data yet — engagement in progress as of July 2026). Strong approach content, but needs outcome data before full Toybox publish.',
    exaReason:
      'Good for CX approach patterns in P&C insurance. The methodology section (insurance, P&C, service-centric CX) is reusable. Weaker on proof points — no measurable impact yet. Best used as an approach reference, not a results story.',
    gemSignals: [
      'P&C insurance-specific CX methodology',
      'Service-centric experience framework',
      'Structured work plan with sample deliverables',
      'Active engagement — content will strengthen over time',
    ],
    artifacts: ['P&C CX methodology', 'Work plan', 'Sample deliverables', 'Team and investment overview'],
    status: 'proposal',
    webUrl: 'https://twodegrees1.sharepoint.com/teams/NewYorkLifeCXRFP/Shared Documents/New York Life CX RFP/NYL RFP July 2026/Client Stories/Frankenmuth CX Digital Strategy Response Final.pptx',
  },
];

const verticalColors: Record<string, { bg: string; text: string; border: string }> = {
  'Financial Services': { bg: 'rgba(0,90,255,0.08)', text: '#005AFF', border: 'rgba(0,90,255,0.2)' },
  Insurance: { bg: 'rgba(16,128,80,0.08)', text: '#108050', border: 'rgba(16,128,80,0.2)' },
};

const exaColors: Record<ExaReadiness, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: 'High',   color: '#166534', bg: 'rgba(22,101,52,0.08)',   border: 'rgba(22,101,52,0.2)'  },
  medium: { label: 'Medium', color: '#92400e', bg: 'rgba(146,64,14,0.08)',  border: 'rgba(146,64,14,0.2)' },
  low:    { label: 'Low',    color: '#991b1b', bg: 'rgba(153,27,27,0.08)',  border: 'rgba(153,27,27,0.2)' },
};

const statusConfig = {
  ready:         { icon: CheckCircle2, label: 'Ready to import', color: '#166534', bg: 'rgba(22,101,52,0.08)', border: 'rgba(22,101,52,0.2)' },
  'needs-review':{ icon: AlertCircle,  label: 'Needs review',    color: '#92400e', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.2)' },
  proposal:      { icon: Clock,        label: 'Proposal — no outcomes yet', color: '#475569', bg: 'rgba(71,85,105,0.08)', border: 'rgba(71,85,105,0.2)' },
};

function FitDots({ score }: { score: FitScore }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-2 w-2 rounded-full" style={{ background: i <= score ? '#005AFF' : '#E2E8F0' }} />
      ))}
    </div>
  );
}

async function saveAndPublish(showcase: any, candidateId: string, sourceFile?: { name: string; webUrl: string }): Promise<ImportStats> {
  const db: IDBDatabase = await new Promise((res, rej) => {
    const req = indexedDB.open('toybox-db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('showcases', { keyPath: 'id' });
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

  const previewId = `sharepoint-${candidateId}-${Date.now()}`;

  const uploadedAssets = sourceFile
    ? [{
        name: sourceFile.name,
        type: 'application/vnd.ms-powerpoint',
        category: 'pdf',
        url: sourceFile.webUrl,
        src: sourceFile.webUrl,
        previewUrl: '',
      }]
    : [];

  const heroImage = '';

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
    domain: showcase.domain || '',
    heroImage,
    previewId,
    tags: showcase.suggestedTags || [],
    publishedAt: new Date().toISOString(),
    source: 'sharepoint',
  };

  const existing = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');
  const safe = existing.filter((item: any) => item.id !== previewId).map((item: any) => ({
    id: item.id, title: item.title, subtitle: item.subtitle, domain: item.domain,
    heroImage: item.heroImage, publishedAt: item.publishedAt, tags: item.tags || [], previewId: item.previewId,
  }));
  localStorage.setItem('toyboxPublishedShowcases', JSON.stringify([publishedCard, ...safe]));

  const extracted = extractArtifacts({
    showcase,
    showcaseId: previewId,
    previewId,
    projectName: publishedCard.title,
    domain: publishedCard.domain,
    publishedAt: publishedCard.publishedAt,
  });
  const existingShelf = JSON.parse(localStorage.getItem('toyboxShelfArtifacts') || '[]');
  const merged = mergeIntoShelf(existingShelf, extracted);
  localStorage.setItem('toyboxShelfArtifacts', JSON.stringify(merged));

  return {
    previewId,
    title: publishedCard.title,
    domain: publishedCard.domain,
    personaCount: showcase.personas?.length || 0,
    personaNames: (showcase.personas || []).map((p: any) => p.name).filter(Boolean),
    shelfCount: extracted.length,
    shelfCategories: [...new Set(extracted.map((a: any) => a.category))] as string[],
    tags: showcase.suggestedTags || [],
  };
}

const categoryLabels: Record<string, string> = {
  'personas': 'Personas',
  'journey-maps': 'Journey Maps',
  'service-blueprints': 'Service Blueprints',
  'ecosystem-maps': 'Ecosystem Maps',
  'storyboards': 'Storyboards',
  'heuristic-checklists': 'Heuristic Checklists',
};

function GeneratingOverlay({ candidateName }: { candidateName: string }) {
  const [factIdx, setFactIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setFactIdx(prev => {
        let next = Math.floor(Math.random() * REVIEW_FACTS.length);
        if (next === prev % REVIEW_FACTS.length) next = (next + 1) % REVIEW_FACTS.length;
        return next;
      });
    }, 7500);
    return () => clearInterval(iv);
  }, []);

  const { Icon, text } = REVIEW_FACTS[factIdx % REVIEW_FACTS.length];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-3xl p-10 text-center" style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="relative mx-auto mb-8 w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#005AFF] animate-spin" style={{ animationDuration: '1.2s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={24} style={{ color: '#DCFF00' }} />
          </div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#DCFF00' }}>Generating Showcase</p>
        <h3 className="text-xl font-semibold text-white mb-2">{candidateName}</h3>
        <p className="text-white/40 text-sm mb-10">Reading from SharePoint, extracting personas, insights, and impact…</p>
        <div className="rounded-2xl px-6 py-5 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5" style={{ background: 'rgba(220,255,0,0.12)' }}>
              <Icon size={17} style={{ color: '#DCFF00' }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#DCFF00' }}>Did you know?</p>
              <p className="text-sm text-white/60 leading-6">{text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ c }: { c: Candidate }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const vc = verticalColors[c.vertical];
  const ec = exaColors[c.exaReadiness];
  const sc = statusConfig[c.status];
  const StatusIcon = sc.icon;

  async function handleReview() {
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch('/api/import-from-sharepoint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ candidateId: c.id }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Generation failed');
      sessionStorage.setItem('toyboxReviewShowcase', JSON.stringify({
        candidateId: c.id,
        showcase: data.showcase,
        sourceFile: data.sourceFile,
        candidateMeta: { fileName: c.fileName, client: c.client, engagementType: c.engagementType, vertical: c.vertical },
      }));
      router.push('/admin/review');
    } catch (e: any) {
      setGenError(e.message || 'Generation failed — please retry.');
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white flex flex-col shadow-sm" style={{ borderColor: '#E8EDF5' }}>
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: vc.bg, color: vc.text, border: `1px solid ${vc.border}` }}>
              {c.vertical}
            </span>
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: '#F1F5F9', color: '#94A3B8' }}>
              <FileText size={10} />{c.fileType.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <StatusIcon size={11} />{sc.label}
          </div>
        </div>

        <h3 className="text-[15px] font-semibold text-slate-900 leading-snug mb-1">{c.fileName}</h3>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[12px] font-semibold text-slate-700">{c.client}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[12px] text-slate-500">{c.engagementType}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{c.sourcePath}</p>

        <div className="flex items-center gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Toybox Fit</p>
            <FitDots score={c.fitScore} />
          </div>
          <div className="w-px h-6 bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">ExA Readiness</p>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ec.bg, color: ec.color, border: `1px solid ${ec.border}` }}>
              {ec.label}
            </span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="px-5 pb-4 flex-1">
        <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(0,90,255,0.04)', border: '1px solid rgba(0,90,255,0.12)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} style={{ color: '#005AFF' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#005AFF' }}>Why Toybox</p>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-600">{c.toyboxFitReason}</p>
        </div>
        <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(16,128,80,0.04)', border: '1px solid rgba(16,128,80,0.12)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={11} style={{ color: '#108050' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#108050' }}>ExA Compatibility</p>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-600">{c.exaReason}</p>
        </div>

        {expanded && (
          <>
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Highlights</p>
              <ul className="space-y-1.5">
                {c.gemSignals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                    <div className="mt-1.5 h-1 w-1 rounded-full bg-[#005AFF] shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Extractable Artifacts</p>
              <div className="flex flex-wrap gap-1.5">
                {c.artifacts.map((a, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-[11px] text-slate-500" style={{ background: '#F1F5F9' }}>{a}</span>
                ))}
              </div>
            </div>
          </>
        )}
        <button onClick={() => setExpanded(e => !e)} className="mt-3 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition">
          {expanded ? '↑ Show less' : '↓ Show highlights & artifacts'}
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: '#F1F5F9' }}>
        {genError && <p className="text-[11px] text-red-500">{genError}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={c.status !== 'proposal' ? handleReview : undefined}
            disabled={c.status === 'proposal' || generating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: c.status === 'proposal' ? '#CBD5E1' : '#005AFF' }}
          >
            {c.status === 'proposal' ? 'Pending Outcomes' : 'Review & Import'}
          </button>
          <a href={c.webUrl} download className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 hover:text-slate-700 transition" style={{ background: '#F8FAFC' }} title="Download source file">
            <Download size={14} />
          </a>
        </div>
      </div>
      {generating && <GeneratingOverlay candidateName={c.client} />}
    </div>
  );
}

export default function AdminPage() {
  const ready = candidates.filter(c => c.status === 'ready').length;
  const review = candidates.filter(c => c.status === 'needs-review').length;

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <ToyboxHeader darkMode={false} />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={13} style={{ color: '#005AFF' }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">SharePoint Intelligence Feed</h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            AI-surfaced content candidates from Slalom's SharePoint. Each file has been scored for Toybox fit and ExA compatibility. Review, approve, and import to grow the knowledge base.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 rounded-2xl border bg-white px-6 py-4 mb-8 shadow-sm" style={{ borderColor: '#E8EDF5' }}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Candidates</p>
            <p className="text-2xl font-bold text-slate-900">{candidates.length}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Ready to import</p>
            <p className="text-2xl font-bold" style={{ color: '#166534' }}>{ready}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Needs review</p>
            <p className="text-2xl font-bold" style={{ color: '#92400e' }}>{review}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Verticals</p>
            <p className="text-2xl font-bold text-slate-900">2</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="ml-auto flex items-center gap-2 text-[12px] text-slate-400">
            <Database size={12} />
            Last scanned: Today, 9:00 AM
          </div>
        </div>

        {/* Vertical sections */}
        {(['Financial Services', 'Insurance'] as const).map(vertical => (
          <div key={vertical} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-sm font-semibold text-slate-500">{vertical}</h2>
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-[11px] text-slate-400">{candidates.filter(c => c.vertical === vertical).length} candidates</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {candidates.filter(c => c.vertical === vertical).map(c => (
                <CandidateCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        ))}

        {/* Roadmap callout */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#E8EDF5' }}>
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(0,90,255,0.08)' }}>
              <Zap size={18} style={{ color: '#005AFF' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Automated weekly scanning — coming next</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl">
                Beyond MVP, a weekly batch job will scan Slalom's SharePoint, score every document across five highlights — narrative completeness, artifact density, impact evidence, reusability potential, and vertical alignment — and surface the highest-scoring candidates here for admin review automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
