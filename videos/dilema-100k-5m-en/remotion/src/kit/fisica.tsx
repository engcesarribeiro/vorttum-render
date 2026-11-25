// Física 2D pré-calculada (matter.js) para cenas Remotion.
//
// Regra de ouro: o Remotion renderiza quadros fora de ordem e em várias abas ao mesmo tempo,
// então a física NUNCA roda ao vivo. simular() roda a cena inteira de uma vez (passo fixo, sem
// aleatório) e grava a posição e o ângulo de cada corpo por quadro, mais as colisões
// (quadro, corpos, força, ponto). O componente só lê o quadro: o mesmo render sai sempre igual.
//
// Os golpes do personagem entram como `acoes`: no quadro tal, o corpo tal ganha velocidade/giro.
import React, {useMemo} from 'react';
import Matter from 'matter-js';
import {OPEN_SANS} from './fonteGlifos';

export type Vec = {x: number; y: number};
export type Estado = {x: number; y: number; ang: number; vx: number; vy: number};
export type Colisao = {quadro: number; a: string; b: string; forca: number; x: number; y: number};

export type Acao = {
  quadro: number;            // quadro da AÇÃO (segundos × fps; use Math.round(t * fps))
  corpo: string;             // label do corpo
  vel?: Vec;                 // velocidade nova (px por quadro de 60 Hz, a unidade do matter)
  giro?: number;             // velocidade angular (rad por passo)
  estatico?: boolean;        // trava (true) ou solta (false) o corpo: ex. "1" parado até levar o soco
  forca?: Vec;               // empurrão contínuo neste passo
};

export type Mundo = {
  engine: Matter.Engine;
  M: typeof Matter;
  /** Atalhos para criar corpos com label (a label é o nome usado no resto da cena). */
  caixa: (label: string, x: number, y: number, w: number, h: number, op?: Matter.IChamferableBodyDefinition) => Matter.Body;
  bola: (label: string, x: number, y: number, r: number, op?: Matter.IBodyDefinition) => Matter.Body;
  composto: (label: string, partes: Matter.Body[], op?: Matter.IBodyDefinition) => Matter.Body;
  chao: (y: number, x0?: number, x1?: number) => Matter.Body;
  paredes: (x0: number, x1: number, y: number) => void;
};

export type Simulacao = {
  quadros: number;
  fps: number;
  labels: string[];
  estados: Record<string, Estado[]>;      // estados[label][quadro]
  colisoes: Colisao[];
  desvios: Record<string, Vec>;           // centro de massa − centro do desenho (corpos compostos)
  /** Estado do corpo num tempo (segundos de ação), interpolado entre quadros. */
  em: (label: string, s: number) => Estado;
};

const MATERIAL = {friction: 0.5, frictionAir: 0.008, restitution: 0.25, density: 0.002};

/**
 * Roda a física de `duracao` segundos (de ação) a `fps` e devolve a gravação.
 * monta(mundo) cria os corpos. subpassos: passos de física por quadro (2 a 4 = estável).
 * gravidade: 1 ≈ terra no quadro de 1080 px; 2 a 3 dá o peso "de desenho animado".
 */
export const simular = (o: {
  duracao: number; fps: number; monta: (m: Mundo) => void; acoes?: Acao[];
  gravidade?: number; subpassos?: number; forcaMinima?: number;
}): Simulacao => {
  const fps = o.fps, sub = o.subpassos ?? 3;
  const engine = Matter.Engine.create({gravity: {x: 0, y: o.gravidade ?? 2.2, scale: 0.001}, enableSleeping: false,
    positionIterations: 10, velocityIterations: 8});
  // matter.js usa um gerador aleatório com semente em Common: fixa para o render ser sempre igual
  (Matter.Common as any)._seed = 1;
  const add = (b: Matter.Body) => (Matter.Composite.add(engine.world, b), b);
  // Corpo criado já com isStatic não guarda a massa: ao soltar (estatico: false) vira NaN e some.
  // Por isso nasce móvel e é travado depois, com setStatic, que guarda a massa original.
  const nasce = (b: Matter.Body, travado?: boolean) => (add(b), travado && Matter.Body.setStatic(b, true), b);
  const sem = <T extends {isStatic?: boolean}>(op: T) => {
    const {isStatic, ...resto} = op;
    return resto;
  };
  const mundo: Mundo = {
    engine, M: Matter,
    caixa: (label, x, y, w, h, op = {}) => nasce(Matter.Bodies.rectangle(x, y, w, h, {...MATERIAL, ...sem(op), label}), op.isStatic),
    bola: (label, x, y, r, op = {}) => nasce(Matter.Bodies.circle(x, y, r, {...MATERIAL, ...sem(op), label}), op.isStatic),
    composto: (label, partes, op = {}) => nasce(Matter.Body.create({...MATERIAL, ...sem(op), parts: partes, label}), op.isStatic),
    chao: (y, x0 = -2000, x1 = 4000) => add(Matter.Bodies.rectangle((x0 + x1) / 2, y + 200, x1 - x0, 400,
      {isStatic: true, label: 'chao', friction: 0.8, restitution: 0.1})),
    paredes: (x0, x1, y) => {
      add(Matter.Bodies.rectangle(x0 - 100, y - 2000, 200, 4000, {isStatic: true, label: 'parede'}));
      add(Matter.Bodies.rectangle(x1 + 100, y - 2000, 200, 4000, {isStatic: true, label: 'parede'}));
    },
  };
  o.monta(mundo);
  const corpos = Matter.Composite.allBodies(engine.world).filter((b) => !b.isStatic || !['chao', 'parede'].includes(b.label));
  const labels = corpos.map((b) => b.label);
  const porLabel = Object.fromEntries(corpos.map((b) => [b.label, b]));
  const estados: Record<string, Estado[]> = Object.fromEntries(labels.map((l) => [l, []]));
  const desvios: Record<string, Vec> = Object.fromEntries(corpos.map((b) => [b.label, (b as any).desvio ?? {x: 0, y: 0}]));
  const colisoes: Colisao[] = [];
  let quadroAtual = 0;
  const ultima: Record<string, number> = {};
  Matter.Events.on(engine, 'collisionStart', (ev) => {
    for (const par of ev.pairs) {
      const A = par.bodyA.parent, B = par.bodyB.parent;
      const forca = Math.hypot(A.velocity.x - B.velocity.x, A.velocity.y - B.velocity.y);
      if (forca < (o.forcaMinima ?? 1.5)) continue;
      const chave = [A.label, B.label].sort().join('|');
      if (ultima[chave] !== undefined && quadroAtual - ultima[chave] < 4) continue;    // mesma batida repetida
      ultima[chave] = quadroAtual;
      const sup = par.collision.supports?.[0] ?? A.position;
      colisoes.push({quadro: quadroAtual, a: A.label, b: B.label, forca, x: sup.x, y: sup.y});
    }
  });
  const total = Math.ceil(o.duracao * fps) + 1;
  const acoes = [...(o.acoes ?? [])].sort((a, b) => a.quadro - b.quadro);
  const dt = 1000 / fps / sub;
  for (let q = 0; q < total; q++) {
    quadroAtual = q;
    for (const a of acoes) {
      if (a.quadro !== q) continue;
      const b = porLabel[a.corpo];
      if (!b) throw new Error(`fisica: ação no quadro ${q} para corpo "${a.corpo}", que não existe`);
      if (a.estatico !== undefined) Matter.Body.setStatic(b, a.estatico);
      if (a.vel) Matter.Body.setVelocity(b, a.vel);
      if (a.giro !== undefined) Matter.Body.setAngularVelocity(b, a.giro);
      if (a.forca) Matter.Body.applyForce(b, b.position, a.forca);
    }
    for (const l of labels) {
      const b = porLabel[l];
      estados[l].push({x: b.position.x, y: b.position.y, ang: b.angle, vx: b.velocity.x, vy: b.velocity.y});
    }
    for (let k = 0; k < sub; k++) Matter.Engine.update(engine, dt);
  }
  const em = (label: string, s: number): Estado => {
    const lista = estados[label];
    if (!lista) throw new Error(`fisica: corpo "${label}" não existe`);
    const f = Math.min(total - 1, Math.max(0, s * fps));
    const i = Math.floor(f), u = f - i;
    const a = lista[i], b = lista[Math.min(total - 1, i + 1)];
    return {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ang: a.ang + (b.ang - a.ang) * u, vx: a.vx, vy: a.vy};
  };
  Matter.Events.off(engine, 'collisionStart', undefined as any);
  Matter.Engine.clear(engine);
  return {quadros: total, fps, labels, estados, colisoes, desvios, em};
};

/** simular() memorizado: roda uma vez por aba do render, não a cada quadro. */
export const useSimulacao = (fn: () => Simulacao): Simulacao => useMemo(fn, []);

/**
 * Desenha qualquer coisa presa a um corpo: o filho é desenhado em volta de (0, 0) e gira com o corpo.
 * Ex.: <NoCorpo sim={sim} label="um" s={a}><Glifo .../></NoCorpo>
 */
export const NoCorpo: React.FC<{sim: Simulacao; label: string; s: number; escala?: number; children: React.ReactNode}> =
  ({sim, label, s, escala = 1, children}) => {
    const e = sim.em(label, s);
    const d = sim.desvios[label];
    return (
      <g transform={`translate(${e.x.toFixed(2)} ${e.y.toFixed(2)}) rotate(${((e.ang * 180) / Math.PI).toFixed(3)}) scale(${escala}) translate(${-d.x} ${-d.y})`}>
        {children}
      </g>
    );
  };

/** Colisões entre tempos (segundos de ação), para som e partículas. filtro opcional por label. */
export const colisoesEntre = (sim: Simulacao, t0: number, t1: number, minimo = 0, label?: string) =>
  sim.colisoes.filter((c) => c.quadro / sim.fps >= t0 && c.quadro / sim.fps < t1 && c.forca >= minimo &&
    (!label || c.a === label || c.b === label));

// ---------------------------------------------------------------- glifos com corpo
// Números e sinais na Open Sans (contorno real da fonte, kit/fonteGlifos.ts) com corpo de física feito de
// retângulos que cobrem o traço. O desenho é path, não <text>: não depende da fonte carregar no render.
// Medidas em px, centro em (0, 0); t = altura do "1" (altura de maiúscula).
export type GlifoNome = '1' | '+' | '-' | '=' | '×' | '0';

/** Peça do corpo: [cx, cy, w, h, ângulo (rad), arredondamento (fração do lado menor)]. */
export type PecaGlifo = [number, number, number, number, number?, number?];

const Q = Math.PI / 4;
/** Retângulos do corpo de cada glifo, relativos ao centro, para tamanho t. Traço da Open Sans ≈ 0,093 t. */
export const formaGlifo = (g: GlifoNome, t: number): PecaGlifo[] => {
  const e = t * 0.093;
  switch (g) {
    case '1': return [[0, 0, e * 1.19, t], [-t * 0.16, -t * 0.352, t * 0.31, e, -0.683]];   // haste + bandeira
    case '+': return [[0, t * 0.006, t * 0.657, e], [0, t * 0.0055, e, t * 0.674]];
    case '-': return [[0, t * 0.006, t * 0.659, e]];
    case '=': return [[0, -t * 0.133, t * 0.642, e], [0, t * 0.147, t * 0.642, e]];
    case '×': return [[0, t * 0.0055, t * 0.78, e, Q], [0, t * 0.0055, t * 0.78, e, -Q]];
    case '0': return [[0, 0, t * 0.66, t * 1.03, 0, 0.45]];
  }
};

/** Distância do centro do glifo até a base dele: nasce apoiado no chão com centro em chao - baseGlifo(g, t). */
export const baseGlifo = (g: GlifoNome, t: number) => OPEN_SANS[g].caixa[3] * t;

/** Cria o corpo de um glifo no mundo (composto de retângulos). */
export const corpoGlifo = (m: Mundo, label: string, g: GlifoNome, x: number, y: number, t: number, op: Matter.IBodyDefinition = {}) => {
  const partes = formaGlifo(g, t).map(([cx, cy, w, h, ang = 0, arred = 0.18]) =>
    m.M.Bodies.rectangle(x + cx, y + cy, w, h, {angle: ang, chamfer: {radius: Math.min(w, h) * arred}}));
  const b = m.composto(label, partes, op);
  // composto muda o centro de massa: guarda o deslocamento para o desenho bater com o corpo
  (b as any).desvio = {x: b.position.x - x, y: b.position.y - y};
  return b;
};

/** Desenho do glifo em Open Sans. Use dentro de <NoCorpo>. `corpo` mostra as peças da física (depuração). */
export const Glifo: React.FC<{g: GlifoNome | '2'; t: number; cor: string; contorno?: string; brilho?: number; corpo?: boolean}> =
  ({g, t, cor, contorno, brilho = 0, corpo}) => {
    const {d} = OPEN_SANS[g];
    const brilhoCss = brilho > 0 ? {filter: `drop-shadow(0 0 ${18 * brilho}px ${cor})`} : undefined;
    return (
      <g style={brilhoCss}>
        <g transform={`scale(${t})`}>
          {contorno && <path d={d} fill="none" stroke={contorno} strokeWidth={12 / t} strokeLinejoin="round" />}
          <path d={d} fill={cor} />
        </g>
        {corpo && g !== '2' && formaGlifo(g, t).map(([cx, cy, w, h, ang = 0], i) => (
          <rect key={i} x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="#f0f" strokeWidth={2}
            transform={`translate(${cx} ${cy}) rotate(${(ang * 180) / Math.PI})`} />
        ))}
      </g>
    );
  };
