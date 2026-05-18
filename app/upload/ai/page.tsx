'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

type AssetSource = 'image' | 'pdf' | 'ppt' | 'zip' | 'figma' | 'other';

type UploadedAsset = {
  name: string;
  url: string;
  type: string;
  source: AssetSource;
};

type ShowcaseMetadata = {
  projectName?: string;
  domain?: string;
  engagementType?: string;
  generateRequest?: string;
  tags?: string[];
};

type ShowcaseData = {
  title: string;
  subtitle: string;
  domain: string;
  engagementType: string;
  heroStatement: string;
  oneLineStory: string;
  challenge: string;
  experienceVision: string;
  designResponse: string;
  impact: string;
  visualStory: UploadedAsset[];
  extractedInsights: string[];
  tags: string[];
  uploadedAssets: UploadedAsset[];
  prototypeLink: string;
  rating: number;
  comments: Array<{ author: string; text: string; rating: number }>;
};

const acceptedFileTypes = '.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.zip';
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
  'Wireframes',
  'Prototype',
  'Design System',
  'Strategy',
  'Accessibility',
  'Dashboard',
  'Workflow Design',
  'Storyboard',
  'Concept Design',
  'Marketing',
  'AI Experience',
];

function getFileCategory(file: File): AssetSource {
  const lower = file.name.toLowerCase();
  if (file.type === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return 'ppt';
  if (lower.endsWith('.zip')) return 'zip';
  if (file.type.startsWith('image/') || ['.png', '.jpg', '.jpeg'].some((ext) => lower.endsWith(ext))) return 'image';
  return 'other';
}

async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === 'undefined') return '';

  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

function inferFromText(text: string, fallback: string) {
  const match = text.match(/(?:purpose|objective|goal|summary|overview)\s*[:\-]\s*([^\.\n\r]+)/i);
  if (match?.[1]) return match[1].trim();
  const sentence = text.split(/[\.\n\r]/).find((line) => line.trim().length > 40);
  return sentence?.trim() || fallback;
}

function collectInsights(text: string, tags: string[]) {
  const insights = new Set<string>();
  if (text) {
    const matches = text.match(/\b(?:workflow|prototype|research|journey|dashboard|storyboard|collaboration|impact|metrics|experience|strategy|system|design)\b/gi);
    if (matches) {
      matches.slice(0, 4).forEach((match) => insights.add(match.toLowerCase()));
    }
  }
  tags.slice(0, 3).forEach((tag) => insights.add(tag.toLowerCase()));
  return Array.from(insights).map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

function buildShowcaseFromExtractedContent({
  extractedText,
  uploadedAssets,
  figmaLink,
  optionalMetadata,
}: {
  extractedText: string;
  uploadedAssets: UploadedAsset[];
  figmaLink?: string;
  optionalMetadata: ShowcaseMetadata;
}): ShowcaseData {
  const title = optionalMetadata.projectName || inferFromText(extractedText, 'Creative intelligence showcase');
  const domain = optionalMetadata.domain || 'Technology';
  const engagementType = optionalMetadata.engagementType || 'Product Design';
  const subtitle = `${engagementType} for ${domain}`;
  const heroStatement = inferFromText(extractedText, 'A refined story built from raw design artifacts.');
  const oneLineStory = `A polished showcase generated from ${uploadedAssets.length} creative sources.`;
  const challenge = inferFromText(extractedText, 'A clear business challenge with user focus.');
  const experienceVision = inferFromText(extractedText, 'A confident experience vision that directs the design work.');
  const designResponse = inferFromText(extractedText, 'A thoughtful design response grounded in user and business needs.');
  const impact = inferFromText(extractedText, 'A concise statement of the outcome and value delivered.');
  const extractedInsights = collectInsights(extractedText, optionalMetadata.tags || []);

  const visualStory = uploadedAssets.filter((asset) => asset.source === 'image');
  const visualAssets = visualStory.length > 0 ? visualStory : uploadedAssets.slice(0, 3);

  return {
    title,
    subtitle,
    domain,
    engagementType,
    heroStatement,
    oneLineStory,
    challenge,
    experienceVision,
    designResponse,
    impact,
    visualStory: visualAssets,
    extractedInsights,
    tags: optionalMetadata.tags || [],
    uploadedAssets,
    prototypeLink: figmaLink || '',
    rating: 4.8,
    comments: [
      { author: 'Ava Lee', text: 'The story lands with clarity and restraint.', rating: 5 },
      { author: 'Noah Patel', text: 'A polished showcase that feels calm and editorial.', rating: 5 },
    ],
  };
}

export default function UploadAI() {
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<ShowcaseMetadata>({ projectName: '', domain: '', engagementType: '', tags: [] });
  const [figmaLink, setFigmaLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const availableAssets: UploadedAsset[] = files.map((file) => ({
    name: file.name,
    url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    type: file.type,
    source: getFileCategory(file),
  }));

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;
    setFiles(Array.from(incomingFiles));
  };

  const toggleTag = (tag: string) => {
    setMetadata((current) => {
      const tags = current.tags || [];
      return {
        ...current,
        tags: tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
      };
    });
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const pdfFiles = files.filter((file) => getFileCategory(file) === 'pdf');
    const extractedText = (
      await Promise.all(pdfFiles.map(async (file) => await extractTextFromPDF(file)))
    ).join('\n');

    const showcase = buildShowcaseFromExtractedContent({
      extractedText,
      uploadedAssets: availableAssets,
      figmaLink,
      optionalMetadata: metadata,
    });

    setIsProcessing(false);
  };

  return (
    <div className="bg-white text-slate-950">
      <ToyboxHeader 
        darkMode={darkMode} 
        onDarkModeChange={setDarkMode}
      />

      <main>
        <div className="border-b border-white/10 bg-[#05060f]">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4">
            <div>
              <a href="/upload" className="text-sm text-cyan-300 hover:text-cyan-200 transition font-medium">
                ← Back to upload options
              </a>
              <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-white">
                Generate with Toybox AI
              </h1>
              <p className="mt-3 text-sm text-slate-300">
                Upload project decks, PDFs, and prototype links to generate a polished showcase draft.
              </p>
            </div>
          </div>
        </div>

        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-10 justify-center">
              <div className="mx-auto w-full max-w-3xl space-y-8">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
                  <div className="text-sm uppercase tracking-[0.3em] font-semibold text-cyan-600">Upload assets</div>
                  <div className="mt-6">
                    <div
                      className="relative min-h-[300px] cursor-pointer rounded-[1.75rem] border-2 border-dashed border-slate-300 bg-slate-100 px-8 py-12 text-center transition hover:border-slate-400"
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFiles(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedFileTypes}
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                      />
                      <p className="text-xl font-semibold text-slate-900">Drop files here or click to browse</p>
                      <p className="mt-3 text-sm text-slate-500">PDF, PPT, PPTX, PNG, JPG, JPEG, ZIP</p>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {files.map((file, index) => {
                          const category = getFileCategory(file);
                          return (
                            <div key={index} className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                                {category === 'image' ? 'IMG' : category === 'pdf' ? 'PDF' : category === 'ppt' ? 'PPT' : category === 'zip' ? 'ZIP' : 'FILE'}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {category === 'ppt'
                                    ? 'PPT ingestion pending'
                                    : category === 'zip'
                                    ? 'ZIP support coming soon'
                                    : 'Uploaded asset'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Project name</span>
                      <input
                        type="text"
                        value={metadata.projectName}
                        onChange={(e) => setMetadata({ ...metadata, projectName: e.target.value })}
                        placeholder="Add a project title"
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 placeholder:text-slate-400"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Domain</span>
                      <select
                        value={metadata.domain}
                        onChange={(e) => setMetadata({ ...metadata, domain: e.target.value })}
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                      >
                        <option value="" disabled>Choose a domain</option>
                        {domainOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mt-6">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Engagement type</span>
                      <select
                        value={metadata.engagementType}
                        onChange={(e) => setMetadata({ ...metadata, engagementType: e.target.value })}
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                      >
                        <option value="" disabled>Choose an engagement</option>
                        {engagementOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Figma / prototype URL</span>
                      <input
                        type="url"
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        placeholder="https://www.figma.com/file/..."
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 placeholder:text-slate-400"
                      />
                    </label>
                  </div>

                  <div className="mt-8 space-y-4">
                    <label className="block">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-700">What should Toybox generate?</span>
                        <span className="text-xs text-slate-500">Optional</span>
                      </div>
                      <textarea
                        value={metadata.generateRequest}
                        onChange={(e) => setMetadata({ ...metadata, generateRequest: e.target.value })}
                        placeholder="e.g. a structured experience narrative and a reusable case study outline"
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 placeholder:text-slate-400"
                        rows={4}
                      />
                      <p className="mt-3 text-sm text-slate-500">Toybox will use a default showcase structure if you leave this blank.</p>
                    </label>
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Tags</span>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => {
                          const selected = metadata.tags?.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`rounded-full border px-3 py-2 text-sm transition ${selected ? 'border-cyan-400 bg-cyan-400/10 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <button
                      onClick={handleGenerate}
                      disabled={files.length === 0 || isProcessing}
                      className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Generating showcase...' : 'Generate showcase'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
