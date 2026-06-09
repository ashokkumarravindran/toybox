'use client';

import Link from 'next/link';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

type ToyboxHeaderProps = {
  darkMode?: boolean;
  onDarkModeChange?: (darkMode: boolean) => void;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function ToyboxHeader({ darkMode = true, onDarkModeChange, backLink }: ToyboxHeaderProps) {
  const [search, setSearch] = useState('');

  return (
    <header className={`sticky top-0 z-40 border-b ${darkMode ? 'border-white/10 bg-[#05060f]/95 text-white' : 'border-slate-200 bg-white/95 text-slate-950'} backdrop-blur`}>
      <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Logo or Back Link */}
          {backLink ? (
            <Link href={backLink.href} className={`font-semibold transition ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>
              ← {backLink.label}
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-lg font-semibold ${darkMode ? 'bg-cyan-400/20 text-cyan-300' : 'bg-cyan-500/10 text-cyan-600'}`}>TB</div>
              <span className="font-semibold">Toybox</span>
            </Link>
          )}

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-8 text-sm">
            <Link href="/" className={`transition ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Discover</Link>
            <Link href="/" className={`transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Collections</Link>
            <Link href="/" className={`transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Design Shelf</Link>
          </nav>

          {/* Right Actions */}
<div className={`flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
  <Link
    href="/upload"
    className={`h-10 rounded-full px-4 text-sm font-medium transition flex items-center ${
      darkMode
        ? 'bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30'
        : 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20'
    }`}
  >
    + Upload
  </Link>

  <button
    className={`h-10 w-10 rounded-full transition flex items-center justify-center ${
      darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
    }`}
  >
    <Search size={18} />
  </button>

  <button
    onClick={() => onDarkModeChange?.(!darkMode)}
    className={`h-10 w-10 rounded-full transition flex items-center justify-center ${
      darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
    }`}
  >
    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
  </button>

  <button
    className={`h-10 w-10 rounded-full transition flex items-center justify-center ${
      darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
    }`}
  >
    <Bell size={18} />
  </button>

  <div className={`flex items-center gap-2 rounded-lg px-3 py-1 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
    <span className="hidden text-sm font-medium sm:inline">A</span>
  </div>
</div>
        </div>
      </div>
    </header>
  );
}
