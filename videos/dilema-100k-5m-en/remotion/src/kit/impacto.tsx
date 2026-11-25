// Impacto ("juice"): o que faz um golpe parecer pesado.
//
// Dois relógios:
//   a = tempo da AÇÃO  — personagem, física e partículas. CONGELA no hit-stop.
//   s = tempo REAL     — tremor, flash, estouro e som. Continua andando durante o congelamento.
// Você escreve a cena toda no tempo da ação; useAcao() converte, somando os congelamentos.
//
// Receita de um golpe: antecipação (pose carrega) → golpe (mola ESTALO) → Impacto {congela 3–5 quadros}
// → tremor + soco de zoom + flash/invertido + estouro + partículas + <Som> no mesmo quadro → sobra (pose volta com BALANCO).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Som} from './retro';
import type {Simulacao} from './fisica';

export {Som};

export type Impacto = {
  t: number;              // segundos de AÇÃO em que acontece
  forca?: number;         // 0 a 1 (padrão 0.6): escala tremor, zoom, flash
  congela?: number;       // quadros de hit-stop (padrão: 2 + 4 × força)
  x?: number; y?: number; // onde foi (centro do zoom e do estouro); padrão = centro da tela
  inverte?: boolean;      // 1 quadro com as cores invertidas (golpe forte)
  flash?: boolean;        // quadro branco (padrão: força ≥ 0.5)
  som?: string;           // efeito em public/sfx (sem .wav), tocado no tempo real
  volume?: number;
};
export type ImpactoReal = Required<Pick<Impacto, 'forca' | 'congela'>> & Impacto & {real: number};

const ord = (l: Impacto[]) => [...l].sort((a, b) => a.t - b.t);

/** Impactos com o tempo real de cada um (somando os congelamentos anteriores). */
export const resolveImpactos = (impactos: Impacto[], fps: number): ImpactoReal[] => {
  let atraso = 0;
  return ord(impactos).map((i) => {
    const forca = i.forca ?? 0.6;
    const congela = i.congela ?? Math.round(2 + 4 * forca);
    const r = {...i, forca, congela, real: i.t + atraso};
    atraso += congela / fps;
    return r;
  });
};

/** Tempo da ação para um tempo real s. */
export const acaoDe = (s: number, imp: ImpactoReal[], fps: number) => {
  let atraso = 0;
  for (const i of imp) {
    if (s < i.real) break;
    const d = i.congela / fps;
    if (s < i.real + d) return i.t;          // congelado no quadro do golpe
    atraso += d;
  }
  return s - atraso;
};

/** Tempo real de um momento da ação (para pôr <Som> ou um título no instante certo). */
export const realDe = (a: number, imp: ImpactoReal[], fps: number) =>
  a + imp.filter((i) => i.t < a).reduce((soma, i) => soma + i.congela / fps, 0);

/** Duração real de uma cena com `acao` segundos de ação (para o FALAS = [n] do video.py). */
export const duracaoReal = (acao: number, impactos: Impacto[], fps = 30) =>
  acao + resolveImpactos(impactos, fps).reduce((soma, i) => soma + i.congela / fps, 0);

/** Os dois relógios da cena. */
export const useAcao = (impactos: Impacto[]) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const imp = resolveImpactos(impactos, fps);
  const s = f / fps;
  return {s, a: acaoDe(s, imp, fps), fps, imp, real: (a: number) => realDe(a, imp, fps)};
};

// ---------------------------------------------------------------- ruído determinístico
const ruido = (s: number, semente: number) =>
  Math.sin(s * 93.7 + semente * 12.9) * 0.55 + Math.sin(s * 57.3 + semente * 4.1) * 0.3 + Math.sin(s * 141.1 + semente * 7.7) * 0.15;

/** Gerador pseudoaleatório com semente (mulberry32): mesmo número sempre. */
export const aleatorio = (semente: number) => {
  let t = semente >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------------------------------------------------------------- câmera
/**
 * Câmera da cena: tremor e soco de zoom a cada impacto, quadro invertido, mais zoom/foco que você anima.
 * Ponha TODO o mundo dentro (fundo, personagem, objetos); flash e legenda ficam fora.
 */
export const Camera: React.FC<{
  s: number; imp: ImpactoReal[]; zoom?: number; foco?: [number, number]; tremor?: number; children: React.ReactNode;
}> = ({s, imp, zoom = 1, foco, tremor = 1, children}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  let dx = 0, dy = 0, rot = 0, soco = 0, inverte = false;
  imp.forEach((i, n) => {
    const d = s - i.real;
    if (d < 0 || d > 1.2) return;
    const k = i.forca * Math.exp(-d / 0.16) * tremor;
    dx += ruido(s, n + 1) * 46 * k;
    dy += ruido(s, n + 11) * 38 * k;
    rot += ruido(s, n + 21) * 1.4 * k;
    soco += 0.085 * i.forca * Math.exp(-d / 0.11) * (d < 1 / fps ? 1.4 : 1);
    if (i.inverte && d < 1 / fps) inverte = true;
  });
  const [fx, fy] = foco ?? [W / 2, H / 2];
  const z = zoom * (1 + soco);
  return (
    <AbsoluteFill style={{
      transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) translate(${W / 2 - fx}px, ${H / 2 - fy}px) scale(${z})`,
      transformOrigin: `${fx}px ${fy}px`, filter: inverte ? 'invert(1) hue-rotate(180deg)' : undefined,
    }}>
      {children}
    </AbsoluteFill>
  );
};

/** Quadro branco de 1–2 quadros nos impactos (fora da Câmera). */
export const Flash: React.FC<{s: number; imp: ImpactoReal[]; cor?: string}> = ({s, imp, cor = '#FFFFFF'}) => {
  const {fps} = useVideoConfig();
  let op = 0;
  for (const i of imp) {
    if (!(i.flash ?? i.forca >= 0.5)) continue;
    const q = (s - i.real) * fps;
    if (q >= 0 && q < 1) op = Math.max(op, 0.85 * i.forca);
    else if (q >= 1 && q < 2.5) op = Math.max(op, 0.3 * i.forca);
  }
  return op > 0 ? <AbsoluteFill style={{background: cor, opacity: op, mixBlendMode: 'screen'}} /> : null;
};

/** Efeitos sonoros de todos os impactos que têm `som`. */
export const SonsDosImpactos: React.FC<{imp: ImpactoReal[]}> = ({imp}) => (
  <>{imp.filter((i) => i.som).map((i, n) => <Som key={n} nome={i.som!} t={i.real} volume={i.volume ?? 0.4 + 0.5 * i.forca} />)}</>
);

/**
 * Um som para cada colisão da física (com volume pela força). real = conversor ação→real de useAcao.
 * Sons diferentes por força: leve → 'toque', forte → 'baque'. ate = para de tocar depois deste tempo de ação.
 */
export const SonsDaFisica: React.FC<{sim: Simulacao; real: (a: number) => number; minimo?: number; leve?: string; forte?: string;
  limite?: number; ignora?: string[]; ate?: number}> =
  ({sim, real, minimo = 3, leve = 'toque', forte = 'baque', limite = 9, ignora = [], ate = Infinity}) => (
    <>
      {sim.colisoes.filter((c) => c.forca >= minimo && c.quadro / sim.fps < ate && !ignora.includes(c.a) && !ignora.includes(c.b)).map((c, n) => (
        <Som key={n} nome={c.forca >= limite ? forte : leve} t={real(c.quadro / sim.fps)}
          volume={Math.min(0.9, 0.15 + c.forca / 25)} />
      ))}
    </>
  );

// ---------------------------------------------------------------- desenhos de impacto (SVG; ponha dentro da Câmera)
const tela = (children: React.ReactNode) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>
);
const saida = Easing.out(Easing.cubic);

/** Estouro de golpe: estrela de impacto + raios + onda. t = tempo REAL do impacto. */
export const Estouro: React.FC<{s: number; t: number; x: number; y: number; forca?: number; cor?: string; cor2?: string; semente?: number}> =
  ({s, t, x, y, forca = 0.7, cor = '#FFFFFF', cor2 = '#F5B82E', semente = 1}) => {
    const d = s - t, dur = 0.34;
    if (d < 0 || d > dur) return null;
    const u = d / dur, k = 0.6 + 0.6 * forca;
    const rnd = aleatorio(semente);
    const raios = Array.from({length: 14}, (_, i) => ({a: (i / 14) * Math.PI * 2 + rnd() * 0.3, l: 0.7 + rnd() * 0.6}));
    const r0 = interpolate(u, [0, 1], [40, 230], {easing: saida}) * k;
    const r1 = interpolate(Math.min(1, u * 1.7), [0, 1], [90, 360], {easing: saida}) * k;
    const estrela = raios.map((r, i) => {
      const rr = (i % 2 ? 0.45 : 1) * 150 * k * r.l * (1 - u * 0.5);
      return `${x + Math.cos(r.a) * rr},${y + Math.sin(r.a) * rr}`;
    }).join(' ');
    return tela(
      <>
        {u < 0.28 && <polygon points={estrela} fill={cor2} stroke={cor} strokeWidth={8} strokeLinejoin="round" opacity={1 - u * 2} />}
        {raios.map((r, i) => (
          <line key={i} x1={x + Math.cos(r.a) * r0 * r.l} y1={y + Math.sin(r.a) * r0 * r.l}
            x2={x + Math.cos(r.a) * r1 * r.l} y2={y + Math.sin(r.a) * r1 * r.l}
            stroke={cor} strokeWidth={Math.max(0.5, 16 * (1 - u) * k)} strokeLinecap="round" />
        ))}
        <circle cx={x} cy={y} r={interpolate(u, [0, 1], [30, 420], {easing: saida}) * k} fill="none"
          stroke={cor} strokeWidth={Math.max(0.5, 22 * (1 - u))} opacity={1 - u} />
      </>,
    );
  };

/** Onda de choque no chão (algo pesado caiu): anel achatado que corre para os lados. t = tempo REAL. */
export const OndaChao: React.FC<{s: number; t: number; x: number; chao: number; forca?: number; cor?: string}> =
  ({s, t, x, chao, forca = 1, cor = '#FFFFFF'}) => {
    const d = s - t, dur = 0.6;
    if (d < 0 || d > dur) return null;
    const u = d / dur;
    const r = interpolate(u, [0, 1], [60, 900], {easing: saida}) * (0.5 + forca / 2);
    return tela(<ellipse cx={x} cy={chao} rx={r} ry={r * 0.12} fill="none" stroke={cor} strokeWidth={18 * (1 - u)} opacity={1 - u} />);
  };

/**
 * Partículas (estilhaços) saindo de (x, y). t = tempo de AÇÃO (congelam no hit-stop junto com o resto).
 * ang = direção central (graus; 0 = direita, -90 = para cima), abertura = leque (graus).
 */
export const Particulas: React.FC<{
  a: number; t: number; x: number; y: number; n?: number; ang?: number; abertura?: number; vel?: number;
  gravidade?: number; vida?: number; tamanho?: number; cores?: string[]; semente?: number; forma?: 'caco' | 'bola';
}> = ({a, t, x, y, n = 18, ang = -90, abertura = 140, vel = 1400, gravidade = 3200, vida = 0.7, tamanho = 16,
  cores = ['#FFFFFF'], semente = 3, forma = 'caco'}) => {
  const d = a - t;
  if (d < 0 || d > vida * 1.6) return null;
  const rnd = aleatorio(semente);
  const ps = Array.from({length: n}, (_, i) => {
    const an = ((ang + (rnd() - 0.5) * abertura) * Math.PI) / 180;
    const v = vel * (0.35 + rnd() * 0.85);
    const vi = vida * (0.6 + rnd() * 0.8);
    const tam = tamanho * (0.5 + rnd());
    const giro = (rnd() - 0.5) * 1400;
    return {an, v, vi, tam, giro, cor: cores[i % cores.length]};
  });
  return tela(ps.map((p, i) => {
    if (d > p.vi) return null;
    const px = x + Math.cos(p.an) * p.v * d;
    const py = y + Math.sin(p.an) * p.v * d + 0.5 * gravidade * d * d;
    const u = d / p.vi, esc = 1 - u * u;
    return forma === 'bola'
      ? <circle key={i} cx={px} cy={py} r={(p.tam / 2) * esc} fill={p.cor} />
      : <rect key={i} x={-p.tam / 2} y={-p.tam / 4} width={p.tam * esc} height={(p.tam / 2) * esc} fill={p.cor}
          transform={`translate(${px} ${py}) rotate(${p.giro * d})`} />;
  }));
};

/** Poeira no chão (aterrissagem, freada, queda). t = tempo de AÇÃO. lado: -1 só para a esquerda, 1 direita, 0 os dois. */
export const Poeira: React.FC<{a: number; t: number; x: number; chao: number; forca?: number; lado?: number; cor?: string; semente?: number}> =
  ({a, t, x, chao, forca = 0.6, lado = 0, cor = 'rgba(200,205,215,0.55)', semente = 7}) => {
    const d = a - t, vida = 0.55 + forca * 0.4;
    if (d < 0 || d > vida) return null;
    const rnd = aleatorio(semente);
    const n = Math.round(6 + forca * 10);
    return tela(Array.from({length: n}, (_, i) => {
      const sentido = lado !== 0 ? lado : i % 2 ? 1 : -1;
      const v = (180 + rnd() * 420) * (0.5 + forca);
      const r0 = 10 + rnd() * 18 * (0.6 + forca);
      const u = d / vida;
      const px = x + sentido * v * d * (1 - u * 0.5);
      const py = chao - 10 - rnd() * 30 * forca * u - 20 * u;
      return <circle key={i} cx={px} cy={py} r={r0 * (1 + u * 2.4)} fill={cor} opacity={(1 - u) * (1 - u)} />;
    }));
  };

/** Linhas de velocidade atrás de algo rápido. intensidade 0–1 (ex.: pela velocidade do corpo). lado = para onde se move. */
export const LinhasVelocidade: React.FC<{x: number; y: number; altura?: number; lado?: number; intensidade: number; s: number; cor?: string}> =
  ({x, y, altura = 300, lado = 1, intensidade, s, cor = 'rgba(255,255,255,0.7)'}) => {
    if (intensidade < 0.05) return null;
    const rnd = aleatorio(Math.floor(s * 30));
    return tela(Array.from({length: 7}, (_, i) => {
      const yy = y - altura / 2 + ((i + 0.5) / 7) * altura + (rnd() - 0.5) * 20;
      const l = (120 + rnd() * 260) * intensidade;
      const x0 = x - lado * (40 + rnd() * 60);
      return <line key={i} x1={x0} y1={yy} x2={x0 - lado * l} y2={yy} stroke={cor} strokeWidth={4 + rnd() * 5} strokeLinecap="round"
        opacity={intensidade} />;
    }));
  };
