'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Search, Bell, Sun, Moon, Bookmark, Pause, Play, ChevronRight, ArrowRight } from 'lucide-react';

type RepositoryCard = {
  id: string;
  title: string;
  type: string;
  creator: string;
  rating: number;
  assetFolder?: string;
  heroImage?: string | null;
  previewPayload?: any;
  __generated?: boolean;
  isNew?: boolean;
};

type ShelfItem = {
  id: string;
  title: string;
  type: string;
  count: string;
  href: string;
};

type CarouselSlide = {
  id: string;
  title: string;
  description: string;
  type: string;
  domain: string;
  gradient: string;
};

const repositoryCards: RepositoryCard[] = [
  { id: '2', title: 'Index Composer', type: 'Enterprise Platform', creator: 'Financial Services', rating: 4.7, assetFolder: 'curated/indexComposer', heroImage: '/assets/curated/indexComposer/Preview.png' },
  { id: '1', title: 'Claims Processing', type: 'Workflow Transformation', creator: 'Insurance', rating: 4.8, assetFolder: 'curated/claimsProcessing' },
  { id: '3', title: 'Client Dashboard', type: 'Customer Experience', creator: 'Banking', rating: 4.7, assetFolder: 'curated/clientDashboard' },
  { id: '4', title: 'Next Generation Casino Experience', type: 'Experience Concept', creator: 'Hospitality', rating: 4.8, assetFolder: 'curated/casinoExperience' },
  { id: '5', title: 'Parent Portal — State of New York', type: 'Public Sector', creator: 'Government', rating: 4.7, assetFolder: 'curated/nyParentPortal' },
  { id: '6', title: 'Intranet SharePoint Experience', type: 'Employee Experience', creator: 'Internal Services', rating: 4.6, assetFolder: 'curated/intranetSharePoint' },
];

const cardGradients = [
  'linear-gradient(135deg, #0e1628 0%, #1a2a4a 100%)',
  'linear-gradient(135deg, #0a1020 0%, #18203a 100%)',
  'linear-gradient(135deg, #180a1e 0%, #2a1238 100%)',
  'linear-gradient(135deg, #0a1a10 0%, #102a18 100%)',
  'linear-gradient(135deg, #1a1000 0%, #2a1c00 100%)',
  'linear-gradient(135deg, #001a1a 0%, #002a28 100%)',
];

const shelfItems: ShelfItem[] = [
  { id: '1', title: 'Personas', type: 'Research Artifacts', count: '12 templates', href: '/design-shelf/personas' },
  { id: '2', title: 'Journey Maps', type: 'Experience Mapping', count: '8 templates', href: '/design-shelf/journey-maps' },
  { id: '3', title: 'Service Blueprints', type: 'Service Design', count: '6 templates', href: '/design-shelf/service-blueprints' },
  { id: '4', title: 'Storyboards', type: 'Visual Narratives', count: '10 templates', href: '/design-shelf/storyboards' },
  { id: '5', title: 'Heuristic Checklists', type: 'Evaluation', count: '5 templates', href: '/design-shelf/heuristic-checklists' },
];

const carouselSlides: CarouselSlide[] = [
  { id: '1', title: 'Index Composer', description: 'Unified index creation platform that brings people, process, and tools together across financial services.', type: 'Enterprise Platform', domain: 'Financial Services', gradient: 'linear-gradient(135deg, #0e1628 0%, #1a2a4a 100%)' },
  { id: '2', title: 'Claims Processing System', description: 'Streamlined claims workflows through guided decisioning, operational visibility, and role-based task handling.', type: 'Workflow Transformation', domain: 'Insurance', gradient: 'linear-gradient(135deg, #180a1e 0%, #0A0A0F 100%)' },
  { id: '3', title: 'AI Workflow Library', description: 'Reusable AI-assisted workflow patterns for discovery, synthesis, decision support, and enterprise productivity.', type: 'AI Experience', domain: 'Cross-industry', gradient: 'linear-gradient(135deg, #001020 0%, #0A0A0F 100%)' },
];

const imageNames = ['thumbnail.png', 'cover.png', 'hero.png', 'Preview.png'];

function AssetImage({ folder, alt, className, fallback }: { folder?: string; alt: string; className?: string; fallback: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setIndex(0); setFailed(false); }, [folder]);

  if (!folder || failed) return <>{fallback}</>;
  return (
    <>
      {fallback}
      <img
        src={`/assets/${folder}/${imageNames[index]}`}
        alt={alt}
        className={className}
        onError={() => index < imageNames.length - 1 ? setIndex((p) => p + 1) : setFailed(true)}
      />
    </>
  );
}

const filters = ['All', 'Workflow', 'Experience', 'Customer', 'Strategy'];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<RepositoryCard[]>([]);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const t = setInterval(() => { if (!isPaused) setCurrentSlide((p) => (p + 1) % carouselSlides.length); }, 5000);
    return () => clearInterval(t);
  }, [isPaused]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('toyboxPublishedShowcases');
      if (!raw) return;
      const published = JSON.parse(raw) as any[];
      setGeneratedCards(published.map((item, i) => ({
        id: String(item.id || `gen-${i}`),
        title: item.title || 'Generated Showcase',
        type: item.domain || 'AI Generated',
        creator: item.domain || 'Toybox AI',
        rating: 4.9,
        heroImage: item.heroImage || null,
        previewPayload: item.previewPayload || null,
        __generated: true,
        isNew: i === 0,
      })));
      const latest = published[0];
      const isFresh = latest?.publishedAt && Date.now() - new Date(latest.publishedAt).getTime() < 12000;
      if (isFresh && !sessionStorage.getItem('toyboxPublishToastShown')) {
        setShowPublishToast(true);
        sessionStorage.setItem('toyboxPublishToastShown', 'true');
        setTimeout(() => setShowPublishToast(false), 3500);
      }
    } catch {}
  }, []);

  const allCards = [...generatedCards, ...repositoryCards];

  return (
    <div className={darkMode ? 'bg-[#0A0A0F] text-slate-100' : 'bg-white text-slate-950'}>

      {showPublishToast && (
        <div className="fixed right-6 top-20 z-[9999] rounded-xl border border-white/10 bg-[#0A0A0F] px-5 py-4 text-white shadow-2xl">
          <p className="text-sm font-semibold">Showcase published</p>
          <p className="mt-0.5 text-xs text-slate-400">Added to Curated Intelligence</p>
        </div>
      )}

      {/* ── Unified header (same component as all other pages) ── */}
      <header className={`no-print sticky top-0 z-50 border-b backdrop-blur-xl ${darkMode ? 'border-white/8 bg-[#0A0A0F]/92' : 'border-slate-200/80 bg-white/96'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className={`text-[15px] font-bold tracking-[-0.02em] lowercase leading-none ${darkMode ? 'text-white' : 'text-slate-950'}`}>slalom</span>
            <span className={`text-sm ${darkMode ? 'text-white/25' : 'text-slate-300'}`}>|</span>
            <span className={`text-[15px] font-medium leading-none ${darkMode ? 'text-white/80' : 'text-slate-700'}`}>Toybox</span>
            <span className="ml-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest leading-none" style={{ background: 'var(--slalom-yellow)', color: '#0A0A0F' }}>Beta</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm sm:flex">
            {['Discover', 'Collections', 'Design Shelf'].map((label) => (
              <Link key={label} href={label === 'Design Shelf' ? '#design-shelf' : label === 'Collections' ? '#collections' : '/'} className={`font-medium transition ${label === 'Discover' ? (darkMode ? 'text-white' : 'text-slate-950') : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950')}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/upload" className="mr-2 hidden rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:flex" style={{ background: 'var(--slalom-blue)' }}>+ Add showcase</Link>
            <button className={`grid h-9 w-9 place-items-center rounded-lg transition ${darkMode ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Search size={16} /></button>
            <button onClick={() => setDarkMode(!darkMode)} className={`grid h-9 w-9 place-items-center rounded-lg transition ${darkMode ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button className={`grid h-9 w-9 place-items-center rounded-lg transition ${darkMode ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Bell size={16} /></button>
            <div className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--slalom-blue)' }}>A</div>
          </div>
        </div>
      </header>

      {/* ── Hero statement ── */}
      <section className={`py-20 sm:py-28 ${darkMode ? 'bg-[#0A0A0F]' : 'bg-white'}`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--slalom-blue)' }}>
              Experience Intelligence Platform
            </p>
            <h1 className={`mt-5 text-6xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-7xl ${darkMode ? 'text-white' : 'text-slate-950'}`}>
              Turn project work<br />into collective knowledge.
            </h1>
            <p className={`mt-6 max-w-2xl text-xl leading-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Upload artifacts from any engagement. Toybox AI builds the showcase.
              Every project becomes a reusable asset for the next one.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white hover:opacity-90" style={{ background: 'var(--slalom-blue)' }}>
                Add a showcase <ArrowRight size={15} />
              </Link>
              <a href="#gallery" className={`inline-flex items-center gap-2 rounded-lg border px-6 py-3.5 text-sm font-semibold transition ${darkMode ? 'border-white/12 text-white hover:bg-white/6' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                Browse gallery
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured carousel ── */}
      <section className="relative overflow-hidden" style={{ height: '80vh', minHeight: 520 }}>
        {carouselSlides.map((slide, i) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0" style={{ background: slide.gradient }} />
            <div className="absolute inset-0 bg-[#0A0A0F]/40" />
            {/* Slalom yellow accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'var(--slalom-yellow)' }} />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{slide.type} · {slide.domain}</p>
                <h2 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-6xl">{slide.title}</h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">{slide.description}</p>
                <div className="mt-8 flex gap-4">
                  <Link href="/showcase/index-composer" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white hover:opacity-90" style={{ background: 'var(--slalom-blue)' }}>
                    View showcase <ArrowRight size={14} />
                  </Link>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8">
                    Explore assets
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
          <div className="flex items-center gap-3 rounded-full bg-white/8 px-4 py-2.5 backdrop-blur">
            {carouselSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
            <div className="mx-1 h-4 w-px bg-white/20" />
            <button onClick={() => setIsPaused((p) => !p)} className="text-white/60 hover:text-white">
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
            </button>
          </div>
        </div>
      </section>

      {/* ── Curated Intelligence grid ── */}
      <section id="gallery" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--slalom-blue)' }}>Repository</p>
            <h2 className={`mt-2 text-3xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-950'}`}>Curated Intelligence</h2>
            <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Experience systems, workflows, and design solutions from real engagements.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${activeFilter === f ? 'border-transparent text-white' : darkMode ? 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                style={activeFilter === f ? { background: 'var(--slalom-blue)' } : {}}
              >{f}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allCards.map((card, idx) => (
            <div key={card.id}
              onClick={() => {
                if (card.__generated) {
                  if (card.previewPayload) {
                    localStorage.setItem('toyboxPreviewShowcase', JSON.stringify(card.previewPayload));
                    (window as any).__toyboxPreviewShowcase = card.previewPayload;
                  }
                  window.location.href = '/showcase/preview?mode=published';
                  return;
                }
                if (card.title === 'Index Composer') window.location.href = '/showcase/index-composer';
              }}
              className={`group cursor-pointer overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-lg ${darkMode ? 'border-white/8 bg-[#0A0A0F] hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="relative h-48 overflow-hidden" style={{ background: cardGradients[idx % cardGradients.length] }}>
                {card.__generated && (
                  <div className="absolute right-3 top-3 z-20 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#0A0A0F]" style={{ background: 'var(--slalom-yellow)' }}>New</div>
                )}
                {card.heroImage && <img src={card.heroImage} alt={card.title} className="absolute inset-0 h-full w-full object-cover" />}
              </div>
              <div className={`p-5 ${darkMode ? 'border-t border-white/8' : 'border-t border-slate-100'}`}>
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-950'}`}>{card.title}</h3>
                <p className={`mt-1 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{card.type}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className={darkMode ? 'text-slate-500' : 'text-slate-500'}>{card.creator}</span>
                  <div className="flex items-center gap-1"><span className="text-amber-400">★</span><span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{card.rating}</span></div>
                </div>
                <button className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${darkMode ? 'border border-white/8 text-slate-400 hover:bg-white/5 hover:text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <Bookmark size={12} /> Save
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button className={`inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition ${darkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-950 hover:bg-slate-50'}`}>
            Load more <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Design Shelf ── */}
      <section id="design-shelf" className={`border-t py-20 ${darkMode ? 'border-white/8 bg-[#0A0A0F]' : 'border-slate-100 bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--slalom-blue)' }}>Templates</p>
              <h2 className={`mt-2 text-3xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-950'}`}>Design Shelf</h2>
              <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reusable artifact templates organized by type and industry.</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {shelfItems.map((item, i) => (
              <Link key={item.id} href={item.href}
                className={`group w-56 flex-shrink-0 overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 ${darkMode ? 'border-white/8 bg-[#0E0E14] hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="relative h-32 overflow-hidden" style={{ background: cardGradients[i % cardGradients.length] }}>
                  <div className="absolute right-0 top-0 h-0.5 w-10" style={{ background: 'var(--slalom-yellow)' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold opacity-10 ${darkMode ? 'text-white' : 'text-white'}`}>{item.title[0]}</span>
                  </div>
                </div>
                <div className={`p-4 ${darkMode ? 'border-t border-white/8' : 'border-t border-slate-100'}`}>
                  <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-950'}`}>{item.title}</h3>
                  <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{item.type}</p>
                  <p className="mt-2 text-xs font-medium" style={{ color: 'var(--slalom-blue)' }}>{item.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`border-t py-24 ${darkMode ? 'border-white/8 bg-[#0A0A0F]' : 'border-slate-100 bg-white'}`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--slalom-blue)' }}>Contribute</p>
            <h2 className={`mt-4 text-4xl font-semibold tracking-[-0.03em] ${darkMode ? 'text-white' : 'text-slate-950'}`}>
              Share your work.<br />Strengthen the collective.
            </h2>
            <p className={`mt-5 text-lg leading-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Upload project artifacts and Toybox AI turns them into a publish-ready showcase in minutes.
            </p>
            <Link href="/upload" className="mt-8 inline-flex items-center gap-2 rounded-lg px-7 py-4 text-sm font-semibold text-white hover:opacity-90" style={{ background: 'var(--slalom-blue)' }}>
              Add a showcase <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
