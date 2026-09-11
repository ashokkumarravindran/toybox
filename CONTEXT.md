# Toybox — Product Context & Build Log

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

## Everything That's Been Built

### 1. AI Showcase Generation
- Upload flow at `/upload` — accepts images and PDFs
- Files are base64-encoded and sent to Claude via `/api/generate-showcase`
- Claude (claude-sonnet-4-5) analyzes uploaded assets and returns structured JSON
- JSON includes: title, subtitle, domain, heroStatement, overview, challenge, mission, personas, solutionHighlights, visualSections, impact, suggestedTags
- Asset assignment rules are enforced in the prompt (e.g. persona images ≠ UI screenshots)
- `sectionType` enum enforced in prompt: `journey-map | ecosystem-map | service-blueprint | storyboard | heuristic-checklist | solution-highlight | other`

### 2. Showcase Preview + Inline Editing
- Preview page at `/showcase/preview`
- **Edit mode**: toggled by "Edit" button → shows inline text fields and image Replace overlays
- **EditableField (EF) component**: renders `<input>` or `<textarea>` in edit mode, plain text otherwise
- **SwappableImage**: Replace overlay only appears in edit mode
- **Commit-on-done**: "Done editing" button saves all text edits + image overrides atomically to IndexedDB
- **Feedback**: "✓ Changes saved" green message for 3 seconds after commit
- **Image overrides**: persisted to IDB, restored on page reload
- `getPreviewFromIDB` returns `{ payload, imageOverrides }`
- `savePreviewToIDB(id, payload, imageOverrides?)` stores both together

### 3. Publish to Curated Intelligence
- "Publish" button on preview page
- Runs `extractArtifacts()` to pull reusable artifacts from the showcase JSON
- Runs `mergeIntoShelf()` to update the Design Shelf in localStorage
- Saves published showcase metadata to `toyboxPublishedShowcases` in localStorage
- Showcase appears in the gallery on the homepage

### 4. Curated Intelligence Gallery (Homepage)
- Homepage at `/` with dark/light mode toggle
- Gallery of showcases with card view
- Two-slide capability hero carousel (see below)
- Design Shelf section linking to artifact categories
- Navigation: Discover, Collections, Design Shelf, Experience Accelerator

### 5. Capability Hero Carousel
- Full-width hero section with two slides, auto-advances every 7 seconds
- **Slide 01 — Knowledge Management**: "Turn project work into collective knowledge." — CTAs: Add a showcase, Browse gallery. Blue accent.
- **Slide 02 — Experience Accelerator**: "Generate a client-ready accelerator in seconds." — CTA: Launch Experience Accelerator. Yellow (#DCFF00) accent, green-black background.
- Manual tab indicators (click to jump), slide counter (01/02), yellow bottom accent line
- Background gradient animates between slides

### 6. Design Shelf
- Browsable artifact library at `/design-shelf/[category]`
- Categories: personas, journey-maps, ecosystem-maps, service-blueprints, storyboards, heuristic-checklists
- Artifacts are extracted at publish time via `lib/extractArtifacts.ts` (pure logic, no AI)
- Each card links to an artifact detail page

### 7. Artifact Detail Pages
- Route: `/design-shelf/[category]/[id]`
- Shows artifact in context: image, name/role, need/pain point/solution support (personas) or narrative/visual focus (visual sections)
- **MetaPanel**: Domain, Industry, Engagement Type, Artifact Type badge, Published date
- **Good fit for**: static mapping of domain → artifact category → 3 use cases
- Breadcrumb: Design Shelf / Category / Artifact Name
- "View full showcase →" link back to the source showcase

### 8. Shared Extraction Pipeline
- `lib/extractArtifacts.ts` — shared utility used by both publish flow and design shelf pages
- `extractArtifacts(params)` — pulls personas and visualSections from showcase JSON into typed `ShelfArtifact[]`
- `mergeIntoShelf(existing, incoming)` — deduplicates by `showcaseId + sourceIndex`
- `ArtifactCategory` and `ShelfArtifact` types exported and shared across pages

### 9. Experience Accelerator (ExA)
- New module — Toybox's second core capability
- **Input form**: `/accelerator` — target client, industry, output type (Sales Pitch / Design Blueprint / Proposal Section), optional focus area
- **API route**: `/api/generate-accelerator` — calls Claude (claude-sonnet-4-5) with the full knowledge base + user inputs
- **Output page**: `/accelerator/output` — white-labeled, client-ready document
- **Output sections**: headline, subheadline, executive summary, Why Now, key insights, relevant experience (anonymized), personas (reframed for target), phased approach, call to action, source attribution
- **PDF export**: `window.print()` — browser print dialog, styled for print (`.no-print` hides chrome)
- **Share UI**: email input + note field modal — UI only, not wired up in MVP
- **Knowledge base logic**: reads Index Composer static data + any published showcases from localStorage

#### How ExA Works (end-to-end)
1. User fills in form → hits Generate
2. Client-side `getKnowledgeBase()` assembles: hardcoded Index Composer data + any published IDB showcases
3. POST to `/api/generate-accelerator` with `{ targetClient, industry, outputType, focusArea, knowledgeBase }`
4. API builds a detailed Claude prompt: "Generate a [outputType] for [targetClient] in [industry] by remixing this knowledge base..."
5. Claude responds with structured JSON (headline, exec summary, insights, personas, approach, CTA, source showcases)
6. Output stored in `sessionStorage` → user redirected to `/accelerator/output`
7. Output page renders the JSON as a polished document
8. User can export as PDF or share via email (UI only)

### 10. Navigation & Header
- `ToyboxHeader` component: global mode (full nav) + contextual mode (back button + breadcrumb)
- Nav links: Discover, Collections, Design Shelf, Experience Accelerator
- "Experience Accelerator" is highlighted in yellow on homepage, blue on other pages
- "+ Add showcase" CTA always visible in header
- Homepage has its own inline header (not ToyboxHeader) with the same nav items

### 11. Static Showcase Pages
- `/showcase/index-composer` — Index Composer curated showcase (hardcoded, cinematic template)
- `/showcase/[slug]` — dynamic route for AI-generated published showcases

---

## Persistence Model

| Data | Where stored | Scope |
|---|---|---|
| Preview payload (AI output) | IndexedDB (`toybox-db` / `showcases`) | Browser-local, survives reload |
| Image overrides | IndexedDB (same record as payload) | Browser-local, survives reload |
| Published showcase metadata | localStorage `toyboxPublishedShowcases` | Browser-local |
| Design Shelf artifacts | localStorage `toyboxShelfArtifacts` | Browser-local |
| Active preview ID | localStorage `toyboxActivePreviewId` | Browser-local |
| Accelerator output | sessionStorage `toyboxAcceleratorOutput` | Tab session only |

**Known limitation**: All storage is browser-local. Not shared across devices or users. Data is lost if browser storage is cleared.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Claude API — claude-sonnet-4-5 |
| Persistence | IndexedDB (payloads + image overrides), localStorage (metadata), sessionStorage (ExA output) |
| Extraction | `lib/extractArtifacts.ts` — pure logic, no AI at publish time |
| Deployment | Vercel — https://toybox-chi.vercel.app/ |

**Brand tokens (hardcoded in inline styles — never CSS variables):**
- `#005AFF` — Slalom blue
- `#DCFF00` — Slalom yellow
- `#0A0A0F` — dark background

---

## Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Homepage — gallery, capability carousel, Design Shelf section |
| `app/upload/ai/page.tsx` | Upload flow + AI generation |
| `app/showcase/preview/page.tsx` | Preview, inline edit, image replacement, publish |
| `app/showcase/index-composer/page.tsx` | Hardcoded Index Composer curated showcase |
| `app/showcase/[slug]/page.tsx` | Dynamic route for published showcases |
| `app/design-shelf/[category]/page.tsx` | Design Shelf listing page |
| `app/design-shelf/[category]/[id]/page.tsx` | Artifact detail page with MetaPanel |
| `app/accelerator/page.tsx` | Experience Accelerator input form |
| `app/accelerator/output/page.tsx` | ExA output — white-labeled document, PDF export, share |
| `app/api/generate-showcase/route.ts` | Claude API call for showcase generation |
| `app/api/generate-accelerator/route.ts` | Claude API call for ExA generation |
| `app/components/ToyboxHeader.tsx` | Shared header (global + contextual modes) |
| `lib/extractArtifacts.ts` | Shared artifact extraction + shelf merge logic |
| `CONTEXT.md` | This file |

---

## Two Planned Capabilities

### Capability 1 — Intelligent Sensitive Data Masking (PARKED)
At upload time, scan content for sensitive client info (names, financials, project codes) and let the user review/mask before generation. Phase 1 = text/PDF only. UI: masking review step between upload and generation. Parked for now — demo the two working capabilities first.

### Capability 2 — Experience Accelerator (ExA) ✓ BUILT
See above. MVP is live. Future improvements:
- Semantic/embedding search over the knowledge base instead of brute-force context injection
- Output saved as a new showcase record in Toybox (not just sessionStorage)
- Slide outline export format
- Source attribution toggle (practitioner-visible but hidden in exported output)
- Remix depth control

---

## Broader Roadmap

### Near term (local prototype / demo phase)
- [x] AI showcase generation
- [x] Design Shelf with artifact extraction
- [x] Inline editing + image replacement + commit pattern
- [x] Capability hero carousel on homepage
- [x] Experience Accelerator (ExA) — MVP
- [ ] Sensitive data masking (Capability 1) — parked
- [ ] ExA output saved as a showcase record

### Medium term (when moving to hosted database)
- Database layer: Azure Postgres + Blob Storage (or Supabase for speed)
- Azure AD SSO — Slalom credentials
- Multi-user: each practitioner owns their showcases
- Vercel Blob for image storage (replaces base64 in IDB)

### Longer term (platform vision)
- SharePoint integration — import files directly from Slalom document libraries
- Semantic search across the knowledge base (embeddings)
- Market signal scanning — surface relevant Toybox content when a new engagement starts
- Cross-project pattern detection
- Knowledge graph visualization
