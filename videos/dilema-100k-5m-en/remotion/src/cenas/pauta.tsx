// Peças do VORTTUM 004 (dilema US$ 100 mil x US$ 5 milhões a cada 10 min): papel, texto reto em Latin Modern,
// gráficos em SVG alimentados por graficos.json / hist.json (números de simulacao.py e histograma.py).
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai} from '../kit/tempo';
import {LM, V, Txt, Papel, vis} from './vorttum';
import G from './graficos.json';
import HIST from './hist.json';

export {G, HIST, V, LM, Txt, Papel, vis, prog, pop, sai};
export const W = 1920;
export const H = 1080;
export const GRAY = '#B9B2A4';
export const fmt = (n: number, d = 0) => n.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
export const usd = (n: number, d = 0) => '$' + fmt(n, d);
export const pc = (x: number, d = 1) => (x * 100).toFixed(d) + '%';

/** Tempos da fala: t(palavra, fala, nth) = segundo em que é dita; fim(fala) = fim da fala (0,25 s antes da próxima). */
export const useT = (props: Props) => ({
  t: (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d),
  ini: (f: number, d = 0) => inicioFala(props, f, d),
  fim: (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.25) : props.duracao + 1),
});

const clampOpt = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lin = (s: number, ts: number[], vs: number[]) => interpolate(s, ts, vs, clampOpt);

/** Cartão de papel com borda e sombra. (x, y) = canto superior esquerdo. */
export const Card: React.FC<{x: number; y: number; w: number; h: number; p: number; cor?: string; borda?: string; rot?: number;
  children?: React.ReactNode; pad?: number}> = ({x, y, w, h, p, cor = V.SHEET, borda = V.INK, rot = 0, children, pad = 0}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h, background: cor, border: `4px solid ${borda}`, borderRadius: 10,
    boxShadow: '7px 9px 0 rgba(42,40,38,0.2)', opacity: Math.min(1, p * 2), padding: pad, boxSizing: 'border-box',
    transform: `translateY(${(1 - p) * -30}px) rotate(${rot}deg) scale(${0.94 + 0.06 * p})`,
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  }}>{children}</div>
);

/** Texto centrado numa caixa (x, y = centro). */
export const Big: React.FC<{x: number; y: number; p: number; size?: number; cor?: string; peso?: number; children: React.ReactNode;
  largura?: number}> = ({x, y, p, size = 80, cor = V.INK, peso = 700, children, largura}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: largura, opacity: Math.min(1, p * 1.6),
    transform: `translate(-50%, -50%) translateY(${(1 - p) * 18}px) scale(${0.96 + 0.04 * p})`,
    fontFamily: LM, fontWeight: peso, fontStyle: 'normal', fontSize: Math.max(size, 56), color: cor, lineHeight: 1.12,
    textAlign: 'center', whiteSpace: largura ? 'normal' : 'pre',
  }}>{children}</div>
);

/** Carimbo inclinado. */
export const Carimbo: React.FC<{x: number; y: number; p: number; size?: number; cor?: string; rot?: number; children: React.ReactNode}> =
  ({x, y, p, size = 70, cor = V.C1, rot = -6, children}) => (
    <div style={{
      position: 'absolute', left: x, top: y, opacity: Math.min(1, p * 3), border: `7px solid ${cor}`, borderRadius: 12,
      padding: '6px 26px', fontFamily: LM, fontWeight: 700, fontSize: size, color: cor, whiteSpace: 'pre',
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${1.5 - 0.5 * p})`,
    }}>{children}</div>
  );

// ------------------------------------------------------------------ desenhos

/** Maleta aberta com maços de notas. (cx, cy) = centro da base. */
export const Maleta: React.FC<{cx: number; cy: number; k?: number; p: number; aberta?: number}> = ({cx, cy, k = 1, p, aberta = 1}) => (
  <g transform={`translate(${cx} ${cy}) scale(${k * (0.85 + 0.15 * p)})`} opacity={Math.min(1, p * 2)}>
    <path d="M -60 -190 Q -60 -230 -20 -230 L 20 -230 Q 60 -230 60 -190" fill="none" stroke={V.INK} strokeWidth={14} />
    <rect x={-200} y={-170} width={400} height={170} rx={16} fill="#6B4A32" stroke={V.INK} strokeWidth={6} />
    <g transform={`rotate(${-aberta * 0} 0 -170)`}>
      <rect x={-184} y={-168 - 70 * aberta} width={368} height={70 * aberta + 2} fill="#7A5A3F" stroke={V.INK} strokeWidth={5} />
    </g>
    {[-150, -75, 0, 75].map((x, i) => (
      <g key={x} transform={`translate(${x} ${-168 - 14 * aberta})`}>
        <rect x={0} y={-52} width={66} height={52} fill={V.GOOD} stroke={V.INK} strokeWidth={4} />
        <rect x={0} y={-52} width={66} height={14} fill="#DFE2D0" stroke={V.INK} strokeWidth={3} />
        <text x={33} y={-14} fontFamily={LM} fontWeight={700} fontSize={26} fill={V.SHEET} textAnchor="middle">$100</text>
        <rect x={20} y={-58} width={26} height={8} fill={V.GOLD} opacity={i % 2 ? 0 : 1} />
      </g>
    ))}
    <rect x={-22} y={-110} width={44} height={36} rx={6} fill={V.GOLD} stroke={V.INK} strokeWidth={4} />
  </g>
);

/** Envelope. (x, y) = canto superior esquerdo. */
export const Envelope: React.FC<{x: number; y: number; w?: number; h?: number; p: number; cor?: string; aberto?: number;
  children?: React.ReactNode}> = ({x, y, w = 420, h = 280, p, cor = '#E7DCC0', aberto = 0, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: Math.min(1, p * 2),
    transform: `translateY(${(1 - p) * -60}px) rotate(${(1 - p) * 4}deg)`}}>
    <svg width={w} height={h + 80} style={{position: 'absolute', left: 0, top: -80, overflow: 'visible'}}>
      <rect x={0} y={80} width={w} height={h} fill={cor} stroke={V.INK} strokeWidth={5} />
      <path d={`M 0 ${80 + h} L ${w / 2} ${80 + h * 0.52} L ${w} ${80 + h}`} fill="none" stroke={V.INK} strokeWidth={3} opacity={0.5} />
      <path d={aberto ? `M 0 80 L ${w / 2} ${80 - 70 * aberto} L ${w} 80 Z` : `M 0 80 L ${w / 2} ${80 + h * 0.55} L ${w} 80 Z`}
        fill={aberto ? '#D9CCAA' : cor} stroke={V.INK} strokeWidth={5} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LM, paddingBottom: h * 0.34,
      fontWeight: 700, color: V.INK, fontSize: 56, textAlign: 'center'}}>{children}</div>
  </div>
);

/** Relógio de parede: o ponteiro de segundos bate a cada segundo. */
export const Relogio: React.FC<{cx: number; cy: number; r: number; s: number; p: number}> = ({cx, cy, r, s, p}) => {
  const seg = Math.floor(s) + prog(s % 1, 0, 0.12, (x) => 1 - Math.pow(1 - x, 3));
  return (
    <g opacity={Math.min(1, p * 2)}>
      <circle cx={cx + 6} cy={cy + 8} r={r} fill="rgba(42,40,38,0.2)" />
      <circle cx={cx} cy={cy} r={r} fill={V.SHEET} stroke={V.INK} strokeWidth={8} />
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1={cx + r * 0.8 * Math.sin(i * Math.PI / 6)} y1={cy - r * 0.8 * Math.cos(i * Math.PI / 6)}
          x2={cx + r * 0.92 * Math.sin(i * Math.PI / 6)} y2={cy - r * 0.92 * Math.cos(i * Math.PI / 6)} stroke={V.INK} strokeWidth={i % 3 ? 4 : 8} />
      ))}
      <line x1={cx} y1={cy} x2={cx + r * 0.5 * Math.sin(0.9)} y2={cy - r * 0.5 * Math.cos(0.9)} stroke={V.INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + r * 0.72 * Math.sin(3.6)} y2={cy - r * 0.72 * Math.cos(3.6)} stroke={V.INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + r * 0.85 * Math.sin(seg * Math.PI / 30)} y2={cy - r * 0.85 * Math.cos(seg * Math.PI / 30)} stroke={V.C1} strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={10} fill={V.C1} />
    </g>
  );
};

/** Caça-níquel pequena com contador. (cx, cy) = centro. */
export const Maquina: React.FC<{cx: number; cy: number; k?: number; p: number; s: number; rola?: boolean}> = ({cx, cy, k = 1, p, s, rola = true}) => (
  <g transform={`translate(${cx} ${cy}) scale(${k * (0.8 + 0.2 * p)})`} opacity={Math.min(1, p * 2)}>
    <rect x={-145} y={-130} width={290} height={260} rx={22} fill={V.C2} stroke={V.INK} strokeWidth={6} />
    <rect x={-118} y={-90} width={236} height={96} rx={10} fill={V.SHEET} stroke={V.INK} strokeWidth={4} />
    {[-76, 0, 76].map((x, i) => (
      <text key={x} x={x} y={-24} fontFamily={LM} fontWeight={700} fontSize={64} fill={i === 1 ? V.C1 : V.INK} textAnchor="middle">
        {rola ? ['7', '$', '?', '0', 'x', '5'][Math.floor(s * 9 + i * 2) % 6] : '7'}
      </text>
    ))}
    <rect x={-118} y={34} width={236} height={46} rx={8} fill={V.INK} />
    <text x={0} y={68} fontFamily={LM} fontWeight={700} fontSize={36} fill={V.GOLD} textAnchor="middle">every 10 min</text>
    <line x1={145} y1={-60} x2={190} y2={-110} stroke={V.INK} strokeWidth={10} strokeLinecap="round" />
    <circle cx={190} cy={-112} r={14} fill={V.C1} stroke={V.INK} strokeWidth={4} />
  </g>
);

/** Bilhete de loteria recortado. (x, y) = canto superior esquerdo. */
export const Bilhete: React.FC<{x: number; y: number; w?: number; h?: number; p?: number; rot?: number; cor?: string; texto?: string}> =
  ({x, y, w = 150, h = 70, p = 1, rot = 0, cor = V.GOLD, texto}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: cor, border: `3px solid ${V.INK}`, opacity: Math.min(1, p * 2),
      transform: `rotate(${rot}deg) scale(${0.7 + 0.3 * p})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: LM, fontWeight: 700, fontSize: h * 0.34, color: V.INK, boxShadow: '3px 4px 0 rgba(42,40,38,0.2)'}}>{texto ?? 'FREE'}</div>
  );

/** Botão giratório Bauhaus com rótulo. ang em graus. */
export const Botao: React.FC<{cx: number; cy: number; r: number; ang: number; p: number; rotulo?: string; cor?: string}> =
  ({cx, cy, r, ang, p, rotulo, cor = V.GOLD}) => (
    <g opacity={Math.min(1, p * 2)}>
      <circle cx={cx + 7} cy={cy + 9} r={r} fill="rgba(42,40,38,0.2)" />
      <circle cx={cx} cy={cy} r={r} fill={V.SHEET} stroke={V.INK} strokeWidth={7} />
      {Array.from({length: 21}, (_, i) => {
        const a = (-120 + i * 12) * Math.PI / 180;
        return <line key={i} x1={cx + r * 1.08 * Math.sin(a)} y1={cy - r * 1.08 * Math.cos(a)} x2={cx + r * (i % 5 ? 1.16 : 1.26) * Math.sin(a)}
          y2={cy - r * (i % 5 ? 1.16 : 1.26) * Math.cos(a)} stroke={V.INK} strokeWidth={i % 5 ? 4 : 7} />;
      })}
      <g transform={`rotate(${ang} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={r * 0.72} fill={cor} stroke={V.INK} strokeWidth={6} />
        <polygon points={`${cx - 14},${cy - r * 0.2} ${cx + 14},${cy - r * 0.2} ${cx},${cy - r * 0.7}`} fill={V.INK} />
      </g>
      <circle cx={cx} cy={cy} r={r * 0.12} fill={V.INK} />
      {rotulo && <text x={cx} y={cy + r + 70} fontFamily={LM} fontWeight={700} fontSize={54} fill={V.INK} textAnchor="middle">{rotulo}</text>}
    </g>
  );

/** Eixos de gráfico. Devolve funções de escala. */
export const useEixos = (x0: number, y0: number, w: number, h: number, xmax: number, ymax: number) => ({
  X: (x: number) => x0 + (w * x) / xmax,
  Y: (y: number) => y0 + h - (h * y) / ymax,
  x0, y0, w, h, xmax, ymax,
});

/** Pizza de duas fatias começando no topo: a = fração da primeira (no sentido horário). */
export const Pizza: React.FC<{cx: number; cy: number; r: number; a: number; cor1: string; cor2: string; p: number; sep?: number}> = ({cx, cy, r, a, cor1, cor2, p, sep = 0}) => {
  const ang = (f: number) => (f * 2 * Math.PI) - Math.PI / 2;
  const P = (f: number, rr = r) => `${cx + rr * Math.cos(ang(f))} ${cy + rr * Math.sin(ang(f))}`;
  const big = a > 0.5 ? 1 : 0;
  const mid = ang(a + (1 - a) / 2);
  return (
    <g opacity={Math.min(1, p * 2)} transform={`scale(${0.9 + 0.1 * p})`} style={{transformOrigin: `${cx}px ${cy}px`}}>
      <circle cx={cx + 7} cy={cy + 9} r={r} fill="rgba(42,40,38,0.18)" />
      <path d={`M ${cx} ${cy} L ${P(0)} A ${r} ${r} 0 ${big} 1 ${P(a)} Z`} fill={cor1} stroke={V.INK} strokeWidth={5} />
      <g transform={`translate(${Math.cos(mid) * sep} ${Math.sin(mid) * sep})`}>
        <path d={`M ${cx} ${cy} L ${P(a)} A ${r} ${r} 0 ${big ? 0 : 1} 1 ${P(1)} Z`} fill={cor2} stroke={V.INK} strokeWidth={5} />
      </g>
    </g>
  );
};

/** Faixa do tempo de uma tela: título pequeno no canto (cabeçalho do que está na tela). */
export const Cab: React.FC<{p: number; children: React.ReactNode; x?: number; y?: number}> = ({p, children, x = 110, y = 70}) => (
  <Txt x={x} y={y} p={p} size={46} cor={V.MUTED} serif>{children}</Txt>
);

export const Cena: React.FC<{children: React.ReactNode; s: number; preto?: number}> = ({children, s, preto = 0}) => (
  <Papel>
    {children}
    {preto > 0 && <AbsoluteFill style={{background: '#000', opacity: preto * (1 - prog(s, 0.2, 0.7))}} />}
  </Papel>
);

/** Janela de uma fala: o conteúdo só existe entre a (início) e b (fim); some com um fade curto. */
export const Jan: React.FC<{s: number; a: number; b: number; children: React.ReactNode}> = ({s, a, b, children}) => {
  if (s < a || s > b + 0.5) return null;
  return <div style={{position: 'absolute', inset: 0, opacity: sai(s, b, 0.3)}}>{children}</div>;
};
