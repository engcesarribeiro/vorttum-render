// Personagem de ação: esqueleto em código (rig) com cinemática direta (FK) e inversa (IK),
// poses-chave ligadas por molas, ciclos de corrida/caminhada, esticar e achatar e rastro de movimento.
//
// A ideia: você não anima quadro a quadro. Você diz ONDE o boneco está em cada momento-chave
// (Chave = tempo + pose) e a mola faz o caminho entre elas, com antecipação e sobra naturais.
// Tudo é função pura do tempo: o mesmo quadro sai igual em qualquer render (exigência do Remotion).
//
// Convenção de ângulo (graus): 0 = apontando para baixo, 90 = para a direita, 180 = para cima.
// As poses são escritas olhando para a DIREITA; lado = -1 espelha tudo.
import React from 'react';
import {Easing, interpolate, spring} from 'remotion';

// ---------------------------------------------------------------- tipos
export type Pose = {
  x: number; y: number;          // quadril, em coordenadas da tela (px no quadro de 1080)
  tronco: number;                // inclinação: + = para a frente (direita)
  cabeca: number;                // inclinação da cabeça em relação ao tronco
  ombroT: number; cotoveloT: number;   // braço de trás (fica atrás do corpo)
  ombroF: number; cotoveloF: number;   // braço da frente
  coxaT: number; joelhoT: number;      // perna de trás
  coxaF: number; joelhoF: number;      // perna da frente
  estica: number;                // 1 = normal; >1 estica na vertical, <1 achata (volume preservado)
  lado: number;                  // 1 = olha para a direita, -1 = esquerda (interpolado: vira passando pelo 0)
};

export type Medidas = {
  coxa: number; canela: number; tronco: number; pescoco: number; cabeca: number;
  braco: number; antebraco: number; traco: number;
};

/** Proporções do boneco a partir da altura total (pé à ponta da cabeça). */
export const medidas = (altura = 520): Medidas => {
  const u = altura / 520;
  return {coxa: 118 * u, canela: 118 * u, tronco: 150 * u, pescoco: 20 * u, cabeca: 46 * u,
    braco: 100 * u, antebraco: 98 * u, traco: 22 * u};
};

export const BASE: Pose = {
  x: 540, y: 1300, tronco: 0, cabeca: 0, ombroT: -8, cotoveloT: 10, ombroF: 8, cotoveloF: 10,
  coxaT: -6, joelhoT: 0, coxaF: 6, joelhoF: 0, estica: 1, lado: 1,
};

type Pt = [number, number];
const rad = (a: number) => (a * Math.PI) / 180;
const dir = (a: number): Pt => [Math.sin(rad(a)), Math.cos(rad(a))];
const soma = (p: Pt, a: number, l: number): Pt => {
  const [dx, dy] = dir(a);
  return [p[0] + dx * l, p[1] + dy * l];
};
const angulo = (de: Pt, para: Pt) => (Math.atan2(para[0] - de[0], para[1] - de[1]) * 180) / Math.PI;

// ---------------------------------------------------------------- FK
export type Juntas = {
  quadril: Pt; pescoco: Pt; cabeca: Pt; ombro: Pt;
  cotoveloT: Pt; maoT: Pt; cotoveloF: Pt; maoF: Pt;
  joelhoT: Pt; peT: Pt; joelhoF: Pt; peF: Pt;
};

/** Posição de cada junta, em coordenadas LOCAIS (quadril em 0,0, olhando para a direita, sem estica). */
const fkLocal = (p: Pose, m: Medidas): Juntas => {
  const quadril: Pt = [0, 0];
  const aTronco = 180 - p.tronco;
  const pescoco = soma(quadril, aTronco, m.tronco);
  const cabeca = soma(pescoco, aTronco - p.cabeca, m.pescoco + m.cabeca);
  const ombro = soma(quadril, aTronco, m.tronco * 0.92);
  const baixo = -p.tronco;                         // "para baixo" no referencial do tronco
  const cotoveloT = soma(ombro, baixo + p.ombroT, m.braco);
  const maoT = soma(cotoveloT, baixo + p.ombroT + p.cotoveloT, m.antebraco);
  const cotoveloF = soma(ombro, baixo + p.ombroF, m.braco);
  const maoF = soma(cotoveloF, baixo + p.ombroF + p.cotoveloF, m.antebraco);
  const joelhoT = soma(quadril, p.coxaT, m.coxa);
  const peT = soma(joelhoT, p.coxaT + p.joelhoT, m.canela);
  const joelhoF = soma(quadril, p.coxaF, m.coxa);
  const peF = soma(joelhoF, p.coxaF + p.joelhoF, m.canela);
  return {quadril, pescoco, cabeca, ombro, cotoveloT, maoT, cotoveloF, maoF, joelhoT, peT, joelhoF, peF};
};

/** Altura do quadril até o chão com as pernas da pose (para o esticar/achatar apoiar no pé). */
const alturaPe = (j: Juntas) => Math.max(j.peT[1], j.peF[1]);

/** Juntas na TELA: aplica lado (espelho), estica (em torno do pé) e a posição do quadril. */
export const juntas = (p: Pose, m: Medidas): Juntas => {
  const L = fkLocal(p, m);
  const chao = alturaPe(L);
  const sy = p.estica, sx = 1 / Math.sqrt(Math.max(0.2, p.estica));
  const lado = Math.abs(p.lado) < 0.05 ? 0.05 * Math.sign(p.lado || 1) : p.lado;
  const out: any = {};
  for (const k of Object.keys(L) as (keyof Juntas)[]) {
    const [x, y] = L[k];
    out[k] = [p.x + x * sx * lado, p.y + chao + (y - chao) * sy];
  }
  return out as Juntas;
};

// ---------------------------------------------------------------- IK
/**
 * IK de dois ossos: ângulos (absoluto do 1º osso, relativo do 2º) para a ponta chegar em alvo.
 * dobra = +1 dobra para a frente (joelho), -1 para trás (cotovelo).
 */
export const ik2 = (raiz: Pt, alvo: Pt, l1: number, l2: number, dobra = 1): [number, number] => {
  const dx = alvo[0] - raiz[0], dy = alvo[1] - raiz[1];
  const d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, Math.hypot(dx, dy)));
  const base = angulo(raiz, alvo);
  const alfa = (Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) * 180) / Math.PI;
  const a1 = base + dobra * alfa;
  const meio = soma(raiz, a1, l1);
  const a2 = angulo(meio, [raiz[0] + (dx / Math.hypot(dx, dy || 1e-6)) * d, raiz[1] + (dy / Math.hypot(dx, dy || 1e-6)) * d]);
  return [a1, a2 - a1];
};

export type Alvos = {maoF?: Pt; maoT?: Pt; peF?: Pt; peT?: Pt};

/**
 * Resolve IK numa pose: mãos e pés vão até pontos da TELA (ex.: punho no "1", pés no chão).
 * Devolve a pose com os ângulos trocados, para continuar interpolando por ângulo (sem tremer).
 */
export const comAlvos = (p: Pose, m: Medidas, alvos: Alvos): Pose => {
  const q = {...p, estica: 1};
  const L = fkLocal(q, m);
  const lado = p.lado >= 0 ? 1 : -1;
  const local = (t: Pt): Pt => [(t[0] - p.x) * lado, t[1] - p.y];
  const r: Pose = {...p};
  const baixo = -p.tronco;
  if (alvos.peF) [r.coxaF, r.joelhoF] = ik2(L.quadril, local(alvos.peF), m.coxa, m.canela, 1);
  if (alvos.peT) [r.coxaT, r.joelhoT] = ik2(L.quadril, local(alvos.peT), m.coxa, m.canela, 1);
  if (alvos.maoF) {
    const [a1, a2] = ik2(L.ombro, local(alvos.maoF), m.braco, m.antebraco, -1);
    r.ombroF = a1 - baixo; r.cotoveloF = a2;
  }
  if (alvos.maoT) {
    const [a1, a2] = ik2(L.ombro, local(alvos.maoT), m.braco, m.antebraco, -1);
    r.ombroT = a1 - baixo; r.cotoveloT = a2;
  }
  return r;
};

/** Pés plantados no chão (y = chao), afastados `passo` px do quadril: dobra os joelhos sozinha quando o quadril desce. */
export const plantado = (p: Pose, m: Medidas, chao: number, passo = 55, alvos: Alvos = {}): Pose => {
  // base larga: se a perna não alcança o chão daqui, o quadril desce o necessário (senão o pé flutua)
  const perna = (m.coxa + m.canela) * 0.99;
  const yMax = chao - Math.sqrt(Math.max(0, perna * perna - passo * passo));
  const q = {...p, y: Math.max(p.y, yMax)};
  return comAlvos(q, m, {peT: [q.x - passo * (q.lado >= 0 ? 1 : -1), chao], peF: [q.x + passo * (q.lado >= 0 ? 1 : -1), chao], ...alvos});
};

/** Altura do quadril (y) com o boneco em pé, pernas retas, sobre o chão. */
export const quadrilEmPe = (m: Medidas, chao: number) => chao - (m.coxa + m.canela) * 0.995;

// ---------------------------------------------------------------- poses prontas
// Funções que recebem onde o boneco está (x, chão) e devolvem a pose. Ajuste com {...pose, campo}.
type Onde = {x: number; chao: number; m: Medidas; lado?: number};
const P = (o: Onde, extra: Partial<Pose>): Pose => ({...BASE, x: o.x, y: quadrilEmPe(o.m, o.chao), lado: o.lado ?? 1, ...extra});

export const POSES = {
  /** Parado, relaxado. */
  emPe: (o: Onde) => plantado(P(o, {}), o.m, o.chao, 34),
  /** Guarda de luta: base larga, punhos na frente do rosto. */
  guarda: (o: Onde) => plantado(P(o, {y: quadrilEmPe(o.m, o.chao) + 26, tronco: 8, ombroT: 60, cotoveloT: 110, ombroF: 85, cotoveloF: 95}), o.m, o.chao, 70),
  /** Antecipação: agacha e puxa o braço para trás (sempre antes de um golpe ou salto). */
  carrega: (o: Onde) => plantado(P(o, {y: quadrilEmPe(o.m, o.chao) + 70, tronco: -14, cabeca: 8, ombroT: 120, cotoveloT: 40, ombroF: -60, cotoveloF: 70, estica: 0.94}), o.m, o.chao, 80),
  /** Agachado fundo (preparação de salto ou aterrissagem). */
  agachado: (o: Onde) => plantado(P(o, {y: quadrilEmPe(o.m, o.chao) + 95, tronco: 28, cabeca: -18, ombroT: -40, cotoveloT: 20, ombroF: -55, cotoveloF: 25, estica: 0.9}), o.m, o.chao, 62),
  /** No ar, corpo esticado para cima. */
  salto: (o: Onde) => P(o, {tronco: 6, cabeca: -6, ombroT: 160, cotoveloT: 10, ombroF: 170, cotoveloF: 5, coxaT: -10, joelhoT: -30, coxaF: 30, joelhoF: -60, estica: 1.08}),
  /** Soco com o braço da frente: o punho vai até alvo (IK). */
  soco: (o: Onde, alvo: Pt) => plantado(P(o, {y: quadrilEmPe(o.m, o.chao) + 34, tronco: 22, cabeca: -10, ombroT: -50, cotoveloT: 80}), o.m, o.chao, 92, {maoF: alvo}),
  /** Chute com a perna da frente até alvo (IK); a perna de trás sustenta. */
  chute: (o: Onde, alvo: Pt) => comAlvos(P(o, {tronco: -22, cabeca: 10, ombroT: 70, cotoveloT: 40, ombroF: -40, cotoveloF: 50}), o.m,
    {peT: [o.x - 20 * (o.lado ?? 1), o.chao], peF: alvo}),
  /** Empurrando algo pesado: corpo inclinado, as duas mãos em alvo. */
  empurra: (o: Onde, alvo: Pt) => plantado(P(o, {y: quadrilEmPe(o.m, o.chao) + 40, tronco: 34, cabeca: -20}), o.m, o.chao, 95, {maoF: alvo, maoT: [alvo[0] - 10, alvo[1] + 24]}),
  /** Susto: recua, braços para cima. */
  susto: (o: Onde) => plantado(P(o, {tronco: -16, cabeca: 14, ombroT: 150, cotoveloT: 30, ombroF: 135, cotoveloF: 40, estica: 1.05}), o.m, o.chao, 48),
  /** Coçando a cabeça (dúvida). */
  duvida: (o: Onde) => plantado(P(o, {tronco: -4, cabeca: 12, ombroT: 4, cotoveloT: 8, ombroF: 150, cotoveloF: 120}), o.m, o.chao, 30),
  /** Comemora: braços para cima, abertos. */
  comemora: (o: Onde) => plantado(P(o, {tronco: -6, cabeca: -14, ombroT: 155, cotoveloT: -20, ombroF: 205, cotoveloF: 20, estica: 1.04}), o.m, o.chao, 52),
  /** Deitado de costas (derrubado). y = chão. */
  caido: (o: Onde) => P(o, {y: o.chao - 26, tronco: -92, cabeca: -8, ombroT: 150, cotoveloT: 20, ombroF: 120, cotoveloF: 30,
    coxaT: 70, joelhoT: 30, coxaF: 95, joelhoF: -40}),
  /** Sentado no chão, mãos apoiadas atrás (IK). */
  sentado: (o: Onde) => comAlvos(P(o, {y: o.chao - 30, tronco: -24, cabeca: 6, coxaT: 82, joelhoT: -10, coxaF: 72, joelhoF: -80}), o.m,
    {maoT: [o.x - 95 * (o.lado ?? 1), o.chao - 4], maoF: [o.x - 70 * (o.lado ?? 1), o.chao - 4]}),
};

// ---------------------------------------------------------------- ciclos
/**
 * Corrida indo de x0 a x1 entre t0 e t1, com PÉ PLANTADO: cada pé fica parado no chão enquanto o quadril
 * passa por cima (apoio) e depois voa em arco até a próxima pisada (balanço). As pernas saem por IK,
 * então o pé não patina. Braços balançam contra as pernas. Devolve uma função do tempo (use como pose de Chave).
 * passada = distância entre pisadas (px); apoio = fração do ciclo com o pé no chão (0,35 corrida, 0,6 caminhada).
 */
export type Corrida = {x0: number; x1: number; t0: number; t1: number; chao: number; m: Medidas;
  intensidade?: number; passada?: number; apoio?: number};
const passadaDe = (o: Corrida) => o.passada ?? (o.m.coxa + o.m.canela) * 0.8;

export const corrida = (o: Corrida) =>
  (s: number): Pose => {
    const {m} = o;
    const k = o.intensidade ?? 1;
    const u = Math.min(1, Math.max(0, (s - o.t0) / (o.t1 - o.t0)));
    const x = o.x0 + (o.x1 - o.x0) * u;
    const lado = o.x1 >= o.x0 ? 1 : -1;
    const d = Math.abs(x - o.x0);
    const L = passadaDe(o), C = 2 * L, st = o.apoio ?? 0.36;
    const alt = (0.2 + 0.25 * k) * (m.coxa + m.canela) * 0.5;          // altura do pé no balanço
    const pe = (off: number) => {
      const dd = d + off;
      const local = ((dd % C) + C) % C, D0 = dd - local, uu = local / C;
      const pisada = (D: number) => D + (st * C) / 2 - off;           // onde o pé pisa (na distância do quadril)
      if (uu < st) return {dist: pisada(D0), h: 0, apoio: Math.sin((Math.PI * uu) / st)};
      const v = (uu - st) / (1 - st), ve = v * v * (3 - 2 * v);
      return {dist: pisada(D0) + (pisada(D0 + C) - pisada(D0)) * ve, h: Math.sin(Math.PI * v) * alt, apoio: 0};
    };
    const F = pe(0), T = pe(L);
    const comp = Math.max(F.apoio, T.apoio);                          // pé no chão: quadril desce (amortece)
    const relF = (F.dist - d) / L, relT = (T.dist - d) / L;           // pé à frente (+) ou atrás (−) do quadril
    const base: Pose = {
      ...BASE, lado, x,
      y: quadrilEmPe(m, o.chao) + 8 * k + 16 * k * comp - (comp < 0.05 ? 8 * k : 0),
      tronco: 8 + 10 * k, cabeca: -4 * k,
      ombroF: -55 * k * relF, cotoveloF: 70 + 25 * k,
      ombroT: -55 * k * relT, cotoveloT: 70 + 25 * k,
      estica: 1 - 0.035 * k * comp,
    };
    return comAlvos(base, m, {
      peF: [o.x0 + lado * F.dist, o.chao - F.h],
      peT: [o.x0 + lado * T.dist, o.chao - T.h],
    });
  };

/** Tempos (s) em que um pé toca o chão na corrida: para o <Som nome="passo">. */
export const passosDaCorrida = (o: Corrida): number[] => {
  const L = passadaDe(o), total = Math.abs(o.x1 - o.x0);
  const r: number[] = [];
  for (let dd = L; dd < total; dd += L) r.push(o.t0 + (dd / total) * (o.t1 - o.t0));
  return r;
};

/** Respiração parado: soma a uma pose (função do tempo). */
export const respira = (pose: Pose, s: number, amp = 1): Pose => ({
  ...pose, y: pose.y + Math.sin(s * 2.4) * 3 * amp, tronco: pose.tronco + Math.sin(s * 2.4 + 0.5) * 1.2 * amp,
  ombroF: pose.ombroF + Math.sin(s * 2.4) * 2 * amp, ombroT: pose.ombroT + Math.sin(s * 2.4) * 2 * amp,
});

/** Trajetória de salto: quadril sai de (x0, y0) em t0, sobe `altura` px e cai em (x1, y1) em t1. Aplica sobre uma pose. */
export const arco = (pose: (s: number) => Pose, o: {t0: number; t1: number; x0: number; x1: number; y0: number; y1: number; altura: number}) =>
  (s: number): Pose => {
    const u = Math.min(1, Math.max(0, (s - o.t0) / (o.t1 - o.t0)));
    const p = pose(s);
    return {...p, x: o.x0 + (o.x1 - o.x0) * u, y: o.y0 + (o.y1 - o.y0) * u - 4 * o.altura * u * (1 - u)};
  };

// ---------------------------------------------------------------- linha do tempo
export type Mola = {damping?: number; stiffness?: number; mass?: number; overshootClamping?: boolean};
/** Molas prontas: ESTALO = golpe (rápido e seco), PADRAO = gesto, PESADO = corpo grande/cansado, BALANCO = sobra visível. */
export const MOLAS = {
  ESTALO: {damping: 18, stiffness: 520, mass: 0.6},
  PADRAO: {damping: 14, stiffness: 170, mass: 0.9},
  PESADO: {damping: 20, stiffness: 90, mass: 1.4},
  BALANCO: {damping: 8, stiffness: 160, mass: 0.8},
} as const;

export type Chave = {
  t: number;                               // segundos (tempo da AÇÃO, ver useAcao em kit/impacto)
  pose: Pose | ((s: number) => Pose);
  mola?: Mola;                             // transição por mola (padrão MOLAS.PADRAO)
  d?: number;                              // ou: duração fixa com curva (segundos)
  curva?: (x: number) => number;           // com d (padrão Easing.inOut(cubic))
  sobreposicao?: number;                   // cascata quadril→tronco→ombro→cabeça→cotovelo (1 = padrão, 0 = tudo junto)
  passos?: boolean;                        // pés no chão nas duas poses: dá passos em vez de deslizar (padrão true)
  ancora?: boolean;                        // pés ficam onde estavam e o corpo se move por cima (levantar, sentar, inclinar)
};

const CAMPOS: (keyof Pose)[] = ['x', 'y', 'tronco', 'cabeca', 'ombroT', 'cotoveloT', 'ombroF', 'cotoveloF',
  'coxaT', 'joelhoT', 'coxaF', 'joelhoF', 'estica', 'lado'];

export const misturaPose = (a: Pose, b: Pose, u: number): Pose => {
  const r: any = {};
  for (const k of CAMPOS) r[k] = a[k] + (b[k] - a[k]) * u;
  return r as Pose;
};

const avalia = (c: Chave, s: number) => (typeof c.pose === 'function' ? c.pose(s) : c.pose);

/**
 * Atraso (s) de cada parte na transição: o quadril puxa e o resto segue em cascata (overlapping action).
 * Sem isso todas as juntas chegam juntas e o boneco parece robô.
 */
export const CASCATA: Record<keyof Pose, number> = {
  x: 0, y: 0, coxaT: 0, joelhoT: 0, coxaF: 0, joelhoF: 0, estica: 0, lado: 0,
  tronco: 0.03, ombroT: 0.05, ombroF: 0.05, cabeca: 0.075, cotoveloT: 0.085, cotoveloF: 0.085,
};

const PE_NO_CHAO = 14;    // px: pé a menos que isso do chão conta como apoiado

const pes = (p: Pose, m: Medidas) => {
  const j = juntas(p, m);
  return {F: j.peF, T: j.peT};
};

/**
 * Pose no tempo s. Cada chave parte de onde o boneco ESTÁ quando ela começa (mesmo no meio da anterior),
 * então interromper um movimento nunca dá salto. Com `chao` (e `altura`):
 * - pés que estão no chão nas duas poses DÃO PASSOS (um pé de cada vez, em arco), em vez de deslizar;
 * - nenhum pé atravessa o chão.
 */
export const poseEm = (chaves: Chave[], s: number, fps: number, chao?: number, altura = 520): Pose => {
  const cs = [...chaves].sort((a, b) => a.t - b.t);
  const m = medidas(altura);
  const progresso = (c: Chave, t: number) => c.d !== undefined
    ? interpolate(t, [c.t, c.t + c.d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: c.curva ?? Easing.inOut(Easing.cubic)})
    : spring({frame: (t - c.t) * fps, fps, config: {...MOLAS.PADRAO, ...c.mola}});

  const trecho = (c: Chave, de: Pose, t: number): Pose => {
    const para = avalia(c, t);
    const k = c.sobreposicao ?? 1;
    const r: any = {};
    for (const campo of CAMPOS) r[campo] = de[campo] + (para[campo] - de[campo]) * progresso(c, t - CASCATA[campo] * k);
    let p = r as Pose;
    if (chao === undefined) return p;
    if (c.ancora) {
      const a = pes(de, m);
      return comAlvos(p, m, {peF: a.F, peT: a.T});
    }
    if (c.passos === false) return p;
    // passos: pé apoiado antes e depois anda em arco, um de cada vez (o que vai mais longe primeiro)
    const a = pes(de, m), b = pes(para, m);
    const noChao = (q: Pt) => Math.abs(q[1] - chao) < PE_NO_CHAO;
    if (noChao(a.F) && noChao(a.T) && noChao(b.F) && noChao(b.T)) {
      const u = Math.min(1, Math.max(0, progresso(c, t)));
      const dF = Math.abs(b.F[0] - a.F[0]), dT = Math.abs(b.T[0] - a.T[0]);
      const primeiro = dF >= dT ? 'F' : 'T';
      const passo = (q0: Pt, q1: Pt, w0: number, w1: number): Pt => {
        const dist = Math.abs(q1[0] - q0[0]);
        if (dist < 8) return [q0[0] + (q1[0] - q0[0]) * u, chao];
        const v = Math.min(1, Math.max(0, (u - w0) / (w1 - w0))), ve = v * v * (3 - 2 * v);
        return [q0[0] + (q1[0] - q0[0]) * ve, chao - Math.min(55, 0.4 * dist) * Math.sin(Math.PI * v)];
      };
      const janela = (pe: 'F' | 'T'): [number, number] => (pe === primeiro ? [0, 0.6] : [0.35, 1]);
      p = comAlvos(p, m, {peF: passo(a.F, b.F, ...janela('F')), peT: passo(a.T, b.T, ...janela('T'))});
    }
    return p;
  };

  // o chão é sólido: pé abaixo dele é puxado de volta por IK
  const solo = (p: Pose): Pose => {
    if (chao === undefined) return p;
    const q = pes(p, m), alvos: Alvos = {};
    if (q.F[1] > chao + 1) alvos.peF = [q.F[0], chao];
    if (q.T[1] > chao + 1) alvos.peT = [q.T[0], chao];
    return alvos.peF || alvos.peT ? comAlvos(p, m, alvos) : p;
  };

  const valor = (i: number, de: Pose | null, t: number) => solo(i === 0 || !de ? avalia(cs[0], t) : trecho(cs[i], de, t));
  let de: Pose | null = null;
  let atual = 0;
  for (let i = 1; i < cs.length && s >= cs[i].t; i++) {
    de = valor(atual, de, cs[i].t);
    atual = i;
  }
  return valor(atual, de, s);
};

// ---------------------------------------------------------------- desenho
const linha = (a: Pt, b: Pt) => `M ${a[0].toFixed(2)} ${a[1].toFixed(2)} L ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
const membro = (a: Pt, b: Pt, c: Pt) => `M ${a[0].toFixed(2)} ${a[1].toFixed(2)} L ${b[0].toFixed(2)} ${b[1].toFixed(2)} L ${c[0].toFixed(2)} ${c[1].toFixed(2)}`;

const Figura: React.FC<{j: Juntas; m: Medidas; cor: string; corTras: string; op?: number; contorno?: string}> =
  ({j, m, cor, corTras, op = 1, contorno}) => {
    const w = m.traco;
    const tr = (d: string, c: string, k = 1) => (
      <>
        {contorno && <path d={d} stroke={contorno} strokeWidth={w * k + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        <path d={d} stroke={c} strokeWidth={w * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
    return (
      <g opacity={op}>
        {tr(membro(j.ombro, j.cotoveloT, j.maoT), corTras)}
        {tr(membro(j.quadril, j.joelhoT, j.peT), corTras)}
        {tr(linha(j.quadril, j.pescoco), cor, 1.15)}
        {tr(membro(j.quadril, j.joelhoF, j.peF), cor)}
        {contorno && <circle cx={j.cabeca[0]} cy={j.cabeca[1]} r={m.cabeca + 4} fill={contorno} />}
        <circle cx={j.cabeca[0]} cy={j.cabeca[1]} r={m.cabeca} fill={cor} />
        {tr(membro(j.ombro, j.cotoveloF, j.maoF), cor)}
      </g>
    );
  };

/**
 * O personagem na tela. chaves = linha do tempo de poses; s = tempo da AÇÃO (segundos).
 * rastro: nº de cópias fantasma de movimento (0 desliga); só aparecem quando o corpo se move rápido.
 * sombra: elipse no chão (y = chao) que encolhe quando ele sobe.
 */
export const Personagem: React.FC<{
  chaves: Chave[]; s: number; fps: number; altura?: number; cor: string; corTras?: string;
  contorno?: string; rastro?: number; chao?: number; corSombra?: string;
}> = ({chaves, s, fps, altura = 520, cor, corTras, contorno, rastro = 3, chao, corSombra = 'rgba(0,0,0,0.28)'}) => {
  const m = medidas(altura);
  const p = poseEm(chaves, s, fps, chao, altura);
  const j = juntas(p, m);
  const fantasmas: React.ReactNode[] = [];
  for (let i = rastro; i >= 1; i--) {
    const dt = (i * 0.5) / fps;                                  // meio quadro entre fantasmas
    const jg = juntas(poseEm(chaves, s - dt, fps, chao, altura), m);
    const desloc = Math.max(...(['maoF', 'maoT', 'peF', 'peT', 'cabeca'] as (keyof Juntas)[])
      .map((k) => Math.hypot(jg[k][0] - j[k][0], jg[k][1] - j[k][1])));
    const op = Math.min(0.28, (desloc - 30 * i) / 140) * (1 - i / (rastro + 1));     // só movimento rápido
    if (op > 0.02) fantasmas.push(<Figura key={i} j={jg} m={m} cor={cor} corTras={corTras ?? cor} op={op} />);
  }
  const yPe = Math.max(j.peF[1], j.peT[1]);
  const alturaChao = chao !== undefined ? Math.max(0, chao - yPe) : 0;
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {chao !== undefined && (
        <ellipse cx={p.x} cy={chao + 6} rx={Math.max(20, 95 - alturaChao * 0.18) * (altura / 520)} ry={14 * (altura / 520)}
          fill={corSombra} opacity={Math.max(0.15, 1 - alturaChao / 600)} />
      )}
      {fantasmas}
      <Figura j={j} m={m} cor={cor} corTras={corTras ?? cor} contorno={contorno} />
    </svg>
  );
};

/** Juntas no tempo s (para colar objetos na mão, saber onde o punho está, mirar partículas). */
export const juntasEm = (chaves: Chave[], s: number, fps: number, altura = 520, chao?: number): Juntas =>
  juntas(poseEm(chaves, s, fps, chao, altura), medidas(altura));
