'use client';

import Link from 'next/link';
import { Star, Bookmark, Share2, Download } from 'lucide-react';
import { useState } from 'react';

type Review = {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
};

const reviews: Review[] = [
  {
    id: '1',
    author: 'Dana W.',
    role: 'Enterprise Experience Lead',
    avatar: 'D',
    rating: 5,
    text: 'This case study perfectly captures how strategic governance and design thinking can transform enterprise operations. The Index Composer approach fundamentally changed how we think about asset orchestration.',
    date: '2 weeks ago',
  },
  {
    id: '2',
    author: 'Priya S.',
    role: 'Design Strategist',
    avatar: 'P',
    rating: 5,
    text: 'The research methodology and persona development sections are incredibly thorough. We\'ve already adapted several frameworks from this work for our own service design initiatives.',
    date: '1 week ago',
  },
  {
    id: '3',
    author: 'Jordan C.',
    role: 'Chief Design Officer',
    avatar: 'J',
    rating: 4,
    text: 'Strong execution on the visual storytelling. The blueprint and storyboard sections really demonstrate the power of translating complex governance concepts into actionable design artifacts.',
    date: '3 days ago',
  },
];

export default function Showcase() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [rating, setRating] = useState(4.9);

  return (
    <div className="bg-white text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="font-semibold">← Back to Repository</Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium">{rating}</span>
              </div>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition ${isBookmarked ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100'}`}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button className="p-2 rounded-lg hover:bg-slate-100 transition">
                <Share2 size={18} />
              </button>

              <button className="p-2 rounded-lg hover:bg-slate-100 transition">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-8">
            <p className="text-sm uppercase tracking-widest text-cyan-600 font-semibold">Case Study</p>
            <h1 className="mt-4 text-6xl sm:text-7xl font-semibold leading-[1.1] tracking-[-0.02em]">Index Composer</h1>
            <p className="mt-6 text-xl leading-8 text-slate-600">
              A unified platform that orchestrates governance, workflows, and design assets into one discoverable, reusable intelligence system for enterprise teams.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <Star size={16} className="text-amber-500" />
                <strong className="font-semibold text-slate-950">{rating}</strong>
                Rating
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                18 comments
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <span className="font-semibold">124</span>
                saves
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
                <Bookmark size={16} />
                Bookmark
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
                <Share2 size={16} />
                Share
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>

          {/* Hero Visual Montage */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
            {[
              'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
              'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
              'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            ].map((gradient, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden"
                style={{ background: gradient }}
              >
                <div
                  style={{
                    background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                  }}
                  className="w-full h-full flex items-center justify-center text-white text-sm font-medium opacity-60"
                >
                  Screenshot {idx + 1}
                </div>
              </div>
            ))}
          </div>
      </section>

      {/* Challenge Section */}
      <section className="py-20 px-6 sm:px-8 border-t border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-semibold mb-6">The Challenge</h2>
              <div className="space-y-4 text-lg text-slate-600 leading-8">
                <p>
                  Large enterprise teams struggle with organizational fragmentation. Governance frameworks, workflow documentation, and design assets exist in silos across teams, tools, and repositories.
                </p>
                <p>
                  Decision-making becomes inefficient, asset reuse drops, and institutional knowledge remains locked away. Teams reinvent solutions instead of building on proven patterns.
                </p>
                <p>
                  Index Composer solves this by creating a unified index that makes governance, operations, and design thinking visible and immediately actionable.
                </p>
              </div>
            </div>

            <div className="aspect-square rounded-2xl" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0284c7 100%)' }}>
              <div
                style={{
                  background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.1) 0%, transparent 50%)',
                }}
                className="w-full h-full rounded-2xl flex items-center justify-center text-white text-lg font-medium opacity-70"
              >
                Challenge Visualization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section className="py-20 px-6 sm:px-8 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-4">Research & Workshops</h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl">
            We conducted 12 stakeholder interviews, 4 co-design workshops, and analyzed 200+ enterprise governance artifacts to understand the complete landscape.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-2xl h-96" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' }} />
            <div className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Stakeholder synthesis</h3>
                <p className="text-slate-600">Synthesized qualitative insights into decision-making patterns, governance risk, and asset reuse opportunities.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Design system exploration</h3>
                <p className="text-slate-600">Mapped service workflows and journey gaps to visual research canvases that power enterprise strategy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-20 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-12">Key Personas</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                role: 'Enterprise Experience Lead',
                name: 'Alyssa Reed',
                quote: 'I need a unified operating model that brings cross-functional teams together.',
                focus: 'Cross-functional alignment',
              },
              {
                role: 'Claims Operations Manager',
                name: 'Jared Kim',
                quote: 'Our biggest pain is reducing handoffs across distributed teams.',
                focus: 'Workflow efficiency',
              },
            ].map((persona, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div
                  className="h-48 flex items-center justify-center text-white opacity-70"
                  style={{
                    background: idx === 0
                      ? 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  }}
                >
                  Persona Visual
                </div>

                <div className="p-8">
                  <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">{persona.role}</p>
                  <h3 className="text-2xl font-semibold mt-3 mb-4">{persona.name}</h3>
                  <blockquote className="text-lg text-slate-600 italic mb-6">"{persona.quote}"</blockquote>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Focus:</span>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{persona.focus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Blueprint Section */}
      <section className="py-20 px-6 sm:px-8 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className="rounded-2xl h-96 order-2 lg:order-1"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-white opacity-70">
                Service Blueprint Visualization
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-semibold mb-6">Service Blueprint</h2>
              <div className="space-y-4 text-lg text-slate-600 leading-8">
                <p>
                  The blueprint maps 6 major governance flows, 12 decision gates, and 28 asset types across the enterprise ecosystem.
                </p>
                <p>
                  Each component connects to reusable templates, policy frameworks, and design precedents that teams can apply immediately.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {['Governance Workflows', 'Decision Gates', 'Asset Mapping', 'Team Touchpoints'].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-cyan-600" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storyboards Section */}
      <section className="py-20 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-4">Storyboards & Flows</h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl">
            Visual narratives that show how governance flows connect to user workflows and business outcomes.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              'Intake to Publishing Flow',
              'Decision Review Cycle',
              'Asset Discovery & Reuse',
            ].map((title, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <div
                  className="aspect-square flex items-center justify-center text-white opacity-70"
                  style={{
                    background: [
                      'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                      'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    ][idx],
                  }}
                >
                  {title}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-slate-600">Detailed visual storyboard showing step-by-step user interactions and decision points.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Fidelity Concepts Section */}
      <section className="py-20 px-6 sm:px-8 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-12">High-Fidelity Concepts</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              { title: 'Dashboard & Index View', desc: 'Centralized governance and asset discovery' },
              { title: 'Asset Detail & Context', desc: 'Rich metadata, lineage, and reuse history' },
            ].map((concept, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div
                  className="aspect-square flex items-center justify-center text-white opacity-70"
                  style={{
                    background: idx === 0
                      ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
                      : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  }}
                >
                  UI Mockup
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-3">{concept.title}</h3>
                  <p className="text-slate-600">{concept.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-12">Impact & Outcomes</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { metric: '46%', label: 'Asset velocity increase', desc: 'Reuse rate across programs' },
              { metric: '82%', label: 'Workflow alignment', desc: 'Cross-team adoption score' },
              { metric: '94%', label: 'Governance coverage', desc: 'Operational framework readiness' },
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-8">
                <div className="text-5xl font-bold text-cyan-600 mb-3">{item.metric}</div>
                <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reusable Assets Section */}
      <section className="py-20 px-6 sm:px-8 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-4">Reusable Assets</h2>
          <p className="text-lg text-slate-600 mb-12">
            This case study produced 12 reusable frameworks, templates, and reference guides that teams across the organization now leverage daily.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Governance Decision Framework',
              'Service Blueprint Template',
              'Persona Kit (6 personas)',
              'Journey Mapping Guides',
              'Policy Reference Cards',
              'Asset Metadata Schema',
            ].map((asset) => (
              <button
                key={asset}
                className="border border-slate-200 rounded-lg p-4 text-left hover:border-cyan-300 hover:bg-cyan-50 transition"
              >
                <div className="font-semibold mb-2">{asset}</div>
                <p className="text-sm text-slate-600">Reusable in your projects</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold mb-12">Community Reviews</h2>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-slate-200 rounded-2xl p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {review.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold">{review.author}</h3>
                      <p className="text-sm text-slate-600">{review.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 leading-7 mb-4">{review.text}</p>
                <p className="text-sm text-slate-500">{review.date}</p>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          <div className="mt-12 border border-slate-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">Share Your Thoughts</h3>
            <div className="space-y-4">
              <textarea
                placeholder="Write a review or share how you've used this work..."
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-cyan-500 resize-none"
                rows={4}
              />
              <button className="px-6 py-3 bg-slate-950 text-white rounded-lg font-semibold hover:bg-slate-900 transition">
                Post Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 sm:px-8 border-t border-slate-200">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-semibold mb-6">Ready to contribute your work?</h2>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-8 py-3 bg-slate-950 text-white rounded-lg font-semibold hover:bg-slate-900 transition"
          >
            Share Your Asset
          </Link>
        </div>
      </section>
    </div>
  );
}
