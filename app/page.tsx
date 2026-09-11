'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function PresentationPage() {
  const deckRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const total = 7;

  useEffect(() => {
    const slides = Array.from(document.querySelectorAll<HTMLElement>('.tb-slide'));
    const counter = document.getElementById('tb-counter');
    const progress = document.getElementById('tb-progress');
    const dotsEl = document.getElementById('tb-dots');
    if (!slides.length) return;

    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'tb-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsEl?.appendChild(d);
    });

    function updateUI() {
      const c = currentRef.current;
      if (counter) counter.textContent = `${c + 1} / ${total}`;
      if (progress) progress.style.width = `${((c + 1) / total) * 100}%`;
      document.querySelectorAll('.tb-dot').forEach((d, i) => d.classList.toggle('active', i === c));
    }

    function goTo(index: number) {
      if (index < 0 || index >= total || index === currentRef.current) return;
      const prev = slides[currentRef.current];
      prev.classList.remove('active');
      prev.classList.add('exit');
      setTimeout(() => prev.classList.remove('exit'), 600);
      currentRef.current = index;
      slides[currentRef.current].classList.add('active');
      updateUI();
    }

    document.getElementById('tb-prev')?.addEventListener('click', () => goTo(currentRef.current - 1));
    document.getElementById('tb-next')?.addEventListener('click', () => goTo(currentRef.current + 1));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goTo(currentRef.current + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(currentRef.current - 1); }
    };
    document.addEventListener('keydown', onKey);

    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? goTo(currentRef.current + 1) : goTo(currentRef.current - 1);
    };
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);

    updateUI();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <>
      <style>{`
        .tb-root *, .tb-root *::before, .tb-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .tb-root {
          position: fixed; inset: 0;
          background: #0A0A0F;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #fff;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          --blue: #005AFF; --blue-bright: #1E6FFF; --blue-dim: rgba(0,90,255,0.08);
          --slate: #8A8FA8; --slate-light: #C0C4D6;
          --card: rgba(255,255,255,0.04); --card-border: rgba(255,255,255,0.08);
          --trans: 0.55s cubic-bezier(0.77,0,0.175,1);
        }
        .tb-noise { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .tb-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);
          background-size: 80px 80px; }
        #tb-progress { position: fixed; top: 0; left: 0; height: 2px; background: linear-gradient(90deg,#005AFF,#7B8FFF); transition: width 0.4s ease; z-index: 200; }
        .tb-logo { position: fixed; top: 32px; left: 40px; display: flex; align-items: center; gap: 10px; z-index: 100; }
        .tb-logo-box { width: 28px; height: 28px; background: #005AFF; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .tb-logo-word { font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #C0C4D6; }
        .tb-logo-word span { color: #fff; }
        #tb-dots { position: fixed; right: 36px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 10px; z-index: 100; }
        .tb-dot { width: 6px; height: 6px; border-radius: 50%; background: #8A8FA8; cursor: pointer; transition: background 0.3s, transform 0.3s; }
        .tb-dot.active { background: #005AFF; transform: scale(1.5); }
        .tb-nav { position: fixed; bottom: 36px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 20px; z-index: 100;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; padding: 10px 20px; backdrop-filter: blur(12px); }
        .tb-nav button { background: none; border: none; cursor: pointer; color: #8A8FA8; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; transition: color 0.2s, background 0.2s; }
        .tb-nav button:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .tb-nav button svg { width: 18px; height: 18px; }
        #tb-counter { font-size: 13px; font-weight: 500; color: #8A8FA8; min-width: 44px; text-align: center; letter-spacing: 0.05em; }
        .tb-deck { position: relative; width: 100vw; height: 100vh; }
        .tb-slide { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px;
          opacity: 0; transform: translateX(60px); transition: opacity var(--trans), transform var(--trans); pointer-events: none; }
        .tb-slide.active { opacity: 1; transform: translateX(0); pointer-events: all; }
        .tb-slide.exit { opacity: 0; transform: translateX(-60px); }
        .tb-slide > * { position: relative; z-index: 1; }
        .tb-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #005AFF; margin-bottom: 20px; }
        .tb-h1 { font-size: clamp(42px,6vw,80px); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; }
        .tb-h2 { font-size: clamp(32px,4.5vw,58px); font-weight: 800; line-height: 1.1; letter-spacing: -0.025em; }
        .tb-sub { font-size: clamp(16px,1.6vw,20px); font-weight: 400; color: #C0C4D6; line-height: 1.65; max-width: 580px; }
        .tb-blue { color: #005AFF; }
        .tb-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(0,90,255,0.08); border: 1px solid rgba(0,90,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tb-icon svg { width: 18px; height: 18px; color: #1E6FFF; }

        /* S1 problem */
        .tb-problem-grid { display: flex; gap: 20px; margin-top: 52px; justify-content: center; }
        .tb-pcard { width: 220px; padding: 24px 20px; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; background: rgba(255,255,255,0.025); display: flex; flex-direction: column; gap: 12px; text-align: left; }
        .tb-pcard-icon { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; }
        .tb-pcard-icon svg { width: 16px; height: 16px; color: #8A8FA8; }
        .tb-pcard h3 { font-size: 13px; font-weight: 600; color: #C0C4D6; }
        .tb-pcard p { font-size: 12px; color: #8A8FA8; line-height: 1.6; }

        /* S2 pillars */
        .tb-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,90,255,0.08); border: 1px solid rgba(0,90,255,0.3); border-radius: 100px; padding: 8px 18px; font-size: 13px; font-weight: 600; color: #1E6FFF; letter-spacing: 0.04em; margin-bottom: 28px; }
        .tb-pillars { display: flex; gap: 20px; margin-top: 48px; justify-content: center; }
        .tb-pillar { width: 210px; padding: 28px 22px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: rgba(255,255,255,0.04); text-align: left; transition: border-color 0.3s, background 0.3s; }
        .tb-pillar:hover { border-color: rgba(0,90,255,0.4); background: rgba(0,90,255,0.08); }
        .tb-pillar h3 { font-size: 14px; font-weight: 700; margin: 14px 0 8px; }
        .tb-pillar p { font-size: 13px; color: #8A8FA8; line-height: 1.6; }

        /* S3 paths */
        .tb-paths { display: flex; gap: 20px; margin-top: 44px; width: 100%; max-width: 960px; }
        .tb-path { flex: 1; padding: 32px 24px; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; background: rgba(255,255,255,0.04); position: relative; overflow: hidden; }
        .tb-path::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 2px 2px 0 0; }
        .tb-path:nth-child(1)::before { background: linear-gradient(90deg,#005AFF,#4D8FFF); }
        .tb-path:nth-child(2)::before { background: linear-gradient(90deg,#7B61FF,#C084FC); }
        .tb-path:nth-child(3)::before { background: linear-gradient(90deg,#10B981,#34D399); }
        .tb-path-num { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8A8FA8; margin: 14px 0 10px; }
        .tb-path h3 { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
        .tb-path p { font-size: 13px; color: #C0C4D6; line-height: 1.7; }
        .tb-human { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 11px; font-weight: 600; color: #34D399; letter-spacing: 0.05em; }
        .tb-human svg { width: 12px; height: 12px; }

        /* S4 shelf */
        .tb-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; width: 100%; max-width: 1000px; align-items: center; }
        .tb-shelf { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .tb-sitem { height: 110px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; position: relative; overflow: hidden; cursor: pointer; transition: border-color 0.3s, transform 0.3s; }
        .tb-sitem:hover { border-color: rgba(0,90,255,0.4); transform: translateY(-2px); }
        .tb-sitem .tag { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #1E6FFF; margin-bottom: 4px; }
        .tb-sitem .name { font-size: 12px; font-weight: 600; color: #C0C4D6; }
        .tb-sitem .grad { position: absolute; inset: 0; opacity: 0.15; border-radius: inherit; }
        .tb-sitem:nth-child(1) .grad { background: linear-gradient(135deg,#005AFF,transparent); }
        .tb-sitem:nth-child(2) .grad { background: linear-gradient(135deg,#7B61FF,transparent); }
        .tb-sitem:nth-child(3) .grad { background: linear-gradient(135deg,#10B981,transparent); }
        .tb-sitem:nth-child(4) .grad { background: linear-gradient(135deg,#F59E0B,transparent); }

        /* S5 ExA */
        #tb-s5 { background: radial-gradient(ellipse 70% 60% at 60% 50%,rgba(0,90,255,0.12) 0%,transparent 70%); }
        .tb-exa-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; width: 100%; max-width: 1100px; align-items: center; }
        .tb-exa-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(90deg,rgba(0,90,255,0.2),rgba(0,90,255,0.05)); border: 1px solid rgba(0,90,255,0.4); border-radius: 100px; padding: 7px 16px; font-size: 12px; font-weight: 700; color: #1E6FFF; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 24px; }
        .tb-dot-pulse { width: 6px; height: 6px; border-radius: 50%; background: #1E6FFF; animation: tbpulse 1.8s ease-in-out infinite; }
        @keyframes tbpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .tb-use-list { display: flex; flex-direction: column; gap: 14px; margin-top: 24px; }
        .tb-use { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); }
        .tb-use-icon { width: 32px; height: 32px; min-width: 32px; border-radius: 8px; background: rgba(0,90,255,0.08); border: 1px solid rgba(0,90,255,0.2); display: flex; align-items: center; justify-content: center; }
        .tb-use-icon svg { width: 14px; height: 14px; color: #1E6FFF; }
        .tb-use h3 { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
        .tb-use p { font-size: 12px; color: #8A8FA8; line-height: 1.55; }
        .tb-terminal { background: rgba(0,0,0,0.5); border: 1px solid rgba(0,90,255,0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 0 60px rgba(0,90,255,0.12),inset 0 1px 0 rgba(255,255,255,0.05); }
        .tb-tbar { background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 14px 20px; display: flex; align-items: center; gap: 8px; }
        .tb-tdot { width: 10px; height: 10px; border-radius: 50%; }
        .tb-tdot.r{background:#FF5F57} .tb-tdot.y{background:#FEBC2E} .tb-tdot.g{background:#28C840}
        .tb-tbody { padding: 22px 26px; }
        .tb-tline { font-size: 12.5px; line-height: 2; font-family: 'SF Mono','Fira Code',monospace; }
        .tb-tprompt{color:#1E6FFF} .tb-tcmd{color:#fff} .tb-tout{color:#C0C4D6} .tb-tres{color:#34D399;font-weight:600}
        .tb-tblink { display: inline-block; width: 2px; height: 13px; background: #1E6FFF; margin-left: 2px; vertical-align: middle; animation: tbblink 1s step-end infinite; }
        @keyframes tbblink{0%,100%{opacity:1}50%{opacity:0}}
        .tb-estats { display: flex; gap: 20px; padding: 18px 26px; border-top: 1px solid rgba(255,255,255,0.06); }
        .tb-estat .num { font-size: 20px; font-weight: 800; color: #1E6FFF; letter-spacing: -0.02em; }
        .tb-estat .lbl { font-size: 11px; color: #8A8FA8; margin-top: 2px; }

        /* S6 governance */
        .tb-gov-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; width: 100%; max-width: 1000px; align-items: center; }
        .tb-score-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
        .tb-score-title { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8A8FA8; margin-bottom: 4px; }
        .tb-score-row { display: flex; align-items: center; gap: 16px; }
        .tb-score-lbl { font-size: 13px; color: #C0C4D6; flex: 1; }
        .tb-score-bg { flex: 2; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .tb-score-fill { height: 100%; border-radius: 3px; }
        .tb-score-val { font-size: 13px; font-weight: 700; color: #fff; min-width: 32px; text-align: right; }
        .tb-gov-pts { display: flex; flex-direction: column; gap: 24px; }
        .tb-gov-pt { display: flex; gap: 16px; align-items: flex-start; }
        .tb-gov-pt h3 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .tb-gov-pt p { font-size: 13px; color: #8A8FA8; line-height: 1.6; }

        /* S7 CTA */
        #tb-s7 { text-align: center; background: radial-gradient(ellipse 80% 60% at 50% 60%,rgba(0,90,255,0.10) 0%,transparent 65%); }
        #tb-s7 .tb-h1 { font-size: clamp(40px,7vw,90px); letter-spacing: -0.04em; line-height: 1; }
        #tb-s7 .accent { background: linear-gradient(90deg,#005AFF,#7B8FFF); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .tb-mvp { margin-top: 28px; max-width: 520px; font-size: 15px; color: #8A8FA8; line-height: 1.7; }
        .tb-mvp strong { color: #C0C4D6; font-weight: 500; }
        .tb-cta { display: inline-flex; align-items: center; gap: 10px; margin-top: 40px; padding: 18px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; background: #005AFF; color: white; border: none; text-decoration: none; transition: opacity 0.2s, transform 0.2s; }
        .tb-cta:hover { opacity: 0.85; transform: translateY(-2px); }
        .tb-cta svg { width: 16px; height: 16px; }
      `}</style>

      <div className="tb-root">
        <div className="tb-noise" />
        <div className="tb-grid" />
        <div id="tb-progress" style={{ width: `${(1 / total) * 100}%` }} />

        {/* Logo */}
        <div className="tb-logo">
          <div className="tb-logo-box">
            <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/><rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/><rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/><rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/></svg>
          </div>
          <div className="tb-logo-word"><span>Toybox</span> &nbsp;·&nbsp; slalom BETA</div>
        </div>

        <div id="tb-dots" />

        {/* Nav */}
        <div className="tb-nav">
          <button id="tb-prev" aria-label="Previous">
            <svg viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div id="tb-counter">1 / {total}</div>
          <button id="tb-next" aria-label="Next">
            <svg viewBox="0 0 18 18" fill="none"><path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="tb-deck" ref={deckRef}>

          {/* SLIDE 1 — Problem */}
          <section className="tb-slide active" id="tb-s1">
            <div className="tb-eyebrow">The Problem</div>
            <h2 className="tb-h2" style={{ textAlign: 'center', maxWidth: 720 }}>We build world-class CX.<br/>Most of it is never seen again.</h2>
            <p className="tb-sub" style={{ textAlign: 'center', marginTop: 20 }}>CX teams move fast. Between projects, there is rarely time to write up what was built. Case studies live in local drives. Brilliant work gets buried in knowledge portals. When the next proposal lands, teams scramble to find it — or start over.</p>
            <div className="tb-problem-grid">
              <div className="tb-pcard">
                <div className="tb-pcard-icon"><svg viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></div>
                <h3>No time to document</h3>
                <p>Case studies are a post-project afterthought. They rarely get written.</p>
              </div>
              <div className="tb-pcard">
                <div className="tb-pcard-icon"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/></svg></div>
                <h3>Lost in the knowledge portal</h3>
                <p>Even when documented, great work disappears into SharePoint and KM tools.</p>
              </div>
              <div className="tb-pcard">
                <div className="tb-pcard-icon"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></div>
                <h3>Proposals scramble for proof</h3>
                <p>Teams reach out to colleagues, dig through old drives, or start from scratch for every pitch.</p>
              </div>
            </div>
          </section>

          {/* SLIDE 2 — What is Toybox */}
          <section className="tb-slide" id="tb-s2" style={{ textAlign: 'center' }}>
            <div className="tb-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/><rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/><rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/><rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/></svg>
              Introducing Toybox
            </div>
            <h1 className="tb-h1" style={{ maxWidth: 820 }}>A premium CX intelligence layer.<br/><span className="tb-blue">Not another repository.</span></h1>
            <p className="tb-sub" style={{ textAlign: 'center', marginTop: 20 }}>A living, curated library of the best CX thinking — designed to make every future engagement smarter. Starting with CX. Built to grow beyond it.</p>
            <div className="tb-pillars">
              {[
                { icon: <svg viewBox="0 0 18 18" fill="none"><path d="M9 2l1.8 3.6 4 .6-2.9 2.8.7 4L9 11l-3.6 1.9.7-4L3.2 6.2l4-.6L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>, title: 'Curated, not crowdsourced', body: 'Every artifact earns its place. Quality over volume — always.' },
                { icon: <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: 'Practitioner-first', body: 'Built for the people who do the work. Zero friction to find, use, and contribute.' },
                { icon: <svg viewBox="0 0 18 18" fill="none"><path d="M9 3v3M9 12v3M3 9h3M12 9h3M4.9 4.9l2.1 2.1M11 11l2.1 2.1M4.9 13.1L7 11M11 7l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: 'AI-accelerated', body: 'Collective intelligence that compounds. The more we add, the faster we move.' },
                { icon: <svg viewBox="0 0 18 18" fill="none"><path d="M3 9a6 6 0 1012 0A6 6 0 003 9z" stroke="currentColor" strokeWidth="1.5"/><path d="M9 6v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: 'Reuse by design', body: 'Work done once, leveraged forever. Great thinking never disappears again.' },
              ].map(({ icon, title, body }) => (
                <div className="tb-pillar" key={title}>
                  <div className="tb-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 3 — Getting content in */}
          <section className="tb-slide" id="tb-s3">
            <div style={{ width: '100%', maxWidth: 960 }}>
              <div className="tb-eyebrow">How content gets in</div>
              <h2 className="tb-h2">Three paths. One quality bar.</h2>
              <p className="tb-sub" style={{ marginTop: 14 }}>Wherever your work lives, Toybox can meet you there. Every path has a human in the loop before anything enters the library.</p>
              <div className="tb-paths">
                <div className="tb-path">
                  <div className="tb-icon"><svg viewBox="0 0 18 18" fill="none"><path d="M9 3c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 3v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div className="tb-path-num">Path 01</div>
                  <h3>AI Case Study Generator</h3>
                  <p>Upload what you have — blueprints, personas, Figma links, Miro boards, decks. AI reads every artifact, connects the dots, and writes a complete case study narrative. Days of documentation work done in minutes.</p>
                  <div className="tb-human"><svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> Review before publish</div>
                </div>
                <div className="tb-path">
                  <div className="tb-icon"><svg viewBox="0 0 18 18" fill="none"><path d="M3 14V5a2 2 0 012-2h8a2 2 0 012 2v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
                  <div className="tb-path-num">Path 02</div>
                  <h3>Guided Manual Upload</h3>
                  <p>A smart form that asks the right questions. Add context, tag by industry and capability, and submit. Clean, structured, searchable from day one.</p>
                  <div className="tb-human"><svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> Practitioner authored</div>
                </div>
                <div className="tb-path">
                  <div className="tb-icon"><svg viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
                  <div className="tb-path-num">Path 03</div>
                  <h3>Knowledge Repository Scan</h3>
                  <p>Connect any existing knowledge repository. AI screens, scores against market relevance, reusability, and ExA potential, then surfaces the strongest candidates for admin review.</p>
                  <div className="tb-human"><svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> Admin approves entry</div>
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 4 — Showcase + Shelf */}
          <section className="tb-slide" id="tb-s4">
            <div className="tb-split">
              <div>
                <div className="tb-eyebrow">Showcase + Design Shelf</div>
                <h2 className="tb-h2">Publish once.<br/>Intelligence keeps<br/><span className="tb-blue">working.</span></h2>
                <p className="tb-sub" style={{ marginTop: 20 }}>A published case study does not just sit there. Toybox automatically extracts reusable design artifacts — personas, service blueprints, journey maps — indexes each one, and makes them instantly searchable. Every artifact traces back to its original showcase.</p>
                <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Auto-extracted on publish — personas, blueprints, journey maps, frameworks', 'Linked to the source showcase — context always one click away'].map(t => (
                    <div key={t} style={{ fontSize: 13, color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tb-shelf">
                {[['Persona','Digital-first Millennial'],['Journey Map','Onboarding — Retail Banking'],['Blueprint','Service Recovery Flow'],['Framework','Moments of Truth Matrix']].map(([tag, name]) => (
                  <div className="tb-sitem" key={name}><div className="grad" /><div className="tag">{tag}</div><div className="name">{name}</div></div>
                ))}
              </div>
            </div>
          </section>

          {/* SLIDE 5 — ExA */}
          <section className="tb-slide" id="tb-s5">
            <div className="tb-exa-layout">
              <div>
                <div className="tb-exa-badge"><span className="tb-dot-pulse" /> The Differentiator — ExA</div>
                <h2 className="tb-h2">Experience<br/>Accelerator.</h2>
                <p style={{ fontSize: 15, color: '#C0C4D6', lineHeight: 1.65, marginTop: 16, maxWidth: 380 }}>Describe your context. Toybox reads the entire library and assembles a white-label, client-ready output — in seconds, not days.</p>
                <div className="tb-use-list">
                  {[
                    { icon: <svg viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h7M2 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title: 'Respond to proposals faster', body: 'Instantly surface the most relevant case studies and artifacts for any RFP or pitch.' },
                    { icon: <svg viewBox="0 0 14 14" fill="none"><path d="M7 2v3M7 9v3M2 7h3M9 7h3M3.5 3.5l2.1 2.1M8.4 8.4l2.1 2.1M3.5 10.5L5.6 8.4M8.4 5.6l2.1-2.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title: 'Accelerate design engagements', body: 'Start new projects with relevant personas and patterns already assembled and ready to adapt.' },
                    { icon: <svg viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7l2 2 2-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: 'White-label client-ready outputs', body: 'Tailored to the engagement context, reviewed by a human, ready to present.' },
                  ].map(({ icon, title, body }) => (
                    <div className="tb-use" key={title}><div className="tb-use-icon">{icon}</div><div><h3>{title}</h3><p>{body}</p></div></div>
                  ))}
                </div>
              </div>
              <div className="tb-terminal">
                <div className="tb-tbar"><div className="tb-tdot r"/><div className="tb-tdot y"/><div className="tb-tdot g"/><div style={{ marginLeft: 12, fontSize: 11, color: '#8A8FA8', fontFamily: 'monospace' }}>ExA — Experience Accelerator</div></div>
                <div className="tb-tbody">
                  <div className="tb-tline"><span className="tb-tprompt">› </span><span className="tb-tcmd">context</span> <span style={{ color: '#8A8FA8' }}>"Regional health insurer, 1.2M members — new CX transformation pitch"</span></div>
                  <div className="tb-tline"><span className="tb-tout">Scanning library for relevant case studies...</span></div>
                  <div className="tb-tline"><span className="tb-tout">Matched 14 showcases across healthcare and insurance</span></div>
                  <div className="tb-tline"><span className="tb-tout">Extracting personas × 6 · blueprints × 3 · frameworks × 4</span></div>
                  <div className="tb-tline"><span className="tb-tout">Assembling white-label pitch pack...</span></div>
                  <div className="tb-tline"><span className="tb-tres">Output ready — 24 pages, client-branded</span></div>
                  <div className="tb-tline"><span className="tb-tres">Review and export when ready</span><span className="tb-tblink"/></div>
                </div>
                <div className="tb-estats">
                  <div className="tb-estat"><div className="num">~4s</div><div className="lbl">Assembly time</div></div>
                  <div className="tb-estat"><div className="num">24pp</div><div className="lbl">White-label output</div></div>
                  <div className="tb-estat"><div className="num">Gets smarter</div><div className="lbl">With every new showcase</div></div>
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 6 — Governance */}
          <section className="tb-slide" id="tb-s6">
            <div className="tb-gov-layout">
              <div>
                <div className="tb-eyebrow">Quality Governance</div>
                <h2 className="tb-h2">Quality that<br/>compounds.</h2>
                <p className="tb-sub" style={{ marginTop: 20 }}>A premium library only stays premium if someone guards the gate. Toybox uses AI-assisted scoring so humans make better calls, faster.</p>
                <div className="tb-gov-pts" style={{ marginTop: 36 }}>
                  {[
                    { icon: <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: 'AI scores every artifact', body: 'Market relevance, reusability, ExA potential, comprehensiveness — rated automatically.' },
                    { icon: <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: 'Humans approve what enters', body: 'Nothing enters Toybox without an admin sign-off. Quality control stays a human decision.' },
                    { icon: <svg viewBox="0 0 18 18" fill="none"><path d="M3 14l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: 'The flywheel accelerates', body: 'Better content in means better ExA output. Quality compounds with every addition.' },
                  ].map(({ icon, title, body }) => (
                    <div className="tb-gov-pt" key={title}><div className="tb-icon">{icon}</div><div><h3>{title}</h3><p>{body}</p></div></div>
                  ))}
                </div>
              </div>
              <div className="tb-score-card">
                <div className="tb-score-title">AI Artifact Score — Healthcare Journey Map</div>
                {[
                  { lbl: 'ExA Relevance', val: 88, color: 'linear-gradient(90deg,#005AFF,#4D8FFF)' },
                  { lbl: 'Market Signal', val: 92, color: 'linear-gradient(90deg,#7B61FF,#C084FC)' },
                  { lbl: 'Reusability', val: 76, color: 'linear-gradient(90deg,#10B981,#34D399)' },
                  { lbl: 'Completeness', val: 95, color: 'linear-gradient(90deg,#F59E0B,#FCD34D)' },
                ].map(({ lbl, val, color }) => (
                  <div className="tb-score-row" key={lbl}>
                    <div className="tb-score-lbl">{lbl}</div>
                    <div className="tb-score-bg"><div className="tb-score-fill" style={{ width: `${val}%`, background: color }} /></div>
                    <div className="tb-score-val">{val}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Overall Score</div>
                    <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: '#34D399' }}>88<span style={{ fontSize: 16, fontWeight: 500, color: '#8A8FA8' }}>/100</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'rgba(52,211,153,0.1)', color: '#34D399', fontWeight: 700, border: '1px solid rgba(52,211,153,0.25)' }}>Recommended</div>
                    <div style={{ fontSize: 11, color: '#8A8FA8' }}>Awaiting admin review</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 7 — CTA */}
          <section className="tb-slide" id="tb-s7">
            <h1 className="tb-h1">Great work,<br/>never lost.<br/><span className="accent">Toybox.</span></h1>
            <p className="tb-mvp">
              This is an early MVP — a working proof of concept built by practitioners, for practitioners.
              <strong> There is a long road ahead.</strong> But the foundation is here. The library, the shelf, the accelerator. Now it needs the community behind it.
            </p>
            <Link href="/explore" className="tb-cta">
              Explore Toybox
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </section>

        </div>
      </div>
    </>
  );
}
