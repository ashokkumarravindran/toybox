'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, ArrowLeft } from 'lucide-react';

type Props = {
  darkMode?: boolean;
  onDarkModeChange?: (val: boolean) => void;
  transparent?: boolean;
  mode?: 'global' | 'contextual';
  backHref?: string;
  backLabel?: string;
  pageTitle?: string;
  actions?: React.ReactNode;
};

const navLinks = [
  { href: '/', label: 'Discover' },
  { href: '/#collections', label: 'Collections' },
  { href: '/#design-shelf', label: 'Design Shelf' },
];

const Logo = ({ isDark }: { isDark: boolean }) => (
  <Link href="/" className="flex items-center gap-2.5 shrink-0">
    <span className={`text-[15px] font-bold tracking-[-0.02em] lowercase leading-none ${isDark ? 'text-white' : 'text-slate-950'}`}>
      slalom
    </span>
    <span className={`text-sm ${isDark ? 'text-white/25' : 'text-slate-300'}`}>|</span>
    <span className={`text-[15px] font-medium leading-none ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
      Toybox
    </span>
    <span
      className="ml-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest leading-none"
      style={{ background: '#DCFF00', color: '#0A0A0F' }}
    >
      Beta
    </span>
  </Link>
);

export default function ToyboxHeader({
  darkMode = false,
  transparent = false,
  mode = 'global',
  backHref = '/',
  backLabel = 'Back',
  pageTitle,
  actions,
}: Props) {
  const pathname = usePathname();
  const isDark = transparent || darkMode;

  const headerBase = `no-print sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${
    isDark ? 'border-white/8 bg-[#0A0A0F]/92' : 'border-slate-200/80 bg-white/96'
  }`;

  if (mode === 'contextual') {
    return (
      <header className={headerBase}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          {/* Row 1: logo + optional page actions */}
          <div className="flex items-center justify-between py-3">
            <Logo isDark={isDark} />
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {/* Row 2: back link + page title */}
          <div className="flex items-center gap-1.5 pb-2.5">
            <Link
              href={backHref}
              className={`flex items-center gap-1.5 text-sm font-medium transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'}`}
            >
              <ArrowLeft size={13} />
              {backLabel}
            </Link>
            {pageTitle && (
              <>
                <span className={`text-sm ${isDark ? 'text-white/20' : 'text-slate-300'}`}>/</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{pageTitle}</span>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerBase}>
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3.5 sm:px-8">
        <Logo isDark={isDark} />

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm sm:flex">
          {navLinks.map(({ href, label }) => {
            const active = pathname === '/' && label === 'Discover';
            return (
              <Link
                key={label}
                href={href}
                className={`font-medium transition ${
                  active
                    ? isDark ? 'text-white' : 'text-slate-950'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          <Link
            href="/upload"
            className="mr-2 hidden rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:flex"
            style={{ background: '#005AFF' }}
          >
            + Add showcase
          </Link>
          <button className={`grid h-9 w-9 place-items-center rounded-lg transition ${isDark ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'}`}>
            <Search size={16} />
          </button>
          <button className={`grid h-9 w-9 place-items-center rounded-lg transition ${isDark ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'}`}>
            <Bell size={16} />
          </button>
          <div className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: '#005AFF' }}>
            A
          </div>
        </div>
      </div>
    </header>
  );
}
