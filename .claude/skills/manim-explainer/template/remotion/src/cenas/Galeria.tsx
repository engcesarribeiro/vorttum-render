// Galeria dos estilos de arte (Anidoodle + Huashu): um estilo por segundo, com o nome embaixo.
// Para ver: npx remotion still src/index.ts Galeria out/g.png --frame=<30*k> (ou contact_sheet).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Props} from '../kit/tempo';
import {Desenho, Arte} from '../kit/arte';
import {ANIDOODLE} from '../kit/galeria-anidoodle';

export const HUASHU: {id: string; nome: string}[] = [
  ['01_cave', 'Pintura rupestre'], ['02_egypt', 'Mural egípcio'], ['03_greek', 'Vaso grego'], ['04_roman', 'Mosaico romano'],
  ['05_gothic', 'Vitral gótico'], ['06_renaissance', 'Renascimento'], ['08_impressionism', 'Impressionismo'], ['09_postimp', 'Pós-impressionismo (Van Gogh)'],
  ['10_nouveau', 'Art nouveau'], ['11_cubism', 'Cubismo'], ['12_bauhaus', 'Bauhaus'], ['13_pop', 'Pop art'], ['14_8bit', '8 bits'],
  ['15_raytrace', '3D realista'], ['16_2026', 'Interface 2026'], ['17_ink', 'Nanquim chinês'], ['18_klimt', 'Klimt (dourado)'], ['19_munch', 'Munch (expressionismo)'],
  ['20_dunhuang', 'Mural de Dunhuang'], ['21_kusama', 'Bolinhas (Kusama)'], ['22_constructivism', 'Construtivismo russo'], ['23_dali', 'Surrealismo (Dalí)'],
  ['24_hopper', 'Hopper (realismo americano)'], ['26_vaporwave', 'Vaporwave'], ['27_kirby', 'Quadrinho de ação (Kirby)'], ['28_monet', 'Monet'],
  ['29_seurat', 'Pontilhismo (Seurat)'], ['30_matisse', 'Recortes de Matisse'], ['31_haring', 'Keith Haring'], ['32_rembrandt', 'Rembrandt (claro-escuro)'],
  ['33_rubberhose', 'Desenho animado anos 30'], ['34_shadowpuppet', 'Teatro de sombras'], ['36_picasso_blue', 'Picasso (fase azul)'], ['38_giotto', 'Afresco (Giotto)'],
  ['39_piero', 'Piero della Francesca'], ['40_raphael', 'Rafael'], ['41_michelangelo', 'Michelangelo'], ['42_guardi', 'Veneza (Guardi)'],
  ['43_lorenzetti', 'Lorenzetti (medieval)'], ['44_cortona', 'Teto barroco (Cortona)'], ['45_renoir', 'Renoir'], ['46_pissarro', 'Pissarro'],
  ['47_sisley', 'Sisley'], ['48_gauguin', 'Gauguin'], ['49_chagall', 'Chagall'], ['50_ma_yuan', 'Paisagem Song (Ma Yuan)'],
  ['51_persian_miniature', 'Miniatura persa'], ['55_dunhuang', 'Dunhuang (versão 2)'],
].map(([id, nome]) => ({id, nome}));

export const ITENS = [
  ...ANIDOODLE.map((a) => ({motor: 'anidoodle' as const, ...a})),
  ...HUASHU.map((h) => ({motor: 'huashu' as const, ...h, film: undefined})),
];

export const Galeria: React.FC<Props> = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = Math.min(ITENS.length - 1, Math.floor(f / fps));
  const it = ITENS[k];
  const s = f / fps;
  return (
    <AbsoluteFill style={{background: '#111'}}>
      {it.motor === 'anidoodle'
        ? <Desenho key={it.id} film={it.film!} t0={-1e6} x={0} y={0} w={1920} h={980} />
        : <Arte key={it.id} cena={it.id} t0={s - 4.5} x={0} y={0} w={1920} h={980} />}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', color: '#fff', font: '600 48px Inter, sans-serif'}}>
        {`${k + 1}. ${it.nome}`}  <span style={{color: '#999', fontSize: 30}}>{`(${it.motor === 'anidoodle' ? 'A' : 'H'}·${it.id})`}</span>
      </div>
    </AbsoluteFill>
  );
};
