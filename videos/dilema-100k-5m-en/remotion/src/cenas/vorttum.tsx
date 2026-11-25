// Peças VORTTUM para as cenas Remotion deste vídeo: paleta, fundo de papel, roleta europeia,
// ficha, texto reto (sem itálico) e recorte de papel com sombra.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from 'remotion';
import {variante} from '../kit/estilos';
import {prog, sai} from '../kit/tempo';

/** Latin Modern (a fonte do LaTeX), regular e negrito, carregada de public/vorttum/fonts (licença GUST). */
export const LM = 'Latin Modern';
let carregada: Promise<unknown> | null = null;
export const useLatin = () => {
  const [h] = useState(() => delayRender('latin modern'));
  useEffect(() => {
    if (!carregada) {
      const fs = [
        new FontFace(LM, `url(${staticFile('vorttum/fonts/lmroman10-regular.otf')})`, {weight: '400', style: 'normal'}),
        new FontFace(LM, `url(${staticFile('vorttum/fonts/lmroman10-bold.otf')})`, {weight: '700', style: 'normal'}),
      ];
      carregada = Promise.all(fs.map((f) => f.load().then((x) => document.fonts.add(x))));
    }
    carregada.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

export const V = {
  BG: '#EFE8DA', INK: '#2A2826', MUTED: '#857E72', SHEET: '#F6F1E6', AREIA: '#C9B48F',
  C1: '#B5472C', C2: '#3F6178', GOLD: '#B07F25', BAD: '#8E2F1E', GOOD: '#5F7A3A',
};

// registra o estilo no kit (o nome vem do ESTILO da RemotionScene no video.py)
variante('v_remotion', 'documentario', {
  cor: {BG: V.BG, INK: V.INK, MUTED: V.MUTED, C1: V.C1, C2: V.C2, GOLD: V.GOLD, BAD: V.BAD, GOOD: V.GOOD,
    P_GOLD: '#EADCBE', P_C1: '#EBD3C8', P_C2: '#D9DDDF', PAINEL: V.SHEET, BORDA: V.INK},
  fonteTexto: LM, fonteTitulo: LM, extra: {fundo: 'vorttum/papel.jpg'},
});

export const ORDEM = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
  20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
export const VERMELHAS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const corCasa = (n: number) => (n === 0 ? V.GOOD : VERMELHAS.has(n) ? V.C1 : V.INK);
export const usd = (v: number, sinal = false) =>
  (v < 0 ? '−' : sinal ? '+' : '') + '$' + Math.abs(v).toLocaleString('en-US');

export const Papel: React.FC<{fundo?: string; children?: React.ReactNode}> = ({fundo = 'vorttum/papel.jpg', children}) => (
  <AbsoluteFill style={{background: V.BG}}>
    <Img src={staticFile(fundo)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    {children}
  </AbsoluteFill>
);

type TxtProps = {x: number; y: number; p: number; size?: number; cor?: string; serif?: boolean; peso?: number;
  ancora?: 'esquerda' | 'centro' | 'direita'; children: React.ReactNode; largura?: number};
/** Texto reto em Latin Modern (LaTeX), nunca itálico, que entra subindo. (x, y) = topo. */
export const Txt: React.FC<TxtProps> = ({x, y, p, size = 44, cor = V.INK, serif, peso, ancora = 'esquerda', children, largura}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: largura, opacity: Math.min(1, p * 1.5),
    transform: `translate(${ancora === 'esquerda' ? '0' : ancora === 'direita' ? '-100%' : '-50%'}, ${(1 - p) * 18}px)`,
    fontFamily: LM, fontWeight: peso ?? (serif || size >= 36 ? 700 : 400), fontStyle: 'normal',
    fontSize: size, color: cor, lineHeight: 1.18, whiteSpace: largura ? 'normal' : 'pre',
    textAlign: ancora === 'centro' ? 'center' : ancora === 'direita' ? 'right' : 'left',
  }}>{children}</div>
);

/** Recorte de papel com sombra (colagem): posição do canto superior esquerdo. */
export const Recorte: React.FC<{x: number; y: number; w: number; h: number; cor: string; p: number; rot?: number;
  children?: React.ReactNode}> = ({x, y, w, h, cor, p, rot = 0, children}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h, background: cor,
    transform: `translateY(${(1 - p) * -40}px) rotate(${rot}deg) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 2),
    boxShadow: '6px 8px 0 rgba(42,40,38,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>{children}</div>
);

/** Ângulo da roleta (graus) para a casa `n` ficar sob o marcador do topo. */
export const anguloDe = (n: number) => -ORDEM.indexOf(n) * 360 / 37;

/** Giros: {t0, t1, numero}. Devolve o ângulo da roleta no segundo s (gira sempre no mesmo sentido). */
export const anguloRoleta = (s: number, giros: {t0: number; t1: number; numero: number}[], inicial = 0) => {
  let ang = inicial;
  let volta = 0;
  for (const g of giros) {
    volta += 3;
    const alvo = anguloDe(g.numero) - 360 * volta;
    if (s <= g.t0) return ang;
    if (s < g.t1) {
      const k = prog(s, g.t0, g.t1 - g.t0);
      return ang + (alvo - ang) * k;
    }
    ang = alvo;
  }
  return ang;
};

/** Roleta europeia vista de cima: 37 casas na ordem real, marcador fixo no topo. */
export const Roleta: React.FC<{cx: number; cy: number; r: number; ang: number; op?: number;
  destaque?: (n: number) => number; bola?: boolean; numeros?: boolean}> =
  ({cx, cy, r, ang, op = 1, destaque, bola, numeros = true}) => {
    const ri = r * 0.68;
    const casas = ORDEM.map((n, k) => {
      const a0 = ((k - 0.5) * 360 / 37 - 90) * Math.PI / 180;
      const a1 = ((k + 0.5) * 360 / 37 - 90) * Math.PI / 180;
      const P = (rr: number, a: number) => `${cx + rr * Math.cos(a)} ${cy + rr * Math.sin(a)}`;
      const d = `M ${P(ri, a0)} L ${P(r, a0)} A ${r} ${r} 0 0 1 ${P(r, a1)} L ${P(ri, a1)} A ${ri} ${ri} 0 0 0 ${P(ri, a0)} Z`;
      const am = (k * 360 / 37 - 90) * Math.PI / 180;
      const rt = (r + ri) / 2;
      return (
        <g key={n} opacity={destaque ? destaque(n) : 1}>
          <path d={d} fill={corCasa(n)} stroke={V.SHEET} strokeWidth={1.4} />
          {numeros && <text x={cx + rt * Math.cos(am)} y={cy + rt * Math.sin(am)} fill={V.SHEET} fontSize={r * 0.075}
            fontFamily={LM} fontWeight={700} textAnchor="middle" dominantBaseline="central"
            transform={`rotate(${k * 360 / 37} ${cx + rt * Math.cos(am)} ${cy + rt * Math.sin(am)})`}>{n}</text>}
        </g>
      );
    });
    return (
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
        <circle cx={cx + 8} cy={cy + 10} r={r + 18} fill="rgba(42,40,38,0.18)" />
        <circle cx={cx} cy={cy} r={r + 18} fill="#6B4A32" />
        <g transform={`rotate(${ang} ${cx} ${cy})`}>
          {casas}
          <circle cx={cx} cy={cy} r={ri} fill={V.SHEET} stroke={V.INK} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={ri * 0.62} fill="#D8C9AC" stroke={V.INK} strokeWidth={1.5} />
          {[45, 135, 225, 315].map((a) => (
            <line key={a} x1={cx} y1={cy} x2={cx + ri * 0.5 * Math.cos(a * Math.PI / 180)} y2={cy + ri * 0.5 * Math.sin(a * Math.PI / 180)}
              stroke={V.INK} strokeWidth={5} strokeLinecap="round" />
          ))}
          <circle cx={cx} cy={cy} r={ri * 0.12} fill={V.INK} />
        </g>
        <path d={`M ${cx - 16} ${cy - r - 42} L ${cx + 16} ${cy - r - 42} L ${cx} ${cy - r - 14} Z`} fill={V.INK} />
        {bola && <circle cx={cx} cy={cy - (r + ri) / 2 - r * 0.0} r={r * 0.035} fill={V.SHEET} stroke={V.INK} strokeWidth={2} />}
      </svg>
    );
  };

/** Ficha de aposta. (x, y) = centro. */
export const Ficha: React.FC<{x: number; y: number; valor: number; p: number; r?: number; cor?: string}> =
  ({x, y, valor, p, r = 54, cor = V.GOLD}) => (
    <div style={{
      position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: cor,
      border: `4px solid ${V.INK}`, boxShadow: `inset 0 0 0 ${r * 0.16}px ${cor}, inset 0 0 0 ${r * 0.22}px ${V.SHEET}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LM, fontWeight: 700,
      fontSize: r * (valor >= 1000 ? 0.36 : 0.46), color: V.SHEET,
      transform: `translateY(${(1 - p) * -90}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2),
    }}>{usd(valor)}</div>
  );

/** Visibilidade de um elemento: entra em t (0→1) e sai em ate. */
export const vis = (s: number, t: number, ate?: number, d = 0.45) =>
  (s < t ? 0 : prog(s, t, d)) * (ate === undefined ? 1 : sai(s, ate, 0.35));
