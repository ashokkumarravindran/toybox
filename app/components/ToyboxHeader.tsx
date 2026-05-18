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
    <header className={`sticky top-0 z-40 border-b ${darkMode ? 'border-white/10 bg-[#05060f]/95' : 'border-slate-200 bg-white/95'} backdrop-blur`}>
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

          {/* Search */}
          <div className={`flex-1 max-w-sm hidden lg:flex items-center gap-3 px-4 py-2 rounded-lg border ${darkMode ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
            <Search size={16} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className={`flex-1 bg-transparent text-sm outline-none placeholder-opacity-50 ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'}`}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30' : 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20'}`}
            >
              + Upload
            </Link>
            <button
              onClick={() => onDarkModeChange?.(!darkMode)}
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
              <Bell size={18} />
            </button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
              <span className="text-sm font-medium hidden sm:inline">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
