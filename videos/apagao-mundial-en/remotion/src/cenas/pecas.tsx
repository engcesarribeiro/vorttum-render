// Peças de colagem do VORTTUM 003 para as cenas que eram Manim (V03, V04, V09):
// papel rasgado em SVG, rotor do gerador, usina, casa, balança, turbina, transformador, bateria,
// gráfico "Manim" (cartão escuro com a curva da simulação), equação, carimbo e marcador à mão.
import React, {useMemo} from 'react';
import {Props, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {aleatorio} from '../kit/impacto';
import {LM, V} from './vorttum';
import {VE, Som} from './apagao';

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const SOMBRA = 'drop-shadow(7px 9px 0 rgba(0,0,0,0.28))';

// ------------------------------------------------------------------ papel rasgado
/** Contorno de papel rasgado em volta de um retângulo (SVG path). */
export const rasgoRet = (x: number, y: number, w: number, h: number, seed = 1, amp = 6) => {
  const r = aleatorio(seed);
  const pts: [number, number][] = [];
  const n = Math.max(6, Math.round((w + h) / 40));
  for (let i = 0; i < n; i++) pts.push([x + (w * i) / n, y + (r() - 0.5) * amp]);
  for (let i = 0; i < n; i++) pts.push([x + w + (r() - 0.5) * amp, y + (h * i) / n]);
  for (let i = 0; i < n; i++) pts.push([x + w - (w * i) / n, y + h + (r() - 0.5) * amp]);
  for (let i = 0; i < n; i++) pts.push([x + (r() - 0.5) * amp, y + h - (h * i) / n]);
  return 'M ' + pts.map((p) => p.join(' ')).join(' L ') + ' Z';
};
/** Mancha de papel rasgado (círculo irregular). */
export const rasgoBola = (cx: number, cy: number, rx: number, ry = rx, seed = 1, amp = 0.12, n = 26) => {
  const r = aleatorio(seed);
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * amp * 2;
    pts.push(`${cx + Math.cos(a) * rx * k} ${cy + Math.sin(a) * ry * k}`);
  }
  return 'M ' + pts.join(' L ') + ' Z';
};

/** Textura de papel (fibras) para pôr por cima de formas: use fill="url(#fibra)". Coloque <Fibra/> uma vez no svg. */
export const Fibra: React.FC = () => (
  <defs>
    <filter id="fibraF" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.5" numOctaves={3} seed={9} />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.35 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
  </defs>
);

// ------------------------------------------------------------------ árvore de colagem
/** Árvore de colagem: copa em pedaços de papel rasgado (três verdes), tronco rasgado. (x, y) = base do tronco. */
export const ArvoreColagem: React.FC<{x: number; y: number; h?: number; balanco?: number; seed?: number; queimada?: number}> =
  ({x, y, h = 260, balanco = 0, seed = 3, queimada = 0}) => {
    const verdes = ['#55803A', '#7AA34E', '#93B865'];
    const pecas: [number, number, number, number][] = [
      [-0.2, 0.6, 0.2, 0], [0.2, 0.62, 0.2, 1], [0, 0.8, 0.24, 2], [-0.08, 0.5, 0.17, 1], [0.12, 0.48, 0.15, 2], [0.02, 0.66, 0.2, 0],
    ];
    const mistura = (c: string) => (queimada > 0 ? lerpCor(c, '#3A2A1E', queimada) : c);
    return (
      <g transform={`rotate(${balanco} ${x} ${y})`} style={{filter: SOMBRA}}>
        <path d={rasgoRet(x - h * 0.065, y - h * 0.47, h * 0.13, h * 0.47, seed, 7)} fill={mistura('#7A5233')} />
        <path d={rasgoRet(x - h * 0.03, y - h * 0.4, h * 0.035, h * 0.36, seed + 1, 4)} fill="#5E3E26" opacity={0.7} />
        {pecas.map(([dx, dy, r, c], i) => (
          <g key={i}>
            <path d={rasgoBola(x + dx * h, y - dy * h, r * h, r * h * 0.92, seed * 7 + i, 0.14)} fill={mistura(verdes[c])} />
            <path d={rasgoBola(x + dx * h - r * h * 0.25, y - dy * h - r * h * 0.3, r * h * 0.35, r * h * 0.25, seed * 11 + i, 0.2)}
              fill="#FFFFFF" opacity={0.12} />
          </g>
        ))}
      </g>
    );
  };

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const lerpCor = (a: string, b: string, p: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp01(p))).toString(16).padStart(2, '0')).join('');
};

// ------------------------------------------------------------------ máquinas
/** Rotor do gerador em papel: disco, raios, marca. ang em graus. vel (0..) desenha linhas de movimento. */
export const Rotor: React.FC<{x: number; y: number; r: number; ang: number; cor?: string; marca?: string; vel?: number; seed?: number; op?: number}> =
  ({x, y, r, ang, cor = V.C2, marca = V.GOLD, vel = 0, seed = 2, op = 1}) => (
    <g opacity={op}>
      <g style={{filter: SOMBRA}}>
        <path d={rasgoBola(x, y, r * 1.08, r * 1.08, seed, 0.03, 40)} fill={V.INK} />
        <g transform={`rotate(${ang} ${x} ${y})`}>
          <circle cx={x} cy={y} r={r} fill={cor} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect key={a} x={x - r * 0.07} y={y - r * 0.92} width={r * 0.14} height={r * 0.92} fill="#EFE5CF" opacity={0.85}
              transform={`rotate(${a} ${x} ${y})`} />
          ))}
          <circle cx={x} cy={y} r={r * 0.2} fill={V.INK} />
          <circle cx={x} cy={y - r * 0.78} r={r * 0.13} fill={marca} stroke={V.INK} strokeWidth={3} />
        </g>
      </g>
      {vel > 0.05 && [0, 1, 2].map((k) => {
        const a0 = ((ang + k * 120) * Math.PI) / 180;
        const larg = Math.min(1.6, vel * 0.9);
        const d = `M ${x + Math.sin(a0) * r * 1.22} ${y - Math.cos(a0) * r * 1.22} A ${r * 1.22} ${r * 1.22} 0 0 0 ${x + Math.sin(a0 - larg) * r * 1.22} ${y - Math.cos(a0 - larg) * r * 1.22}`;
        return <path key={k} d={d} stroke={V.INK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={Math.min(0.8, vel * 0.5)} />;
      })}
    </g>
  );

/** Usina em recorte (prédio, chaminé com fumaça). (x, y) = base no centro. ligada 0..1 (janelas). */
export const Usina: React.FC<{x: number; y: number; k?: number; s: number; ligada?: number; cor?: string; seed?: number}> =
  ({x, y, k = 1, s, ligada = 1, cor = '#B9A27E', seed = 1}) => (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <g style={{filter: SOMBRA}}>
        <path d={rasgoRet(-90, -120, 180, 120, seed, 5)} fill={cor} />
        <path d={rasgoRet(40, -230, 38, 115, seed + 2, 4)} fill={lerpCor(cor, '#6B5A44', 0.35)} />
        <path d={`M -90 -120 L -40 -160 L -40 -120 L 10 -160 L 10 -120 Z`} fill={lerpCor(cor, '#6B5A44', 0.25)} />
        {[-62, -22, 18].map((wx) => <rect key={wx} x={wx} y={-80} width={26} height={30} fill={ligada > 0.5 ? VE.LUZ : '#3A3631'} />)}
      </g>
      {ligada > 0.5 && [0, 1, 2].map((i) => {
        const u = ((s * 0.5 + i / 3) % 1);
        return <circle key={i} cx={59 + u * 30} cy={-240 - u * 90} r={14 + u * 22} fill="#E9E1D2" opacity={(1 - u) * 0.8} />;
      })}
    </g>
  );

/** Casa pequena em recorte. (x, y) = base no centro. luz 0..1. */
export const Casa: React.FC<{x: number; y: number; k?: number; luz?: number; cor?: string; seed?: number}> =
  ({x, y, k = 1, luz = 1, cor = '#A2674A', seed = 1}) => (
    <g transform={`translate(${x} ${y}) scale(${k})`} style={{filter: 'drop-shadow(4px 5px 0 rgba(0,0,0,0.25))'}}>
      <path d={rasgoRet(-40, -60, 80, 60, seed, 4)} fill={cor} />
      <path d="M -50 -58 L 0 -100 L 50 -58 Z" fill={lerpCor(cor, '#2A2826', 0.35)} />
      <rect x={-22} y={-45} width={20} height={20} fill={lerpCor('#3A3631', VE.LUZ, luz)} />
      <rect x={6} y={-45} width={20} height={20} fill={lerpCor('#3A3631', VE.LUZ, luz)} />
    </g>
  );

/** Turbina vista de frente (disco de pás), com tremor e rachaduras (racha 0..1). */
export const Turbina: React.FC<{x: number; y: number; r: number; ang: number; tremor: number; racha: number; s: number}> =
  ({x, y, r, ang, tremor, racha, s}) => {
    const dx = Math.sin(s * 71) * tremor * 22, dy = Math.cos(s * 59) * tremor * 16;
    const pas = 18;
    return (
      <g transform={`translate(${dx} ${dy})`} style={{filter: SOMBRA}}>
        <circle cx={x} cy={y} r={r * 1.1} fill="#3F3B36" />
        <g transform={`rotate(${ang} ${x} ${y})`}>
          {[...Array(pas)].map((_, i) => (
            <path key={i} d={`M ${x} ${y} L ${x + r * 0.16} ${y - r} Q ${x - r * 0.05} ${y - r * 1.02} ${x - r * 0.14} ${y - r * 0.96} Z`}
              fill={i % 2 ? '#C9B48F' : '#B39B72'} stroke={V.INK} strokeWidth={2} transform={`rotate(${(i * 360) / pas} ${x} ${y})`} />
          ))}
          <circle cx={x} cy={y} r={r * 0.22} fill={V.INK} />
        </g>
        {racha > 0 && (
          <g stroke={V.C1} strokeWidth={7} fill="none" strokeLinecap="round">
            <path d={`M ${x - r * 0.1} ${y - r * 0.2} l ${-r * 0.3} ${-r * 0.25} l ${-r * 0.1} ${-r * 0.3} l ${-r * 0.25} ${-r * 0.1}`}
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - racha} />
            <path d={`M ${x + r * 0.15} ${y + r * 0.1} l ${r * 0.35} ${r * 0.15} l ${r * 0.1} ${r * 0.35} l ${r * 0.2} ${r * 0.05}`}
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(racha * 1.3 - 0.3)} />
          </g>
        )}
      </g>
    );
  };

/** Balança de pratos. ang em graus (+ = prato direito desce). esquerda/direita desenham o conteúdo de cada prato (cx, cy = fundo do prato). */
export const Balanca: React.FC<{x: number; y: number; braco?: number; ang: number;
  esquerda?: (cx: number, cy: number) => React.ReactNode; direita?: (cx: number, cy: number) => React.ReactNode}> =
  ({x, y, braco = 380, ang, esquerda, direita}) => {
    const a = (ang * Math.PI) / 180;
    const pe = [x - braco * Math.cos(a), y - braco * Math.sin(a)], pd = [x + braco * Math.cos(a), y + braco * Math.sin(a)];
    const prato = (p: number[], conteudo?: (cx: number, cy: number) => React.ReactNode) => {
      const cy = p[1] + 200;
      return (
        <g>
          <line x1={p[0]} y1={p[1]} x2={p[0] - 120} y2={cy} stroke={V.INK} strokeWidth={4} />
          <line x1={p[0]} y1={p[1]} x2={p[0] + 120} y2={cy} stroke={V.INK} strokeWidth={4} />
          {conteudo && conteudo(p[0], cy)}
          <path d={`M ${p[0] - 150} ${cy} Q ${p[0]} ${cy + 60} ${p[0] + 150} ${cy} Z`} fill={V.GOLD} stroke={V.INK} strokeWidth={4} style={{filter: SOMBRA}} />
        </g>
      );
    };
    return (
      <g>
        <path d={rasgoRet(x - 18, y, 36, 380, 4, 4)} fill="#6A4A33" />
        <path d={`M ${x - 140} ${y + 400} L ${x + 140} ${y + 400} L ${x + 90} ${y + 370} L ${x - 90} ${y + 370} Z`} fill="#6A4A33" />
        <line x1={pe[0]} y1={pe[1]} x2={pd[0]} y2={pd[1]} stroke={V.INK} strokeWidth={14} strokeLinecap="round" />
        <circle cx={x} cy={y} r={20} fill={V.C1} stroke={V.INK} strokeWidth={4} />
        {prato(pe, esquerda)}
        {prato(pd, direita)}
      </g>
    );
  };

/** Transformador de subestação em recorte. calor 0..1 (núcleo avermelha e brilha). */
export const Transformador: React.FC<{x: number; y: number; k?: number; calor?: number; s: number; seed?: number}> =
  ({x, y, k = 1, calor = 0, s, seed = 1}) => {
    const pulso = calor * (0.75 + 0.25 * Math.sin(s * 6));
    return (
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <g style={{filter: SOMBRA}}>
          {[-150, -90, 90, 150].map((fx) => <path key={fx} d={rasgoRet(fx - 22, -250, 44, 220, seed + fx, 4)} fill="#5E6E5B" />)}
          <path d={rasgoRet(-120, -300, 240, 300, seed, 6)} fill={lerpCor('#7E8F79', '#B5472C', calor * 0.8)} />
          {[-70, 0, 70].map((bx) => (
            <g key={bx}>
              <rect x={bx - 12} y={-400} width={24} height={100} fill="#D9CFBE" stroke={V.INK} strokeWidth={3} />
              {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={bx} cy={-385 + i * 24} rx={22} ry={7} fill="#CFC3AD" stroke={V.INK} strokeWidth={2} />)}
            </g>
          ))}
          <rect x={-120} y={-30} width={240} height={30} fill="#4A4540" />
        </g>
        {calor > 0.02 && <>
          <ellipse cx={0} cy={-150} rx={150} ry={170} fill="#F2A15A" opacity={pulso * 0.45} style={{filter: 'blur(30px)'}} />
          {[0, 1, 2, 3, 4].map((i) => {
            const u = (s * 0.6 + i / 5) % 1;
            return <path key={i} d={`M ${-80 + i * 40} ${-320 - u * 160} q 15 -20 0 -40 q -15 -20 0 -40`} stroke="#E9E1D2"
              strokeWidth={8} fill="none" opacity={calor * (1 - u) * 0.8} />;
          })}
        </>}
      </g>
    );
  };

/** Bateria (nível 0..1). */
export const Bateria: React.FC<{x: number; y: number; w: number; h: number; nivel: number; cor?: string}> =
  ({x, y, w, h, nivel, cor = V.GOOD}) => (
    <g style={{filter: SOMBRA}}>
      <path d={rasgoRet(x, y, w, h, 5, 6)} fill={V.SHEET} stroke={V.INK} strokeWidth={6} />
      <rect x={x + w} y={y + h * 0.3} width={w * 0.06} height={h * 0.4} fill={V.INK} />
      <rect x={x + 14} y={y + 14} width={(w - 28) * clamp01(nivel)} height={h - 28}
        fill={nivel < 0.25 ? V.C1 : nivel < 0.5 ? V.GOLD : cor} />
    </g>
  );

// ------------------------------------------------------------------ "Manim" dentro da colagem
type Curva = {t: number[]; f: number[]; cor: string; ate: number; larg?: number};
/**
 * Cartão escuro estilo Manim (lousa) com o gráfico de frequência. Coordenadas em px da tela.
 * curvas: cada uma desenhada até o tempo de simulação `ate`. linhas: limiares horizontais.
 */
export const GraficoManim: React.FC<{x: number; y: number; w: number; h: number; p: number; tmax: number;
  fmin?: number; fmax?: number; curvas: Curva[]; linhas?: {f: number; cor: string; rotulo?: string}[]; rot?: number; titulo?: string}> =
  ({x, y, w, h, p, tmax, fmin = 57, fmax = 60.3, curvas, linhas = [], rot = 1.5, titulo}) => {
    if (p <= 0) return null;
    const m = {l: 110, r: 40, t: titulo ? 90 : 40, b: 80};
    const X = (t: number) => m.l + (t / tmax) * (w - m.l - m.r);
    const Y = (f: number) => m.t + ((fmax - f) / (fmax - fmin)) * (h - m.t - m.b);
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp01(p * 2),
        transform: `rotate(${rot}deg) scale(${lerp(1.15, 1, p)}) translateY(${(1 - p) * -80}px)`, filter: 'drop-shadow(12px 14px 0 rgba(0,0,0,0.3))'}}>
        <svg width={w} height={h} style={{position: 'absolute'}}>
          <path d={rasgoRet(0, 0, w, h, 8, 8)} fill={VE.BG} />
          <path d={rasgoRet(10, 10, w - 20, h - 20, 9, 3)} fill="none" stroke="#3A3B44" strokeWidth={2} />
          {titulo && <text x={m.l} y={58} fontFamily={LM} fontWeight={700} fontSize={36} fill={VE.INK}>{titulo}</text>}
          {[57, 58, 59, 60].filter((f) => f >= fmin && f <= fmax).map((f) => (
            <g key={f}>
              <line x1={m.l} y1={Y(f)} x2={w - m.r} y2={Y(f)} stroke="#3A3B44" strokeWidth={2} />
              <text x={m.l - 16} y={Y(f) + 10} fontFamily={LM} fontSize={28} fill={VE.MUTED} textAnchor="end">{f}</text>
            </g>
          ))}
          <line x1={m.l} y1={m.t - 10} x2={m.l} y2={h - m.b} stroke={VE.INK} strokeWidth={3} />
          <line x1={m.l} y1={h - m.b} x2={w - m.r} y2={h - m.b} stroke={VE.INK} strokeWidth={3} />
          <text x={w - m.r} y={h - m.b + 50} fontFamily={LM} fontSize={28} fill={VE.MUTED} textAnchor="end">seconds</text>
          <text x={m.l - 16} y={m.t - 18} fontFamily={LM} fontSize={28} fill={VE.MUTED} textAnchor="end">Hz</text>
          {linhas.map((l, i) => (
            <g key={i}>
              <line x1={m.l} y1={Y(l.f)} x2={w - m.r} y2={Y(l.f)} stroke={l.cor} strokeWidth={3} strokeDasharray="14 10" />
              {l.rotulo && <text x={w - m.r - 8} y={Y(l.f) - 12} fontFamily={LM} fontSize={26} fill={l.cor} textAnchor="end">{l.rotulo}</text>}
            </g>
          ))}
          {curvas.map((c, i) => {
            const pts: string[] = [];
            let last: [number, number] | null = null;
            for (let k = 0; k < c.t.length && c.t[k] <= c.ate; k++) {
              const f = Math.max(fmin, c.f[k]);
              last = [X(Math.min(c.t[k], tmax)), Y(f)];
              pts.push(`${last[0]} ${last[1]}`);
            }
            if (pts.length < 2) return null;
            return (
              <g key={i}>
                <path d={'M ' + pts.join(' L ')} stroke={c.cor} strokeWidth={(c.larg ?? 6) + 8} fill="none" opacity={0.18} strokeLinejoin="round" />
                <path d={'M ' + pts.join(' L ')} stroke={c.cor} strokeWidth={c.larg ?? 6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                {last && <circle cx={last[0]} cy={last[1]} r={10} fill={c.cor} />}
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: w / 2 - 70, top: -22, width: 140, height: 44, background: '#E9DFC0', opacity: 0.85, transform: 'rotate(-3deg)'}} />
      </div>
    );
  };

/** Valor de f no tempo de simulação t (interpolação linear). */
export const fEm = (c: {t: number[]; f: number[]}, t: number) => {
  if (t <= c.t[0]) return c.f[0];
  for (let k = 1; k < c.t.length; k++) if (c.t[k] >= t) return lerp(c.f[k - 1], c.f[k], (t - c.t[k - 1]) / (c.t[k] - c.t[k - 1]));
  return c.f[c.f.length - 1];
};

// ------------------------------------------------------------------ marcações à mão
/** Elipse de marcador à mão, desenhada aos poucos (p 0..1). */
export const Circulo: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number; cor?: string; seed?: number; w?: number}> =
  ({cx, cy, rx, ry, p, cor = V.C1, seed = 1, w = 8}) => {
    const d = useMemo(() => {
      const r = aleatorio(seed);
      const pts: string[] = [];
      const n = 40;
      for (let i = 0; i <= n * 1.12; i++) {
        const a = (i / n) * Math.PI * 2 - 2.2;
        const k = 1 + (r() - 0.5) * 0.06 + i / n * 0.05;
        pts.push(`${cx + Math.cos(a) * rx * k} ${cy + Math.sin(a) * ry * k}`);
      }
      return 'M ' + pts.join(' L ');
    }, [cx, cy, rx, ry, seed]);
    if (p <= 0) return null;
    return <path d={d} stroke={cor} strokeWidth={w} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1"
      strokeDashoffset={1 - clamp01(p)} opacity={0.9} />;
  };

/** Carimbo: retângulo com borda, entra batendo (com som). */
export const Carimbo: React.FC<{s: number; t: number; ate?: number; x: number; y: number; cor?: string; size?: number; rot?: number; fundo?: string; children: React.ReactNode}> =
  ({s, t, ate, x, y, cor = V.C1, size = 70, rot = -8, fundo, children}) => {
    const p = s < t ? 0 : prog(s, t, 0.18);
    const k = ate === undefined ? 1 : sai(s, ate, 0.25);
    return (
      <>
        <Som nome="carimbo" t={t} volume={0.5} />
        {p > 0 && k > 0 && <div style={{position: 'absolute', left: x, top: y, opacity: k * clamp01(p * 3),
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(2.2, 1, p)})`, border: `${size * 0.09}px solid ${cor}`,
          padding: `${size * 0.1}px ${size * 0.3}px`, color: cor, fontFamily: LM, fontWeight: 700, fontSize: size, whiteSpace: 'pre',
          letterSpacing: 4, mixBlendMode: fundo ? 'normal' : 'multiply', background: fundo}}>{children}</div>}
      </>
    );
  };

// ------------------------------------------------------------------ câmera que respira por fala
/** Zoom e passeio lentos e contínuos (movimento de fundo sem chamar atenção, sem saltos). */
export const respiro = (s: number, amp = 0.03) => ({
  zoom: 1 + amp + amp * Math.sin((s * 2 * Math.PI) / 16),
  foco: [960 + 40 * Math.sin((s * 2 * Math.PI) / 23), 540 + 20 * Math.cos((s * 2 * Math.PI) / 19)] as [number, number],
});
/** Índice (1..n) da fala em s. */
export const falaEm = (props: Props, s: number) => {
  let i = 0;
  while (i + 1 < props.falas.length && s >= inicioFala(props, i + 2)) i++;
  return i + 1;
};

export {pop, prog, sai, lerp};
