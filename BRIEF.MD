# Toybox — Project Brief

**Project Name:** Toybox
**Author:** Ashok Kumar Ravindran
**Date:** June 2026
**Status:** MVP Prototype v1.0

---

## Overview

Toybox is an AI-powered design repository and showcase platform built to help enterprise experience teams organize, discover, understand, and reuse the knowledge embedded in their project artifacts.

Design organizations generate enormous volumes of work across strategy, research, UX, CX, service design, product design, marketing, and innovation initiatives. That work — decks, journey maps, blueprints, personas, prototypes, research reports — typically scatters across file systems, shared drives, and collaboration tools the moment a project closes. Within months, much of it becomes invisible to the broader team.

Toybox reimagines the design repository as an intelligent experience layer. Rather than storing files, it transforms artifacts into rich, curated showcase experiences that communicate project context, decisions, outcomes, and business value. The result is a living knowledge system that grows more useful over time.

---

## The Problem We Set Out to Solve

Traditional repositories are organized around storage. Teams need a system organized around understanding.

Common pain points that shaped the concept:

- Assets scattered across platforms with no consistent taxonomy
- Project outcomes and design rationale lost when team members rotate off
- New team members spend weeks recreating knowledge that already exists
- Valuable research and deliverables become undiscoverable within six months of project close
- No compelling way to communicate the breadth and depth of design experience to clients or leadership
- Proposal and sales teams manually hunt for relevant past work before every pitch

---

## Design Vision

Toybox is conceived as a **collective intelligence layer for experience teams** — a place where the accumulated knowledge of every engagement is preserved, structured, and made available for future acceleration.

The guiding metaphor is a curated gallery, not a file cabinet. Every piece of work that enters Toybox should emerge as something worth sharing.

### Long-Term Platform Vision

The ultimate goal is an **Experience Accelerator** — a platform that uses AI to:

1. Ingest project collateral from every engagement (decks, deliverables, research, prototypes)
2. Scan market signals, industry patterns, and sector developments
3. Extract reusable patterns, frameworks, and knowledge clusters across the collective portfolio
4. Surface relevant prior work automatically when a new engagement begins
5. Generate draft experience artifacts (personas, journey maps, service blueprints, case studies) seeded from institutional knowledge
6. Identify white-space opportunities by comparing internal capability patterns against external market signals
7. Enable teams to build on prior thinking rather than starting from zero

This vision is deliberately scalable. The IA is designed so that:
- New knowledge sources (Figma, SharePoint, Confluence, Notion) can be connected without restructuring the platform
- Domain taxonomies expand as new industries and engagement types are added
- The AI layer operates against a growing knowledge graph rather than a flat file store
- Individual showcases become nodes in a semantic network that can be queried by relationship, not just keyword

---

## How We Conceptualized the Product

Toybox began from a simple observation: the highest-value output of a design organization is not individual files — it is the structured understanding those files represent. A journey map is not a JPEG; it is a model of a customer's experience at a specific point in time for a specific problem.

The core insight was that **AI can now do what humans never had time to do**: read through artifacts, extract the structured knowledge inside them, and compose that knowledge into a format that is immediately useful to someone who wasn't on the original project.

That insight drove three foundational product decisions:

1. **AI as the primary ingestion mechanism** — rather than requiring teams to fill out metadata forms, the system reads the artifacts and generates the structure
2. **Showcase as the primary output** — rather than surfacing raw files, the system produces a narrative experience that can be shared with a client, used in a proposal, or explored by a new team member
3. **Discovery as the primary use case** — the repository earns its value not by storing things, but by making them findable and understandable at the moment they are needed

---

## Navigation Schema

The application is organized around three top-level destinations and a linear upload-to-publish workflow.

```
Toybox
│
├── Discover (Home)
│   ├── Featured Carousel — highlighted showcases rotating automatically
│   ├── Curated Intelligence Gallery — browsable grid of all published showcases
│   │   └── Filter by: Workflow / Experience / Customer / Strategy
│   └── Design Shelf — horizontally scrollable library of reusable artifact types
│       └── Personas / Journey Maps / Service Blueprints / Storyboards / Heuristic Checklists
│
├── Upload
│   ├── Choose path: AI Generation or Manual Authoring
│   │
│   ├── AI Upload (/upload/ai)
│   │   ├── File upload (images, PDFs — up to 10 images, 1 PDF)
│   │   ├── Metadata input (project name, domain, engagement type, tags)
│   │   ├── AI generation (Claude analyzes assets and produces structured showcase)
│   │   └── Redirect to Preview
│   │
│   └── Manual (/upload/manual)
│       └── Guided structured form [planned — not yet active]
│
├── Showcase Preview (/showcase/preview)
│   ├── Full rendered preview of AI-generated showcase
│   ├── Editable narrative sections
│   ├── Asset gallery validation
│   └── Publish to Curated Intelligence
│
└── Published Showcase
    ├── /showcase/[slug] — individual curated showcase pages
    └── /showcase/index-composer — hand-crafted flagship showcase
```

---

## Key Features

### AI-Powered Case Study Generation

The core capability of the current MVP. Users upload project images and PDFs, provide lightweight metadata (project name, domain, engagement type, tags), and Toybox sends the material to Claude for analysis.

Claude returns a fully structured showcase containing:

- **Problem Statement** — the challenge the project addressed
- **User Personas** — key actors identified from the artifacts
- **Experience Challenges** — friction points surfaced in the work
- **Solution Highlights** — key design decisions and approaches
- **Outcomes and Impact** — results and value delivered
- **Narrative Storytelling** — a coherent written arc across the above sections
- **Asset References** — images and documents mapped to the narrative

The generation pipeline is designed to work with minimal human input. A team member can upload a presentation deck and five screenshots and receive a publishable showcase draft within minutes.

**Technical implementation:**
- API route at `/api/generate-showcase`
- Claude Sonnet 4.5 as the underlying model
- Files converted to data URLs client-side before transmission
- Payload size managed with smart compression (max 3.5 MB to API)
- IndexedDB (`lib/idb.ts`) for local persistence of generated content

### Curated Showcase Gallery

Published showcases appear in the Curated Intelligence grid on the home page. AI-generated showcases are automatically surfaced with a "New" badge and are placed at the top of the feed. Each card links directly to the full showcase experience.

The gallery currently holds six hand-curated reference showcases spanning Financial Services, Insurance, Banking, Hospitality, Government, and Internal Services, alongside any AI-generated showcases the user has published.

### Featured Carousel

A full-viewport hero carousel on the home page highlights three flagship showcases with auto-advance (5-second interval), pause control, and manual dot navigation. The carousel communicates the breadth of the portfolio at a glance.

### Design Shelf

A horizontally scrollable section surfacing reusable artifact types: Personas, Journey Maps, Service Blueprints, Storyboards, and Heuristic Checklists. This section is the entry point for the asset-extraction and design-acceleration use cases planned in future releases.

### Dark / Light Mode

Full dark and light theme support across all pages, persistent within a session.

### Showcase Preview and Publishing Workflow

Before a generated showcase goes live, users review the full rendered experience in a dedicated preview page. From preview, they can publish directly to the Curated Intelligence gallery. A toast notification confirms successful publication and the showcase appears in the home feed immediately.

---

## Scalable Information Architecture

The IA is built to accommodate growth in four dimensions:

**1. Content types** — the current data model supports images, PDFs, and structured narrative blocks. Future content types (Figma frames, video, Miro boards, Confluence pages) can be added as new `AssetSource` categories without restructuring the showcase schema.

**2. Domain taxonomy** — domains are currently a flat list (Banking, Healthcare, Insurance, etc.). The architecture supports promotion to a hierarchical taxonomy with sub-domains and cross-domain tagging as the repository grows.

**3. Showcase structure** — the AI generation prompt produces a fixed set of sections today (problem statement, personas, challenges, solutions, outcomes). This schema is designed to be modular; sections can be added, reordered, or made optional per engagement type without breaking existing showcases.

**4. AI layer** — the generation pipeline is model-agnostic. Claude is the current provider, but the API contract is isolated in a single route handler, making it straightforward to swap models, add retrieval-augmented generation (RAG) against the existing showcase corpus, or layer in embedding-based semantic search.

---

## The Experience Accelerator Vision

Toybox MVP is the foundation of a larger capability: an Experience Accelerator that turns collective organizational knowledge into a competitive advantage.

The path from Toybox MVP to Experience Accelerator involves three phases:

**Phase 1 — Capture (current MVP)**
Build the repository. Establish the ingestion pipeline. Demonstrate AI-generated showcase quality. Create the knowledge base that future phases will operate against.

**Phase 2 — Connect**
Ingest from more sources (Figma, SharePoint, Confluence, PPT, Notion). Extract structured metadata at ingestion (deliverable type, methods used, outcomes, client sector, team). Build a semantic layer across the corpus — every showcase becomes a node with relationships to others by domain, method, and outcome type.

**Phase 3 — Accelerate**
When a new engagement begins, the system scans the repository for relevant prior work and surfaces it automatically. When a proposal is being written, the system identifies the strongest supporting case studies and extracts reusable content blocks. When a designer starts a new journey map, the system offers patterns from analogous past projects as a starting point.

The market signal layer adds an outward-facing intelligence dimension: the platform monitors industry publications, analyst reports, and sector trends, then surfaces gaps between what the organization has built and where the market is moving. This creates a continuous feedback loop between external signals and internal capability — the foundation for proactive experience innovation rather than reactive project delivery.

---

## Application Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| State / Persistence | React state, localStorage, IndexedDB |
| AI | Claude API (Anthropic) via Next.js API routes |
| Deployment | Vercel |
| Version Control | GitHub |

---

## What Works Today

| Capability | Status |
|---|---|
| Upload images (PNG, JPG, WEBP — up to 10 files, 8 MB each) | ✅ Live |
| Upload PDFs (up to 1 file, 10 MB) | ✅ Live |
| Metadata input (project name, domain, engagement type, tags) | ✅ Live |
| AI-powered showcase generation via Claude Sonnet 4.5 | ✅ Live |
| Showcase preview with full rendered output | ✅ Live |
| Publish to Curated Intelligence gallery | ✅ Live |
| AI-generated showcases surfaced in home feed | ✅ Live |
| Six hand-curated reference showcases | ✅ Live |
| Featured project carousel | ✅ Live |
| Design Shelf (visual, non-interactive) | ✅ Live |
| Dark / light mode | ✅ Live |
| Index Composer showcase (hand-crafted) | ✅ Live |

---

## Planned for Next Releases

| Capability | Priority |
|---|---|
| Manual case study authoring (guided form) | High |
| Search across showcases | High |
| Figma ingestion | High |
| PowerPoint / deck ingestion | High |
| Semantic search (embedding-based) | Medium |
| AI-powered recommendations | Medium |
| Cross-project pattern detection | Medium |
| Design Shelf — browse and download artifacts | Medium |
| Collections — group related showcases | Medium |
| Collaboration and commenting | Medium |
| Artifact extraction from PDFs | Medium |
| Asset versioning and governance | Low |
| Knowledge graph visualization | Low |
| Personalized discovery experience | Low |
| Market signal scanning (Experience Accelerator) | Future |
| RAG-powered proposal assistant | Future |

---

## Design Principles

1. **Storytelling over storage** — every artifact should have a narrative, not just a filename
2. **Discovery over navigation** — users should find relevant work without knowing where to look
3. **Context over documentation** — the why matters as much as the what
4. **Intelligence over organization** — AI does the work humans never had time to do
5. **Showcase over archive** — the repository should feel like a gallery, not a filing cabinet
6. **Simplicity over complexity** — each interaction should be obvious

---

## Success Criteria

The MVP succeeds if a team member can:

1. Upload raw project artifacts in under five minutes
2. Receive a structured, publishable showcase draft without writing a single word
3. Publish that showcase to the repository
4. Browse the gallery and find relevant work from past projects
5. Share a showcase link with a client or colleague

The platform succeeds long-term if it measurably reduces the time teams spend recreating knowledge that already exists — and if it makes the breadth and depth of organizational experience visible to everyone who needs it.

---

## Vision Statement

Toybox transforms design repositories from static storage systems into intelligent knowledge experiences that preserve, communicate, and amplify the value of experience design work — and eventually, into an acceleration layer that helps teams move faster by building on everything their organization already knows.
