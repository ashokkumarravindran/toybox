'use client';

import Link from 'next/link';
import { useState } from 'react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

export default function UploadChoicePage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="bg-white text-slate-950">
      <ToyboxHeader darkMode={darkMode} onDarkModeChange={setDarkMode} />

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-900 via-slate-950/70 to-transparent" />
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm uppercase tracking-[0.3em] font-semibold text-cyan-300">UPLOAD</p>
              <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.1]">
                Create a new showcase
              </h1>
              <p className="mt-6 text-xl leading-8 text-slate-300">
                Choose how you want to turn project artifacts into a polished Toybox showcase.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
              {/* AI Card */}
              <Link href="/upload/ai">
                <div className="group rounded-[2rem] border border-slate-200 bg-white p-8 transition hover:border-cyan-400 hover:bg-slate-50">
                  <h3 className="text-2xl font-semibold">Generate with Toybox AI</h3>
                  <p className="mt-4 leading-7 text-slate-600">
                    Upload decks, PDFs, images, and prototype links. Toybox analyzes the material and generates a structured showcase draft.
                  </p>
                  <div className="mt-8">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 transition group-hover:text-cyan-700">
                      Use Toybox AI →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Manual Card */}
              <Link href="/upload/manual">
                <div className="group rounded-[2rem] border border-slate-200 bg-white p-8 transition hover:border-cyan-400 hover:bg-slate-50">
                  <h3 className="text-2xl font-semibold">Create manually</h3>
                  <p className="mt-4 leading-7 text-slate-600">
                    Build your showcase with a guided structured form and add your own narrative, assets, tags, and project details.
                  </p>
                  <div className="mt-8">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 transition group-hover:text-cyan-700">
                      Create manually →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
