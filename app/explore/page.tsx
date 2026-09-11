'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Search, Bell, Bookmark, Pause, Play, ChevronRight, ArrowRight, Sparkles, CheckCircle2, X, HelpCircle } from 'lucide-react';
import { ProfileSwitcher } from '@/app/components/ToyboxHeader';
import AddShowcaseDropdown from '@/app/components/AddShowcaseDropdown';
import OnboardingModal from '@/app/components/OnboardingModal';

async function saveCuratedPreview(previewId: string, payload: any) {
  return new Promise<void>((resolve, reject) => {
    const req = indexedDB.open('toybox-db', 1);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore('showcases', { keyPath: 'id' });
    };
    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const tx = db.transaction('showcases', 'readwrite');
      tx.objectStore('showcases').put({ id: previewId, previewPayload: payload, imageOverrides: {}, savedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

// Curated showcase static payloads — opens in the editorial preview viewer
const CURATED_PAYLOADS: Record<string, any> = {
  'curated/claimsProcessing': {
    metadata: { projectName: 'Claims Processing', domain: 'Insurance', tags: ['Workflow Transformation', 'Claims', 'Operations'], engagementType: 'Service Design' },
    showcase: {
      title: 'Claims Processing Transformation', subtitle: 'End-to-end service redesign for a major insurance carrier',
      domain: 'Insurance', heroStatement: 'A fragmented, manual claims process was costing customers trust and adjusters time. We redesigned the end-to-end experience — from First Notice of Loss to settlement — cutting cycle time and elevating satisfaction across every touchpoint.',
      overview: 'Working with a leading P&C insurer, Slalom redesigned the claims journey across digital, phone, and field channels. The engagement spanned discovery research, service blueprinting, and a phased digital delivery roadmap.',
      challenge: 'Adjusters were managing claims across four disconnected systems. Customers had no visibility into status. Cycle times exceeded industry benchmarks by 40% and CSAT scores had declined for three consecutive quarters.',
      mission: 'Create a unified, human-centered claims experience that gives customers transparency, reduces adjuster cognitive load, and enables faster, more accurate settlement decisions.',
      impact: 'Projected 35% reduction in average cycle time. Adjuster satisfaction scores improved 28 points in pilot. Customer NPS increased 22 points within 6 months of launch.',
      personas: [
        { name: 'Maria Chen', role: 'Auto Claims Customer', need: 'Understand claim status and get reimbursed quickly', painPoint: 'No visibility after filing — calls go unanswered for days', solutionSupport: 'Real-time status portal with proactive SMS updates', assetName: '' },
        { name: 'James Okafor', role: 'FNOL Handler', need: 'Capture accurate first notice quickly and route correctly', painPoint: 'Paper forms and re-keying data across systems causes errors', solutionSupport: 'Guided digital intake with smart routing reduces re-work by 60%', assetName: '' },
        { name: 'Sarah Mitchell', role: 'Claims Adjuster', need: 'Assess damages and settle claims accurately', painPoint: 'Four separate systems to access claimant history, photos, and valuations', solutionSupport: 'Unified adjuster workbench with integrated photo review and valuation tools', assetName: '' },
        { name: 'Derek Williams', role: 'Claims Supervisor', need: 'Monitor team workload and flag complex cases early', painPoint: 'No real-time dashboard — relies on weekly reports to spot bottlenecks', solutionSupport: 'Live operations dashboard with queue management and escalation alerts', assetName: '' },
        { name: 'Priya Nair', role: 'Total Loss Adjuster', need: 'Determine fair market value and manage customer expectations', painPoint: 'Valuation disputes consume 3x average cycle time', solutionSupport: 'Transparent valuation tool shared with customers reduces disputes by 45%', assetName: '' },
      ],
      solutionHighlights: [
        { heading: 'Unified Adjuster Workbench', body: 'Consolidated four legacy systems into a single workspace with integrated damage photo review, valuation lookup, and communication history.', assetName: '' },
        { heading: 'Customer Status Portal', body: 'Self-service portal giving claimants real-time claim tracking, document upload, and direct messaging with their adjuster.', assetName: '' },
        { heading: 'Smart FNOL Intake', body: 'Guided digital intake flow with AI-assisted damage triage and automatic routing to the right specialist team.', assetName: '' },
      ],
      visualSections: [],
      suggestedTags: ['Claims', 'Insurance', 'Service Design', 'Workflow Automation', 'CX'],
      _aiGenerated: { heroStatement: false, overview: false, challenge: false, impact: false, personas: false, solutionHighlights: false },
    },
  },
  'curated/clientDashboard': {
    metadata: { projectName: 'Client Dashboard', domain: 'Financial Services', tags: ['Customer Experience', 'Dashboard', 'FinTech'], engagementType: 'Product Design' },
    showcase: {
      title: 'Client Dashboard', subtitle: 'Unified wealth management experience for high-net-worth clients',
      domain: 'Financial Services', heroStatement: 'A fragmented view of investments, loans, and banking relationships was eroding trust with high-value clients. We designed a unified dashboard that puts everything in one place.',
      overview: 'Slalom partnered with a regional bank to redesign the digital experience for HNW clients — consolidating portfolio, banking, and relationship data into a single, intuitive interface.',
      challenge: 'Clients managed their relationship across three separate portals with no unified view. Relationship managers had to manually compile information before client meetings, taking hours each week.',
      mission: 'Deliver a unified client dashboard that reduces friction, increases digital engagement, and frees relationship managers to focus on high-value advisory work.',
      impact: 'Digital engagement increased 40%. Relationship manager prep time reduced by 3 hours per week. Client NPS improved 18 points in the first year.',
      personas: [
        { name: 'Robert Harrington', role: 'HNW Banking Client', need: 'Clear, consolidated view of all financial relationships', painPoint: 'Three portals with different logins — no single picture of net worth', solutionSupport: 'Unified dashboard aggregating all accounts, investments, and loans', assetName: '' },
        { name: 'Angela Flores', role: 'Relationship Manager', need: 'Prepare for client meetings quickly and accurately', painPoint: 'Manual data gathering from multiple systems takes hours per client', solutionSupport: 'Pre-built client summary view with recent activity and portfolio snapshot', assetName: '' },
        { name: 'Thomas Banks', role: 'Operations Analyst', need: 'Ensure data accuracy and system reliability', painPoint: 'Manual reconciliation between systems causes data lags and discrepancies', solutionSupport: 'Real-time data feeds with automated reconciliation and alerting', assetName: '' },
        { name: 'Lisa Cheng', role: 'Branch Manager', need: 'Track team performance and client satisfaction', painPoint: 'No visibility into digital engagement metrics for their client portfolio', solutionSupport: 'Branch-level analytics dashboard with client engagement and NPS trends', assetName: '' },
      ],
      solutionHighlights: [
        { heading: 'Unified Portfolio View', body: 'Single dashboard consolidating investments, banking, and loans with real-time valuations and performance metrics.', assetName: '' },
        { heading: 'Relationship Manager Workspace', body: 'Pre-meeting client summary with recent activity, key milestones, and talking points auto-generated from account data.', assetName: '' },
      ],
      visualSections: [],
      suggestedTags: ['Banking', 'Dashboard', 'HNW', 'Wealth Management', 'CX'],
      _aiGenerated: { heroStatement: false, overview: false, challenge: false, impact: false, personas: false, solutionHighlights: false },
    },
  },
  'curated/casinoExperience': {
    metadata: { projectName: 'Next Generation Casino Experience', domain: 'Hospitality', tags: ['Experience Concept', 'Gaming', 'Loyalty'], engagementType: 'Experience Strategy' },
    showcase: {
      title: 'Next Generation Casino Experience', subtitle: 'Reimagining the physical and digital casino journey for a new era of guests',
      domain: 'Hospitality', heroStatement: 'The traditional casino floor was designed for a generation of guests who no longer walk through the door. We reimagined the entire experience — from pre-arrival anticipation to post-stay loyalty — for the next generation.',
      overview: 'Slalom led a full experience strategy engagement for a major hospitality group, mapping the casino journey across digital, physical, and service touchpoints to identify the highest-value redesign opportunities.',
      challenge: 'Younger guests expected seamless digital integration, personalized service, and experiences worth sharing. Legacy loyalty programs, disconnected apps, and impersonal floor interactions were driving them to competitors.',
      mission: 'Design a cohesive next-generation guest experience that blends digital personalization with authentic hospitality moments — increasing visit frequency and per-guest spend among the 25-45 demographic.',
      impact: 'Concept testing showed 67% higher intent to return among target demographic. Digital engagement with loyalty program projected to increase 3x. Estimated $12M incremental annual revenue from new experience zones.',
      personas: [
        { name: 'Jordan Walsh', role: 'Social Casino Guest', need: 'Memorable experiences worth sharing with their network', painPoint: 'The casino feels dated and impersonal compared to boutique hospitality brands', solutionSupport: 'Instagrammable experience zones with personalized digital moments', assetName: '' },
        { name: 'Carmen Rodriguez', role: 'Loyal High-Value Player', need: 'Recognition and personalized perks for their loyalty', painPoint: 'Loyalty benefits feel generic — same offers as first-time guests', solutionSupport: 'Tiered personalization engine surfacing exclusive offers based on play history', assetName: '' },
        { name: 'Mike Tanaka', role: 'Floor Host', need: 'Deliver personalized service to high-value guests', painPoint: 'No real-time guest insights — relies on memory and paper printouts', solutionSupport: 'Mobile guest intelligence app with visit history, preferences, and live alerts', assetName: '' },
        { name: 'Diana Prince', role: 'Guest Experience Manager', need: 'Monitor floor experience quality and respond to issues quickly', painPoint: 'Guest feedback arrives too late to act on during the visit', solutionSupport: 'Live sentiment monitoring with in-visit recovery workflows', assetName: '' },
      ],
      solutionHighlights: [
        { heading: 'Personalized Arrival Experience', body: 'Mobile check-in with room preferences pre-set, personalized welcome message on room TV, and curated itinerary based on past visits.', assetName: '' },
        { heading: 'Dynamic Loyalty Program', body: 'Real-time offer engine delivering personalized promotions based on in-visit behavior — moving beyond static tier rewards.', assetName: '' },
        { heading: 'Floor Host Intelligence App', body: 'Mobile tool giving floor hosts instant guest profiles, preference history, and nudges for high-value service moments.', assetName: '' },
      ],
      visualSections: [],
      suggestedTags: ['Hospitality', 'Gaming', 'Loyalty', 'Experience Strategy', 'Personalization'],
      _aiGenerated: { heroStatement: false, overview: false, challenge: false, impact: false, personas: false, solutionHighlights: false },
    },
  },
  'curated/nyParentPortal': {
    metadata: { projectName: 'Parent Portal — State of New York', domain: 'Government', tags: ['Public Sector', 'Digital Services', 'Citizen Experience'], engagementType: 'Service Design' },
    showcase: {
      title: 'Parent Portal — State of New York', subtitle: 'Simplifying access to child services for New York families',
      domain: 'Government', heroStatement: 'Families navigating child welfare, education, and benefits programs were lost in a maze of disconnected systems and confusing language. We built a single portal that puts families first.',
      overview: 'Slalom worked with a New York State agency to design a unified parent portal consolidating access to education enrollment, benefits applications, and child welfare case tracking into a single, plain-language experience.',
      challenge: 'Families needed to navigate 7 separate agencies and websites to access services they were entitled to. Language barriers and low digital literacy compounded the challenge, leading to service gaps and low uptake.',
      mission: 'Create a unified, accessible digital portal that reduces friction for families seeking state services — increasing program uptake and reducing call center volume.',
      impact: 'Pilot showed 45% reduction in average task completion time. Call center volume decreased 30% for piloted services. Accessibility score improved to WCAG AA compliance across all touchpoints.',
      personas: [
        { name: 'Maria Gonzalez', role: 'Parent / Primary Caregiver', need: 'Access benefits and school enrollment without navigating multiple sites', painPoint: 'Seven different logins, forms in English only, and no clear status updates', solutionSupport: 'Single portal with multi-language support and real-time application status', assetName: '' },
        { name: 'David Kim', role: 'Case Worker', need: 'Process applications accurately and support families with complex needs', painPoint: 'Multiple systems require re-entry of the same data, causing errors and delays', solutionSupport: 'Unified case view reduces re-keying and flags at-risk families for proactive outreach', assetName: '' },
        { name: 'Sandra Fields', role: 'Program Manager', need: 'Track service uptake and identify access gaps by region', painPoint: 'No aggregate view of who is and isn\'t accessing services', solutionSupport: 'Program analytics dashboard with demographic and geographic breakdowns', assetName: '' },
        { name: 'James Obi', role: 'Service Coordinator', need: 'Connect families to the right services quickly', painPoint: 'No tools to identify all eligible programs for a given family situation', solutionSupport: 'Needs-based eligibility engine surfaces all applicable programs in one view', assetName: '' },
      ],
      solutionHighlights: [
        { heading: 'Unified Family Portal', body: 'Single authenticated portal giving parents access to all state services — education, benefits, childcare, and welfare — with consistent navigation and plain language.', assetName: '' },
        { heading: 'Multi-Language Support', body: 'Full portal available in 8 languages with human-reviewed translations for all critical service content.', assetName: '' },
        { heading: 'Eligibility Navigator', body: 'Smart questionnaire surfaces all programs a family may qualify for based on their situation, reducing reliance on case workers for discovery.', assetName: '' },
      ],
      visualSections: [],
      suggestedTags: ['Government', 'Public Sector', 'Digital Services', 'Accessibility', 'CX'],
      _aiGenerated: { heroStatement: false, overview: false, challenge: false, impact: false, personas: false, solutionHighlights: false },
    },
  },
  'curated/intranetSharePoint': {
    metadata: { projectName: 'Intranet SharePoint Experience', domain: 'Internal Services', tags: ['Employee Experience', 'SharePoint', 'Collaboration'], engagementType: 'Product Design' },
    showcase: {
      title: 'Intranet SharePoint Experience', subtitle: 'Designing a modern employee intranet that people actually use',
      domain: 'Internal Services', heroStatement: 'The existing intranet was a digital graveyard — outdated content, impossible navigation, and zero adoption. We redesigned it around how employees actually work.',
      overview: 'Slalom partnered with a professional services firm to redesign their SharePoint intranet — from information architecture through visual design and governance — resulting in a resource employees return to daily.',
      challenge: 'Adoption had fallen to under 5% of employees using the intranet weekly. Content was 3+ years out of date, navigation required 5+ clicks to reach common resources, and the design hadn\'t been updated since 2019.',
      mission: 'Redesign the intranet as a living, trusted employee hub — surfacing relevant content, streamlining common tasks, and making it easy for teams to keep their spaces current.',
      impact: 'Weekly active users increased from 5% to 62% within 3 months of launch. Content freshness score improved from 34% to 89%. IT helpdesk tickets for "can\'t find" queries dropped 55%.',
      personas: [
        { name: 'Alex Turner', role: 'Employee / End User', need: 'Find policies, tools, and announcements quickly without digging', painPoint: 'Spends 20+ minutes per week searching for content that should be one click away', solutionSupport: 'Personalized homepage with role-based content surfacing and powerful search', assetName: '' },
        { name: 'Natalie Ross', role: 'HR Content Owner', need: 'Keep HR policies and resources current and discoverable', painPoint: 'No governance tools — content expires silently with no owner notifications', solutionSupport: 'Content lifecycle management with automated expiry alerts and owner dashboard', assetName: '' },
        { name: 'Chris Parker', role: 'IT Administrator', need: 'Manage SharePoint permissions and monitor usage at scale', painPoint: 'Permission management is manual and time-consuming across hundreds of sites', solutionSupport: 'Centralized admin console with bulk permission management and usage analytics', assetName: '' },
        { name: 'Robin Chen', role: 'Department Manager', need: 'Keep their team\'s intranet space accurate and useful', painPoint: 'Non-technical managers find SharePoint authoring tools too complex to use confidently', solutionSupport: 'Simplified page editor with templates, reducing authoring time from 2 hours to 15 minutes', assetName: '' },
      ],
      solutionHighlights: [
        { heading: 'Personalized Employee Homepage', body: 'Role-based homepage surfacing relevant news, tools, and tasks — reducing time to find common resources from minutes to seconds.', assetName: '' },
        { heading: 'Content Governance System', body: 'Automated content lifecycle management with owner notifications, expiry dates, and a freshness dashboard for site managers.', assetName: '' },
        { heading: 'Simplified Authoring', body: 'Pre-built page templates and a simplified editor empowering non-technical content owners to publish and update without IT support.', assetName: '' },
      ],
      visualSections: [],
      suggestedTags: ['Employee Experience', 'SharePoint', 'Intranet', 'Governance', 'Collaboration'],
      _aiGenerated: { heroStatement: false, overview: false, challenge: false, impact: false, personas: false, solutionHighlights: false },
    },
  },
};

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

function ogUrl(title: string, domain: string, tags: string) {
  return `/api/og?title=${encodeURIComponent(title)}&domain=${encodeURIComponent(domain)}&tags=${encodeURIComponent(tags)}`;
}

const repositoryCards: RepositoryCard[] = [
  { id: '2', title: 'Index Composer', type: 'Enterprise Platform', creator: 'Financial Services', rating: 4.7, assetFolder: 'curated/indexComposer', heroImage: '/assets/curated/indexComposer/Preview.png' },
  { id: '1', title: 'Claims Processing', type: 'Workflow Transformation', creator: 'Insurance', rating: 4.8, assetFolder: 'curated/claimsProcessing', heroImage: ogUrl('Claims Processing', 'Insurance', 'Workflow Transformation,Claims,Operations') },
  { id: '3', title: 'Client Dashboard', type: 'Customer Experience', creator: 'Banking', rating: 4.7, assetFolder: 'curated/clientDashboard', heroImage: ogUrl('Client Dashboard', 'Financial Services', 'Customer Experience,Dashboard,FinTech') },
  { id: '4', title: 'Next Generation Casino Experience', type: 'Experience Concept', creator: 'Hospitality', rating: 4.8, assetFolder: 'curated/casinoExperience', heroImage: ogUrl('Next Generation Casino Experience', 'Hospitality', 'Experience Concept,Gaming,Loyalty') },
  { id: '5', title: 'Parent Portal — State of New York', type: 'Public Sector', creator: 'Government', rating: 4.7, assetFolder: 'curated/nyParentPortal', heroImage: ogUrl('Parent Portal — State of New York', 'Government', 'Public Sector,Digital Services,Citizen Experience') },
  { id: '6', title: 'Intranet SharePoint Experience', type: 'Employee Experience', creator: 'Internal Services', rating: 4.6, assetFolder: 'curated/intranetSharePoint', heroImage: ogUrl('Intranet SharePoint Experience', 'Internal Services', 'Employee Experience,SharePoint,Collaboration') },
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

const capabilitySlides = [
  {
    id: 'showcase',
    eyebrow: 'Capability 01 — Knowledge Management',
    headline: 'Turn project work\ninto collective knowledge.',
    body: 'Upload artifacts from any engagement. Toybox AI builds the showcase. Every project becomes a reusable asset for the next one.',
    ctas: [
      { label: 'Add a showcase', href: '/upload', primary: true, dropdown: true },
      { label: 'Browse gallery', href: '#gallery', primary: false },
    ],
    accent: '#005AFF',
    bg: 'radial-gradient(ellipse 80% 60% at 60% 40%, #001433 0%, #0A0A0F 100%)',
  },
  {
    id: 'exa',
    eyebrow: 'Capability 02 — Experience Accelerator',
    headline: 'Generate a client-ready\naccelerator in seconds.',
    body: 'Describe your next client meeting. ExA remixes Slalom\'s knowledge base into a white-labeled pitch, blueprint, or proposal — tailored to their industry.',
    ctas: [
      { label: 'Launch Experience Accelerator', href: '/accelerator', primary: true },
    ],
    accent: '#DCFF00',
    bg: 'radial-gradient(ellipse 80% 60% at 40% 50%, #0d1a00 0%, #0A0A0F 100%)',
  },
];

function CapabilityHero({ darkMode }: { darkMode: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % capabilitySlides.length), 7000);
    return () => clearInterval(t);
  }, []);

  const slide = capabilitySlides[active];

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 520 }}>
      {/* Animated background */}
      {capabilitySlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: s.bg, opacity: i === active ? 1 : 0 }}
        />
      ))}

      {/* Yellow bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: '#DCFF00' }} />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 py-20 sm:py-28">
        <div className="max-w-4xl">
          {/* Slide indicators */}
          <div className="flex items-center gap-3 mb-8">
            {capabilitySlides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className="flex items-center gap-2 group"
              >
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i === active ? 32 : 12,
                    background: i === active ? slide.accent : 'rgba(255,255,255,0.2)',
                  }}
                />
                <span className={`text-[11px] font-semibold uppercase tracking-widest transition ${i === active ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`} style={{ color: i === active ? slide.accent : '#fff' }}>
                  {s.id === 'showcase' ? 'Knowledge' : 'Accelerator'}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-5" style={{ color: slide.accent }}>
            {slide.eyebrow}
          </p>

          <h1 className="text-6xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-7xl text-white" style={{ whiteSpace: 'pre-line' }}>
            {slide.headline}
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-400">
            {slide.body}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {slide.ctas.map((cta) =>
              (cta as any).dropdown ? (
                <AddShowcaseDropdown key={cta.label} variant="hero" />
              ) : (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition"
                  style={cta.primary
                    ? { background: slide.accent, color: slide.accent === '#DCFF00' ? '#0A0A0F' : '#fff' }
                    : { border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }
                  }
                >
                  {cta.label} {cta.primary && <ArrowRight size={15} />}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Slide counter */}
        <p className="absolute bottom-8 right-8 text-xs text-white/25 font-mono tabular-nums">
          {String(active + 1).padStart(2, '0')} / {String(capabilitySlides.length).padStart(2, '0')}
        </p>
      </div>
    </section>
  );
}

const filters = ['All', 'Workflow', 'Experience', 'Customer', 'Strategy'];

export default function Home() {
  const [darkMode] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);
  // tourOpen used to re-trigger onboarding modal
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<RepositoryCard[]>([]);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [adminPublishSuccess, setAdminPublishSuccess] = useState<{ title: string; personaCount: number; previewId: string } | null>(null);
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
        id: String(item.previewId || item.id || `gen-${i}`),
        title: item.title || 'Generated Showcase',
        type: item.domain || 'AI Generated',
        creator: item.domain || 'Toybox AI',
        rating: 4.9,
        heroImage: item.heroImage || `/api/og?title=${encodeURIComponent(item.title || '')}&domain=${encodeURIComponent(item.domain || '')}&tags=${encodeURIComponent((item.tags || []).slice(0, 3).join(','))}`,
        previewPayload: item.previewPayload || null,
        __generated: true,
        isNew: i === 0,
      })));
      const latest = published[0];
      const successRaw = sessionStorage.getItem('toyboxPublishSuccess');
      if (successRaw) {
        sessionStorage.removeItem('toyboxPublishSuccess');
        setAdminPublishSuccess(JSON.parse(successRaw));
        setTimeout(() => setAdminPublishSuccess(null), 6000);
        return;
      }
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
      <OnboardingModal forceOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {showPublishToast && (
        <div className="fixed right-6 top-20 z-[9999] rounded-xl border border-white/10 bg-[#0A0A0F] px-5 py-4 text-white shadow-2xl">
          <p className="text-sm font-semibold">Showcase published</p>
          <p className="mt-0.5 text-xs text-slate-400">Added to Curated Intelligence</p>
        </div>
      )}

      {adminPublishSuccess && (
        <div className="fixed right-6 top-20 z-[9999] rounded-2xl shadow-2xl overflow-hidden" style={{ border: '1px solid rgba(220,255,0,0.3)', background: '#0A0A0F', minWidth: 320 }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'rgba(220,255,0,0.12)', borderBottom: '1px solid rgba(220,255,0,0.2)' }}>
            <CheckCircle2 size={15} style={{ color: '#DCFF00' }} />
            <p className="text-sm font-semibold" style={{ color: '#DCFF00' }}>1 showcase published to Toybox</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-white mb-0.5">{adminPublishSuccess.title}</p>
            {adminPublishSuccess.personaCount > 0 && (
              <p className="text-xs text-slate-400">{adminPublishSuccess.personaCount} persona{adminPublishSuccess.personaCount !== 1 ? 's' : ''} extracted to Design Shelf</p>
            )}
            <Link href={`/admin/review?previewId=${adminPublishSuccess.previewId}`} className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#005AFF' }}>
              View showcase <ArrowRight size={11} />
            </Link>
          </div>
          <button onClick={() => setAdminPublishSuccess(null)} className="absolute right-3 top-3 p-1 text-white/30 hover:text-white/70 transition" aria-label="Dismiss">
            <X size={13} />
          </button>
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
            {[
              { label: 'Discover', href: '/' },
              { label: 'Collections', href: '/#collections' },
              { label: 'Design Shelf', href: '#design-shelf' },
              { label: 'Experience Accelerator', href: '/accelerator' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className={`font-medium transition ${label === 'Discover' ? (darkMode ? 'text-white' : 'text-slate-950') : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950')}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <AddShowcaseDropdown variant="header" />
            <button className={`grid h-9 w-9 place-items-center rounded-lg transition ${darkMode ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Search size={16} /></button>
            <button onClick={() => setTourOpen(true)} title="Relaunch tour" className={`grid h-9 w-9 place-items-center rounded-lg transition ${darkMode ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><HelpCircle size={16} /></button>
            <button className={`grid h-9 w-9 place-items-center rounded-lg transition ${darkMode ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Bell size={16} /></button>
            <ProfileSwitcher isDark={darkMode} />
          </div>
        </div>
      </header>

      {/* ── Capability carousel hero ── */}
      <CapabilityHero darkMode={darkMode} />

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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-onboarding="showcase-grid">
          {allCards.map((card, idx) => (
            <div key={card.id}
              onClick={async () => {
                if (card.__generated) {
                  window.location.href = `/admin/review?previewId=${card.id}`;
                  return;
                }
                if (card.title === 'Index Composer') { window.location.href = '/showcase/index-composer'; return; }
                if (card.assetFolder && CURATED_PAYLOADS[card.assetFolder]) {
                  const previewId = `curated-${card.assetFolder.split('/')[1]}`;
                  await saveCuratedPreview(previewId, CURATED_PAYLOADS[card.assetFolder]);
                  localStorage.setItem('toyboxActivePreviewId', previewId);
                  window.location.href = `/showcase/preview?previewId=${previewId}`;
                }
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
            <AddShowcaseDropdown variant="cta" />
          </div>
        </div>
      </section>
    </div>
  );
}
