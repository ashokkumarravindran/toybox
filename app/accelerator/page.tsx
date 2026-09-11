'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, Search, Brain, Scissors, Target, PenLine, Link2, LayoutTemplate, Lightbulb, Layers, Zap, Users, FileText, Globe, TrendingUp } from 'lucide-react';

const OUTPUT_TYPES = [
  { value: 'sales-pitch', label: 'Sales Pitch', description: 'Capabilities story for a new client meeting' },
  { value: 'design-blueprint', label: 'Design Blueprint', description: 'Thought starter with approach, personas & insights', comingSoon: true },
  { value: 'proposal-response', label: 'Proposal Response', description: 'Compelling narrative stitched from relevant experience for an RFP or formal bid', comingSoon: true },
];

const LOADING_FACTS = [
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
  { Icon: Link2, text: 'The Von Restorff effect: items that stand out are more memorable. It\'s why a single CTA on a page outperforms five equally-styled ones every time.' },
  { Icon: FileText, text: 'Reading on screens is ~25% slower than reading on paper. Users don\'t read — they scan. Short paragraphs, clear headers, and bold key terms are accessibility, not style.' },
  { Icon: LayoutTemplate, text: 'The Aesthetic-Usability Effect: users perceive visually pleasing designs as more usable, even when they\'re functionally identical to plainer alternatives.' },
  { Icon: Scissors, text: 'Jakob\'s Law: users spend most of their time on other sites. They expect your site to work the same way. Convention beats originality in navigation.' },
];

// Score a showcase for relevance against the user's inputs.
// Returns 0-100; anything below RELEVANCE_THRESHOLD is excluded.
const RELEVANCE_THRESHOLD = 10;
const MAX_KB_ENTRIES = 5; // cap how many showcases we send to the AI

function scoreShowcase(showcase: any, targetClient: string, goalContext: string): number {
  const needle = `${targetClient} ${goalContext}`.toLowerCase();
  const tokens = needle.split(/\W+/).filter((t) => t.length > 2);

  const haystack = [
    showcase.title || '',
    showcase.domain || '',
    showcase.overview || '',
    showcase.challenge || '',
    showcase.mission || '',
    showcase.impact || '',
    ...(showcase.suggestedTags || []),
    ...(showcase.personas || []).map((p: any) => `${p.name} ${p.role} ${p.need}`),
    ...(showcase.solutionHighlights || []).map((h: any) => `${h.heading} ${h.body}`),
  ].join(' ').toLowerCase();

  let score = 0;
  for (const token of tokens) {
    // Exact word match in domain/title is worth more
    const inTitle = (showcase.title || '').toLowerCase().includes(token);
    const inDomain = (showcase.domain || '').toLowerCase().includes(token);
    const inBody = haystack.includes(token);
    if (inTitle) score += 20;
    else if (inDomain) score += 15;
    else if (inBody) score += 5;
  }
  return score;
}

function getKnowledgeBase(): any[] {
  const kb: any[] = [];

  kb.push({
    title: 'Index Composer — Enterprise Platform',
    domain: 'Financial Services',
    overview: 'Unified index creation platform that seamlessly brings together people, process, and tools. Redesigning how a global index provider creates, governs, and maintains financial indices at enterprise scale.',
    challenge: 'A fragmented ecosystem of legacy tools, manual processes, and siloed teams made index creation slow, error-prone, and difficult to govern. Lifecycle visibility was poor, and downstream operational impacts were hard to trace.',
    mission: 'Design a unified platform that gives every stakeholder — from index designers to operations teams to governance leads — a single coherent place to do their work.',
    impact: 'Reduced index creation cycle time significantly, improved governance traceability, and enabled self-service for downstream consumers. Delivered a platform vision that unified 6 previously siloed tools.',
    personas: [
      { name: 'Index Designer', role: 'Financial Product Designer', need: 'Clear visibility into downstream impacts of index rule changes', painPoint: 'No way to model changes before committing to production', solutionSupport: 'Simulation workspace with live impact previews' },
      { name: 'Operations Lead', role: 'Index Production Manager', need: 'Reliable, auditable production workflows', painPoint: 'Manual handoffs and scattered approval chains cause delays', solutionSupport: 'Automated workflow orchestration with audit trail' },
      { name: 'Governance Officer', role: 'Index Governance & Compliance', need: 'End-to-end traceability of every index decision', painPoint: 'Governance evidence spread across emails, spreadsheets, and tickets', solutionSupport: 'Centralized governance log with automated evidence capture' },
    ],
    solutionHighlights: [
      { heading: 'Unified Workflow Orchestration', body: 'A single platform replacing 6 legacy tools with intelligent workflow routing, automated approvals, and real-time status visibility across the index lifecycle.' },
      { heading: 'Governance by Design', body: 'Built-in compliance checkpoints, automated audit trail capture, and exception-handling workflows — compliance as a feature, not a bolt-on.' },
      { heading: 'Ecosystem Mapping & Stakeholder Alignment', body: 'Service blueprint and ecosystem mapping work to surface hidden dependencies, align 12+ stakeholder groups, and define clear ownership boundaries.' },
    ],
    visualSections: [
      { sectionTitle: 'Index Creation Lifecycle', sectionType: 'journey-map', narrative: 'End-to-end journey mapping across all stakeholder groups from ideation through production.' },
    ],
    suggestedTags: ['enterprise-platform', 'financial-services', 'workflow-design', 'governance', 'service-design', 'ecosystem-mapping'],
    previewId: null,
    showcaseHref: '/showcase/index-composer',
  });

  try {
    const published = JSON.parse(localStorage.getItem('toyboxPublishedShowcases') || '[]');
    for (const p of published) {
      if (p.showcase) {
        kb.push({
          title: p.showcase.title || p.projectName,
          domain: p.showcase.domain || p.domain || '',
          overview: p.showcase.overview || '',
          challenge: p.showcase.challenge || '',
          mission: p.showcase.mission || '',
          impact: p.showcase.impact || '',
          personas: p.showcase.personas || [],
          solutionHighlights: p.showcase.solutionHighlights || [],
          visualSections: p.showcase.visualSections || [],
          suggestedTags: p.showcase.suggestedTags || [],
          previewId: p.id || null,
          showcaseHref: p.id ? `/showcase/preview?mode=published&previewId=${p.id}` : null,
        });
      }
    }
  } catch { /* ignore */ }

  return kb;
}

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

type PreviewData = {
  matchedSources: MatchedSource[];
  headline: string;
  subheadline: string;
  targetClient: string;
  outputType: string;
};

function LoadingModal({ factIndex, progress }: { factIndex: number; progress: number }) {
  const fact = LOADING_FACTS[factIndex % LOADING_FACTS.length];
  const { Icon } = fact;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-2xl border border-slate-100">
        {/* Spinner */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#005AFF]" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
          Experience Accelerator
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Searching Toybox…</h3>
        <p className="mt-2 text-sm text-slate-500 leading-6">
          Finding the most relevant experience and crafting a tailored output for your client.
        </p>

        {/* Rotating fact */}
        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5" style={{ background: 'rgba(0,90,255,0.08)' }}>
              <Icon size={17} style={{ color: '#005AFF' }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#005AFF' }}>Did you know?</p>
              <p className="text-sm text-slate-600 leading-6">{fact.text}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ background: '#005AFF', width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Finding relevant experience and shaping your output…
        </p>
      </div>
    </div>
  );
}

function DiscoveryPreview({
  data,
  onViewFull,
  onRefine,
}: {
  data: PreviewData;
  onViewFull: () => void;
  onRefine: () => void;
}) {
  const outputLabel =
    data.outputType === 'sales-pitch' ? 'Sales Pitch'
    : data.outputType === 'design-blueprint' ? 'Design Blueprint'
    : 'Proposal Response';

  const highMatches = data.matchedSources.filter((s) => s.relevanceScore === 'High');
  const otherMatches = data.matchedSources.filter((s) => s.relevanceScore !== 'High');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-[15px] font-bold tracking-[-0.02em] lowercase text-slate-950">slalom</span>
            <span className="text-slate-300">|</span>
            <span className="text-[15px] font-medium text-slate-700">Toybox</span>
            <span className="ml-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ background: '#DCFF00', color: '#0A0A0F' }}>Beta</span>
          </Link>
          <button onClick={onRefine} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 transition">
            <ArrowLeft size={14} />
            Refine search
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Found indicator */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border" style={{ background: '#16A34A0D', color: '#16A34A', borderColor: '#16A34A33' }}>
          <CheckCircle2 size={14} />
          Toybox found {data.matchedSources.length} relevant showcase{data.matchedSources.length !== 1 ? 's' : ''}
        </div>

        <h1 className="text-4xl font-semibold tracking-[-0.03em] leading-[1.1] text-slate-950 mb-3">
          {data.headline}
        </h1>
        <p className="text-lg text-slate-500 leading-7 mb-12">{data.subheadline}</p>

        {/* Best fit sources */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
            {highMatches.length > 0 ? 'Best fit from Toybox' : 'Matched from Toybox'}
          </h2>
          <div className="space-y-4">
            {[...highMatches, ...otherMatches].map((src, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: src.relevanceScore === 'High' ? '#005AFF33' : '#e2e8f0',
                  background: src.relevanceScore === 'High' ? '#005AFF05' : '#fff',
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      {src.relevanceScore === 'High' && (
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: '#005AFF', color: '#fff' }}>
                          Best fit
                        </span>
                      )}
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-slate-200 text-slate-500">
                        {src.domain}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base leading-snug">{src.title}</h3>
                  </div>
                  {src.showcaseHref && (
                    <Link
                      href={src.showcaseHref}
                      target="_blank"
                      className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition border border-slate-200 rounded-lg px-3 py-1.5"
                    >
                      View in Toybox
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-6 mb-4">{src.relevanceReason}</p>

                <div className="rounded-xl px-4 py-3.5 border-l-4" style={{ background: '#F8FAFF', borderLeftColor: '#005AFF' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Key transfer</p>
                  <p className="text-sm text-slate-700 leading-5">{src.keyTransfer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-2xl p-8 border border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500 mb-6 text-center">
            Ready to see the full {outputLabel} for <span className="font-semibold text-slate-700">{data.targetClient}</span>?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRefine}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-medium text-slate-600 hover:text-slate-950 hover:border-slate-400 transition"
            >
              <RotateCcw size={14} />
              Refine search criteria
            </button>
            <button
              onClick={onViewFull}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition"
              style={{ background: '#005AFF' }}
            >
              View full {outputLabel}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AcceleratorPage() {
  const router = useRouter();
  const [targetClient, setTargetClient] = useState('');
  const [goalContext, setGoalContext] = useState('');
  const [outputType, setOutputType] = useState('sales-pitch');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'preview'>('idle');
  const [factIndex, setFactIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Randomly cycle through facts while loading (no repeated consecutive picks)
  useEffect(() => {
    if (phase !== 'loading') return;
    const interval = setInterval(() => {
      setFactIndex((prev) => {
        let next = Math.floor(Math.random() * LOADING_FACTS.length);
        if (next === prev % LOADING_FACTS.length) next = (next + 1) % LOADING_FACTS.length;
        return next;
      });
    }, 7500);
    return () => clearInterval(interval);
  }, [phase]);

  // Progress bar animation while loading
  useEffect(() => {
    if (phase !== 'loading') {
      setLoadingProgress(8);
      return;
    }
    const interval = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 92) return current;
        return Math.min(92, current + Math.random() * 5);
      });
    }, 900);
    return () => clearInterval(interval);
  }, [phase]);

  const handleGenerate = async () => {
    if (!targetClient.trim() || !goalContext.trim()) {
      setError('Please fill in the client name and describe the opportunity.');
      return;
    }
    setError('');
    setPhase('loading');
    setFactIndex(0);

    try {
      const allShowcases = getKnowledgeBase();

      // Pre-filter: score every showcase against the user's inputs, keep only relevant ones
      const scored = allShowcases
        .map((s) => ({ showcase: s, score: scoreShowcase(s, targetClient, goalContext) }))
        .filter(({ score }) => score >= RELEVANCE_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_KB_ENTRIES)
        .map(({ showcase }) => showcase);

      // Fallback: if nothing scored high enough, send the top-scored entry so the AI always has something to work with
      const knowledgeBase = scored.length > 0
        ? scored
        : allShowcases
            .map((s) => ({ showcase: s, score: scoreShowcase(s, targetClient, goalContext) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map(({ showcase }) => showcase);

      const res = await fetch('/api/generate-accelerator', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targetClient, goalContext, outputType, knowledgeBase }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Generation failed');

      sessionStorage.setItem('toyboxAcceleratorOutput', JSON.stringify({
        input: { targetClient, goalContext, outputType },
        output: data.accelerator,
        generatedAt: new Date().toISOString(),
      }));

      setPreviewData({
        matchedSources: data.accelerator.matchedSources || [],
        headline: data.accelerator.headline,
        subheadline: data.accelerator.subheadline,
        targetClient,
        outputType,
      });
      setPhase('preview');
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
      setPhase('idle');
    }
  };

  if (phase === 'preview' && previewData) {
    return (
      <DiscoveryPreview
        data={previewData}
        onViewFull={() => router.push('/accelerator/output')}
        onRefine={() => setPhase('idle')}
      />
    );
  }

  return (
    <>
      {phase === 'loading' && <LoadingModal factIndex={factIndex} progress={loadingProgress} />}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-[15px] font-bold tracking-[-0.02em] lowercase text-slate-950">slalom</span>
              <span className="text-slate-300">|</span>
              <span className="text-[15px] font-medium text-slate-700">Toybox</span>
              <span className="ml-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ background: '#DCFF00', color: '#0A0A0F' }}>Beta</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 transition">
              <ArrowLeft size={14} />
              Back to Toybox
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-6 py-16">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border" style={{ background: '#005AFF0D', color: '#005AFF', borderColor: '#005AFF33' }}>
            <Sparkles size={14} />
            Experience Accelerator
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-950 mb-4">
            Generate a client-ready<br />
            <span style={{ color: '#005AFF' }}>accelerator in seconds.</span>
          </h1>

          <p className="text-slate-500 text-lg leading-7 mb-12">
            Describe what you're trying to do — ExA searches Toybox for relevant experience and tailors the output for you.
          </p>

          <div className="space-y-6">
            {/* Output Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">What are you creating?</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {OUTPUT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => !t.comingSoon && setOutputType(t.value)}
                    disabled={!!t.comingSoon}
                    className="text-left rounded-xl border px-4 py-3.5 transition relative"
                    style={{
                      borderColor: t.comingSoon ? '#e2e8f0' : outputType === t.value ? '#005AFF' : '#e2e8f0',
                      background: t.comingSoon ? '#f8fafc' : outputType === t.value ? '#005AFF0A' : '#fff',
                      opacity: t.comingSoon ? 0.7 : 1,
                      cursor: t.comingSoon ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="mb-2">
                      <span className={`font-semibold text-sm ${!t.comingSoon && outputType === t.value ? 'text-[#005AFF]' : 'text-slate-700'}`}>{t.label}</span>
                      {!t.comingSoon && outputType === t.value && <div className="inline-block ml-2 w-2 h-2 rounded-full align-middle" style={{ background: '#005AFF' }} />}
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{t.description}</p>
                    {t.comingSoon && (
                      <span className="mt-3 inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ background: 'rgba(0,0,0,0.06)', color: '#94a3b8' }}>Coming soon</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Client / Prospect */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Client or prospect *</label>
              <input
                type="text"
                value={targetClient}
                onChange={(e) => setTargetClient(e.target.value)}
                placeholder="e.g. BlackRock, Santander, NHS England..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
              />
            </div>

            {/* Opportunity context */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Describe the opportunity *</label>
              <textarea
                value={goalContext}
                onChange={(e) => setGoalContext(e.target.value)}
                placeholder="e.g. BlackRock is exploring how to modernise their index lifecycle — we want to show relevant experience in enterprise platform design, governance, and stakeholder alignment to open a discovery conversation."
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition resize-none leading-relaxed"
              />
              <p className="mt-2 text-xs text-slate-400">Include the problem space, what you want to convey, and any relevant context. ExA will find the most applicable experience in Toybox and tailor the output.</p>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={phase === 'loading'}
              className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-semibold transition disabled:opacity-60"
              style={{ background: '#005AFF', color: '#fff' }}
            >
              <Sparkles size={18} />
              Generate accelerator
              <ArrowRight size={18} />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
