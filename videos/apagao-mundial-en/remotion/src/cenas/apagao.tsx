// Peças do VORTTUM 003 (apagão) para as cenas Remotion: fundos com movimento, grão de filme, luzes de cidade,
// torre e árvore em recorte, mostrador de frequência, globo girando, rótulo rasgado, texto que bate e contador.
// Paleta e tipografia VORTTUM (Latin Modern reta, terrosos, sem neon).
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, pop, sai, lerp} from '../kit/tempo';
import {rasgado} from '../kit/componentes';
import {Som} from '../kit/retro';
import {aleatorio} from '../kit/impacto';
import {LM, V} from './vorttum';

export {Som};

/** Paleta escura VORTTUM (a mesma do v_doc do Manim). */
export const VE = {
  BG: '#1E1C1A', INK: '#ECE5D6', MUTED: '#9A9286', SHEET: '#282522', C1: '#C9694B', C2: '#9AA6AD',
  GOLD: '#D2B47E', BAD: '#C25B43', GOOD: '#9CA77A', LUZ: '#F0C878',
};
export const KRAFT = '#D8C9AC';
export const W = 1920, H = 1080;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** entra em t, sai em ate (0..1) */
export const vida = (s: number, t: number, ate?: number, d = 0.35) =>
  (s < t ? 0 : prog(s, t, d)) * (ate === undefined ? 1 : sai(s, ate, 0.3));

// ------------------------------------------------------------------ fundos
/** Grão de filme que muda a cada quadro (dá vida ao fundo parado). */
export const Grao: React.FC<{forca?: number}> = ({forca = 0.08}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: forca}}>
      <svg width={W} height={H}>
        <filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 6} /></filter>
        <rect width={W} height={H} filter={`url(#g${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Vinheta (bordas escuras). */
export const Vinheta: React.FC<{forca?: number; cor?: string}> = ({forca = 0.55, cor = '0,0,0'}) => (
  <AbsoluteFill style={{pointerEvents: 'none',
    background: `radial-gradient(ellipse at center, rgba(${cor},0) 55%, rgba(${cor},${forca}) 100%)`}} />
);

export const FundoNoite: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 60% 40%, #2A2622 0%, ${VE.BG} 55%, #141311 100%)`}}>
    {children}
  </AbsoluteFill>
);

export const FundoPapel: React.FC<{img?: string; deriva?: number; children?: React.ReactNode}> = ({img = 'vorttum/papel.jpg', deriva = 0, children}) => (
  <AbsoluteFill style={{background: V.BG, overflow: 'hidden'}}>
    <Img src={staticFile(img)} style={{position: 'absolute', inset: -40, width: W + 80, height: H + 80, objectFit: 'cover',
      transform: `translate(${-deriva * 30}px, ${-deriva * 12}px) scale(1.03)`}} />
    {children}
  </AbsoluteFill>
);

export const FundoKraft: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: KRAFT}}>
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.35}}>
      <filter id="kr"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.6" numOctaves={3} seed={4} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.24  0 0 0 0.5 0" /></filter>
      <rect width={W} height={H} filter="url(#kr)" />
    </svg>
    {children}
  </AbsoluteFill>
);

// ------------------------------------------------------------------ texto
type Ancora = 'esquerda' | 'centro' | 'direita';
const al = (a: Ancora): 'left' | 'center' | 'right' => (a === 'esquerda' ? 'left' : a === 'direita' ? 'right' : 'center');
const tx = (a: Ancora) => (a === 'esquerda' ? '0' : a === 'direita' ? '-100%' : '-50%');

/** Texto que BATE na tela: entra grande e desfocado, assenta com passada. Som opcional. */
export const Bate: React.FC<{s: number; t: number; ate?: number; x: number; y: number; size?: number; cor?: string;
  ancora?: Ancora; som?: string | false; peso?: number; rot?: number; children: React.ReactNode}> =
  ({s, t, ate, x, y, size = 120, cor = VE.INK, ancora = 'centro', som = 'soco', peso = 700, rot = 0, children}) => {
    if (s < t - 0.05) return <>{som && <Som nome={som} t={t} volume={0.45} />}</>;
    const p = pop(s, t, 0.38);
    const k = ate === undefined ? 1 : sai(s, ate, 0.25);
    const blur = (1 - prog(s, t, 0.18)) * 14;
    const resp = 1 + 0.012 * Math.sin((s - t) * 3.2);
    return (
      <>
        {som && <Som nome={som} t={t} volume={0.45} />}
        <div style={{position: 'absolute', left: x, top: y, opacity: clamp01(p * 2) * k, filter: `blur(${blur}px)`,
          transform: `translate(${tx(ancora)}, -50%) rotate(${rot}deg) scale(${lerp(2.4, 1, p) * resp})`, transformOrigin: '50% 50%',
          fontFamily: LM, fontWeight: peso, fontSize: size, color: cor, whiteSpace: 'pre', lineHeight: 1.05,
          textAlign: al(ancora)}}>{children}</div>
      </>
    );
  };

/** Texto que entra subindo (apoio). */
export const Sobe: React.FC<{s: number; t: number; ate?: number; x: number; y: number; size?: number; cor?: string;
  ancora?: Ancora; peso?: number; largura?: number; children: React.ReactNode}> =
  ({s, t, ate, x, y, size = 44, cor = VE.INK, ancora = 'esquerda', peso, largura, children}) => {
    const p = vida(s, t, ate, 0.45);
    if (p <= 0) return null;
    return (
      <div style={{position: 'absolute', left: x, top: y, width: largura, opacity: p,
        transform: `translate(${tx(ancora)}, ${(1 - prog(s, t, 0.45)) * 26}px)`,
        fontFamily: LM, fontWeight: peso ?? (size >= 40 ? 700 : 400), fontSize: size, color: cor, lineHeight: 1.18,
        whiteSpace: largura ? 'normal' : 'pre', textAlign: al(ancora)}}>{children}</div>
    );
  };

/** Rótulo de papel rasgado (colagem) em cores VORTTUM. Entra em pop, levemente torto, com som de papel. */
export const Rotulo: React.FC<{s: number; t: number; ate?: number; x: number; y: number; fundo?: string; cor?: string;
  size?: number; rot?: number; seed?: number; ancora?: Ancora; som?: string | false; children: React.ReactNode}> =
  ({s, t, ate, x, y, fundo = V.INK, cor = V.SHEET, size = 54, rot = -2, seed = 3, ancora = 'centro', som = 'papel', children}) => {
    const p = s < t ? 0 : pop(s, t, 0.4);
    const k = ate === undefined ? 1 : sai(s, ate, 0.25);
    return (
      <>
        {som && <Som nome={som} t={t} volume={0.4} />}
        {p > 0 && k > 0 && (
          <div style={{position: 'absolute', left: x, top: y, opacity: clamp01(p * 2) * k,
            transform: `translate(${tx(ancora)}, -50%) rotate(${rot}deg) scale(${p})`, filter: 'drop-shadow(7px 9px 0 rgba(0,0,0,0.3))'}}>
            <div style={{background: fundo, color: cor, fontFamily: LM, fontWeight: 700, fontSize: size, lineHeight: 1.05,
              padding: `${size * 0.2}px ${size * 0.4}px ${size * 0.16}px`, whiteSpace: 'pre', clipPath: rasgado(seed, 4, 14)}}>{children}</div>
          </div>
        )}
      </>
    );
  };

/** Cartão de papel com fita (colagem), entra caindo e assenta. */
export const Cartao: React.FC<{s: number; t: number; ate?: number; x: number; y: number; w: number; h: number; fundo?: string;
  rot?: number; seed?: number; fita?: boolean; som?: string | false; children?: React.ReactNode}> =
  ({s, t, ate, x, y, w, h, fundo = V.SHEET, rot = -2, seed = 5, fita = true, som = 'papel', children}) => {
    const p = s < t ? 0 : pop(s, t, 0.45);
    const k = ate === undefined ? 1 : sai(s, ate, 0.25);
    const balanca = Math.sin((s - t) * 1.6) * 0.6 * prog(s, t, 0.5);
    return (
      <>
        {som && <Som nome={som} t={t} volume={0.35} />}
        {p > 0 && k > 0 && (
          <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp01(p * 2) * k,
            transform: `translateY(${(1 - p) * -120}px) rotate(${rot + balanca + (1 - p) * 8}deg) scale(${lerp(1.2, 1, p)})`,
            filter: 'drop-shadow(10px 13px 0 rgba(0,0,0,0.28))'}}>
            <div style={{position: 'absolute', inset: 0, background: fundo, clipPath: rasgado(seed, 2.5, 16)}} />
            {fita && <div style={{position: 'absolute', left: w / 2 - 75, top: -24, width: 150, height: 48,
              background: '#EFE3B0', opacity: 0.8, transform: 'rotate(4deg)'}} />}
            <div style={{position: 'absolute', inset: 0}}>{children}</div>
          </div>
        )}
      </>
    );
  };

/** Número que conta de a até b entre t0 e t0 + d. */
export const conta = (s: number, t0: number, d: number, a: number, b: number) =>
  Math.round(lerp(a, b, prog(s, t0, d, (x) => 1 - Math.pow(1 - x, 3))));
export const milhar = (n: number) => n.toLocaleString('en-US');

// ------------------------------------------------------------------ desenhos
/** Torre de transmissão (x = centro da base, y = base). */
export const Torre: React.FC<{x: number; y: number; h?: number; cor?: string; op?: number}> = ({x, y, h = 300, cor = VE.INK, op = 1}) => {
  const b = h * 0.32;
  const L: [number, number, number, number][] = [];
  for (let k = 0; k < 5; k++) {
    const y0 = y - (k * h) / 5, y1 = y - ((k + 1) * h) / 5;
    const w0 = b / 2 * (1 - k * 0.17), w1 = b / 2 * (1 - (k + 1) * 0.17);
    L.push([x - w0, y0, x + w1, y1], [x + w0, y0, x - w1, y1]);
  }
  return (
    <g opacity={op} stroke={cor} strokeWidth={4} fill="none" strokeLinecap="round">
      <path d={`M ${x - b / 2} ${y} L ${x - 6} ${y - h} L ${x + 6} ${y - h} L ${x + b / 2} ${y}`} strokeWidth={6} />
      <line x1={x - b * 0.95} y1={y - h * 0.8} x2={x + b * 0.95} y2={y - h * 0.8} strokeWidth={6} />
      {L.map(([a, b2, c, d], i) => <line key={i} x1={a} y1={b2} x2={c} y2={d} />)}
    </g>
  );
};
/** Ponto de amarração do cabo na torre. */
export const pontaTorre = (x: number, y: number, h = 300, lado = 1): [number, number] => [x + lado * h * 0.32 * 0.95, y - h * 0.8];

/** Cabo com flecha (sag) entre dois pontos. */
export const Cabo: React.FC<{a: [number, number]; b: [number, number]; flecha: number; cor: string; w?: number; op?: number}> =
  ({a, b, flecha, cor, w = 5, op = 1}) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + flecha * 2;
    return <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`} stroke={cor} strokeWidth={w} fill="none" opacity={op} />;
  };

/** Árvore em recorte (x = base do tronco). balanço: graus. */
export const Arvore: React.FC<{x: number; y: number; h?: number; balanco?: number; copa?: string; tronco?: string}> =
  ({x, y, h = 260, balanco = 0, copa = '#7D8A5A', tronco = '#5A4A3A'}) => (
    <g transform={`rotate(${balanco} ${x} ${y})`} style={{filter: 'drop-shadow(6px 8px 0 rgba(0,0,0,0.35))'}}>
      <rect x={x - h * 0.06} y={y - h * 0.45} width={h * 0.12} height={h * 0.45} fill={tronco} />
      {[[-0.17, 0.62, 0.2], [0.17, 0.64, 0.2], [0, 0.82, 0.24], [-0.05, 0.55, 0.18]].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx * h} cy={y - dy * h} r={r * h} fill={copa} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
      ))}
    </g>
  );

/** Luzes de cidade (noite). Pontos fixos com cintilar; apagam pela função `ligada(x)` (0..1). */
export type Luz = {x: number; y: number; r: number; b: number; f: number};
export const useLuzes = (centros: [number, number, number][], n = 140, semente = 7): Luz[] =>
  useMemo(() => {
    const rnd = aleatorio(semente);
    const out: Luz[] = [];
    for (const [cx, cy, esc] of centros) {
      const k = Math.round(n * esc);
      for (let i = 0; i < k; i++) {
        const a = rnd() * Math.PI * 2;
        const d = Math.abs((rnd() + rnd() + rnd() - 1.5) / 1.5) * 170 * esc;
        out.push({x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.75, r: 1.2 + rnd() * 3.2, b: 0.5 + rnd() * 0.5, f: rnd() * 10});
      }
    }
    return out;
  }, []);

export const Luzes: React.FC<{luzes: Luz[]; s: number; ligada: (l: Luz) => number; cor?: string}> =
  ({luzes, s, ligada, cor = VE.LUZ}) => (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs><filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter></defs>
      <g filter="url(#brilho)" opacity={0.75}>
        {luzes.map((l, i) => {
          const o = ligada(l);
          return o > 0.02 ? <circle key={i} cx={l.x} cy={l.y} r={l.r * 3.2} fill={cor} opacity={o * l.b * 0.5} /> : null;
        })}
      </g>
      {luzes.map((l, i) => {
        const o = ligada(l) * (0.82 + 0.18 * Math.sin(s * 3 + l.f));
        return o > 0.02 ? <circle key={i} cx={l.x} cy={l.y} r={l.r} fill="#FFF1D0" opacity={o * l.b} /> : null;
      })}
    </svg>
  );

/** Mostrador de frequência (57 a 61 Hz). (cx, cy) = eixo; f = frequência mostrada. */
export const Medidor: React.FC<{cx: number; cy: number; r: number; f: number; tinta?: string; op?: number}> =
  ({cx, cy, r, f, tinta = VE.INK, op = 1}) => {
    const ang = (v: number) => Math.PI - ((v - 57) / 4) * Math.PI;
    const P = (rr: number, v: number) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
    const arco = (rr: number, v0: number, v1: number) => {
      const [x0, y0] = P(rr, v0), [x1, y1] = P(rr, v1);
      return `M ${x0} ${y0} A ${rr} ${rr} 0 0 1 ${x1} ${y1}`;
    };
    const [px, py] = P(r * 0.82, f);
    const perigo = clamp01((59.6 - f) / 0.5);
    return (
      <g opacity={op}>
        <circle cx={cx} cy={cy} r={r * 1.12} fill={VE.C1} opacity={0.18 * perigo} />
        <path d={arco(r, 57, 61)} stroke={tinta} strokeWidth={7} fill="none" />
        <path d={arco(r * 0.9, 57, 59)} stroke={VE.C1} strokeWidth={18} fill="none" />
        <path d={arco(r * 0.9, 59.5, 60.5)} stroke={VE.GOOD} strokeWidth={18} fill="none" />
        {[57, 58, 59, 60, 61].map((v) => {
          const [a1, b1] = P(r * 0.8, v), [a2, b2] = P(r, v), [lx, ly] = P(r * 1.17, v);
          return <g key={v}><line x1={a1} y1={b1} x2={a2} y2={b2} stroke={tinta} strokeWidth={5} />
            <text x={lx} y={ly} fill={VE.MUTED} fontSize={r * 0.12} fontFamily={LM} textAnchor="middle" dominantBaseline="central">{v}</text></g>;
        })}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke={VE.GOLD} strokeWidth={10} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={14} fill={tinta} />
        <text x={cx} y={cy + r * 0.25} fill={VE.MUTED} fontSize={r * 0.12} fontFamily={LM} textAnchor="middle">Hz</text>
        <text x={cx} y={cy - r * 0.38} fill={perigo > 0.3 ? VE.C1 : tinta} fontSize={r * 0.2} fontFamily={LM} fontWeight={700}
          textAnchor="middle">{f.toFixed(2)}</text>
      </g>
    );
  };

/** Globo que gira com luzes de cidade (pontos lat/lon). apaga(lat, lon) = 0..1 (1 = aceso). */
export const Globo: React.FC<{cx: number; cy: number; r: number; giro: number; apaga?: (lat: number, lon: number) => number;
  borda?: string; n?: number}> = ({cx, cy, r, giro, apaga = () => 1, borda = VE.MUTED, n = 420}) => {
  const pts = useMemo(() => {
    const rnd = aleatorio(19);
    const zonas: [number, number, number][] = [[40, -85, 22], [45, -110, 18], [50, 10, 22], [30, 110, 24], [22, 78, 16], [-23, -46, 16],
      [35, 135, 10], [-30, 145, 12], [6, 3, 14], [55, 37, 18], [19, -99, 12], [30, 31, 12], [-26, 28, 10], [25, 50, 12],
      [4, -74, 10], [37, 127, 6], [-6, 107, 12], [60, 90, 22], [15, 100, 12], [40, -3, 10]];
    return Array.from({length: n}, () => {
      const [la, lo, sp] = zonas[Math.floor(rnd() * zonas.length)];
      return {lat: la + (rnd() - 0.5) * sp, lon: lo + (rnd() - 0.5) * sp * 1.6, b: 0.4 + rnd() * 0.6};
    });
  }, [n]);
  const tilt = 0.35;
  const proj = (lat: number, lon: number) => {
    const la = (lat * Math.PI) / 180, lo = ((lon + giro) * Math.PI) / 180;
    const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    return {x: cx + r * x, y: cy - r * y2, z: z2};
  };
  const meridianos = Array.from({length: 12}, (_, k) => k * 30);
  const linha = (fn: (u: number) => {x: number; y: number; z: number}) => {
    const seg: string[] = [];
    let ab = false;
    for (let i = 0; i <= 60; i++) {
      const p = fn(i / 60);
      if (p.z > 0) { seg.push(`${ab ? 'L' : 'M'} ${p.x} ${p.y}`); ab = true; } else ab = false;
    }
    return seg.join(' ');
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="esf" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#2E2A26" /><stop offset="100%" stopColor="#151412" /></radialGradient>
        <filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#esf)" stroke={borda} strokeWidth={3} />
      <g stroke={borda} strokeWidth={1.2} fill="none" opacity={0.45}>
        {meridianos.map((lo) => <path key={lo} d={linha((u) => proj(-90 + 180 * u, lo))} />)}
        {[-60, -30, 0, 30, 60].map((la) => <path key={la} d={linha((u) => proj(la, -180 + 360 * u))} />)}
      </g>
      <g filter="url(#gl)">
        {pts.map((p, i) => { const q = proj(p.lat, p.lon); const o = apaga(p.lat, p.lon);
          return q.z > 0 && o > 0.02 ? <circle key={i} cx={q.x} cy={q.y} r={5} fill={VE.LUZ} opacity={o * p.b * 0.6} /> : null; })}
      </g>
      {pts.map((p, i) => { const q = proj(p.lat, p.lon); const o = apaga(p.lat, p.lon);
        return q.z > 0 && o > 0.02 ? <circle key={i} cx={q.x} cy={q.y} r={1.8} fill="#FFF1D0" opacity={o * p.b} /> : null; })}
    </svg>
  );
};

/** Interruptor de parede (ligado = alavanca em cima). */
export const Interruptor: React.FC<{x: number; y: number; h?: number; ligado: number}> = ({x, y, h = 180, ligado}) => (
  <g>
    <rect x={x - h * 0.31} y={y - h / 2} width={h * 0.62} height={h} rx={14} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
    <rect x={x - h * 0.15} y={y - h * 0.21 + (1 - ligado) * h * 0.2 - h * 0.1 + (ligado ? 0 : 0)} width={h * 0.3} height={h * 0.42 * 0.7}
      rx={8} fill={ligado > 0.5 ? V.GOOD : V.C2} stroke={V.INK} strokeWidth={3}
      transform={`translate(0 ${(1 - ligado) * h * 0.18 - h * 0.09})`} />
  </g>
);

/** Deriva lenta de câmera (zoom e passeio) para nada ficar parado. */
export const deriva = (s: number, dur: number, z0 = 1, z1 = 1.07) => lerp(z0, z1, clamp01(s / Math.max(1, dur)));
