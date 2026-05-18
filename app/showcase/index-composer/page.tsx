'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bookmark, Share2, Download, Star, ArrowRight } from 'lucide-react';

type Reflection = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

const reflections: Reflection[] = [
  {
    id: '1',
    quote: 'Strong systems-thinking approach.',
    author: 'Amina R.',
    role: 'Design Operations Partner',
  },
  {
    id: '2',
    quote: 'Loved the ecosystem mapping work.',
    author: 'Marcus H.',
    role: 'Service Strategy Lead',
  },
  {
    id: '3',
    quote: 'Excellent governance-led experience strategy.',
    author: 'Nina K.',
    role: 'Enterprise UX Director',
  },
];

export default function IndexComposerShowcase() {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState<Reflection[]>([]);
  const [challengeImage, setChallengeImage] = useState('/assets/curated/indexComposer/challenge.png');

  const heroImage = '/assets/curated/indexComposer/preview.png';

  return (
    <div className="bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <Link href="/" className="font-semibold hover:text-slate-900 transition">
              ← Back to Toybox
            </Link>
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-950 via-slate-950/70 to-transparent" />
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div className="relative z-10">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-semibold">Enterprise Platform · Financial Services</p>
                <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[0.98]">
                  Index Composer
                </h1>
                <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
                  Unified index creation platform that seamlessly brings together people, process, and tools.
                </p>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
                  A connected enterprise ecosystem designed to unify governance, workflows, collaboration, and production across the complete index lifecycle.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="#challenge"
                    className="inline-flex items-center gap-3 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Launch Story
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/assets/index-composer"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
                  >
                    Explore Assets
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute right-0 top-0 hidden h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl lg:block" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/20">
                  <img
                    src={heroImage}
                    alt="Index Composer interface composition"
                    className="h-full w-full min-h-[420px] object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                </div>
                <div className="absolute right-6 top-6 flex items-center rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur-sm">
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-100 transition hover:bg-white/10">
                    <Bookmark size={18} />
                  </button>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-100 transition hover:bg-white/10">
                    <Share2 size={18} />
                  </button>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-100 transition hover:bg-white/10">
                    <Download size={18} />
                  </button>
                  <div className="ml-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-slate-100">
                    <Star size={16} className="text-amber-300" />
                    4.9
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="challenge" className="bg-slate-900 text-white py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300 font-semibold">The Challenge</p>
                <h2 className="mt-6 text-5xl font-semibold leading-tight">
                  Index creation at global scale is inherently complex.
                </h2>
                <div className="mt-8 space-y-5 text-lg leading-8 text-slate-300">
                  <p>
                    Multiple teams, fragmented tools, and disconnected workflows often slow down the process. Governance frameworks, research activities, production workflows, and maintenance operations frequently exist across disconnected systems and teams.
                  </p>
                  <p>
                    Index Composer was envisioned to transform this fragmented landscape into one connected enterprise experience.
                  </p>
                  <p>
                    The goal was not simply to redesign screens, but to rethink how people, governance, workflows, and operational systems interact across the complete lifecycle of index creation and maintenance.
                  </p>
                  <p>
                    Backed by deep user research, service design thinking, ecosystem mapping, and iterative validation, the initiative explored how disconnected operational activities could evolve into a unified and scalable platform experience.
                  </p>
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/30 overflow-hidden">
                <img
                  src={challengeImage}
                  alt="Challenge visualization"
                  className="h-full w-full min-h-[384px] object-cover object-center"
                  loading="lazy"
                  onError={() => setChallengeImage('/assets/curated/indexComposer/thumbnail.png')}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Overview</p>
                <h2 className="text-4xl font-semibold">The Mission Statement</h2>
                <div className="space-y-4 text-lg leading-8 text-slate-700">
                  <p>
                    Transform fragmented and disconnected index creation workflows into a unified, intuitive, and collaborative platform.
                  </p>
                  <p>
                    Create an ecosystem that enables teams across research, governance, production, validation, and maintenance to work through a connected operational experience rather than isolated systems and handoffs.
                  </p>
                  <p>
                    The vision focused on simplifying complexity, improving transparency, and enabling scalable collaboration across the entire index lifecycle.
                  </p>
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-8 shadow-sm">
                <h3 className="text-2xl font-semibold text-slate-900">An Experience Led Strategy</h3>
                <div className="mt-8 space-y-5 text-slate-700">
                  {[
                    'Users and workflows — Capturing operational needs, governance touchpoints, and end-to-end journeys across teams.',
                    'The ecosystem map — Visualizing systems, dependencies, process flows, and organizational interactions.',
                    'The solution concept — Exploring future-state workflows and validating collaborative operational models.',
                    'Design, test, and refine — Iterating concepts through workshops, storyboards, and high-fidelity experience validation.',
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-3xl border border-slate-200/80 bg-white p-6">
                      <span className="text-sm font-semibold text-slate-900">{idx + 1}. </span>
                      <span className="text-base text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-6 mb-12">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
                <h2 className="mt-4 text-4xl font-semibold">Users and Workflows — User Research</h2>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
                <p className="text-lg leading-8 text-slate-700">
                  Engaged cross-functional stakeholders through moderated workshops, collaborative research sessions, and structured discovery exercises to better understand operational pain points, governance complexity, and workflow fragmentation.
                </p>
                <div className="mt-8 space-y-4 text-slate-600 leading-7">
                  {[
                    'Disconnected production workflows',
                    'Governance dependencies',
                    'Operational inefficiencies',
                    'Collaboration gaps',
                    'Lifecycle visibility challenges',
                    'Opportunities for workflow unification',
                  ].map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
                <p className="mt-8 text-slate-600 leading-7">
                  Insights gathered from workshops and ecosystem discovery sessions became foundational in shaping the platform strategy and future-state experience direction.
                </p>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
                <div className="h-[520px] overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-inner">
                  <img
                    src="/assets/curated/indexComposer/user-research.png"
                    alt="Users and workflows research visualization"
                    className="h-full w-full object-cover object-center scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
                <h2 className="mt-4 text-4xl font-semibold">Users and Workflows — Personas</h2>
              </div>
              <p className="max-w-2xl text-slate-600">
                Synthesized research insights into distinct operational personas representing the diverse ecosystem involved in index creation, governance, production, validation, and maintenance.
              </p>
            </div>
            <div className="mt-12 grid lg:grid-cols-3 gap-8">
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
                {
                  role: 'Governance Program Director',
                  name: 'Nina Patel',
                  quote: 'We need clarity over decision gates and systemic compliance across every release.',
                  focus: 'Governance consistency',
                },
              ].map((persona) => (
                <div key={persona.name} className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="h-52 bg-slate-900 text-white flex items-center justify-center text-lg font-semibold">
                    Persona Board
                  </div>
                  <div className="p-8">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500 font-semibold">{persona.role}</p>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-900">{persona.name}</h3>
                    <p className="mt-4 text-slate-600 italic">“{persona.quote}”</p>
                    <div className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                      {persona.focus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
                <h2 className="mt-6 text-4xl font-semibold">The Ecosystem Map</h2>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  The ecosystem map visualized how operational systems, governance layers, data dependencies, workflows, and organizational teams interacted across the index creation and maintenance lifecycle.
                </p>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Rather than viewing production activities as isolated tasks, the ecosystem perspective exposed how upstream and downstream activities continuously influenced operational outcomes.
                </p>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  At the center of the ecosystem sat a connected operational model designed to improve visibility, alignment, governance consistency, and cross-functional collaboration.
                </p>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-6 shadow-sm">
                <div className="h-full overflow-hidden rounded-[1.75rem] bg-white">
                  <img
                    src="/assets/curated/indexComposer/ecosystem-map.png"
                    alt="Ecosystem map"
                    className="h-full w-full object-contain object-center"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
            <h2 className="mt-6 text-4xl font-semibold">Service Blueprint</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              The service blueprint mapped the end-to-end operational lifecycle of index creation and maintenance.
            </p>
            <div className="mt-12 rounded-[2rem] border border-slate-200 bg-slate-100 p-8 shadow-sm">
              <div className="h-[420px] overflow-hidden rounded-[1.75rem]">
                <img
                  src="/assets/curated/indexComposer/service-blueprint.png"
                  alt="Service blueprint visualization"
                  className="h-full w-full object-contain object-center scale-105"
                  loading="lazy"
                />
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  'User roles',
                  'Operational steps',
                  'Governance checkpoints',
                  'Decision gates',
                  'Workflow dependencies',
                  'Cross-functional handoffs',
                  'Validation activities',
                  'Downstream operational impacts',
                ].map((line) => (
                  <div key={line} className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
            <h2 className="mt-6 text-4xl font-semibold">UI Storyboards</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Storyboard explorations translated operational concepts into experience narratives that visualized how users, workflows, governance actions, and collaboration moments would unfold across the platform.
            </p>
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Narrative-first workflow visualization</h3>
                <p className="text-slate-600 leading-7">
                  These explorations helped align stakeholders around future-state operational experiences before moving into detailed interaction design and high-fidelity prototyping.
                </p>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="h-72 overflow-hidden">
                  <img
                    src="/assets/curated/indexComposer/storyboards.png"
                    alt="UI storyboards"
                    className="h-full w-full object-contain object-center scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Solution Highlights</p>
            <h2 className="mt-6 text-4xl font-semibold">High Fidelity Designs</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              High-fidelity concepts transformed strategic workflows and operational models into detailed platform experiences.
            </p>
            <div className="mt-12 rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl">
              <div className="h-[520px] overflow-hidden">
                <img
                  src="/assets/curated/indexComposer/high-fidelity.png"
                  alt="High fidelity designs"
                  className="h-full w-full object-contain object-center scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl text-slate-700">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Transformation Outcome</p>
            <h2 className="mt-6 text-4xl font-semibold text-slate-950">A connected operational vision for enterprise index creation.</h2>
            <p className="mt-8 text-xl leading-8">
              Index Composer established a connected operational vision for how enterprise index creation workflows, governance systems, and collaborative production activities could evolve into a unified ecosystem experience.
            </p>
            <p className="mt-6 text-lg leading-8">
              The initiative demonstrated how service design thinking, systems mapping, governance alignment, and experience strategy could help simplify operational complexity while improving visibility, collaboration, and scalability across enterprise teams.
            </p>
            <p className="mt-6 text-lg leading-8">
              More importantly, the work created a reusable strategic foundation that could guide future transformation initiatives across governance-heavy operational environments.
            </p>
          </div>
        </section>

        <section className="py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-10">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-500 font-semibold">Community Reflections</p>
                <h2 className="mt-6 text-4xl font-semibold text-slate-950">A thoughtful space for collaborative observations.</h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                  A space for teams, designers, strategists, and collaborators to share observations, insights, and reflections around the transformation journey.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {[...reflections, ...submitted].slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
                    <div className="mt-6 text-sm text-slate-500">
                      <strong className="text-slate-900">{item.author}</strong>, {item.role}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!comment.trim()) return;
                  setSubmitted((current) => [
                    { id: String(Date.now()), quote: comment.trim(), author: 'Your reflection', role: 'Collaborator' },
                    ...current,
                  ]);
                  setComment('');
                }}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <label htmlFor="comment" className="text-sm font-semibold text-slate-900">
                  Share a reflection
                </label>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <input
                    id="comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Strong systems-thinking approach."
                    className="min-h-[56px] flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Add reflection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white py-24 px-6 sm:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300 font-semibold">Explore Reusable Assets</p>
            <h2 className="mt-6 text-4xl font-semibold">Dive deeper into the platform frameworks.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Dive deeper into the research artifacts, ecosystem maps, service blueprints, workflows, and reusable frameworks that shaped the Index Composer initiative.
            </p>
            <Link
              href="/assets/index-composer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-cyan-400 px-8 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Explore Assets
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
