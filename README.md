# Toybox

**Curated Intelligence for Experience Acceleration**

Toybox is an AI-powered design repository that transforms scattered project artifacts into reusable organizational intelligence. Rather than functioning as a traditional asset store, Toybox serves as a living knowledge system — helping teams discover, understand, package, and reuse the work from past engagements to accelerate future ones.

**Working site:** https://toybox-chi.vercel.app/

---

## What It Does

Most design organizations create enormous amounts of valuable work — research findings, journey maps, service blueprints, personas, process flows, prototypes, strategy decks, and final deliverables. Once a project closes, that knowledge fragments across platforms and becomes difficult to find, understand, or reuse.

Toybox addresses this by combining a curated showcase gallery with an AI generation pipeline. Users upload project artifacts, and Toybox uses Claude to analyze the material and produce a structured, publish-ready showcase experience. Published showcases accumulate into a growing organizational knowledge base that any team member can browse and learn from.

---

## Core Features

### AI-Powered Showcase Generation
Upload images and PDFs from any project. Toybox sends the material to Claude, which reads the artifacts and generates a complete showcase containing a problem statement, user personas, experience challenges, solution highlights, outcomes, and a narrative arc. No manual writing required.

### Curated Intelligence Gallery
Published showcases appear in a browsable grid on the home page. AI-generated showcases are automatically surfaced with a "New" badge. The gallery currently includes six hand-curated reference showcases spanning Financial Services, Insurance, Banking, Hospitality, Government, and Internal Services.

### Featured Showcase Carousel
A full-viewport hero carousel highlights flagship showcases with auto-advance, pause control, and manual navigation.

### Showcase Preview and Publishing
Before going live, users review the fully rendered showcase in a dedicated preview page. One click publishes it to the Curated Intelligence gallery, with an immediate confirmation toast.

### Design Shelf
A horizontally scrollable section surfacing reusable artifact types — Personas, Journey Maps, Service Blueprints, Storyboards, and Heuristic Checklists — as the entry point for the asset-acceleration use cases planned in future releases.

### Dark / Light Mode
Full theme support across all pages.

---

## Application Structure

| Route | Purpose |
|---|---|
| `/` | Home — featured carousel, curated gallery, design shelf |
| `/upload` | Choose between AI generation and manual authoring |
| `/upload/ai` | Upload artifacts and trigger AI showcase generation |
| `/upload/manual` | Guided manual authoring form *(planned)* |
| `/showcase/preview` | Review and publish an AI-generated showcase |
| `/showcase/[slug]` | Individual published showcase page |
| `/showcase/index-composer` | Hand-crafted Index Composer flagship showcase |

---

## What Works Today

| Capability | Status |
|---|---|
| Upload images (PNG, JPG, WEBP — up to 10 files, 8 MB each) | ✅ |
| Upload PDFs (up to 1 file, 10 MB) | ✅ |
| Metadata input (project name, domain, engagement type, tags) | ✅ |
| AI showcase generation via Claude Sonnet 4.5 | ✅ |
| Showcase preview | ✅ |
| Publish to Curated Intelligence | ✅ |
| AI-generated showcases appear in home feed | ✅ |
| Six hand-curated reference showcases | ✅ |
| Featured carousel | ✅ |
| Design Shelf (visual) | ✅ |
| Dark / light mode | ✅ |

---

## Planned for Next Releases

| Capability | Priority |
|---|---|
| Manual case study authoring (guided form) | High |
| Search across showcases | High |
| Figma ingestion | High |
| PowerPoint / deck ingestion | High |
| Semantic / embedding-based search | Medium |
| AI-powered recommendations | Medium |
| Cross-project pattern detection | Medium |
| Design Shelf — browse and download artifacts | Medium |
| Collections — group related showcases | Medium |
| Collaboration and commenting | Medium |
| Asset versioning and governance | Low |
| Knowledge graph visualization | Low |
| Market signal scanning (Experience Accelerator layer) | Future |
| RAG-powered proposal assistant | Future |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| State / Persistence | React state, localStorage, IndexedDB |
| AI | Claude API (Anthropic) — claude-sonnet-4-5 |
| Deployment | Vercel |
| Version Control | GitHub |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To use AI generation, add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=your_key_here
```

---

## Key Use Cases

**Sales Acceleration** — quickly identify and share relevant past project examples during client conversations.

**Proposal Response** — locate reusable content, supporting artifacts, and experience evidence for bids and RFPs.

**Design Acceleration** — give designers access to reusable deliverables, patterns, and frameworks from analogous past projects.

**Discovery Acceleration** — reduce time spent recreating research by surfacing existing organizational knowledge.

**Knowledge Preservation** — ensure valuable project work remains discoverable long after project teams have moved on.

---

## The Bigger Picture

Toybox MVP is the foundation of an **Experience Accelerator** — a platform where AI scans the collective portfolio of organizational knowledge, monitors market signals, and surfaces relevant patterns and artifacts at the moment a new engagement begins. The IA and data model are designed to scale toward this vision: new ingestion sources, richer semantic relationships between showcases, and proactive recommendations as the knowledge base grows.

See [BRIEF.MD](BRIEF.MD) for the full product brief, conceptualization, and roadmap.
