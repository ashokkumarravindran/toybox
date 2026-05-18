'use client';

import Link from 'next/link';
import { useState, useEffect, type ReactNode } from 'react';
import { Search, Bell, Sun, Moon, Bookmark, Pause } from 'lucide-react';


type RepositoryCard = {
  id: string;
  title: string;
  type: string;
  creator: string;
  rating: number;
  assetFolder: string;
  gradient: string;
  pattern: string;
};

type ShelfItem = {
  id: string;
  title: string;
  type: string;
  assetFolder: string;
  gradient: string;
};

type CarouselSlide = {
  id: string;
  title: string;
  description: string;
  type: string;
  domain: string;
  assetFolder: string;
  gradient: string;
  pattern: string;
};

const repositoryCards: RepositoryCard[] = [
  {
    id: '1',
    title: 'Claims Processing',
    type: 'Workflow Transformation',
    creator: 'Insurance',
    rating: 4.8,
    assetFolder: 'curated/claimsProcessing',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    pattern: 'radial-gradient(circle at 20% 50%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.1), transparent)',
  },
  {
    id: '2',
    title: 'Index Composer',
    type: 'Enterprise Platform',
    creator: 'Financial Services',
    rating: 4.7,
    assetFolder: 'curated/indexComposer',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    pattern: 'radial-gradient(circle at 30% 40%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 70% 70%, rgba(217,70,239,0.1), transparent)',
  },
  {
    id: '3',
    title: 'Client Dashboard',
    type: 'Customer Experience',
    creator: 'Banking',
    rating: 4.7,
    assetFolder: 'curated/clientDashboard',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    pattern: 'radial-gradient(circle at 25% 45%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 75% 75%, rgba(244,114,182,0.1), transparent)',
  },
  {
    id: '4',
    title: 'Next Generation Casino Experience',
    type: 'Experience Concept',
    creator: 'Hospitality',
    rating: 4.8,
    assetFolder: 'curated/casinoExperience',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    pattern: 'radial-gradient(circle at 28% 48%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 72% 72%, rgba(52,211,153,0.1), transparent)',
  },
  {
    id: '5',
    title: 'Parent Portal for State of New York',
    type: 'Public Sector',
    creator: 'Government',
    rating: 4.7,
    assetFolder: 'curated/nyParentPortal',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    pattern: 'radial-gradient(circle at 22% 52%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 78% 68%, rgba(251,191,36,0.1), transparent)',
  },
  {
    id: '6',
    title: 'Intranet SharePoint Experience',
    type: 'Employee Experience',
    creator: 'Internal Services',
    rating: 4.6,
    assetFolder: 'curated/intranetSharePoint',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
    pattern: 'radial-gradient(circle at 32% 42%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 68% 78%, rgba(2,132,199,0.1), transparent)',
  },
  {
    id: '7',
    title: 'Leading Hotels of the World Concept',
    type: 'Luxury Hospitality',
    creator: 'Travel',
    rating: 4.9,
    assetFolder: 'curated/leadingHotelsConcept',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    pattern: 'radial-gradient(circle at 35% 38%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 65% 72%, rgba(99,102,241,0.1), transparent)',
  },
  {
    id: '8',
    title: 'Life Insurance Consumer Portal',
    type: 'Self-Service',
    creator: 'Insurance',
    rating: 4.6,
    assetFolder: 'curated/lifeInsurancePortal',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    pattern: 'radial-gradient(circle at 40% 45%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 60% 75%, rgba(6,182,212,0.1), transparent)',
  },
  {
    id: '9',
    title: 'Planogramming Heuristic Evaluation',
    type: 'Heuristic Review',
    creator: 'Retail',
    rating: 4.7,
    assetFolder: 'curated/planogrammingHeuristic',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    pattern: 'radial-gradient(circle at 38% 52%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 62% 68%, rgba(190,24,93,0.1), transparent)',
  },
  {
    id: '10',
    title: 'Citizen Portal for State of Florida',
    type: 'Digital Government',
    creator: 'Public Services',
    rating: 4.8,
    assetFolder: 'curated/floridaCitizenPortal',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    pattern: 'radial-gradient(circle at 26% 48%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 74% 70%, rgba(217,119,6,0.1), transparent)',
  },
  {
    id: '11',
    title: 'Insurance Marketing Dashboard',
    type: 'Marketing Intelligence',
    creator: 'Insurance',
    rating: 4.9,
    assetFolder: 'curated/insuranceMarketingDashboard',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    pattern: 'radial-gradient(circle at 30% 50%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 70% 72%, rgba(5,150,105,0.1), transparent)',
  },
  {
    id: '12',
    title: 'Merchant Rate Review Application',
    type: 'Banking Workflow',
    creator: 'Financial Services',
    rating: 4.6,
    assetFolder: 'curated/merchantRateReview',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    pattern: 'radial-gradient(circle at 33% 46%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 67% 74%, rgba(168,85,247,0.1), transparent)',
  },
];

const shelfItems: ShelfItem[] = [
  { id: '1', title: 'Personas', type: 'Research', assetFolder: 'shelf/personas', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
  { id: '2', title: 'Journey Maps', type: 'Mapping', assetFolder: 'shelf/journeyMaps', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' },
  { id: '3', title: 'Service Blueprints', type: 'Framework', assetFolder: 'shelf/serviceBlueprints', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { id: '4', title: 'Storyboards', type: 'Visual', assetFolder: 'shelf/storyboards', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
  { id: '5', title: 'Heuristic Checklists', type: 'Evaluation', assetFolder: 'shelf/heuristicChecklists', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' },
];

const carouselSlides: CarouselSlide[] = [
  {
    id: '1',
    title: 'Index Composer',
    description: 'Unified index creation platform that brings people, process, and tools together.',
    type: 'Enterprise Platform',
    domain: 'Financial Services',
    assetFolder: 'featured/indexComposer',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0284c7 100%)',
    pattern: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)',
  },
  {
    id: '2',
    title: 'Claims Processing System',
    description: 'Streamlined claims workflows through guided decisioning, operational visibility, and role-based task handling.',
    type: 'Workflow Transformation',
    domain: 'Insurance',
    assetFolder: 'featured/claimsProcessing',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    pattern: 'radial-gradient(circle at 30% 40%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 70% 70%, rgba(217,70,239,0.1), transparent)',
  },
  {
    id: '3',
    title: 'Client Onboarding Solution',
    description: 'End-to-end onboarding experience designed to simplify complex client setup, documentation, and service activation.',
    type: 'Customer Experience',
    domain: 'Banking',
    assetFolder: 'featured/clientOnboarding',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    pattern: 'radial-gradient(circle at 25% 45%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 75% 75%, rgba(244,114,182,0.1), transparent)',
  },
  {
    id: '4',
    title: 'AI Workflow Library',
    description: 'Reusable AI-assisted workflow patterns for discovery, synthesis, decision support, and enterprise productivity.',
    type: 'AI Experience',
    domain: 'Cross-industry',
    assetFolder: 'featured/aiWorkflowLibrary',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    pattern: 'radial-gradient(circle at 28% 48%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 72% 72%, rgba(52,211,153,0.1), transparent)',
  },
  {
    id: '5',
    title: 'Experience Operations Platform',
    description: 'A concept system for connecting design signals, service health, and operational insights into one experience layer.',
    type: 'Experience Strategy',
    domain: 'Enterprise Operations',
    assetFolder: 'featured/experienceOpsPlatform',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    pattern: 'radial-gradient(circle at 22% 52%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 78% 68%, rgba(251,191,36,0.1), transparent)',
  },
  {
    id: '6',
    title: 'Governance Blueprint',
    description: 'Reusable governance patterns for aligning stakeholders, workflows, decision rights, and delivery rituals.',
    type: 'Strategy Framework',
    domain: 'Cross-industry',
    assetFolder: 'featured/governanceBlueprint',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
    pattern: 'radial-gradient(circle at 32% 42%, rgba(15,23,42,0.8), transparent), radial-gradient(circle at 68% 78%, rgba(2,132,199,0.1), transparent)',
  },
];

const imageNames = ['thumbnail.png', 'cover.png', 'hero.png', 'preview.png'];

type AssetImageProps = {
  folder: string;
  alt: string;
  className?: string;
  style?: Record<string, string>;
  fallback: React.ReactNode;
};

function AssetImage({ folder, alt, className, style, fallback }: AssetImageProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = `/assets/${folder}/${imageNames[index]}`;

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [folder]);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (index < imageNames.length - 1) {
          setIndex((prev) => prev + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }
    }, 5000); // 5 seconds autoplay
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className={darkMode ? 'bg-[#05060f] text-slate-100' : 'bg-white text-slate-950'}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b ${darkMode ? 'border-white/10 bg-[#05060f]/95' : 'border-slate-200 bg-white/95'} backdrop-blur`}>
        <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-lg font-semibold ${darkMode ? 'bg-cyan-400/20 text-cyan-300' : 'bg-cyan-500/10 text-cyan-600'}`}>TB</div>
              <span className="font-semibold">Toybox</span>
            </Link>

            {/* Nav */}
            <nav className="hidden sm:flex items-center gap-8 text-sm">
              <Link href="/" className={`transition ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Discover</Link>
              <Link href="/" className={`transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Collections</Link>
              <Link href="/" className={`transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Design Shelf</Link>
            </nav>

            {/* Search */}
            <div className={`flex-1 max-w-sm hidden lg:flex items-center gap-3 px-4 py-2 rounded-lg border ${darkMode ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
              <Search size={16} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className={`flex-1 bg-transparent text-sm outline-none placeholder-opacity-50 ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'}`}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/upload"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30' : 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20'}`}
              >
                + Upload
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                <Bell size={18} />
              </button>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
                <span className="text-sm font-medium hidden sm:inline">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`${darkMode ? 'bg-gradient-to-b from-[#05060f] to-slate-950' : 'bg-gradient-to-b from-white to-slate-50'} py-16 sm:py-24`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.1]">
              Collective design intelligence for enterprise teams.
            </h1>
            <p className={`mt-6 text-lg leading-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Discover, reuse, and showcase UX, CX, service design, and product strategy assets built from real engagements.
            </p>
          </div>
        </div>
      </section>

      {/* Cinematic Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative h-screen flex">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="h-full w-full relative overflow-hidden">
                <AssetImage
                  folder={slide.assetFolder}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  fallback={
                    <div className="absolute inset-0" style={{ background: slide.gradient }}>
                      <div className="absolute inset-0" style={{ background: slide.pattern }} />
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-slate-950/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-4 flex flex-wrap justify-center gap-3 text-sm uppercase tracking-[0.24em] text-white/70">
                      <span>{slide.type}</span>
                      <span>{slide.domain}</span>
                    </div>
                    <h2 className="text-6xl font-semibold mb-4">{slide.title}</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">{slide.description}</p>
                    <div className="flex gap-4 justify-center">
                      <Link
                        href="/showcase/index-composer"
                        className="px-8 py-3 bg-white text-slate-950 rounded-lg font-medium hover:bg-slate-100 transition"
                      >
                        View showcase
                      </Link>
                      <button className="px-8 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition">
                        Explore assets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex items-center gap-3 transform -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full bg-slate-900/80 px-4 py-3 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 rounded-full bg-slate-800/90 px-3 py-2">
              <div className="relative h-2 w-40 overflow-hidden rounded-full bg-slate-700/50">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-500"
                  style={{ width: `${((currentSlide + 1) / carouselSlides.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                {carouselSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 w-2 rounded-full transition ${index === currentSlide ? 'bg-white' : 'bg-slate-500/70'}`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow hover:bg-slate-800"
            >
              <Pause size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Repository Grid */}
      <section className="mx-auto max-w-7xl px-6 sm:px-8 py-16">
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">Curated Intelligence</h2>
              <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Selected experience systems, workflows, and governance previews.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['All', 'Workflow', 'Experience', 'Customer', 'Strategy'].map((filter) => (
                <button
                  key={filter}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-white/20 hover:bg-white/10"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositoryCards.map((card) => (
            <Link
              key={card.id}
              href={card.id === '1' ? '/showcase/index-composer' : '/'}
              className={`group rounded-xl overflow-hidden border transition hover:shadow-2xl hover:-translate-y-1 ${darkMode ? 'border-white/10 hover:border-white/30 hover:bg-slate-950/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <AssetImage
                  folder={card.assetFolder}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  fallback={
                    <div className="absolute inset-0" style={{ background: card.gradient }}>
                      <div className="absolute inset-0" style={{ background: card.pattern }} />
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-slate-950/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-sm font-medium text-white/90">{card.title}</div>
                </div>
              </div>

              {/* Card Content */}
              <div className={`p-5 ${darkMode ? 'bg-slate-950/50 border-t border-white/10' : 'bg-slate-50 border-t border-slate-200'}`}>
                <h3 className="font-semibold text-sm">{card.title}</h3>
                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>{card.type}</p>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{card.creator}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>★</span>
                    <span>{card.rating}</span>
                  </div>
                </div>

                <button className={`mt-4 w-full py-2 rounded-lg text-xs font-medium transition ${darkMode ? 'border border-white/10 hover:bg-white/5' : 'border border-slate-300 hover:bg-slate-100'}`}>
                  <Bookmark size={14} className="inline mr-2" />
                  Save
                </button>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-end">
          <button className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${darkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-900'}`}>
            Show more
          </button>
        </div>
      </section>

      {/* Design Shelf */}
      <section className={`${darkMode ? 'bg-slate-950/50 border-t border-white/10' : 'bg-slate-50 border-t border-slate-200'} py-16`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <h2 className="text-3xl font-semibold mb-8">Design Shelf</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {shelfItems.map((item) => (
              <button
                key={item.id}
                className={`flex-shrink-0 w-56 group rounded-xl overflow-hidden border transition ${darkMode ? 'border-white/10 hover:border-white/30' : 'border-slate-200 hover:border-slate-300'}`}
              >
                {/* Image */}
<div className="relative h-40 overflow-hidden">
                    <AssetImage
                      folder={item.assetFolder}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      fallback={
                        <div className="absolute inset-0" style={{ background: item.gradient }}>
                          <div
                            style={{
                              background: 'radial-gradient(circle at 30% 40%, rgba(15,23,42,0.7), transparent), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05), transparent)',
                            }}
                            className="absolute inset-0"
                          />
                        </div>
                      }
                    />
                    <div className="absolute inset-0 bg-slate-950/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
                    {item.title}
                  </div>
                </div>

                {/* Content */}
                <div className={`p-4 text-left ${darkMode ? 'bg-slate-950/50 border-t border-white/10' : 'bg-slate-50 border-t border-slate-200'}`}>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>{item.type}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`${darkMode ? 'bg-[#05060f]' : 'bg-white'} py-16 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8 text-center">
          <h2 className="text-3xl font-semibold mb-6">Ready to contribute?</h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Share design assets, research insights, and strategic frameworks to strengthen our collective intelligence.
          </p>
          <Link
            href="/upload"
            className={`inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition ${darkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-900'}`}
          >
            Contribute Asset
          </Link>
        </div>
      </section>
    </div>
  );
}

