// Pure extraction logic — no AI needed at publish time.
// The upstream AI prompt enforces canonical sectionType values so keyword
// matching here is reliable.

export type ArtifactCategory =
  | 'personas'
  | 'journey-maps'
  | 'ecosystem-maps'
  | 'service-blueprints'
  | 'storyboards'
  | 'heuristic-checklists';

export type ShelfArtifact = {
  id: string;
  category: ArtifactCategory;
  // display
  name: string;
  role?: string;           // personas only
  description: string;
  tags?: string[];
  // provenance
  projectName: string;
  domain: string;
  publishedAt: string;
  previewId: string;
  showcaseId: string;
  // asset
  assetName?: string;
  // index within showcase (for deep-link on detail page)
  sourceIndex: number;
  sourceField: 'personas' | 'visualSections';
};

const JOURNEY_TYPES = ['journey-map', 'journey', 'swimlane', 'user-journey'];
const ECOSYSTEM_TYPES = ['ecosystem-map', 'ecosystem', 'landscape', 'context-map'];
const BLUEPRINT_TYPES = ['service-blueprint', 'blueprint', 'process', 'workflow'];
const STORYBOARD_TYPES = ['storyboard', 'story-board', 'scenario'];
const HEURISTIC_TYPES = ['heuristic-checklist', 'heuristic', 'checklist', 'audit'];

function matchesType(sectionType: string, keywords: string[]): boolean {
  const t = (sectionType || '').toLowerCase().replace(/\s+/g, '-');
  return keywords.some((k) => t.includes(k));
}

function categoryForType(sectionType: string): ArtifactCategory | null {
  if (matchesType(sectionType, JOURNEY_TYPES))    return 'journey-maps';
  if (matchesType(sectionType, ECOSYSTEM_TYPES))  return 'ecosystem-maps';
  if (matchesType(sectionType, BLUEPRINT_TYPES))  return 'service-blueprints';
  if (matchesType(sectionType, STORYBOARD_TYPES)) return 'storyboards';
  if (matchesType(sectionType, HEURISTIC_TYPES))  return 'heuristic-checklists';
  return null;
}

export function extractArtifacts(params: {
  showcase: any;
  showcaseId: string;
  previewId: string;
  projectName: string;
  domain: string;
  publishedAt: string;
}): ShelfArtifact[] {
  const { showcase, showcaseId, previewId, projectName, domain, publishedAt } = params;
  const results: ShelfArtifact[] = [];

  // ── Personas ────────────────────────────────────────────────────────────────
  (showcase.personas || []).forEach((p: any, i: number) => {
    if (!p.name) return;
    results.push({
      id: `${showcaseId}-persona-${i}`,
      category: 'personas',
      name: p.name,
      role: p.role || '',
      description: [p.need, p.painPoint].filter(Boolean).join(' — ') || p.solutionSupport || '',
      tags: [],
      projectName,
      domain,
      publishedAt,
      previewId,
      showcaseId,
      assetName: p.assetName || '',
      sourceIndex: i,
      sourceField: 'personas',
    });
  });

  // ── Visual sections (journey maps, ecosystem maps, blueprints, etc.) ────────
  (showcase.visualSections || []).forEach((s: any, i: number) => {
    const category = categoryForType(s.sectionType || '');
    if (!category) return;
    results.push({
      id: `${showcaseId}-visual-${i}`,
      category,
      name: s.sectionTitle || `${s.sectionType} — ${projectName}`,
      description: s.narrative || '',
      tags: [],
      projectName,
      domain,
      publishedAt,
      previewId,
      showcaseId,
      assetName: s.assetName || '',
      sourceIndex: i,
      sourceField: 'visualSections',
    });
  });

  return results;
}

// Merge new artifacts into existing shelf, replacing stale entries from the
// same showcaseId so re-publishing doesn't create duplicates.
export function mergeIntoShelf(
  existing: ShelfArtifact[],
  incoming: ShelfArtifact[]
): ShelfArtifact[] {
  if (incoming.length === 0) return existing;
  const showcaseId = incoming[0].showcaseId;
  const filtered = existing.filter((a) => a.showcaseId !== showcaseId);
  return [...incoming, ...filtered];
}
