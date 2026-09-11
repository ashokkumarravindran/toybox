import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const DOMAIN_PALETTE: Record<string, { from: string; to: string; accent: string }> = {
  'financial services': { from: '#001A4D', to: '#003080', accent: '#005AFF' },
  'insurance':          { from: '#0D1F0D', to: '#1A3D1A', accent: '#16A34A' },
  'banking':            { from: '#1A0033', to: '#330066', accent: '#7C3AED' },
  'healthcare':         { from: '#001A33', to: '#003366', accent: '#0EA5E9' },
  'public sector':      { from: '#1A1A00', to: '#333300', accent: '#CA8A04' },
  'retail':             { from: '#1A0011', to: '#33001F', accent: '#DB2777' },
  'hospitality':        { from: '#1A0A00', to: '#331500', accent: '#EA580C' },
  'government':         { from: '#0D1A00', to: '#1F3300', accent: '#65A30D' },
  'cross-industry':     { from: '#0A0A1F', to: '#0F0F2E', accent: '#DCFF00' },
};

function palette(domain: string) {
  const key = domain.toLowerCase();
  for (const [k, v] of Object.entries(DOMAIN_PALETTE)) {
    if (key.includes(k)) return v;
  }
  return { from: '#070B14', to: '#0D1829', accent: '#005AFF' };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') || 'Slalom Showcase';
  const domain = searchParams.get('domain') || '';
  const tags = (searchParams.get('tags') || '').split(',').filter(Boolean).slice(0, 3);

  const p = palette(domain);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${p.accent}18 1px, transparent 1px), linear-gradient(90deg, ${p.accent}18 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          display: 'flex',
        }} />

        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: `radial-gradient(circle, ${p.accent}40 0%, transparent 70%)`,
          display: 'flex',
        }} />

        {/* Top: Slalom wordmark + domain badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>slalom</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>|</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Toybox</span>
          </div>
          {domain && (
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
              color: p.accent, background: `${p.accent}22`,
              border: `1px solid ${p.accent}55`,
              borderRadius: 100, padding: '5px 14px',
              display: 'flex',
            }}>
              {domain}
            </div>
          )}
        </div>

        {/* Center: title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', flex: 1, justifyContent: 'center' }}>
          <div style={{
            width: 48, height: 4, borderRadius: 2,
            background: p.accent, display: 'flex',
          }} />
          <div style={{
            fontSize: title.length > 50 ? 32 : title.length > 30 ? 38 : 44,
            fontWeight: 800, color: 'white',
            letterSpacing: '-0.02em', lineHeight: 1.15,
            maxWidth: 580, display: 'flex', flexWrap: 'wrap',
          }}>
            {title}
          </div>
        </div>

        {/* Bottom: tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {tags.length > 0 ? tags.map((t, i) => (
            <div key={i} style={{
              fontSize: 11, color: 'rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 100, padding: '4px 12px',
              display: 'flex',
            }}>
              {t}
            </div>
          )) : (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', display: 'flex' }}>
              Slalom · Case Study
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 800,
      height: 450,
    }
  );
}
