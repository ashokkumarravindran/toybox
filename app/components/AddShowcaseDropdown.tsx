'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ChevronDown, Sparkles, PenLine } from 'lucide-react';

type Variant = 'header' | 'cta' | 'hero';

const OPTIONS = [
  {
    href: '/upload/ai',
    icon: Sparkles,
    label: 'Generate with Toybox AI',
    description: 'Upload a project file — AI drafts the full showcase.',
    badge: 'AI',
    iconBg: 'rgba(0,90,255,0.15)',
    iconColor: '#005AFF',
  },
  {
    href: '/upload/manual',
    icon: PenLine,
    label: 'Create manually',
    description: 'Build your showcase step-by-step using a guided form.',
    badge: null,
    iconBg: 'rgba(255,255,255,0.06)',
    iconColor: 'rgba(255,255,255,0.45)',
  },
];

type MenuPos = { top: number; left: number; width: number };

function PortalMenu({ anchor, onClose, align }: { anchor: HTMLElement | null; onClose: () => void; align: 'left' | 'right' }) {
  const [pos, setPos] = useState<MenuPos | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const update = () => {
      const r = anchor.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: align === 'right' ? r.right - 300 : r.left, width: 300 });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [anchor, align]);

  // Lock scroll by fixing the body at its current scroll position
  useEffect(() => {
    const scrollY = window.scrollY;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (anchor && anchor.closest('[data-dropdown]')?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchor, onClose]);

  if (!pos) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
        background: '#0F1117',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}
    >
      {/* Blue top accent stripe */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #005AFF 0%, rgba(0,90,255,0) 100%)' }} />

      <div className="p-1.5">
        {OPTIONS.map(({ href, icon: Icon, label, description, badge, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="group flex items-start gap-3.5 rounded-xl px-3.5 py-3 transition-colors hover:bg-white/5"
          >
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: iconBg }}>
              <Icon size={16} style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white leading-snug">{label}</p>
                {badge && (
                  <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest leading-none" style={{ background: 'rgba(0,90,255,0.2)', color: '#005AFF' }}>
                    {badge}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-5 text-white/40">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] text-white/20">Publish to the Toybox gallery once complete</p>
      </div>
    </div>,
    document.body
  );
}

export default function AddShowcaseDropdown({ variant = 'header' }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  const align = variant === 'header' ? 'right' : 'left';

  const buttonCls = variant === 'cta'
    ? 'mt-8 inline-flex items-center gap-2 rounded-lg px-7 py-4 text-sm font-semibold text-white transition hover:opacity-90'
    : variant === 'hero'
    ? 'inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90'
    : 'mr-2 hidden items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:flex';

  return (
    <div ref={wrapRef} data-dropdown="true" className="relative inline-block">
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className={buttonCls}
        style={{ background: '#005AFF' }}
      >
        {variant === 'header' ? '+ Add showcase' : 'Add a showcase'}
        <ChevronDown size={variant === 'header' ? 12 : 14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <PortalMenu anchor={btnRef.current} onClose={close} align={align} />}
    </div>
  );
}
