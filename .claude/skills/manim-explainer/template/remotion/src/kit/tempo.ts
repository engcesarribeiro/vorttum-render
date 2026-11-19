// Tempo da voz dentro de uma cena Remotion.
// O Manim gera a voz (Thalita) e grava os tempos em media/remotion/<Cena>.json;
// o render.py passa esse arquivo como props. Tudo aqui é relativo ao início da cena.
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type Fala = {texto: string; inicio: number; duracao: number; palavras: [string, number][]};
export type Props = {
  cena: string;
  composicao: string;
  estilo: string;
  duracao: number;
  fps: number;
  largura: number;
  altura: number;
  vertical: boolean;
  falas: Fala[];
  volume?: number[];        // volume da voz (0 a 1) na cena toda, volume_fps valores por segundo (boca do RetratoFalante)
  volume_fps?: number;
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]/g, '');

/** Segundos desde o início da cena. */
export const useSec = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

/**
 * Momento (s) em que a palavra é dita. fala = 1, 2, ... (ordem do FALAS da cena);
 * nth = ocorrência na fala (1 = primeira); d = deslocamento em segundos.
 * Palavra que não está na fala quebra o render (mesma regra do wait_until no Manim).
 */
export function at(p: Props, palavra: string, fala = 1, nth = 1, d = 0): number {
  const f = p.falas[fala - 1];
  if (!f) throw new Error(`fala ${fala} não existe nesta cena (${p.cena})`);
  const alvo = norm(palavra);
  let hits = f.palavras.filter(([w]) => norm(w) === alvo).map(([, t]) => t);
  if (!hits.length) hits = f.palavras.filter(([w]) => norm(w).startsWith(alvo)).map(([, t]) => t);
  if (hits.length < nth) throw new Error(`fala ${fala}: palavra "${palavra}" (#${nth}) não está na narração`);
  return hits[nth - 1] + d;
}

/** Início da fala (s). */
export const inicioFala = (p: Props, fala: number, d = 0) => p.falas[fala - 1].inicio + d;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0 → 1 entre t0 e t0 + d (entrada suave). */
export const prog = (s: number, t0: number, d = 0.5, ease = Easing.out(Easing.cubic)) =>
  interpolate(s, [t0, t0 + d], [0, 1], {...clamp, easing: ease});
/** 0 → 1 passando um pouco do ponto (entrada "pop"). */
export const pop = (s: number, t0: number, d = 0.45) => prog(s, t0, d, Easing.out(Easing.back(1.8)));
/** 1 → 0 (saída). */
export const sai = (s: number, t0: number, d = 0.4) => 1 - prog(s, t0, d, Easing.in(Easing.cubic));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
