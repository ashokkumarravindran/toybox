'use client';

import { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

// ── Types ─────────────────────────────────────────────────────────────────────

type ShelfArtifact = {
  id: string;
  category: string;
  name: string;
  role?: string;
  description: string;
  projectName: string;
  domain: string;
  publishedAt: string;
  previewId: string;
  assetName?: string;
};

type Artifact = {
  id: string;
  name: string;
  industry: string;
  engagementType: string;
  description: string;
  tags: string[];
  format: 'Figma' | 'Miro' | 'PowerPoint' | 'PDF';
  lastUpdated: string;
  author: string;
  viewUrl: string;
  gradient: string;
};

// ── Mock data per category ────────────────────────────────────────────────────

const MOCK_DATA: Record<string, { title: string; subtitle: string; artifacts: Artifact[] }> = {
  personas: {
    title: 'Personas',
    subtitle: 'User and stakeholder personas from real engagements, organized by industry.',
    artifacts: [
      { id: 'p1', name: 'Clinical Coordinator', industry: 'Healthcare', engagementType: 'Research and Discovery', description: 'Primary care coordinator responsible for managing patient case workflows, scheduling, and cross-team communication.', tags: ['Workflow', 'Clinical'], format: 'Figma', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0e1a2a 0%, #1a3a5a 100%)' },
      { id: 'p2', name: 'Patient Navigator', industry: 'Healthcare', engagementType: 'Customer Experience', description: 'Patients navigating digital health portals for appointment management, test results, and care plan access.', tags: ['Patient', 'Portal'], format: 'Miro', lastUpdated: 'Apr 2026', author: 'UX Strategy', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0a1e1a 0%, #1a3a30 100%)' },
      { id: 'p12', name: 'ER Nurse', industry: 'Healthcare', engagementType: 'Research and Discovery', description: 'Emergency department nurse triaging patients, managing electronic health records, and coordinating rapid-cycle care decisions.', tags: ['Clinical', 'Research'], format: 'Figma', lastUpdated: 'Jun 2026', author: 'Research', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #001a0e 0%, #002a18 100%)' },
      { id: 'p3', name: 'Portfolio Manager', industry: 'Financial Services', engagementType: 'UX Strategy', description: 'Senior portfolio manager overseeing index composition workflows, compliance reviews, and client reporting.', tags: ['Dashboard', 'Strategy'], format: 'Figma', lastUpdated: 'Jun 2026', author: 'Design Ops', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1a2a48 100%)' },
      { id: 'p4', name: 'Compliance Officer', industry: 'Financial Services', engagementType: 'Product Design', description: 'Regulatory compliance officer ensuring audit trails, reporting accuracy, and governance workflows are met.', tags: ['Compliance', 'Governance'], format: 'PowerPoint', lastUpdated: 'Mar 2026', author: 'Service Design', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #1a1000 0%, #2a1e00 100%)' },
      { id: 'p11', name: 'Wealth Management Client', industry: 'Financial Services', engagementType: 'UX Strategy', description: 'UHNW client engaging with a wealth advisor through digital and in-person touchpoints for portfolio reviews and planning.', tags: ['Wealth', 'High Value'], format: 'Miro', lastUpdated: 'Mar 2026', author: 'UX Strategy', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1e2a48 100%)' },
      { id: 'p5', name: 'Claims Adjuster', industry: 'Insurance', engagementType: 'Workflow Transformation', description: 'Field and desk adjuster managing end-to-end claims from first notice of loss through settlement and closure.', tags: ['Workflow', 'Claims'], format: 'Miro', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #1a0a00 0%, #2a1800 100%)' },
      { id: 'p6', name: 'Digital Insurance Customer', industry: 'Insurance', engagementType: 'Customer Experience', description: 'Self-service insurance customer managing policies, filing claims, and accessing support through digital channels.', tags: ['Self-service', 'Portal'], format: 'Figma', lastUpdated: 'Feb 2026', author: 'UX Strategy', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #001a10 0%, #002a1a 100%)' },
      { id: 'p7', name: 'Benefits Case Manager', industry: 'Public Sector', engagementType: 'Service Design', description: 'Government case manager responsible for processing eligibility determinations, benefit assignments, and family case coordination.', tags: ['Case Management', 'Service Design'], format: 'Miro', lastUpdated: 'Apr 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #100a1a 0%, #201828 100%)' },
      { id: 'p8', name: 'Loyalty Member', industry: 'Retail', engagementType: 'Customer Experience', description: 'High-value retail loyalty member shopping across digital and in-store channels, redeeming points and managing preferences.', tags: ['Loyalty', 'Omnichannel'], format: 'Figma', lastUpdated: 'Jun 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #001818 0%, #002828 100%)' },
      { id: 'p9', name: 'IT Service Desk Agent', industry: 'Technology', engagementType: 'Employee Experience', description: 'Tier-1 service desk agent managing incident queues, knowledge base articles, and employee escalations.', tags: ['Employee Experience', 'Service Desk'], format: 'PowerPoint', lastUpdated: 'Jan 2026', author: 'Design Ops', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0a001a 0%, #180028 100%)' },
      { id: 'p10', name: 'Casino Floor Host', industry: 'Hospitality', engagementType: 'Experience Concept', description: 'Premium floor host responsible for high-value guest experiences, personalized offers, and real-time preference management.', tags: ['Guest Experience', 'High Value'], format: 'Figma', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0a1800 0%, #182a00 100%)' },
    ],
  },
  'journey-maps': {
    title: 'Journey Maps',
    subtitle: 'End-to-end experience maps capturing moments, emotions, and opportunities across key user journeys.',
    artifacts: [
      { id: 'jm1', name: 'Patient Enrollment Journey', industry: 'Healthcare', engagementType: 'Customer Experience', description: 'Complete patient enrollment experience from awareness through first clinical appointment, including digital and in-person touchpoints.', tags: ['Enrollment', 'Journey Map'], format: 'Miro', lastUpdated: 'Jun 2026', author: 'CX Team', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0e1a2a 0%, #1a3a5a 100%)' },
      { id: 'jm2', name: 'Claims Filing Journey', industry: 'Insurance', engagementType: 'Workflow Transformation', description: 'End-to-end digital claims submission journey for property and casualty, from FNOL through settlement confirmation.', tags: ['Claims', 'Digital'], format: 'Miro', lastUpdated: 'May 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #1a0a00 0%, #2a1800 100%)' },
      { id: 'jm3', name: 'Account Opening Journey', industry: 'Financial Services', engagementType: 'Customer Experience', description: 'Digital-first account opening from prospect awareness through funded account, including KYC and identity verification steps.', tags: ['Onboarding', 'Digital'], format: 'Figma', lastUpdated: 'Apr 2026', author: 'UX Strategy', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1a2a48 100%)' },
      { id: 'jm4', name: 'Benefits Application Journey', industry: 'Public Sector', engagementType: 'Service Design', description: 'Citizen journey through state benefits application, eligibility determination, document submission, and case status tracking.', tags: ['Benefits', 'Service Design'], format: 'Miro', lastUpdated: 'Mar 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #100a1a 0%, #201828 100%)' },
      { id: 'jm5', name: 'Employee Onboarding Journey', industry: 'Technology', engagementType: 'Employee Experience', description: 'New hire experience from offer acceptance through 90-day milestone, covering IT provisioning, HR workflows, and team integration.', tags: ['Employee Experience', 'Onboarding'], format: 'Miro', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0a001a 0%, #180028 100%)' },
      { id: 'jm6', name: 'Wealth Transfer Journey', industry: 'Financial Services', engagementType: 'UX Strategy', description: 'Multi-generational wealth transfer experience covering estate planning, advisor engagement, and digital account transition.', tags: ['Wealth', 'Strategy'], format: 'PowerPoint', lastUpdated: 'Feb 2026', author: 'UX Strategy', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1e2a48 100%)' },
      { id: 'jm7', name: 'Guest Experience Journey', industry: 'Hospitality', engagementType: 'Experience Concept', description: 'High-value guest journey across pre-arrival, in-property, and post-stay phases for a luxury resort experience.', tags: ['Guest', 'Luxury'], format: 'Figma', lastUpdated: 'Jun 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0a1800 0%, #182a00 100%)' },
      { id: 'jm8', name: 'Returns & Refunds Journey', industry: 'Retail', engagementType: 'Customer Experience', description: 'Omnichannel returns experience mapping friction points across digital initiation, in-store drop-off, and refund confirmation.', tags: ['Returns', 'Omnichannel'], format: 'Miro', lastUpdated: 'Apr 2026', author: 'CX Team', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #001818 0%, #002828 100%)' },
    ],
  },
  'service-blueprints': {
    title: 'Service Blueprints',
    subtitle: 'Service design blueprints mapping frontstage, backstage, and support processes across key service moments.',
    artifacts: [
      { id: 'sb1', name: 'Emergency Department Blueprint', industry: 'Healthcare', engagementType: 'Service Design', description: 'Full-service blueprint for emergency triage, care delivery, and discharge coordination, mapping clinical and administrative workflows.', tags: ['Clinical', 'Service Design'], format: 'Miro', lastUpdated: 'May 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0e1a2a 0%, #1a3a5a 100%)' },
      { id: 'sb2', name: 'Claims Processing Blueprint', industry: 'Insurance', engagementType: 'Workflow Transformation', description: 'End-to-end claims service blueprint covering intake, investigation, decision, and settlement with system integration touchpoints.', tags: ['Claims', 'Workflow'], format: 'Miro', lastUpdated: 'Apr 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #1a0a00 0%, #2a1800 100%)' },
      { id: 'sb3', name: 'Wealth Advisory Blueprint', industry: 'Financial Services', engagementType: 'Service Design', description: 'Advisory service blueprint mapping client-advisor interactions, middle-office operations, and technology support systems.', tags: ['Wealth', 'Advisory'], format: 'Figma', lastUpdated: 'Jun 2026', author: 'Service Design', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1a2a48 100%)' },
      { id: 'sb4', name: 'Benefits Administration Blueprint', industry: 'Public Sector', engagementType: 'Service Design', description: 'State benefits administration blueprint covering citizen intake, eligibility verification, case management, and payment issuance.', tags: ['Benefits', 'Administration'], format: 'Miro', lastUpdated: 'Mar 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #100a1a 0%, #201828 100%)' },
      { id: 'sb5', name: 'Loan Origination Blueprint', industry: 'Financial Services', engagementType: 'Workflow Transformation', description: 'Full loan origination service blueprint from application through underwriting, approval, and closing.', tags: ['Lending', 'Workflow'], format: 'PowerPoint', lastUpdated: 'Feb 2026', author: 'Service Design', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #001018 0%, #001a28 100%)' },
      { id: 'sb6', name: 'Resort Check-in Blueprint', industry: 'Hospitality', engagementType: 'Experience Concept', description: 'Guest arrival and check-in service blueprint mapping digital pre-check-in, physical arrival, room assignment, and concierge integration.', tags: ['Guest', 'Operations'], format: 'Miro', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0a1800 0%, #182a00 100%)' },
    ],
  },
  storyboards: {
    title: 'Storyboards',
    subtitle: 'Visual narrative storyboards illustrating key moments, interactions, and emotional arcs within experience concepts.',
    artifacts: [
      { id: 'st1', name: 'Digital Claims Submission', industry: 'Insurance', engagementType: 'Workflow Transformation', description: 'Storyboard illustrating the moment-by-moment experience of a policyholder filing a digital claim following a vehicle incident.', tags: ['Claims', 'Narrative'], format: 'Figma', lastUpdated: 'Apr 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #1a0a00 0%, #2a1800 100%)' },
      { id: 'st2', name: 'Member Portal Onboarding', industry: 'Healthcare', engagementType: 'Customer Experience', description: 'Visual narrative of a new member setting up their patient portal account, finding a provider, and scheduling their first appointment.', tags: ['Onboarding', 'Portal'], format: 'Figma', lastUpdated: 'May 2026', author: 'UX Strategy', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0e1a2a 0%, #1a3a5a 100%)' },
      { id: 'st3', name: 'Advisor Dashboard Walkthrough', industry: 'Financial Services', engagementType: 'Product Design', description: 'Storyboard showing a wealth advisor using a new AI-assisted dashboard to prepare for a client review meeting.', tags: ['AI', 'Dashboard'], format: 'PowerPoint', lastUpdated: 'Jun 2026', author: 'CX Team', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1a2a48 100%)' },
      { id: 'st4', name: 'Benefits Office Visit', industry: 'Public Sector', engagementType: 'Service Design', description: 'Storyboard depicting a family navigating an in-person benefits office visit to resolve a flagged application.', tags: ['In-person', 'Family'], format: 'Miro', lastUpdated: 'Mar 2026', author: 'Service Design', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #100a1a 0%, #201828 100%)' },
      { id: 'st5', name: 'Casino VIP Evening', industry: 'Hospitality', engagementType: 'Experience Concept', description: "Experiential storyboard capturing a VIP guest's personalized evening — from pre-arrival notification through curated on-floor moments.", tags: ['VIP', 'Personalization'], format: 'Figma', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0a1800 0%, #182a00 100%)' },
      { id: 'st6', name: 'Store Associate Training App', industry: 'Retail', engagementType: 'Employee Experience', description: 'Storyboard illustrating an associate using a mobile training app to learn new seasonal product knowledge during a shift.', tags: ['Training', 'Mobile'], format: 'Figma', lastUpdated: 'Apr 2026', author: 'UX Strategy', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #001818 0%, #002828 100%)' },
      { id: 'st7', name: 'AI-Assisted Research Review', industry: 'Technology', engagementType: 'Research and Discovery', description: 'Storyboard showing a UX researcher using an AI tool to synthesize interview notes and identify themes in minutes.', tags: ['AI', 'Research'], format: 'Miro', lastUpdated: 'Jun 2026', author: 'Research', viewUrl: 'https://miro.com', gradient: 'linear-gradient(135deg, #0a001a 0%, #180028 100%)' },
      { id: 'st9', name: 'Loan Officer Decisioning', industry: 'Financial Services', engagementType: 'Workflow Transformation', description: 'Storyboard illustrating a loan officer reviewing an AI-generated risk summary and making a real-time underwriting decision.', tags: ['AI', 'Decisioning'], format: 'Figma', lastUpdated: 'May 2026', author: 'CX Team', viewUrl: 'https://www.figma.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1e2a48 100%)' },
    ],
  },
  'heuristic-checklists': {
    title: 'Heuristic Checklists',
    subtitle: 'Structured evaluation checklists used in heuristic reviews, UX audits, and design critiques.',
    artifacts: [
      { id: 'hc1', name: 'Enterprise Web Application Checklist', industry: 'Technology', engagementType: 'Heuristic Evaluation', description: '80-item heuristic evaluation checklist for complex enterprise web applications, covering navigation, data display, error handling, and accessibility.', tags: ['Enterprise', 'Web'], format: 'PowerPoint', lastUpdated: 'May 2026', author: 'Design Ops', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0a001a 0%, #180028 100%)' },
      { id: 'hc2', name: 'Mobile App Experience Checklist', industry: 'Retail', engagementType: 'Heuristic Evaluation', description: 'Comprehensive mobile UX checklist for native iOS and Android applications, with emphasis on touch targets, gesture design, and performance perception.', tags: ['Mobile', 'iOS/Android'], format: 'PDF', lastUpdated: 'Apr 2026', author: 'UX Strategy', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #001818 0%, #002828 100%)' },
      { id: 'hc3', name: 'AI-Assisted Workflow Checklist', industry: 'Technology', engagementType: 'Heuristic Evaluation', description: 'Purpose-built evaluation checklist for AI-augmented workflows, addressing trust, transparency, error recovery, and human override patterns.', tags: ['AI', 'Trust'], format: 'PowerPoint', lastUpdated: 'Jun 2026', author: 'CX Team', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1a2a48 100%)' },
      { id: 'hc4', name: 'Healthcare Portal Accessibility Checklist', industry: 'Healthcare', engagementType: 'Heuristic Evaluation', description: 'WCAG 2.1 AA compliance checklist tailored for healthcare patient portals, with clinical workflow and health literacy considerations.', tags: ['Accessibility', 'WCAG'], format: 'PDF', lastUpdated: 'Mar 2026', author: 'Design Ops', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0e1a2a 0%, #1a3a5a 100%)' },
      { id: 'hc5', name: 'Financial Services UX Audit Checklist', industry: 'Financial Services', engagementType: 'Heuristic Evaluation', description: 'Structured UX audit framework for financial services digital products, integrating regulatory disclosure requirements with Nielsen heuristics.', tags: ['Audit', 'Regulatory'], format: 'PowerPoint', lastUpdated: 'May 2026', author: 'UX Strategy', viewUrl: 'https://sharepoint.slalom.com', gradient: 'linear-gradient(135deg, #0e1628 0%, #1e2a48 100%)' },
    ],
  },
};

const FORMAT_ICON: Record<string, string> = { Figma: 'F', Miro: 'M', PowerPoint: 'P', PDF: '↓' };
const FORMAT_LABEL: Record<string, string> = { Figma: 'View in Figma', Miro: 'View in Miro', PowerPoint: 'Open deck', PDF: 'Download PDF' };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DesignShelfCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [industriesOpen, setIndustriesOpen] = useState(true);
  const [formatsOpen, setFormatsOpen] = useState(true);
  const [liveArtifacts, setLiveArtifacts] = useState<ShelfArtifact[]>([]);

  const data = MOCK_DATA[category];

  // Load extracted artifacts from published showcases
  useEffect(() => {
    try {
      const all: ShelfArtifact[] = JSON.parse(localStorage.getItem('toyboxShelfArtifacts') || '[]');
      setLiveArtifacts(all.filter((a) => a.category === category));
    } catch {
      // localStorage not available (SSR guard)
    }
  }, [category]);

  const availableIndustries = useMemo(() =>
    Array.from(new Set(data?.artifacts.map((a) => a.industry) ?? [])).sort(),
  [data]);

  const availableFormats = useMemo(() =>
    Array.from(new Set(data?.artifacts.map((a) => a.format) ?? [])).sort(),
  [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.artifacts.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
      const matchesIndustry = selectedIndustries.length === 0 || selectedIndustries.includes(a.industry);
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(a.format);
      return matchesSearch && matchesIndustry && matchesFormat;
    });
  }, [data, searchQuery, selectedIndustries, selectedFormats]);

  const toggleFacet = (set: string[], setter: (v: string[]) => void, value: string) => {
    setter(set.includes(value) ? set.filter((v) => v !== value) : [...set, value]);
  };

  const clearAll = () => { setSelectedIndustries([]); setSelectedFormats([]); setSearchQuery(''); };
  const hasFilters = selectedIndustries.length > 0 || selectedFormats.length > 0 || !!searchQuery;

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <ToyboxHeader />
        <main className="mx-auto max-w-xl px-6 py-32 text-center">
          <h1 className="text-3xl font-semibold text-slate-950">Category not found</h1>
          <Link href="/#design-shelf" className="mt-6 inline-flex rounded-lg px-5 py-3 text-sm font-semibold text-white" style={{ background: '#005AFF' }}>← Design Shelf</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <ToyboxHeader transparent mode="contextual" backHref="/#design-shelf" backLabel="Design Shelf" pageTitle={data.title} />

      {/* Page header */}
      <div className="border-b border-white/8 bg-[#0A0A0F]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Design Shelf</p>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-6xl">{data.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400 leading-8">{data.subtitle}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="flex gap-8">

          {/* ── Left facets panel ── */}
          <aside className="hidden w-56 shrink-0 lg:block">

            <div className="relative mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${data.title.toLowerCase()}…`}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#005AFF] focus:ring-2 focus:ring-[#005AFF]/10"
              />
            </div>

            {hasFilters && (
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                <button onClick={clearAll} className="text-xs font-medium" style={{ color: '#005AFF' }}>Clear all</button>
              </div>
            )}

            {/* Industry */}
            <FacetGroup
              label="Industry"
              open={industriesOpen}
              onToggle={() => setIndustriesOpen(!industriesOpen)}
              items={availableIndustries}
              counts={Object.fromEntries(availableIndustries.map((i) => [i, data.artifacts.filter((a) => a.industry === i).length]))}
              selected={selectedIndustries}
              onToggleItem={(v) => toggleFacet(selectedIndustries, setSelectedIndustries, v)}
            />

            {/* Format */}
            <FacetGroup
              label="Format"
              open={formatsOpen}
              onToggle={() => setFormatsOpen(!formatsOpen)}
              items={availableFormats}
              counts={Object.fromEntries(availableFormats.map((f) => [f, data.artifacts.filter((a) => a.format === f).length]))}
              selected={selectedFormats}
              onToggleItem={(v) => toggleFacet(selectedFormats, setSelectedFormats, v)}
            />

          </aside>

          {/* ── Results ── */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-950">{filtered.length}</span> {data.title.toLowerCase()} found
              </p>
              {!hasFilters && (
                <p className="hidden text-xs text-slate-400 lg:block">Filter by industry or format on the left</p>
              )}
            </div>

            {/* ── From your published showcases ── */}
            {liveArtifacts.length > 0 && (
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={14} style={{ color: '#005AFF' }} />
                  <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#005AFF' }}>
                    Extracted from your showcases
                  </p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: '#005AFF' }}>
                    {liveArtifacts.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {liveArtifacts.map((a) => (
                    <LiveArtifactCard key={a.id} artifact={a} category={category} />
                  ))}
                </div>
                <div className="my-8 border-t border-slate-200" />
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Template library</p>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
                <p className="text-slate-400">No results match your filters.</p>
                <button onClick={clearAll} className="mt-3 text-sm font-medium" style={{ color: '#005AFF' }}>Clear filters →</button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((artifact) => (
                  <div key={artifact.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative h-40 overflow-hidden" style={{ background: artifact.gradient }}>
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
                        <span className="text-xs font-bold text-white">{FORMAT_ICON[artifact.format]}</span>
                        <span className="text-xs text-white/80">{artifact.format}</span>
                      </div>
                      <div className="absolute right-3 top-3 rounded-md bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{artifact.industry}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl font-bold text-white/5">{artifact.name[0]}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60" style={{ background: '#DCFF00' }} />
                    </div>

                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-slate-950">{artifact.name}</h3>
                      <p className="mt-0.5 text-xs font-medium" style={{ color: '#005AFF' }}>{artifact.engagementType}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{artifact.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {artifact.tags.map((tag) => (
                          <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">{tag}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                        <span>Updated {artifact.lastUpdated}</span>
                        <span>{artifact.author}</span>
                      </div>
                      <a href={artifact.viewUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ background: '#005AFF' }}>
                        <ExternalLink size={12} />
                        {FORMAT_LABEL[artifact.format]}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Live artifact card (from published showcases) ─────────────────────────────

const DOMAIN_GRADIENTS: Record<string, string> = {
  'Healthcare': 'linear-gradient(135deg, #0e1a2a 0%, #1a3a5a 100%)',
  'Financial Services': 'linear-gradient(135deg, #0e1628 0%, #1a2a48 100%)',
  'Insurance': 'linear-gradient(135deg, #1a0a00 0%, #2a1800 100%)',
  'Public Sector': 'linear-gradient(135deg, #100a1a 0%, #201828 100%)',
  'Retail': 'linear-gradient(135deg, #001818 0%, #002828 100%)',
  'Technology': 'linear-gradient(135deg, #0a001a 0%, #180028 100%)',
  'Hospitality': 'linear-gradient(135deg, #0a1800 0%, #182a00 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #111 0%, #222 100%)';

function LiveArtifactCard({ artifact, category }: { artifact: ShelfArtifact; category: string }) {
  const gradient = DOMAIN_GRADIENTS[artifact.domain] || DEFAULT_GRADIENT;
  const date = new Date(artifact.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <Link
      href={`/showcase/preview?mode=published&previewId=${artifact.previewId}`}
      className="group block overflow-hidden rounded-2xl border border-[#005AFF]/20 bg-white transition hover:border-[#005AFF]/40 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden" style={{ background: gradient }}>
        {/* Live badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md px-2.5 py-1.5" style={{ background: '#005AFF' }}>
          <Sparkles size={10} color="white" />
          <span className="text-[10px] font-bold text-white">From Toybox</span>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{artifact.domain}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl font-bold text-white/5">{artifact.name[0]}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#005AFF', opacity: 0.8 }} />
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#005AFF' }}>
            {artifact.projectName}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-slate-950">{artifact.name}</h3>
        {artifact.role && <p className="mt-0.5 text-xs text-slate-500">{artifact.role}</p>}
        {artifact.description && (
          <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{artifact.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span>Published {date}</span>
          <span className="font-medium" style={{ color: '#005AFF' }}>View showcase →</span>
        </div>
      </div>
    </Link>
  );
}

// ── Facet group component ─────────────────────────────────────────────────────

function FacetGroup({ label, open, onToggle, items, counts, selected, onToggleItem }: {
  label: string;
  open: boolean;
  onToggle: () => void;
  items: string[];
  counts: Record<string, number>;
  selected: string[];
  onToggleItem: (v: string) => void;
}) {
  return (
    <div className="mb-5 border-b border-slate-200 pb-5">
      <button className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-3" onClick={onToggle}>
        {label}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="space-y-2.5">
          {items.map((item) => (
            <label key={item} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => onToggleItem(item)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-[#005AFF]"
                />
                <span className={`leading-snug ${selected.includes(item) ? 'font-medium text-slate-950' : 'text-slate-600'}`}>{item}</span>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{counts[item]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
