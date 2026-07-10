'use client';

import Link from 'next/link';
import { Sparkles, PenLine } from 'lucide-react';
import ToyboxHeader from '@/app/components/ToyboxHeader';

export default function UploadChoicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <ToyboxHeader transparent mode="contextual" backHref="/" backLabel="Discover" pageTitle="Add showcase" />

      {/* Page header */}
      <div className="bg-[#0A0A0F]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Showcase Studio</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] leading-[1.06] text-white sm:text-6xl">
            Add a showcase
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Choose how you want to turn project artifacts into a published Toybox showcase.
          </p>
        </div>
      </div>

      {/* Path selection */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-5 max-w-3xl lg:grid-cols-2">

          <Link href="/upload/ai" className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-[#005AFF]/40 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#005AFF' }}>
              <Sparkles size={20} color="white" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-950">Generate with Toybox AI</h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
              Upload images and PDFs from any project. Claude reads the artifacts and generates a structured, publish-ready showcase draft.
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold" style={{ color: '#005AFF' }}>
              Use Toybox AI <span className="transition group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          <Link href="/upload/manual" className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-[#005AFF]/40 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 transition group-hover:border-[#005AFF]">
              <PenLine size={18} className="text-slate-500 transition group-hover:text-[#005AFF]" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-950">Create manually</h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
              Build your showcase using a guided four-step form. Add your own narrative, assets, deliverable highlights, and reference links.
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold" style={{ color: '#005AFF' }}>
              Create manually <span className="transition group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
