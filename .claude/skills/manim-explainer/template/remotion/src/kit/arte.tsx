// Estilos de arte feitos em código, dentro das cenas Remotion.
//
// Dois motores de terceiros, trazidos inteiros para a skill (licenças junto):
//   Anidoodle (Alex Greenshpun, Apache-2.0)  src/anidoodle/       32 estilos (sumi-e, gravura, risografia, giz...)
//   Huashu Art Motion (花叔, MIT)            public/huashu/       estilos de história da arte (nanquim, Klimt, Seurat...)
//
// <Desenho>  toca um filme do Anidoodle (um "Film": função pura do quadro) num canvas.
//            Os filmes "...Draw" mostram o desenho se fazendo, traço a traço.
// <Arte>     toca uma cena do Huashu (SCENES[id].draw(ctx, lt, t)) num canvas.
//
// Os dois recebem o tempo da cena (segundos, useSec) e o mapeiam para o tempo do filme:
// o desenho começa em t0 e termina em t0 + dur (o filme inteiro cabe nesse trecho),
// então o desenho pode acompanhar a fala: t0 = at(props, "palavra").
import React, {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import type {Ctx, Env, Layer} from '../anidoodle/src/canvas-core/core';
import {type Film, renderFrame} from '../anidoodle/src/canvas-core/film';
import {useSec} from './tempo';

type Caixa = {x?: number; y?: number; w?: number; h?: number; opacidade?: number};

const superficie = (w: number, h: number): Layer => {
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), {width: w, height: h});
  return {canvas: c, ctx: c.getContext('2d') as unknown as Ctx} as Layer;
};

/** Caixa padrão: o quadro inteiro do vídeo. */
const useCaixa = (c: Caixa) => {
  const {width, height} = useVideoConfig();
  return {x: c.x ?? 0, y: c.y ?? 0, w: c.w ?? width, h: c.h ?? height};
};

// ------------------------------------------------------------------ Anidoodle
/**
 * Um filme do Anidoodle numa caixa da tela.
 * film: o Film importado (ex.: import {sumiE} from '../anidoodle/src/canvas-core/sumiE').
 * t0: segundo da cena em que o desenho começa; dur: quanto tempo ele leva (padrão: a duração original do filme).
 * Antes de t0 fica o 1º quadro do filme, depois de t0 + dur fica o último (o desenho pronto).
 */
export const Desenho: React.FC<Caixa & {film: Film; t0?: number; dur?: number; escala?: number}> = ({film, t0 = 0, dur, escala = 1, opacidade = 1, ...c}) => {
  const s = useSec();
  const cx = useCaixa(c);
  const ref = useRef<HTMLCanvasElement>(null);
  const env = useRef<Env | null>(null);
  const N = film.meta.durationFrames;
  const d = dur ?? N / film.meta.fps;
  const q = Math.min(N - 1, Math.max(0, Math.floor(((s - t0) / d) * N)));
  const [h] = useState(() => delayRender(`desenho ${film.meta.title}`, {timeoutInMilliseconds: 240000}));
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (!env.current) env.current = {W: film.meta.W, H: film.meta.H, scale: escala, cache: new Map(), canvas: superficie, image: () => undefined} as Env;
    const ctx = cv.getContext('2d') as Ctx;
    renderFrame(film, ctx, q, env.current);
    ctx.getImageData(0, 0, 1, 1);
    continueRender(h);
  }, [q, film, escala, h]);
  return (
    <canvas ref={ref} width={Math.round(film.meta.W * escala)} height={Math.round(film.meta.H * escala)}
      style={{position: 'absolute', left: cx.x, top: cx.y, width: cx.w, height: cx.h, objectFit: 'contain', opacity: opacidade}} />
  );
};

// ------------------------------------------------------------------ Huashu
// As bibliotecas do Huashu são scripts de navegador que registram globais (U, PAINT, KIT, SCENES...).
// Carregamos uma vez por página, na ordem do index.html deles, e esperamos as fontes.
const LIBS = ['fonts', 'util', 'paint', 'brush', 'render', 'post', 'rig', 'rig_huashu', 'kit', 'medium',
  'motion', 'camera', 'diagram', 'typo', 'chart', 'ui', 'collage', 'media', 'toon', 'finish', 'palettes'];
let carregando: Promise<void> | null = null;
const roda = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`huashu: ${url} não existe (HTTP ${r.status})`);
  (0, eval)((await r.text()) + `\n//# sourceURL=${url}`);
};
const carregaHuashu = (W: number, H: number) => {
  if (carregando) return carregando;
  carregando = (async () => {
    const w = window as any;
    w.SCENES = w.SCENES || {}; w.IMG = w.IMG || {};
    for (const l of LIBS) {
      try { await roda(staticFile(`huashu/lib/${l}.js`)); } catch (err) { if (!['toon', 'finish', 'palettes'].includes(l)) throw err; }
    }
    w.U.setStage(W, H);
    for (const f of w.FONT_FACES || []) {
      const ff = new FontFace(f.family, `url(${staticFile('huashu/' + f.url)})`, f.desc || {});
      document.fonts.add(await ff.load());
    }
  })();
  return carregando;
};
const cenasCarregadas = new Map<string, Promise<void>>();
const carregaCena = (id: string) => {
  if (!cenasCarregadas.has(id)) cenasCarregadas.set(id, (async () => {
    const w = window as any;
    if (!w.SCENES[id]) await roda(staticFile(`huashu/scenes/${id}.js`));
    const sc = w.SCENES[id];
    if (!sc || typeof sc.draw !== 'function') throw new Error(`huashu: a cena ${id} não registrou SCENES['${id}'].draw`);
    if (sc.init) await sc.init();
  })());
  return cenasCarregadas.get(id)!;
};

/**
 * Uma cena do Huashu (scenes/<id>.js) numa caixa da tela. As cenas de estilo foram pintadas em 1920x1080.
 * cena: id do arquivo (ex.: '17_ink'); t0: segundo da cena em que começa; dur: duração da cena original
 * que deve caber até o fim (padrão 6 s; a abertura "se desenhando" fica nos primeiros ~2,5 s).
 * desenhar: no lugar de cena, o seu próprio desenho com as ferramentas do Huashu (H.PAINT.brush, H.PAINT.inkWash,
 * H.PAINT.watercolor, H.MEDIUM, H.KIT...), recebendo lt = segundos desde t0. Receitas em references/huashu/receitas/.
 */
export const Arte: React.FC<Caixa & {cena?: string; desenhar?: (c: CanvasRenderingContext2D, lt: number, H: any) => void;
  t0?: number; dur?: number; tamanho?: [number, number]}> = ({cena, desenhar, t0 = 0, dur, tamanho = [1920, 1080], opacidade = 1, ...c}) => {
  const s = useSec();
  const cx = useCaixa(c);
  const ref = useRef<HTMLCanvasElement>(null);
  const [pronto, setPronto] = useState(false);
  const [h] = useState(() => delayRender(`arte ${cena ?? 'propria'}`, {timeoutInMilliseconds: 120000}));
  const lt = Math.max(0, s - t0) * (dur ? 6 / dur : 1);
  useEffect(() => {
    if (!cena && !desenhar) throw new Error('Arte: passe cena="17_ink" ou desenhar={(c, lt, H) => ...}');
    carregaHuashu(tamanho[0], tamanho[1]).then(() => (cena ? carregaCena(cena) : undefined)).then(() => setPronto(true)).catch((e) => { console.error(e); throw e; });
  }, [cena]);
  useEffect(() => {
    if (!pronto || !ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    ctx.save(); ctx.clearRect(0, 0, tamanho[0], tamanho[1]);
    const w = window as any;
    if (desenhar) desenhar(ctx, lt, w); else w.SCENES[cena!].draw(ctx, lt, lt);
    ctx.restore();
    ctx.getImageData(0, 0, 1, 1);
    continueRender(h);
  }, [pronto, lt, cena, h]);
  return (
    <canvas ref={ref} width={tamanho[0]} height={tamanho[1]}
      style={{position: 'absolute', left: cx.x, top: cx.y, width: cx.w, height: cx.h, objectFit: 'contain', opacity: opacidade}} />
  );
};
