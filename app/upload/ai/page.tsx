'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

type AssetSource = 'image' | 'pdf' | 'other';

type ShowcaseMetadata = {
  projectName?: string;
  domain?: string;
  engagementType?: string;
  tags?: string[];
};

type PreparedFile = {
  name: string;
  type: string;
  category: AssetSource;
  dataUrl: string;
};

const acceptedFileTypes = '.pdf,.png,.jpg,.jpeg,.webp';
const DEMO_PASSWORD = 'Claude45';

const domainOptions = [
  'Banking and Financial Services',
  'Healthcare',
  'Hospitality',
  'Insurance',
  'Manufacturing and Logistics',
  'Media and Entertainment',
  'Public Sector',
  'Retail',
  'Technology',
  'Other',
];

const engagementOptions = [
  'Brand Strategy',
  'Customer Experience',
  'Design System',
  'Heuristic Evaluation',
  'Marketing Strategy',
  'Point of View',
  'Product Design',
  'Prototypes',
  'Research and Discovery',
  'Service Design',
  'UX Strategy',
];

const suggestedTags = [
  'Dashboard',
  'High Fidelity Design',
  'Journey Map',
  'Persona',
  'Prototype',
  'Research',
  'Service Blueprint',
  'Storyboard',
  'Strategy',
  'Process flow',
];

const loadingFacts = [
  'The first Macintosh launched in 1984 with just 128 KB of memory.',
  'The original iPhone team worked in complete secrecy, even from other Apple teams.',
  "The term 'user experience' was coined by Don Norman while at Apple.",
  'The first website ever created is still online today.',
  'Figma was originally built around multiplayer collaboration before design tools.',
  'The average person spends less than 15 seconds deciding if a digital experience feels trustworthy.',
  'The first computer mouse was made of wood.',
  "Apple's Human Interface Guidelines have influenced digital products far beyond Apple devices.",
  "The world's first webcam was built to monitor a coffee pot.",
  "Most users won't notice good UX, but they'll immediately notice bad UX.",
  "Nielsen's 10 usability heuristics were introduced in 1994 and are still used today.",
  'The first version of Photoshop shipped on floppy disks.',
  'Amazon found that every 100ms of latency could impact revenue.',
  "Google's homepage stayed minimal because the founders initially did not know HTML well enough to build more.",
  'The first touchscreen was invented in the 1960s.',
  "Airbnb's founders once sold cereal boxes to keep the company alive.",
  'The original Apple logo featured Isaac Newton sitting under a tree.',
  'Dark mode can reduce eye strain, but readability still depends on contrast and typography.',
  'Great design is often invisible because it removes friction before users notice it.',
];

function getFileCategory(file: File): AssetSource {
  const lower = file.name.toLowerCase();

  if (file.type === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';

  if (
    file.type.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg', '.webp'].some((ext) => lower.endsWith(ext))
  ) {
    return 'image';
  }

  return 'other';
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadAI() {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<ShowcaseMetadata>({
    projectName: '',
    domain: '',
    engagementType: '',
    tags: [],
  });

  const [projectContext, setProjectContext] = useState('');
  const [figmaLink] = useState('');
  const [otherUrls, setOtherUrls] = useState<string[]>([]);
  const [otherUrlInput, setOtherUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingFactIndex, setLoadingFactIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [darkMode, setDarkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [demoPassword, setDemoPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isProcessing) return;

    const interval = window.setInterval(() => {
      setLoadingFactIndex((current) => (current + 1) % loadingFacts.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing) {
      setLoadingProgress(8);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 92) return current;
        return Math.min(92, current + Math.random() * 7);
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [isProcessing]);

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const allowedFiles = Array.from(incomingFiles).filter((file) => {
      const category = getFileCategory(file);
      return category === 'image' || category === 'pdf';
    });

    setFiles((current) => [...current, ...allowedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, idx) => idx !== index));
  };

  const toggleTag = (tag: string) => {
    setMetadata((current) => {
      const tags = current.tags || [];

      return {
        ...current,
        tags: tags.includes(tag)
          ? tags.filter((item) => item !== tag)
          : [...tags, tag],
      };
    });
  };

  const addOtherUrl = () => {
    const trimmed = otherUrlInput.trim();
    if (!trimmed) return;

    setOtherUrls((current) => [...current, trimmed]);
    setOtherUrlInput('');
  };

  const removeOtherUrl = (index: number) => {
    setOtherUrls((current) => current.filter((_, idx) => idx !== index));
  };

  const prepareFilesForClaude = async (): Promise<PreparedFile[]> => {
    const prepared = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type || (getFileCategory(file) === 'pdf' ? 'application/pdf' : 'image/png'),
        category: getFileCategory(file),
        dataUrl: await fileToDataUrl(file),
      }))
    );

    return prepared;
  };

  const handleGenerate = () => {
    setPasswordError('');
    setDemoPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (demoPassword !== DEMO_PASSWORD) {
      setPasswordError('That key does not open this Toybox. Try again.');
      return;
    }

    setShowPasswordModal(false);
    setDemoPassword('');
    setPasswordError('');
    runGeneration();
  };

  const runGeneration = async () => {
    setIsProcessing(true);
    setLoadingFactIndex(0);
    setLoadingProgress(8);
    setErrorMessage('');

    try {
      const preparedFiles = await prepareFilesForClaude();

      const images = preparedFiles.filter((file) => file.category === 'image');
      const documents = preparedFiles.filter((file) => file.category === 'pdf');

      const response = await fetch('/api/generate-showcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: metadata.projectName,
          domain: metadata.domain,
          engagementType: metadata.engagementType,
          projectContext,
          figmaLink,
          otherUrls,
          tags: metadata.tags,
          images,
          documents,
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        setErrorMessage('Showcase generation failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      const previewPayload = {
        showcase: result.showcase,
        uploadedAssets: preparedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          category: file.category,
          dataUrl: file.dataUrl,
        })),
        metadata: {
          projectName: metadata.projectName,
          domain: metadata.domain,
          engagementType: metadata.engagementType,
          projectContext,
          figmaLink,
          otherUrls,
          tags: metadata.tags,
        },
        generatedAt: new Date().toISOString(),
      };

      (window as any).__toyboxPreviewShowcase = previewPayload;

      localStorage.setItem(
        'toyboxPreviewShowcase',
        JSON.stringify({
          ...previewPayload,
          uploadedAssets: previewPayload.uploadedAssets.map((asset) => ({
            name: asset.name,
            type: asset.type,
            category: asset.category,
          })),
        })
      );

      router.push('/showcase/preview?mode=preview');
    } catch (error) {
      console.error('Showcase generation failed:', error);
      setErrorMessage('Showcase generation failed. Please check the console or API route.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white text-slate-950">
      <ToyboxHeader darkMode={darkMode} onDarkModeChange={setDarkMode} />

      {showPasswordModal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-2xl">
              🔒
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">
              Showcase Studio
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Unlock the story engine
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter key to access ToyBox AI
            </p>

            <input
              type="password"
              value={demoPassword}
              onChange={(e) => {
                setDemoPassword(e.target.value);
                setPasswordError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordSubmit();
              }}
              placeholder="Enter Key"
              className="mt-6 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400"
            />

            {passwordError && (
              <p className="mt-3 text-xs font-medium text-red-600">{passwordError}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setDemoPassword('');
                  setPasswordError('');
                }}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                Let&apos;s go
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-50">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
            </div>

            <h2 className="text-2xl font-semibold text-slate-900">Building your showcase</h2>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">
              Did you know?
            </p>

            <p className="mt-3 min-h-[60px] text-sm leading-6 text-slate-600">
              {loadingFacts[loadingFactIndex]}
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-700 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Reading artifacts, extracting themes, and shaping the story.
            </p>
          </div>
        </div>
      )}

      <main>
        <div className="border-b border-white/10 bg-[#05060f]">
          <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8">
            <Link href="/upload" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              Back to upload options ←
            </Link>

            <h1 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-4xl">
              Generate with Toybox AI
            </h1>
          </div>
        </div>

        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                    Project context
                  </p>

                  <div className="mt-6 space-y-6">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Project name</span>
                      <input
                        type="text"
                        value={metadata.projectName}
                        onChange={(e) => setMetadata({ ...metadata, projectName: e.target.value })}
                        placeholder="Example: Parent Portal Experience"
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400"
                      />
                    </label>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Engagement type</span>
                        <select
                          value={metadata.engagementType}
                          onChange={(e) =>
                            setMetadata({ ...metadata, engagementType: e.target.value })
                          }
                          className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                        >
                          <option value="">Choose an engagement</option>
                          {engagementOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Domain</span>
                        <select
                          value={metadata.domain}
                          onChange={(e) => setMetadata({ ...metadata, domain: e.target.value })}
                          className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                        >
                          <option value="">Choose a domain</option>
                          {domainOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Brief project context
                      </span>
                      <textarea
                        value={projectContext}
                        onChange={(e) => setProjectContext(e.target.value)}
                        placeholder="Example: This is a parent portal that supports families through enrollment, eligibility, payments, documents, and case communication."
                        rows={5}
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400"
                      />
                    </label>

                    <div>
                      <span className="text-sm font-semibold text-slate-700">
                        What are you uploading?
                      </span>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => {
                          const selected = metadata.tags?.includes(tag);

                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`rounded-full border px-3 py-2 text-sm transition ${
                                selected
                                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-700'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                    How to prepare your files
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Choose assets that best represent your work. Images and PDFs are supported for
                    this MVP. Support for additional formats such as PPT and Figma is coming soon.
                  </p>

                  <div
                    className="mt-6 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-300 bg-slate-100 px-8 py-12 text-center transition hover:border-slate-400"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
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

                    <p className="text-xl font-semibold text-slate-900">Drop images or PDFs here</p>
                    <p className="mt-3 text-sm text-slate-500">PNG, JPG, JPEG, WEBP, PDF</p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {files.map((file, index) => {
                        const category = getFileCategory(file);
                        const previewUrl = category === 'image' ? URL.createObjectURL(file) : '';

                        return (
                          <div
                            key={`${file.name}-${index}`}
                            className="relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50"
                          >
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute right-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-md transition hover:bg-red-50 hover:text-red-600"
                            >
                              Remove
                            </button>

                            {category === 'image' ? (
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="h-36 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-36 items-center justify-center bg-slate-200 text-sm font-semibold text-slate-700">
                                PDF
                              </div>
                            )}

                            <div className="p-4">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {file.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {category === 'image'
                                  ? 'Image will be analyzed'
                                  : 'PDF will be sent as a document'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
                  <p className="text-sm font-semibold text-slate-700">Other reference URLs</p>
                  <p className="mt-1 text-xs text-slate-500">Optional. Saved as reference for now.</p>

                  <div className="mt-4 space-y-3">
                    {otherUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3"
                      >
                        <span className="truncate text-sm text-slate-700">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeOtherUrl(index)}
                          className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <input
                        type="url"
                        value={otherUrlInput}
                        onChange={(e) => setOtherUrlInput(e.target.value)}
                        placeholder="https://miro.com/... or reference URL"
                        className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400"
                      />

                      <button
                        type="button"
                        onClick={addOtherUrl}
                        className="rounded-[1rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}
              </div>

              <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 lg:sticky lg:top-24">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                  AI Magic
                </p>

                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  Turn your work into stories
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Toybox uses Claude Sonnet 4.5 to analyze uploaded artifacts, identify themes,
                  workflows, decisions, and outcomes, then assemble them into a structured showcase
                  draft.
                </p>

                <div className="mt-6 rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Before you generate</p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>• Review AI generated content before publication.</li>
                    <li>• Remove client names and sensitive information.</li>
                    <li>• AI uncovers connections. You provide context.</li>
                  </ul>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || files.length === 0}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-8 py-4 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isProcessing ? 'Generating preview...' : 'Generate showcase preview'}
                </button>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}