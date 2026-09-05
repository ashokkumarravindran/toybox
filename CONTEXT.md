# Toybox — Product Context & Capability Roadmap

Last updated: September 2026  
Status: Local prototype, deployed to Vercel for demo purposes  
Author: Ashok Ravindran, Slalom

---

## What Toybox Is

Toybox is an internal Slalom platform that turns project artifacts into reusable organizational intelligence. Practitioners upload case study materials (images, PDFs, decks) and AI generates a structured, publish-ready showcase. Published showcases accumulate into a growing knowledge base that fuels future work — proposals, design accelerators, sales pitches, and discovery.

The core loop:
```
Upload artifacts → AI generates showcase → Publish → Knowledge base grows → Reuse to accelerate future work
```

---

## Current State (as of Sep 2026)

### What's built and working
- AI showcase generation via Claude (vision + PDF ingestion)
- Showcase preview with inline copy editing and image replacement (edit mode)
- Publish to Curated Intelligence gallery
- Design Shelf — browsable artifact categories (Personas, Journey Maps, Service Blueprints, Storyboards, Heuristic Checklists, Ecosystem Maps)
- Artifact detail pages with metadata (domain, industry, engagement type, good-fit-for)
- Extraction pipeline — on publish, artifacts are automatically extracted from showcase JSON and added to Design Shelf
- Three showcase templates: Minimal, Editorial, Cinematic
- Breadcrumb navigation across all L2+ pages
- LocalStorage + IndexedDB for persistence (browser-local, per-device)
- Deployed on Vercel: https://toybox-chi.vercel.app/

### Known limitations
- Storage is browser-local (IndexedDB/localStorage) — not shared across users or devices
- No authentication or user ownership
- No database — data is lost if browser storage is cleared
- Images stored as base64 in IDB — large, inefficient
- Extraction limited to personas + visual sections — no storyboard or heuristic checklist extraction yet

---

## Two Capabilities to Build Next

---

### Capability 1 — Intelligent Sensitive Data Masking

#### The Problem
When Slalom practitioners upload case study materials, those files often contain sensitive client information — client names, project names, individual names, financial figures, proprietary process details. Before those materials are used to generate a showcase or stored in the knowledge base, that information needs to be identified and handled appropriately.

#### What It Does
At upload time, before the files are sent to the AI for showcase generation, Toybox runs an automatic sensitivity scan. The AI reads the uploaded content and identifies:
- Client / organisation names
- Individual (person) names not already in persona templates
- Financial figures, percentages, metrics tied to a specific client
- Project codenames or internal identifiers
- Proprietary process names or technology stack details

It then presents the user with a masking review step — a lightweight UI before generation starts — showing what was found and offering options:
- **Auto-mask** — replace with a neutral placeholder (`[Client]`, `[Organisation]`, `[Project Name]`)
- **Keep** — user confirms they have permission to use this information
- **Edit** — user manually replaces with a different label

#### Why This Matters
- Protects client confidentiality when showcases are shared internally
- Allows practitioners to safely contribute sensitive project work to the shared knowledge base
- Builds trust that Toybox handles real client data responsibly

#### Design Considerations
- Masking should happen BEFORE generation — not as a post-processing step
- The review UI should be fast and non-blocking — show findings, let user confirm in one click
- Masked placeholders should carry through consistently into the generated showcase
- User should be able to undo masking decisions before committing
- For images: harder (requires OCR first) — phase 1 covers text/PDF content only

#### Open Questions
- Does masking apply to image content (text on slides, whiteboards)? Phase 1 = text only
- Should masked items be stored in a per-showcase log for audit purposes?
- Should there be org-level rules (e.g. always mask financial figures)?

---

### Capability 2 — Accelerator Studio (White-Label Knowledge Remix)

#### The Problem
Slalom has built significant knowledge across engagements — personas, journey maps, blueprints, solution patterns. When a practitioner is in a meeting with a new client (e.g. BlackRock) and wants to quickly show relevant prior work or spin up a starting point for a new engagement, there's no fast way to do that today. They'd have to manually find relevant past work, strip client references, reframe for the new context, and rebuild a presentation or document.

#### What It Does
Accelerator Studio is a new module in Toybox that lets a practitioner describe what they need in natural language or via a guided form, and generates a white-labelled, client-ready output by remixing the existing knowledge base.

**Input (what the user provides):**
- Target client / industry (e.g. "BlackRock", "Financial Services")
- What they need (free-form or structured):
  - Sales pitch / capabilities story
  - Design blueprint / thought starter
  - Proposal section
  - Workshop agenda
  - Discovery framework
- Relevant context (optional): engagement type, focus area, timeline

**Process (what Toybox does):**
1. Searches the knowledge base for relevant showcases and artifacts (by domain, engagement type, artifact category)
2. Selects the most applicable personas, journey maps, solution patterns, and outcomes
3. Strips or replaces client-specific references (applies masking logic from Capability 1)
4. Reframes the content for the target client and use case
5. Generates the output in the requested format

**Output (what the user gets):**
- A white-labelled showcase (rendered in Toybox, exportable as PDF)
- Or a structured slide outline (headings, talking points, supporting artifacts)
- Or a design brief / thought starter document
- With links back to the source showcases for deeper reference

#### Why This Matters
- Shortens the time from "new client meeting" to "relevant materials in hand" from days to minutes
- Makes the knowledge base actively useful, not just archival
- Enables reuse of Slalom's collective IP in a controlled, responsible way
- Differentiates Toybox from a passive document library

#### Design Considerations
- The module needs a distinct entry point — not part of the upload flow
- The form/prompt interface needs to be fast and lightweight — practitioners are often in a meeting when they need this
- Output format should be selectable: showcase view, slide outline, brief
- White-labelling must be thorough — no original client names should leak through
- Source attribution should be visible to the practitioner (but not necessarily in the exported output)
- The AI needs enough context from the knowledge base to make good selections — this implies building a simple search/retrieval layer over published showcases

#### Key Technical Dependencies
- A search/retrieval layer over published showcases (initially: keyword + domain/category match; later: semantic/embedding search)
- The masking capability from Capability 1 (white-labelling = masking applied to remixed content)
- A new route: `/accelerator` or `/studio`
- A new output format: the "accelerator showcase" — similar to a preview page but purpose-built for external presentation

#### Open Questions
- Should the output be a new showcase record in Toybox, or a one-time export?
- How do we handle attribution — do practitioners see which source showcases were used?
- Should there be a "remix depth" control — how heavily adapted vs. how close to source?
- What formats matter most first: PDF export, showcase view, or slide outline?

---

## Broader Roadmap Context

### Near term (local prototype phase)
- [x] AI showcase generation
- [x] Design Shelf with artifact extraction
- [x] Inline editing + image replacement
- [ ] Capability 1: Sensitive data masking
- [ ] Capability 2: Accelerator Studio (v1)

### Medium term (when moving to hosted database)
- Database layer: Azure Postgres + Blob Storage (or Supabase for speed)
- Azure AD SSO — Slalom credentials
- Multi-user: each practitioner owns their showcases
- Vercel Blob for image storage (replaces base64 in IDB)

### Longer term (platform vision)
- SharePoint integration — import files directly from Slalom document libraries
- Semantic search across the knowledge base
- Market signal scanning — surface relevant Toybox content when a new engagement starts
- Cross-project pattern detection
- Knowledge graph visualization

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Claude API — claude-sonnet-4-6 |
| Persistence (current) | IndexedDB (payloads), localStorage (metadata) |
| Extraction | lib/extractArtifacts.ts — pure logic, no AI at publish time |
| Deployment | Vercel |

---

## Key Files

| File | Purpose |
|---|---|
| `app/upload/ai/page.tsx` | Upload flow + AI generation |
| `app/showcase/preview/page.tsx` | Preview, edit, publish |
| `app/design-shelf/[category]/page.tsx` | Design Shelf listing |
| `app/design-shelf/[category]/[id]/page.tsx` | Artifact detail page |
| `app/api/generate-showcase/route.ts` | Claude API call + prompt |
| `lib/extractArtifacts.ts` | Artifact extraction on publish |
| `app/components/ToyboxHeader.tsx` | Shared header (global + contextual modes) |
