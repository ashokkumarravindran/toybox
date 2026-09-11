'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

// ── IndexedDB helpers (mirrors preview/page.tsx) ──────────────────────────────
function openPreviewDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('toybox-db', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('showcases')) {
        db.createObjectStore('showcases', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function savePreviewToIDB(id: string, payload: unknown) {
  const db = await openPreviewDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('showcases', 'readwrite');
    tx.objectStore('showcases').put({ id, previewPayload: payload, savedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

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

const MAX_IMAGE_FILES = 10;
const MAX_PDF_FILES = 1;
const MAX_IMAGE_FILE_MB = 8;
const MAX_PDF_FILE_MB = 10;
const MAX_API_PAYLOAD_MB = 3.5;
const MB = 1024 * 1024;

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

function getPayloadSizeMb(payload: unknown) {
  return new Blob([JSON.stringify(payload)]).size / MB;
}

function compressImageDataUrl(
  dataUrl: string,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not prepare image for AI.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('Image optimization failed.'));
    img.src = dataUrl;
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
  const [darkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [demoPassword, setDemoPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploaderName, setUploaderName] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [uploaderRole, setUploaderRole] = useState('');

  useEffect(() => {
    setUploaderName(localStorage.getItem('toyboxUploaderName') || '');
    setUploaderEmail(localStorage.getItem('toyboxUploaderEmail') || '');
    setUploaderRole(localStorage.getItem('toyboxUploaderRole') || '');
  }, []);

  useEffect(() => {
    if (uploaderName) localStorage.setItem('toyboxUploaderName', uploaderName);
    if (uploaderEmail) localStorage.setItem('toyboxUploaderEmail', uploaderEmail);
    if (uploaderRole) localStorage.setItem('toyboxUploaderRole', uploaderRole);
  }, [uploaderName, uploaderEmail, uploaderRole]);

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

  setErrorMessage('');

  const incoming = Array.from(incomingFiles);
  const currentImages = files.filter((file) => getFileCategory(file) === 'image').length;
  const currentPdfs = files.filter((file) => getFileCategory(file) === 'pdf').length;

  const accepted: File[] = [];

  for (const file of incoming) {
    const category = getFileCategory(file);
    const fileSizeMb = file.size / MB;

    if (category !== 'image' && category !== 'pdf') {
      setErrorMessage('Toybox supports PNG, JPG, WEBP, and PDF files for this MVP.');
      continue;
    }

    if (category === 'image') {
      const nextImageCount =
        currentImages + accepted.filter((item) => getFileCategory(item) === 'image').length + 1;

      if (nextImageCount > MAX_IMAGE_FILES) {
        setErrorMessage(`You can upload up to ${MAX_IMAGE_FILES} images for this MVP.`);
        continue;
      }

      if (fileSizeMb > MAX_IMAGE_FILE_MB) {
        setErrorMessage(`Each image must be ${MAX_IMAGE_FILE_MB} MB or smaller.`);
        continue;
      }
    }

    if (category === 'pdf') {
      const nextPdfCount =
        currentPdfs + accepted.filter((item) => getFileCategory(item) === 'pdf').length + 1;

      if (nextPdfCount > MAX_PDF_FILES) {
        setErrorMessage('You can upload 1 PDF for this MVP.');
        continue;
      }

      if (fileSizeMb > MAX_PDF_FILE_MB) {
        setErrorMessage(`PDF must be ${MAX_PDF_FILE_MB} MB or smaller.`);
        continue;
      }
    }

    accepted.push(file);
  }

  if (accepted.length > 0) {
    setFiles((current) => [...current, ...accepted]);
  }
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

 const prepareFilesForClaude = async (): Promise<{
  originalFiles: PreparedFile[];
  analysisFiles: PreparedFile[];
}> => {
  const originalFiles = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type || (getFileCategory(file) === 'pdf' ? 'application/pdf' : 'image/png'),
      category: getFileCategory(file),
      dataUrl: await fileToDataUrl(file),
    }))
  );

  // PDFs are sent as documents to Claude's API (up to 32 MB each) — no size check needed.
  // Only images are subject to the payload size limit and get compressed.
  const MAX_IMAGE_PAYLOAD_MB = 10;

  const compressionPasses = [
    { maxWidth: 1400, quality: 0.82 },
    { maxWidth: 1200, quality: 0.75 },
    { maxWidth: 1000, quality: 0.65 },
    { maxWidth: 800,  quality: 0.55 },
    { maxWidth: 640,  quality: 0.45 },
    { maxWidth: 512,  quality: 0.38 },
    { maxWidth: 400,  quality: 0.30 },
  ];

  // Check if there are any images at all — if only PDFs, skip compression entirely
  const hasImages = originalFiles.some((f) => f.category === 'image');
  if (!hasImages) {
    return { originalFiles, analysisFiles: originalFiles };
  }

  for (const pass of compressionPasses) {
    const analysisFiles = await Promise.all(
      originalFiles.map(async (file) => {
        if (file.category !== 'image') return file;
        return {
          ...file,
          type: 'image/jpeg',
          dataUrl: await compressImageDataUrl(file.dataUrl, pass.maxWidth, pass.quality),
        };
      })
    );

    // Only measure the image portion — PDFs are handled separately by the API route
    const imageSizeMb = analysisFiles
      .filter((f) => f.category === 'image')
      .reduce((sum, f) => sum + new Blob([f.dataUrl]).size / MB, 0);

    if (imageSizeMb <= MAX_IMAGE_PAYLOAD_MB) {
      return { originalFiles, analysisFiles };
    }
  }

  throw new Error(
    'Your images are still too large after optimization. Try removing some images or uploading lower-resolution versions.'
  );
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
    const { originalFiles, analysisFiles } = await prepareFilesForClaude();

    const images = analysisFiles.filter((file) => file.category === 'image');
    const documents = analysisFiles.filter((file) => file.category === 'pdf');

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
        const detail = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error)
          : 'Unknown error';
        setErrorMessage(`Showcase generation failed: ${detail}`);
        setIsProcessing(false);
        return;
      }

      // Inject uploader as POC if not already set by the AI
      const pocName = uploaderName || 'Slalom Team';
      const pocEmail = uploaderEmail || '';
      const pocRole = uploaderRole || 'Slalom Practitioner';
      const showcaseWithPoc = {
        ...result.showcase,
        pointsOfContact: result.showcase.pointsOfContact?.length
          ? result.showcase.pointsOfContact
          : [{ name: pocName, role: pocRole, email: pocEmail }],
      };

      const previewPayload = {
        showcase: showcaseWithPoc,
        uploadedAssets: originalFiles.map((file) => ({
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
          uploaderName: pocName,
          uploaderEmail: pocEmail,
          uploaderRole: pocRole,
        },
        generatedAt: new Date().toISOString(),
      };

      // Save full payload (with dataUrls) to IndexedDB so preview always loads the new generation
      const previewId = `preview-${Date.now()}`;
      await savePreviewToIDB(previewId, previewPayload);
      localStorage.setItem('toyboxActivePreviewId', previewId);

      // Also keep window reference as fast-path for same-tab navigation
      (window as any).__toyboxPreviewShowcase = previewPayload;

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
      <ToyboxHeader transparent mode="contextual" backHref="/" backLabel="Discover" pageTitle="Generate with AI" />

      {showPasswordModal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔒
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
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
              className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#005AFF] focus:ring-2 focus:ring-[#005AFF]/10"
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
                className="rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#005AFF' }}
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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#005AFF]" />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-900">Building your showcase</h2>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
              Did you know?
            </p>

            <p className="mt-3 min-h-[60px] text-sm leading-6 text-slate-600">
              {loadingFacts[loadingFactIndex]}
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ background: '#005AFF', width: `${loadingProgress}%` }}
              />
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Reading artifacts, extracting themes, and shaping the story.
            </p>
          </div>
        </div>
      )}

      <main>
        <div className="border-b border-white/8 bg-[#0A0A0F]">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Showcase Studio</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-6xl">
              Generate with Toybox AI
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400 leading-8">
              Upload project images and PDFs. Claude reads the artifacts and builds a structured showcase draft.
            </p>
          </div>
        </div>

        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
                  <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
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
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#005AFF]"
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
                          className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#005AFF]"
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
                          className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#005AFF]"
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
                        className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#005AFF]"
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
                                  ? 'border-[#005AFF] bg-[#EEF3FF] text-[#005AFF]'
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
                  <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
                    How to prepare your files
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Choose assets that best represent your work. Upload up to 10 images or 1 PDF.
                    Toybox keeps originals for download and sends optimized previews to AI.
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
                    <p className="mt-3 text-sm text-slate-500">PNG, JPG, JPEG up to 8 MB each or PDF up to 10 MB.</p>
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
                        className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#005AFF]"
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
                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#005AFF' }}>
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

                {/* Point of contact */}
                <div className="mt-6 rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Your info</p>
                  <p className="mt-1 text-xs text-slate-500">Added as point of contact on the showcase.</p>
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#005AFF]"
                    />
                    <input
                      type="text"
                      placeholder="Your role (e.g. UX Lead)"
                      value={uploaderRole}
                      onChange={(e) => setUploaderRole(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#005AFF]"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={uploaderEmail}
                      onChange={(e) => setUploaderEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#005AFF]"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4">
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
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-8 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: '#005AFF' }}
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