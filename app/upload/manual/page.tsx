'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToyboxHeader from '@/app/components/ToyboxHeader';
import { saveFile } from '@/lib/idb';

type SolutionHighlight = {
  type: string;
  summary: string;
  images: File[];
};

type ProjectArtifact = {
  type: 'pdf' | 'ppt' | 'zip' | 'link';
  name: string;
  value: string | File;
};

type ManualShowcaseData = {
  projectName: string;
  domain: string;
  engagementType: string;
  figmaLink: string;
  tags: string[];
  overview: string;
  challenge: string;
  solutionApproach: string;
  outcome: string;
  selectedHighlights: string[];
  solutionHighlights: SolutionHighlight[];
  projectArtifacts: ProjectArtifact[];
};

const domainOptions = [
  'Banking and Financial Services',
  'Healthcare',
  'Retail',
  'Manufacturing and Logistics',
  'Insurance',
  'Media and Entertainment',
  'Technology',
  'Public Sector',
  'Other',
];

const engagementOptions = [
  'UX Strategy',
  'Customer Experience',
  'Product Design',
  'Service Design',
  'Design System',
  'Research and Discovery',
  'Marketing Experience',
  'Prototype',
  'Case Study',
];

const suggestedTags = [
  'UX Audit',
  'Research',
  'Journey Map',
  'Service Blueprint',
  'Workflow Design',
  'Dashboard',
  'Strategy',
  'Accessibility',
  'Storyboard',
  'Concept Design',
  'Prototype',
  'Design System',
  'AI Experience',
];

const availableHighlights = [
  'Research and discovery',
  'Personas',
  'Journey map',
  'Ecosystem map',
  'Service blueprint',
  'Storyboards',
  'High fidelity designs',
  'Design system',
  'Usability testing',
  'Heuristic evaluation',
  'Prototype',
  'Analytics dashboard',
  'Governance model',
  'Content strategy',
  'Accessibility review',
  'Technical architecture',
];

export default function UploadManual() {
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState<ManualShowcaseData>({
    projectName: '',
    domain: '',
    engagementType: '',
    figmaLink: '',
    tags: [],
    overview: '',
    challenge: '',
    solutionApproach: '',
    outcome: '',
    selectedHighlights: [],
    solutionHighlights: [],
    projectArtifacts: [],
  });

  const router = useRouter();

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleHighlight = (highlight: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedHighlights.includes(highlight);
      return {
        ...prev,
        selectedHighlights: isSelected
          ? prev.selectedHighlights.filter((h) => h !== highlight)
          : [...prev.selectedHighlights, highlight],
        solutionHighlights: isSelected
          ? prev.solutionHighlights.filter((h) => h.type !== highlight)
          : [
              ...prev.solutionHighlights,
              {
                type: highlight,
                summary: '',
                images: [],
              },
            ],
      };
    });
  };

  const updateHighlightSummary = (type: string, summary: string) => {
    setFormData((prev) => ({
      ...prev,
      solutionHighlights: prev.solutionHighlights.map((h) =>
        h.type === type ? { ...h, summary } : h
      ),
    }));
  };

  const addHighlightImage = (type: string, files: FileList | null) => {
    if (!files) return;
    setFormData((prev) => ({
      ...prev,
      solutionHighlights: prev.solutionHighlights.map((h) =>
        h.type === type
          ? { ...h, images: [...h.images, ...Array.from(files)] }
          : h
      ),
    }));
  };

  const handleCreateShowcase = () => {
    // placeholder — implementation below
    void createShowcase();
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    // TODO: Save to localStorage or backend
  };

  const [toast, setToast] = useState<string | null>(null);

  const detectArtifactType = (name: string): ProjectArtifact['type'] => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'ppt' || ext === 'pptx') return 'ppt';
    if (ext === 'zip') return 'zip';
    return 'zip';
  };

  const addProjectArtifacts = (files: FileList | null) => {
    if (!files) return;
    const entries: ProjectArtifact[] = Array.from(files).map((f) => ({
      type: detectArtifactType(f.name),
      name: f.name,
      value: f,
    }));
    setFormData((prev) => ({ ...prev, projectArtifacts: [...prev.projectArtifacts, ...entries] }));
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const createImageThumbnail = (file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          const width = Math.min(maxWidth, img.width);
          const height = Math.round(width / ratio);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Failed to create thumbnail'));
            resolve(blob);
          }, 'image/jpeg', 0.8);
        };
        img.onerror = reject;
        img.src = String(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const createShowcase = async () => {
    // Validate required fields
    const required = [
      { key: 'projectName', label: 'Project name' },
      { key: 'domain', label: 'Domain' },
      { key: 'engagementType', label: 'Engagement type' },
      { key: 'overview', label: 'Overview' },
      { key: 'challenge', label: 'Challenge' },
      { key: 'solutionApproach', label: 'Solution approach' },
    ] as const;

    for (const r of required) {
      // @ts-ignore
      if (!formData[r.key] || (typeof formData[r.key] === 'string' && formData[r.key].trim() === '')) {
        alert(`${r.label} is required`);
        return;
      }
    }

    
    const slugBase = formData.projectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Save uploaded images to IndexedDB and store ids. Generate a thumbnail for the hero image.
    let heroImage: string | null = null;
    let heroThumb: string | null = null;
    const solutionHighlights = await Promise.all(
      formData.solutionHighlights.map(async (h) => ({
        type: h.type,
        summary: h.summary,
        images: await Promise.all(h.images.map(async (file) => {
          const id = await saveFile(file, file.name);
          // generate hero thumbnail from the first available image
          if (!heroThumb) {
            try {
              const thumbBlob = await createImageThumbnail(file, 800);
              heroThumb = await saveFile(thumbBlob, `thumb-${file.name}`);
            } catch (e) {
              // ignore thumbnail errors
            }
          }
          return id;
        })),
      }))
    );

    // Choose hero image id: first uploaded highlight image if available
    for (const sh of solutionHighlights) {
      if (sh.images && sh.images.length > 0) {
        heroImage = sh.images[0];
        break;
      }
    }

    const processedArtifacts = await Promise.all(
      formData.projectArtifacts.map(async (a) => {
        if (typeof a.value === 'string') return { ...a };
        const file = a.value as File;
        const id = await saveFile(file, a.name);
        return { type: a.type, name: a.name, value: id } as ProjectArtifact;
      })
    );

    const newShowcase = {
      projectName: formData.projectName,
      domain: formData.domain,
      engagementType: formData.engagementType,
      figmaLink: formData.figmaLink,
      tags: formData.tags,
      overview: formData.overview,
      challenge: formData.challenge,
      solutionApproach: formData.solutionApproach,
      outcome: formData.outcome,
      selectedHighlights: formData.selectedHighlights,
      solutionHighlights,
      projectArtifacts: processedArtifacts,
      heroImage,
      heroThumb,
      createdAt: Date.now(),
    } as const;

    const STORAGE_KEY = 'toybox_generated_showcases';
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];

    let slug = slugBase;
    // ensure uniqueness
    if (existing.some((s: any) => s.slug === slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    const stored = [{ ...newShowcase, slug }, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    setToast('Showcase created — redirecting...');
    await new Promise((res) => setTimeout(res, 700));
    router.push(`/showcase/${slug}`);
  };

  return (
    <div className="bg-white text-slate-950">
      <ToyboxHeader
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
        backLink={undefined}
      />

      {/* Secondary Navigation */}
      <div className="border-b border-white/10 bg-[#05060f] sticky top-[4rem] z-30">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4">
          <div>
            <a href="/upload" className="text-sm text-cyan-300 hover:text-cyan-200 transition font-medium">
              ← Back to upload options
            </a>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-white">
              Create manually
            </h1>
            <p className="mt-3 text-sm text-slate-300">Build your showcase using a guided structured form.</p>
          </div>
        </div>
      </div>

      <main>
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="mx-auto w-full max-w-4xl space-y-8">
              {/* Section 1: Project Details */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-8">Project details</h2>

                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Project name</span>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        placeholder="Enter project name"
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Domain</span>
                      <select
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                      >
                        <option value="">Select a domain</option>
                        {domainOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Engagement type</span>
                      <select
                        value={formData.engagementType}
                        onChange={(e) => setFormData({ ...formData, engagementType: e.target.value })}
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                      >
                        <option value="">Select engagement type</option>
                        {engagementOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Figma / prototype URL</span>
                      <input
                        type="url"
                        value={formData.figmaLink}
                        onChange={(e) => setFormData({ ...formData, figmaLink: e.target.value })}
                        placeholder="https://www.figma.com/file/..."
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-700">Tags</span>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-2 text-sm transition ${
                            formData.tags.includes(tag)
                              ? 'border-cyan-400 bg-cyan-400/10 text-cyan-700'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Showcase Narrative */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-8">Showcase narrative</h2>

                <div className="space-y-6">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Overview</span>
                    <textarea
                      value={formData.overview}
                      onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                      placeholder="Provide a brief overview of the project..."
                      className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                      rows={4}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Challenge</span>
                    <textarea
                      value={formData.challenge}
                      onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                      placeholder="Describe the main challenge or problem..."
                      className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                      rows={4}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Solution approach</span>
                    <textarea
                      value={formData.solutionApproach}
                      onChange={(e) => setFormData({ ...formData, solutionApproach: e.target.value })}
                      placeholder="Explain your solution approach..."
                      className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                      rows={4}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Outcome</span>
                    <textarea
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      placeholder="Describe the outcomes and impact..."
                      className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                      rows={4}
                    />
                  </label>
                </div>
              </div>

              {/* Section 3: Solution Highlights */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-2">Solution highlights</h2>
                <p className="text-sm mb-8 text-slate-600">
                  Select the solution areas that apply to this project. Only selected sections will appear in the showcase builder and final case study.
                </p>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  {availableHighlights.map((highlight) => (
                    <button
                      key={highlight}
                      onClick={() => toggleHighlight(highlight)}
                      className={`rounded-[1rem] border px-4 py-3 text-sm text-left transition ${
                        formData.selectedHighlights.includes(highlight)
                          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {highlight}
                    </button>
                  ))}
                </div>

                {formData.selectedHighlights.length > 0 && (
                  <div className="mt-8 space-y-8 border-t border-slate-200 pt-8">
                    {formData.solutionHighlights.map((highlight) => (
                      <div key={highlight.type}>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900">
                          {highlight.type}
                        </h3>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Summary</span>
                            <textarea
                              value={highlight.summary}
                              onChange={(e) => updateHighlightSummary(highlight.type, e.target.value)}
                              placeholder="Briefly describe this section..."
                              className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400"
                              rows={3}
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Images</span>
                            <div className="mt-3 relative">
                              <input
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.webp"
                                onChange={(e) => addHighlightImage(highlight.type, e.target.files)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="rounded-[1rem] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center cursor-pointer hover:border-slate-400 transition">
                                <p className="text-sm font-medium text-slate-900">
                                  {highlight.images.length > 0
                                    ? `${highlight.images.length} image(s) uploaded`
                                    : 'Click or drag to upload PNG, JPG, JPEG, WebP'}
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Upload Project Artifacts */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-2">Upload project artifacts</h2>
                <p className="text-sm mb-8 text-slate-600">
                  Add supporting materials users can download or reference later.
                </p>

                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Accepted: PDF, PPT, PPTX, ZIP, Miro links, Figma links, Readout materials</p>
                    <div className="rounded-[1rem] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center cursor-pointer hover:border-slate-400 transition relative">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => addProjectArtifacts(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Click or drag to upload project files</p>
                        <p className="mt-2 text-xs text-slate-600">Optional</p>
                      </div>
                    </div>

                    {formData.projectArtifacts.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.projectArtifacts.map((a, idx) => (
                          <div key={idx} className="text-sm text-slate-700">{a.name}</div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleSaveDraft}
                  className="px-8 py-4 rounded-full text-sm font-semibold transition border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                >
                  Save draft
                </button>
                <button
                  disabled
                  className="px-8 py-4 rounded-full text-sm font-semibold transition bg-slate-300 text-slate-500 cursor-not-allowed"
                >
                  Create Showcase
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
