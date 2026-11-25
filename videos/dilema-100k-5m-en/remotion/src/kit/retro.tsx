// Kit do estilo retro (colagem retrô editorial): etiquetas recortadas, setas, checklist, riscar e trocar,
// cartão com foto ou vídeo, meio-tom, faixa diagonal, mão apontando, retrato que fala, câmera e legenda em recortes.
// Serve em qualquer estilo, mas foi desenhado para o `retro`.
//
// Diferença do resto do kit: aqui os componentes recebem `t` (segundo em que entram, vindo de at())
// em vez de `p`, e tocam um efeito sonoro na entrada (som={false} desliga). `ate` = segundo em que saem.
// Regra de sempre: cada elemento entra na palavra que o nomeia.
import React from 'react';
import {Audio, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Props, useSec, pop, prog, sai, lerp} from './tempo';
import {rasgado} from './componentes';

// ------------------------------------------------------------------ som
/** Efeitos que vêm em public/sfx/ (gerados por scripts/sfx.py, livres). */
export type NomeSom = 'pop' | 'papel' | 'rasgo' | 'whoosh' | 'clique' | 'carimbo' | 'risco' | 'digitar' | 'ding' | 'tique';
type SomProp = NomeSom | false;

/** Toca public/sfx/<nome>.wav no segundo t da cena. O render.py mistura com a voz. */
export const Som: React.FC<{nome: NomeSom | string; t: number; volume?: number}> = ({nome, t, volume = 0.5}) => {
  const {fps} = useVideoConfig();
  if (!(t >= 0) || !nome) return null;
  return (
    <Sequence from={Math.round(t * fps)} layout="none">
      <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
    </Sequence>
  );
};

// ---------------------------------------------------------------- cores
export type CorRetro = 'preto' | 'vermelho' | 'amarelo' | 'creme' | 'branco';
export const CORES: Record<CorRetro, {bg: string; fg: string}> = {
  preto: {bg: '#151515', fg: '#F4EEE2'},
  vermelho: {bg: '#C8202A', fg: '#FAF7F0'},
  amarelo: {bg: '#F2CF3B', fg: '#151515'},
  creme: {bg: '#F1E9D8', fg: '#151515'},
  branco: {bg: '#FAF7F0', fg: '#151515'},
};
export type FonteRetro = 'grossa' | 'slab' | 'maquina' | 'condensada';
export const FONTES: Record<FonteRetro, string> = {
  grossa: 'Archivo Black', slab: 'Alfa Slab One', maquina: 'Special Elite', condensada: 'Anton',
};
const SOMBRA = 'drop-shadow(7px 9px 0 rgba(0,0,0,0.32))';
type Ancora = 'esquerda' | 'centro' | 'direita';
const transX = (a: Ancora) => (a === 'esquerda' ? '0' : a === 'direita' ? '-100%' : '-50%');

/** 0 → 1 (com passada) na entrada; 1 → 0 na saída. */
const vida = (s: number, t: number, ate?: number, d = 0.4) =>
  (s < t ? 0 : pop(s, t, d)) * (ate === undefined ? 1 : sai(s, ate, 0.3));

// ------------------------------------------------------------- etiqueta
/**
 * Etiqueta de papel recortado (bilhete de sequestro): FORMATO, GANCHO, "ELA ESTUDA:".
 * (x, y) = centro (ou borda, com ancora) do topo da etiqueta. seta = ponto para onde a seta aponta.
 */
export const Etiqueta: React.FC<{t: number; ate?: number; x: number; y: number; ancora?: Ancora; cor?: CorRetro;
  fonte?: FonteRetro; size?: number; rot?: number; seed?: number; seta?: [number, number]; som?: SomProp;
  children: React.ReactNode}> =
  ({t, ate, x, y, ancora = 'centro', cor = 'preto', fonte = 'grossa', size = 64, rot = -2, seed = 3, seta, som = 'pop', children}) => {
    const s = useSec();
    const p = vida(s, t, ate);
    const c = CORES[cor];
    if (p <= 0 && s > t) return null;
    return (
      <>
        {som && <Som nome={som} t={t} />}
        {seta && <Seta t={t + 0.2} ate={ate} de={[x, y + size * 0.7]} para={seta} som={false} />}
        <div style={{position: 'absolute', left: x, top: y, opacity: Math.min(1, p * 2), filter: SOMBRA,
          transform: `translate(${transX(ancora)}, 0) rotate(${rot}deg) scale(${p})`, transformOrigin: '50% 50%'}}>
          <div style={{background: c.bg, color: c.fg, fontFamily: FONTES[fonte], fontSize: size, lineHeight: 1.05,
            padding: `${size * 0.14}px ${size * 0.32}px ${size * 0.12}px`, whiteSpace: 'pre', textTransform: 'uppercase',
            clipPath: rasgado(seed, 4, 14), letterSpacing: fonte === 'maquina' ? 1 : 0}}>{children}</div>
        </div>
      </>
    );
  };

// ----------------------------------------------------------------- seta
/** Seta grossa desenhada (entra se desenhando). de/para em px do quadro. curva: + para um lado, - para o outro. */
export const Seta: React.FC<{t: number; ate?: number; de: [number, number]; para: [number, number]; cor?: string;
  espessura?: number; curva?: number; som?: SomProp}> =
  ({t, ate, de, para, cor = '#151515', espessura = 11, curva = 0.18, som = 'whoosh'}) => {
    const s = useSec();
    const {width: W, height: H} = useVideoConfig();
    const p = prog(s, t, 0.35) * (ate === undefined ? 1 : sai(s, ate, 0.3));
    const [x0, y0] = de, [x1, y1] = para;
    const mx = (x0 + x1) / 2 - (y1 - y0) * curva, my = (y0 + y1) / 2 + (x1 - x0) * curva;
    // tangente no fim da curva quadrática
    const tx = x1 - mx, ty = y1 - my, L = Math.hypot(tx, ty) || 1;
    const ux = tx / L, uy = ty / L, cab = espessura * 3.2;
    const a1 = [x1 - ux * cab - uy * cab * 0.6, y1 - uy * cab + ux * cab * 0.6];
    const a2 = [x1 - ux * cab + uy * cab * 0.6, y1 - uy * cab - ux * cab * 0.6];
    if (p <= 0) return som ? <Som nome={som} t={t} volume={0.35} /> : null;
    return (
      <>
        {som && <Som nome={som} t={t} volume={0.35} />}
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: SOMBRA, pointerEvents: 'none'}}>
          <path d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} stroke={cor} strokeWidth={espessura} fill="none"
            strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          {p > 0.85 && <path d={`M ${a1[0]} ${a1[1]} L ${x1} ${y1} L ${a2[0]} ${a2[1]}`} stroke={cor} strokeWidth={espessura}
            fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={(p - 0.85) / 0.15} />}
        </svg>
      </>
    );
  };

// ------------------------------------------------------------ checklist
/**
 * Lista que cresce com ✓ em etiquetas: PESQUISA, ROTEIRO, PERSONAGEM...
 * itens[k] entra em t[k]. Grade de `colunas` a partir de (x, y), com leve desalinho de colagem.
 */
export const Checklist: React.FC<{t: number[]; ate?: number; itens: string[]; x: number; y: number; colunas?: number;
  largura?: number; linha?: number; size?: number; cores?: CorRetro[]; som?: SomProp}> =
  ({t, ate, itens, x, y, colunas = 2, largura = 470, linha = 104, size = 46,
    cores = ['creme', 'amarelo', 'creme', 'vermelho', 'branco', 'creme', 'amarelo', 'preto'], som = 'tique'}) => (
    <>
      {itens.map((item, k) => {
        const col = k % colunas, lin = Math.floor(k / colunas);
        const rot = [-2.5, 1.5, -1, 2.2, -1.8, 1][k % 6];
        const dx = [0, 18, -10, 12, 6, -14][k % 6];
        return (
          <Etiqueta key={k} t={t[k]} ate={ate} x={x + col * largura + dx} y={y + lin * linha} ancora="esquerda"
            cor={cores[k % cores.length]} fonte={k % 3 === 2 ? 'maquina' : 'grossa'} size={size} rot={rot} seed={k + 21} som={som}>
            {`✓ ${item}`}
          </Etiqueta>
        );
      })}
    </>
  );

// -------------------------------------------------------- riscar e trocar
/** Etiqueta que é riscada (tRisco) e trocada por outra que entra embaixo (tNovo): COPIAR → MODELAR. */
export const Riscar: React.FC<{t: number; tRisco: number; tNovo?: number; ate?: number; x: number; y: number;
  texto: string; novo?: string; cor?: CorRetro; corNovo?: CorRetro; size?: number; sizeNovo?: number}> =
  ({t, tRisco, tNovo, ate, x, y, texto, novo, cor = 'creme', corNovo = 'vermelho', size = 72, sizeNovo}) => {
    const s = useSec();
    const pr = prog(s, tRisco, 0.3) * (ate === undefined ? 1 : sai(s, ate, 0.3));
    const larg = texto.length * size * 0.72 + size * 0.7;
    return (
      <>
        <Etiqueta t={t} ate={ate} x={x} y={y} cor={cor} fonte="slab" size={size} rot={-3} seed={41}>{texto}</Etiqueta>
        <Som nome="risco" t={tRisco} volume={0.55} />
        <svg width={larg + 40} height={size * 1.6} style={{position: 'absolute', left: x - larg / 2 - 20, top: y - size * 0.1,
          overflow: 'visible', transform: 'rotate(-3deg)'}}>
          {[0.42, 0.62].map((k, i) => (
            <path key={i} d={`M 10 ${size * (k + 0.06 * i)} L ${larg + 30} ${size * (k - 0.08 + 0.05 * i)}`}
              stroke="#151515" strokeWidth={size * 0.11} strokeLinecap="round" pathLength={1} strokeDasharray="1 1"
              strokeDashoffset={1 - Math.max(0, Math.min(1, pr * 2 - i))} />
          ))}
        </svg>
        {novo && tNovo !== undefined && (
          <Etiqueta t={tNovo} ate={ate} x={x + size * 0.6} y={y + size * 1.35} cor={corNovo} fonte="grossa"
            size={sizeNovo ?? size * 1.1} rot={-6} seed={43} som="carimbo">{novo}</Etiqueta>
        )}
      </>
    );
  };

// ------------------------------------------------------------- meio-tom
/**
 * Deixa qualquer imagem ou vídeo com cara de impressão em meio-tom (pontos), em tinta preta sobre papel.
 * passo = tamanho da retícula (px). Para foto fixa, prefira gerar o PNG com scripts/gravura.py.
 */
export const MeioTom: React.FC<{w: number; h: number; passo?: number; children: React.ReactNode}> =
  ({w, h, passo = 7, children}) => (
    <div style={{width: w, height: h, mixBlendMode: 'multiply'}}>
      <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#fff',
        filter: 'contrast(16)', isolation: 'isolate'}}>
        <div style={{position: 'absolute', inset: 0, filter: `grayscale(1) blur(${passo * 0.18}px)`}}>{children}</div>
        <div style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay',
          backgroundImage: `radial-gradient(circle at center, #000 0, #fff ${passo * 0.7}px)`,
          backgroundSize: `${passo}px ${passo}px`}} />
      </div>
    </div>
  );

// ---------------------------------------------------------- cartão com foto
const ehVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);
/**
 * Cartão colado com fita: foto (png/jpg/svg) ou vídeo (mp4/webm, toca a partir da entrada, sem som).
 * (x, y) = canto de cima à esquerda da área da imagem; w × h = área da imagem. moldura: 'creme' ou 'preta'.
 */
export const CartaoFoto: React.FC<{t: number; ate?: number; x: number; y: number; w: number; h: number; src: string;
  rot?: number; fita?: boolean; moldura?: 'creme' | 'preta'; legenda?: string; meioTom?: boolean; ajuste?: 'cover' | 'contain';
  inicioVideo?: number; som?: SomProp}> =
  ({t, ate, x, y, w, h, src, rot = -3, fita = true, moldura = 'creme', legenda, meioTom = false, ajuste = 'cover',
    inicioVideo = 0, som = 'papel'}) => {
    const s = useSec();
    const {fps} = useVideoConfig();
    const pIn = s < t ? 0 : prog(s, t, 0.35);
    const pOut = ate === undefined ? 1 : sai(s, ate, 0.3);
    if (pIn <= 0) return som ? <Som nome={som} t={t} /> : null;
    const borda = 16;
    const midia = ehVideo(src) ? (
      <Sequence from={Math.round(t * fps)} layout="none">
        <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(inicioVideo * fps)}
          style={{width: w, height: h, objectFit: ajuste}} />
      </Sequence>
    ) : <Img src={staticFile(src)} style={{width: w, height: h, objectFit: ajuste}} />;
    return (
      <>
        {som && <Som nome={som} t={t} />}
        <div style={{position: 'absolute', left: x - borda, top: y - borda, opacity: pOut * Math.min(1, pIn * 3), filter: SOMBRA,
          transform: `translateY(${(1 - pIn) * 120}px) rotate(${lerp(rot - 8, rot, pIn)}deg) scale(${lerp(1.15, 1, pIn)})`}}>
          <div style={{background: moldura === 'creme' ? '#F4EEE2' : '#151515', padding: borda,
            paddingBottom: legenda ? borda + 54 : borda}}>
            <div style={{width: w, height: h, overflow: 'hidden', background: meioTom ? '#F4EEE2' : '#111'}}>
              {meioTom ? <MeioTom w={w} h={h}>{midia}</MeioTom> : midia}
            </div>
            {legenda && <div style={{position: 'absolute', left: 0, right: 0, bottom: 12, textAlign: 'center',
              fontFamily: FONTES.maquina, fontSize: 36, color: moldura === 'creme' ? '#151515' : '#F4EEE2'}}>{legenda}</div>}
          </div>
          {fita && <div style={{position: 'absolute', left: (w + 2 * borda) / 2 - 85, top: -24, width: 170, height: 50,
            background: '#E9DFC0', opacity: 0.88, transform: 'rotate(-4deg)', boxShadow: '0 2px 3px rgba(0,0,0,0.15)'}} />}
        </div>
      </>
    );
  };

// --------------------------------------------------------- faixa diagonal
/** Faixa diagonal que entra varrendo a tela (vermelha ou preta), atrás do conteúdo. Ponha antes dos outros elementos. */
export const Faixa: React.FC<{t: number; ate?: number; y: number; ang?: number; cor?: string; altura?: number;
  de?: 'esquerda' | 'direita'; som?: SomProp}> =
  ({t, ate, y, ang = -12, cor = '#C8202A', altura = 150, de = 'esquerda', som = 'whoosh'}) => {
    const s = useSec();
    const {width: W} = useVideoConfig();
    const p = s < t ? 0 : prog(s, t, 0.4);
    const pOut = ate === undefined ? 1 : sai(s, ate, 0.3);
    const dx = (1 - p) * W * 1.7 * (de === 'esquerda' ? -1 : 1);
    return (
      <>
        {som && <Som nome={som} t={t} volume={0.4} />}
        {p > 0 && <div style={{position: 'absolute', left: -W * 0.3, width: W * 1.6, top: y - altura / 2, height: altura,
          background: cor, opacity: pOut, transform: `rotate(${ang}deg) translateX(${dx}px)`, boxShadow: '0 10px 18px rgba(0,0,0,0.25)'}} />}
      </>
    );
  };

// ---------------------------------------------------------- mão apontando
/** Mão de gravura apontando. (x, y) = ponta do dedo; ang = direção em graus (0 = direita, 90 = para baixo). */
export const MaoAponta: React.FC<{t: number; ate?: number; x: number; y: number; ang?: number; tamanho?: number;
  balanco?: boolean; som?: SomProp}> =
  ({t, ate, x, y, ang = 0, tamanho = 300, balanco = true, som = 'pop'}) => {
    const s = useSec();
    const p = vida(s, t, ate);
    if (p <= 0) return som ? <Som nome={som} t={t} volume={0.35} /> : null;
    const k = tamanho / 400;
    const vai = balanco ? Math.sin((s - t) * 7) * 10 : 0;
    const espelha = ang > 90 || ang < -90;      // apontando para a esquerda: espelha para a mão não ficar de cabeça para baixo
    const rot = espelha ? ang - 180 : ang;
    return (
      <>
        {som && <Som nome={som} t={t} volume={0.35} />}
        <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0,
          transform: `rotate(${rot}deg) translateX(${(espelha ? 1 : -1) * (vai - (1 - p) * 120)}px)`}}>
          <Img src={staticFile('retro/mao.svg')} style={{position: 'absolute', width: 400 * k, height: 210 * k,
            left: espelha ? -15 * k : -385 * k, top: -74 * k, opacity: Math.min(1, p * 2), filter: SOMBRA,
            transform: espelha ? 'scaleX(-1)' : undefined}} />
        </div>
      </>
    );
  };

// ---------------------------------------------------------- retrato que fala
export type Boca = {y: number; y1: number; x0: number; x1: number};
const silabas = (w: string) => Math.max(1, (w.toLowerCase().match(/[aeiouáéíóúâêôãõà]+/g) || []).length);

/** Abertura da boca (0 a 1) no segundo s: pelo volume da voz, se o JSON trouxer; senão, pelas sílabas de cada palavra. */
export const aberturaBoca = (props: Props, s: number, falas?: number[]) => {
  const ativas = (falas ?? props.falas.map((_, i) => i + 1)).map((i) => props.falas[i - 1]).filter(Boolean);
  const f = ativas.find((q) => s >= q.inicio && s <= q.inicio + q.duracao);
  if (!f) return 0;
  if (props.volume && props.volume.length) {
    const v = props.volume[Math.min(props.volume.length - 1, Math.floor(s * (props.volume_fps ?? 30)))] ?? 0;
    return Math.max(0, Math.min(1, (v - 0.06) / 0.55));
  }
  const ws = f.palavras;
  for (let i = ws.length - 1; i >= 0; i--) {
    const [w, t0] = ws[i];
    if (s >= t0) {
      const fim = Math.min(i + 1 < ws.length ? ws[i + 1][1] : f.inicio + f.duracao, t0 + 0.7);
      if (s > fim) return 0;
      const fase = ((s - t0) / Math.max(0.05, fim - t0)) * silabas(w);
      return Math.abs(Math.sin(Math.PI * fase)) * 0.9;
    }
  }
  return 0;
};

/**
 * Retrato recortado (gravura) cujo queixo mexe no ritmo da voz, como fantoche de papel.
 * src = imagem em public/ (padrão: o cavalheiro da skill). boca = retângulo que mexe, em frações da imagem
 * (y = linha da boca, y1 = fim do queixo, x0..x1 = largura). proporcao = altura/largura da imagem.
 * falas = quais falas da cena ele diz (padrão: todas).
 */
export const RetratoFalante: React.FC<{t: number; ate?: number; props: Props; x: number; y: number; largura: number;
  src?: string; proporcao?: number; boca?: Boca; abertura?: number; falas?: number[]; rot?: number; som?: SomProp}> =
  ({t, ate, props, x, y, largura, src = 'retro/cavalheiro.svg', proporcao = 760 / 600,
    boca = {y: 0.58, y1: 0.75, x0: 0.34, x1: 0.66}, abertura = 0.045, falas, rot = 0, som = 'papel'}) => {
    const s = useSec();
    const p = vida(s, t, ate, 0.45);
    if (p <= 0) return som ? <Som nome={som} t={t} /> : null;
    const W = largura, H = largura * proporcao;
    const a = aberturaBoca(props, s, falas) * abertura * H;
    const pc = (v: number) => `${(v * 100).toFixed(2)}%`;
    const buraco = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${pc(boca.x0)} ${pc(boca.y)}, ${pc(boca.x1)} ${pc(boca.y)}, ${pc(boca.x1)} ${pc(boca.y1)}, ${pc(boca.x0)} ${pc(boca.y1)}, ${pc(boca.x0)} ${pc(boca.y)})`;
    const queixo = `inset(${pc(boca.y)} ${pc(1 - boca.x1)} ${pc(1 - boca.y1)} ${pc(boca.x0)})`;
    const img = {position: 'absolute' as const, left: 0, top: 0, width: W, height: H};
    return (
      <>
        {som && <Som nome={som} t={t} />}
        <div style={{position: 'absolute', left: x, top: y, width: W, height: H, filter: SOMBRA,
          transform: `rotate(${rot}deg) scale(${p})`, transformOrigin: '50% 100%', opacity: Math.min(1, p * 2)}}>
          <div style={{position: 'absolute', left: W * (boca.x0 + 0.03), width: W * (boca.x1 - boca.x0 - 0.06),
            top: H * boca.y - 2, height: a + 4, background: '#2A0F0C', borderRadius: '0 0 40% 40%'}} />
          <Img src={staticFile(src)} style={{...img, clipPath: queixo, transform: `translateY(${a}px)`}} />
          <Img src={staticFile(src)} style={{...img, clipPath: buraco}} />
        </div>
      </>
    );
  };

// ----------------------------------------------------------------- câmera
/**
 * Tremor leve e "soco" de zoom nas batidas (segundos), como no vídeo editado à mão. Envolve o conteúdo.
 * tremor = amplitude em px (0 desliga).
 */
export const Camera: React.FC<{batidas?: number[]; tremor?: number; children: React.ReactNode}> =
  ({batidas = [], tremor = 3, children}) => {
    const s = useSec();
    const ultima = [...batidas].reverse().find((b) => b <= s);
    const soco = ultima === undefined ? 0 : 0.035 * Math.exp(-(s - ultima) * 9);
    const dx = tremor * (Math.sin(s * 13.1) + 0.6 * Math.sin(s * 29.7));
    const dy = tremor * (Math.cos(s * 11.3) + 0.6 * Math.sin(s * 23.9));
    return (
      <div style={{position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${1 + soco})`}}>
        {children}
      </div>
    );
  };

// ------------------------------------------------------- legenda em recortes
/**
 * Legenda tipo bilhete recortado: 2 ou 3 palavras por vez, cada uma num papel; as palavras entram quando
 * são ditas e a palavra falada fica no papel vermelho. y = topo da linha (px). No anúncio de story,
 * deixe acima do botão "Saiba mais" (y ≈ 1450 no 1080x1920).
 */
export const LegendaRecortes: React.FC<{props: Props; y?: number; size?: number; max?: number}> =
  ({props, y = 1450, size = 58, max = 3}) => {
    const s = useSec();
    const blocos: [string, number][][] = [];
    for (const f of props.falas) {
      let cur: [string, number][] = [];
      for (const w of f.palavras) {
        const txt = [...cur.map((c) => c[0]), w[0]].join(' ');
        if (cur.length && (cur.length >= max || txt.length > 18)) { blocos.push(cur); cur = []; }
        cur.push(w);
        if (/[.,?!:;]$/.test(w[0])) { blocos.push(cur); cur = []; }
      }
      if (cur.length) blocos.push(cur);
    }
    const fala = props.falas.find((f) => s >= f.inicio - 0.05 && s <= f.inicio + f.duracao + 0.25);
    const atual = [...blocos].reverse().find((b) => b[0][1] <= s + 0.02);
    if (!fala || !atual) return null;
    const ditas = atual.filter(([, t]) => t <= s + 0.02);
    const base: CorRetro[] = ['creme', 'branco', 'preto'];
    return (
      <div style={{position: 'absolute', left: 30, right: 30, top: y, display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
        {ditas.map(([w, t], k) => {
          const ativa = k === ditas.length - 1;
          const c = CORES[ativa ? 'vermelho' : base[(Math.round(t * 7) + k) % base.length]];
          const pk = pop(s, t, 0.18);
          return (
            <div key={`${w}-${t}`} style={{filter: 'drop-shadow(5px 6px 0 rgba(0,0,0,0.3))',
              transform: `rotate(${[-2.5, 1.8, -1.2, 2.4][k % 4]}deg) scale(${pk})`}}>
              <div style={{background: c.bg, color: c.fg, fontFamily: k % 2 ? FONTES.maquina : FONTES.slab,
                fontSize: size * (k % 2 ? 0.92 : 1), padding: `${size * 0.1}px ${size * 0.22}px`, textTransform: 'uppercase',
                clipPath: rasgado(k + Math.round(t * 10), 4, 10), whiteSpace: 'pre'}}>
                {w.replace(/[.,;:]$/, '')}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
