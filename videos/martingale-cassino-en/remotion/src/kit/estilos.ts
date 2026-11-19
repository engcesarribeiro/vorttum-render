// Mesmas paletas e fontes do estilos.py (cenas Manim e Remotion combinam no mesmo vídeo).
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/bangers/400.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/abril-fatface/400.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/josefin-sans/400.css';
import '@fontsource/josefin-sans/700.css';
import '@fontsource/architects-daughter/400.css';
import '@fontsource/cabin-sketch/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/monoton/400.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/luckiest-guy/400.css';
import '@fontsource/alfa-slab-one/400.css';
import '@fontsource/anton/400.css';

export type Paleta = {
  BG: string; INK: string; MUTED: string; C1: string; C2: string; GOLD: string; BAD: string; GOOD: string;
  P_GOLD: string; P_C1: string; P_C2: string; PAINEL: string; BORDA: string;
};
export type Estilo = {
  nome: string;
  cor: Paleta;
  fonteTexto: string;
  fonteTitulo: string;
  pesoTexto: number;
  caixaAlta: boolean;       // texto de apoio
  tituloCaixaAlta: boolean;
  tituloCor?: string;
  cantos: number;           // raio dos cantos (px, no quadro de 1080)
  sombra: boolean;          // recorte com sombra (colagem)
  extra: Record<string, any>;
  base?: string;            // variante de marca: usa o fundo e o título deste estilo (ver variante())
};

/** Estilo cujo desenho de fundo/título a cena usa (o próprio nome, se não for variante). */
export const tipo = (e: Estilo) => e.base ?? e.nome;

export const ESTILOS: Record<string, Estilo> = {
  documentario: {
    nome: 'documentario',
    cor: {BG: '#0B1016', INK: '#E8E6E1', MUTED: '#8A9099', C1: '#29B6F6', C2: '#FF7043', GOLD: '#F5B82E',
      BAD: '#EF5350', GOOD: '#66BB6A', P_GOLD: '#2E2511', P_C1: '#0D2433', P_C2: '#36190E', PAINEL: '#16202B', BORDA: '#2C3A4A'},
    fonteTexto: 'Inter', fonteTitulo: 'Inter', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 18, sombra: false, extra: {},
  },
  quadro: {
    nome: 'quadro',
    cor: {BG: '#FFFFFF', INK: '#1E1E1E', MUTED: '#6B6B6B', C1: '#1E78C8', C2: '#E65100', GOLD: '#B8860B',
      BAD: '#C62828', GOOD: '#2E7D32', P_GOLD: '#FFF4D1', P_C1: '#E1EFFB', P_C2: '#FFE7D9', PAINEL: '#F6F5F1', BORDA: '#1E1E1E'},
    fonteTexto: 'Kalam', fonteTitulo: 'Bangers', pesoTexto: 700, caixaAlta: true, tituloCaixaAlta: true,
    tituloCor: '#E5332A', cantos: 18, sombra: false, extra: {},
  },
  papel: {
    nome: 'papel',
    cor: {BG: '#FBF7EE', INK: '#1F2E4A', MUTED: '#7A8499', C1: '#2D6CDF', C2: '#E0662A', GOLD: '#B57A00',
      BAD: '#C8312F', GOOD: '#2F8A4C', P_GOLD: '#FFF1B8', P_C1: '#DDEAFF', P_C2: '#FFE2D1', PAINEL: '#FFFDF7', BORDA: '#1F2E4A'},
    fonteTexto: 'Caveat', fonteTitulo: 'Caveat', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 14, sombra: false, extra: {pauta: '#B9CDE6', margem: '#E58A8A'},
  },
  colagem: {
    nome: 'colagem',
    cor: {BG: '#E6D8BE', INK: '#1A1A1A', MUTED: '#6E6253', C1: '#1F5FAF', C2: '#D9481C', GOLD: '#A0690A',
      BAD: '#B3261E', GOOD: '#3A7A2F', P_GOLD: '#F6E3A1', P_C1: '#CFE0F5', P_C2: '#F6CDB8', PAINEL: '#FBF7EF', BORDA: '#1A1A1A'},
    fonteTexto: 'Special Elite', fonteTitulo: 'Abril Fatface', pesoTexto: 400, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 0, sombra: true, extra: {recortes: ['#1A1A1A', '#D9481C', '#F4EDE0', '#1F5FAF', '#E9C46A'], fita: '#EFE3B0'},
  },
  // colagem retrô editorial: kraft, tiras de jornal antigo, faixas diagonais, gravuras em meio-tom e
  // etiquetas tipo bilhete recortado (preto, vermelho, amarelo, creme). Componentes em kit/retro.tsx.
  retro: {
    nome: 'retro',
    cor: {BG: '#B8986F', INK: '#141414', MUTED: '#4A3F33', C1: '#A3161D', C2: '#1D3F66', GOLD: '#4A2F00',
      BAD: '#9E1B1B', GOOD: '#2F5A2F', P_GOLD: '#F2CF3B', P_C1: '#F3D9D5', P_C2: '#D5DEEA', PAINEL: '#F1E9D8', BORDA: '#141414'},
    fonteTexto: 'Special Elite', fonteTitulo: 'Archivo Black', pesoTexto: 400, caixaAlta: false, tituloCaixaAlta: true,
    cantos: 0, sombra: true,
    extra: {
      preto: '#151515', vermelho: '#C8202A', amarelo: '#F2CF3B', creme: '#F1E9D8', branco: '#FAF7F0', fita: '#E9DFC0',
      recortes: ['#151515', '#C8202A', '#F1E9D8', '#F2CF3B'],
      fontesRecorte: ['Archivo Black', 'Alfa Slab One', 'Special Elite', 'Anton'],
      kraft: 'retro/kraft.jpg', jornal: ['retro/jornal_1.png', 'retro/jornal_2.png'],
    },
  },
  bauhaus: {
    nome: 'bauhaus',
    cor: {BG: '#F1EADA', INK: '#141414', MUTED: '#6F6A60', C1: '#1D4FA0', C2: '#D03A2B', GOLD: '#B07A00',
      BAD: '#9E1B1B', GOOD: '#2D6B35', P_GOLD: '#F7DC7A', P_C1: '#D3DDF0', P_C2: '#F3CDC6', PAINEL: '#FAF6EC', BORDA: '#141414'},
    fonteTexto: 'Josefin Sans', fonteTitulo: 'Josefin Sans', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: true,
    cantos: 0, sombra: false, extra: {amarelo: '#F2B705', vermelho: '#D03A2B', azul: '#1D4FA0', preto: '#141414'},
  },
  blueprint: {
    nome: 'blueprint',
    cor: {BG: '#0F3D6E', INK: '#EAF2FF', MUTED: '#9DB9DA', C1: '#7FD3FF', C2: '#FFB36B', GOLD: '#FFE08A',
      BAD: '#FF8A80', GOOD: '#A5E8A0', P_GOLD: '#2D4A5E', P_C1: '#164E80', P_C2: '#3B4A5E', PAINEL: '#124576', BORDA: '#EAF2FF'},
    fonteTexto: 'Architects Daughter', fonteTitulo: 'Architects Daughter', pesoTexto: 400, caixaAlta: true, tituloCaixaAlta: true,
    cantos: 0, sombra: false, extra: {grade: '#FFFFFF'},
  },
  lousa: {
    nome: 'lousa',
    cor: {BG: '#22382E', INK: '#F2F0E6', MUTED: '#B9C2B6', C1: '#8EC9F0', C2: '#F5A86E', GOLD: '#F3D46B',
      BAD: '#F08A8A', GOOD: '#A6E3A1', P_GOLD: '#3B4A33', P_C1: '#2A4A4A', P_C2: '#45422F', PAINEL: '#284035', BORDA: '#F2F0E6'},
    fonteTexto: 'Kalam', fonteTitulo: 'Cabin Sketch', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    tituloCor: '#F2F0E6', cantos: 14, sombra: false, extra: {moldura: '#7A5230', moldura_borda: '#4E321C'},
  },
  darkui: {
    nome: 'darkui',
    cor: {BG: '#0B0E14', INK: '#EEF1F6', MUTED: '#8C96A8', C1: '#5B9DFF', C2: '#FF8A5B', GOLD: '#FFC857',
      BAD: '#FF5C7A', GOOD: '#4ADE80', P_GOLD: '#2A2416', P_C1: '#14223D', P_C2: '#2D1A14', PAINEL: 'rgba(26,33,50,0.72)', BORDA: '#3A4560'},
    fonteTexto: 'Inter', fonteTitulo: 'Inter', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 28, sombra: false, extra: {brilhos: ['#5B9DFF', '#A855F7', '#FF8A5B'], vidro: true},
  },
  terminal: {
    nome: 'terminal',
    cor: {BG: '#0D1117', INK: '#E6EDF3', MUTED: '#7D8590', C1: '#79C0FF', C2: '#FFA657', GOLD: '#E3B341',
      BAD: '#FF7B72', GOOD: '#7EE787', P_GOLD: '#2A2310', P_C1: '#0F2338', P_C2: '#2E1D0E', PAINEL: '#161B22', BORDA: '#30363D'},
    fonteTexto: 'JetBrains Mono', fonteTitulo: 'JetBrains Mono', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 8, sombra: false, extra: {barra: '#21262D', botoes: ['#FF5F57', '#FEBC2E', '#28C840'], digitar: true},
  },
  recorte: {
    nome: 'recorte',
    cor: {BG: '#CFE8F3', INK: '#2B2D42', MUTED: '#5C677D', C1: '#2F6FDB', C2: '#F2601C', GOLD: '#B57A00',
      BAD: '#D62828', GOOD: '#21867A', P_GOLD: '#FFF0BF', P_C1: '#DCE8FF', P_C2: '#FFE1D1', PAINEL: '#FFFFFF', BORDA: '#2B2D42'},
    fonteTexto: 'Fredoka', fonteTitulo: 'Luckiest Guy', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 36, sombra: true, extra: {camadas: ['#8BC34A', '#6FA83A', '#4E8A2E'], nuvem: '#FFFFFF', faixa: '#F2601C'},
  },
  jornal: {
    nome: 'jornal',
    cor: {BG: '#F3EBDD', INK: '#1B1B1B', MUTED: '#6B645A', C1: '#2C4A7A', C2: '#A63D2A', GOLD: '#7A5A12',
      BAD: '#8B1E1E', GOOD: '#2F5A2F', P_GOLD: '#EADBB4', P_C1: '#D9DFEA', P_C2: '#EBD3CC', PAINEL: '#F8F2E6', BORDA: '#1B1B1B'},
    fonteTexto: 'Libre Baskerville', fonteTitulo: 'Playfair Display', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: false,
    cantos: 0, sombra: false, extra: {cabecalho: 'EDIÇÃO EXTRA'},
  },
  neon: {
    nome: 'neon',
    cor: {BG: '#0A0612', INK: '#F5E9FF', MUTED: '#A08CB8', C1: '#29E7FF', C2: '#FF4FD8', GOLD: '#FFE45E',
      BAD: '#FF5470', GOOD: '#5CFF9D', P_GOLD: '#2B2410', P_C1: '#0B2630', P_C2: '#2E0F2A', PAINEL: '#140B22', BORDA: '#FF4FD8'},
    fonteTexto: 'Orbitron', fonteTitulo: 'Monoton', pesoTexto: 700, caixaAlta: false, tituloCaixaAlta: true,
    tituloCor: '#FF4FD8', cantos: 16, sombra: false, extra: {chao: '#FF4FD8', sol: '#FFE45E', brilho: true},
  },
};

/**
 * Variante de marca: mesmo desenho do estilo `base`, com outras cores, fontes e extras.
 * extra.fundo = imagem em public/ (ex.: 'marca/papel.jpg') que cobre o quadro atrás de tudo.
 */
export const variante = (nome: string, base: string, mud: Partial<Omit<Estilo, 'cor'>> & {cor?: Partial<Paleta>} = {}): Estilo => {
  const b = ESTILOS[base];
  const e: Estilo = {...b, ...mud, nome, base: tipo(b), cor: {...b.cor, ...(mud.cor ?? {})}, extra: {...b.extra, ...(mud.extra ?? {})}};
  ESTILOS[nome] = e;
  return e;
};

export const estilo = (nome: string): Estilo => {
  const e = ESTILOS[nome];
  if (!e) throw new Error(`estilo "${nome}" não existe. Opções: ${Object.keys(ESTILOS).join(', ')}`);
  return e;
};

/** Fundo de caixa de destaque para cada cor do texto. */
export const tinta = (e: Estilo, cor: string) =>
  cor === e.cor.C1 ? e.cor.P_C1 : cor === e.cor.C2 ? e.cor.P_C2 : cor === e.cor.GOLD ? e.cor.P_GOLD : e.cor.PAINEL;

/** Halo neon (text-shadow) quando o estilo pede brilho. */
export const halo = (e: Estilo, cor: string) =>
  e.extra.brilho ? `0 0 6px ${cor}, 0 0 18px ${cor}99, 0 0 36px ${cor}55` : undefined;
