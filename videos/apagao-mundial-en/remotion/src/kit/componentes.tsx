// Peças prontas para montar cenas no Remotion em qualquer estilo.
// Coordenadas em px do quadro de 1080x1920 (vertical) ou 1920x1080 (horizontal).
// Regra da skill vale aqui também: cada elemento entra na palavra que o nomeia (use at()).
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import rough from 'roughjs';
import {Estilo, tinta, halo, tipo} from './estilos';
import {lerp} from './tempo';

// ---------------------------------------------------------------- fontes
const FONTES = [
  '400 48px "Inter"', '700 48px "Inter"', '800 48px "Inter"', '400 48px "Kalam"', '700 48px "Kalam"',
  '48px "Bangers"', '400 48px "Caveat"', '700 48px "Caveat"', '48px "Special Elite"', '48px "Abril Fatface"',
  '48px "Archivo Black"', '400 48px "Josefin Sans"', '700 48px "Josefin Sans"', '48px "Architects Daughter"',
  '700 48px "Cabin Sketch"', '400 48px "JetBrains Mono"', '700 48px "JetBrains Mono"', '700 48px "Playfair Display"',
  '900 48px "Playfair Display"', '400 48px "Libre Baskerville"', '700 48px "Libre Baskerville"', '48px "Monoton"',
  '400 48px "Orbitron"', '700 48px "Orbitron"', '500 48px "Fredoka"', '700 48px "Fredoka"', '48px "Luckiest Guy"',
  '48px "Alfa Slab One"', '48px "Anton"',
];

/** Segura o render até as fontes carregarem (chame no começo de toda cena). */
export const useFontes = () => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    Promise.all(FONTES.map((f) => document.fonts.load(f)))
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};

// ------------------------------------------------------------ utilidades
/** Polígono de papel rasgado (bordas de cima e de baixo irregulares), em % para clip-path. */
export const rasgado = (seed: number, amp = 2.2, passos = 18) => {
  let x = seed * 9301 + 49297;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= passos; i++) {
    const px = (i / passos) * 100;
    top.push(`${px}% ${rnd() * amp}%`);
    bot.push(`${100 - px}% ${100 - rnd() * amp}%`);
  }
  return `polygon(${[...top, ...bot].join(',')})`;
};

const gen = rough.generator();
export type Forma = {d: string; stroke: string; strokeWidth: number; fill?: string}[];
/** Converte um desenho do rough.js (traço "à mão") em caminhos SVG. Ex.: rascunho(gen.circle(540, 900, 400, {...})) */
export const rascunho = (drawable: any): Forma =>
  gen.toPaths(drawable).map((p: any) => ({d: p.d, stroke: p.stroke, strokeWidth: p.strokeWidth, fill: p.fill}));
export {gen as rough};

// ---------------------------------------------------------------- palco
/** Fundo e enfeites fixos do estilo (pauta do caderno, papel kraft, formas Bauhaus, moldura do quadro). */
export type FaixaFundo = {cor: string; y: number; ang?: number; altura?: number};
/**
 * faixas: só no estilo retro, faixas diagonais fixas atrás do conteúdo (padrão: uma vermelha no meio).
 * Para faixa que entra animada, use <Faixa> do kit/retro.tsx.
 */
export const Palco: React.FC<{e: Estilo; faixas?: FaixaFundo[]; children?: React.ReactNode}> = ({e, faixas, children}) => {
  const {width: W, height: H} = useVideoConfig();
  const vertical = H > W;
  const c = e.cor;
  let decor: React.ReactNode = null;

  if (tipo(e) === 'quadro') {
    decor = <div style={{position: 'absolute', inset: 14, border: `26px solid ${c.INK}`, borderRadius: 44}} />;
  } else if (tipo(e) === 'papel') {
    const linhas = [];
    for (let y = vertical ? 240 : 150; y < H; y += vertical ? 74 : 68) linhas.push(y);
    decor = (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {linhas.map((y) => <line key={y} x1={0} x2={W} y1={y} y2={y} stroke={e.extra.pauta} strokeWidth={2.5} opacity={0.75} />)}
        <line x1={vertical ? 68 : 130} x2={vertical ? 68 : 130} y1={0} y2={H} stroke={e.extra.margem} strokeWidth={3.5} opacity={0.8} />
        {[0.2, 0.5, 0.8].map((k) => <circle key={k} cx={30} cy={H * k} r={15} fill="#E8E1D0" stroke={c.MUTED} strokeOpacity={0.5} />)}
      </svg>
    );
  } else if (tipo(e) === 'colagem') {
    const cs = e.extra.recortes;
    const pontos = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) pontos.push([W - 40 - i * 27, 40 + j * 27, Math.min(9, 4 + (i + j) * 0.6)]);
    const tira = (style: React.CSSProperties, cor: string, seed: number) => (
      <div style={{position: 'absolute', background: cor, clipPath: rasgado(seed, 14, 26), ...style}} />
    );
    decor = (
      <>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {pontos.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} fill={cs[1]} opacity={0.35} />)}
        </svg>
        {vertical ? (
          <>
            {tira({left: -20, top: 40, width: W * 0.9, height: 78, transform: 'rotate(-2deg)'}, cs[3], 1)}
            {tira({right: -30, bottom: 120, width: W * 0.75, height: 64, transform: 'rotate(3deg)'}, cs[4], 2)}
            {tira({left: -20, bottom: 50, width: W * 0.6, height: 50, transform: 'rotate(-3deg)'}, cs[0], 3)}
          </>
        ) : (
          <>
            {tira({left: 60, bottom: 0, width: W * 0.35, height: 56, transform: 'rotate(-3deg)'}, cs[3], 1)}
            {tira({right: 80, bottom: 0, width: W * 0.25, height: 46, transform: 'rotate(3deg)'}, cs[4], 2)}
          </>
        )}
      </>
    );
  } else if (tipo(e) === 'retro') {
    const x = e.extra;
    const fx: FaixaFundo[] = faixas ?? [{cor: x.vermelho, y: vertical ? 1120 : 640, ang: -12}];
    const tiraJornal = (src: string, style: React.CSSProperties) => (
      <Img src={staticFile(src)} style={{position: 'absolute', filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.35))', ...style}} />
    );
    decor = (
      <>
        <Img src={staticFile(x.kraft)} style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover'}} />
        {fx.map((f, k) => (
          <div key={k} style={{position: 'absolute', left: -W * 0.3, width: W * 1.6, top: f.y - (f.altura ?? 150) / 2,
            height: f.altura ?? 150, background: f.cor, transform: `rotate(${f.ang ?? -12}deg)`,
            boxShadow: '0 10px 18px rgba(0,0,0,0.25)'}} />
        ))}
        {vertical ? (
          <>
            {tiraJornal(x.jornal[0], {left: -90, top: -150, width: W + 200, transform: 'rotate(-1.6deg)'})}
            {tiraJornal(x.jornal[1], {left: -110, bottom: -190, width: W + 220, transform: 'rotate(1.4deg)'})}
          </>
        ) : (
          <>
            {tiraJornal(x.jornal[0], {left: -60, top: -150, width: W * 0.75, transform: 'rotate(-1.2deg)'})}
            {tiraJornal(x.jornal[1], {right: -60, bottom: -170, width: W * 0.7, transform: 'rotate(1.4deg)'})}
          </>
        )}
      </>
    );
  } else if (tipo(e) === 'bauhaus') {
    const x = e.extra;
    decor = vertical ? (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={W - 75} cy={45} r={182} fill={x.amarelo} />
        <rect x={0} y={128} width={W * 0.55} height={30} fill={x.preto} />
        <path d={`M 0 ${H} L 0 ${H - 216} A 216 216 0 0 1 216 ${H} Z`} fill={x.vermelho} />
        <polygon points={`${W - 122},${H - 210} ${W - 34},${H - 60} ${W - 210},${H - 60}`} fill={x.azul} />
        <line x1={270} x2={W - 245} y1={H - 75} y2={H - 75} stroke={x.preto} strokeWidth={7} />
      </svg>
    ) : (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={W + 27} cy={-27} r={122} fill={x.amarelo} />
        <path d={`M 0 ${H} L 0 ${H - 135} A 135 135 0 0 1 135 ${H} Z`} fill={x.vermelho} />
        <rect x={W - 22} y={H * 0.6} width={22} height={H * 0.4} fill={x.azul} />
      </svg>
    );
  } else if (tipo(e) === 'blueprint') {
    const linhas = [];
    const passo = W / 32;
    for (let k = 0, x = 0; x <= W; k++, x += passo) linhas.push(<line key={'v' + k} x1={x} x2={x} y1={0} y2={H} stroke="#fff" strokeOpacity={k % 4 ? 0.09 : 0.22} strokeWidth={k % 4 ? 1 : 2.5} />);
    for (let k = 0, y = 0; y <= H; k++, y += passo) linhas.push(<line key={'h' + k} x1={0} x2={W} y1={y} y2={y} stroke="#fff" strokeOpacity={k % 4 ? 0.09 : 0.22} strokeWidth={k % 4 ? 1 : 2.5} />);
    decor = (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {linhas}
        <rect x={20} y={20} width={W - 40} height={H - 40} fill="none" stroke={c.INK} strokeOpacity={0.8} strokeWidth={4} />
      </svg>
    );
  } else if (tipo(e) === 'lousa') {
    decor = (
      <>
        <div style={{position: 'absolute', inset: 0, background:
          'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.05), transparent 40%), radial-gradient(ellipse at 70% 75%, rgba(255,255,255,0.04), transparent 45%)'}} />
        <div style={{position: 'absolute', inset: 0, border: `34px solid ${e.extra.moldura}`, boxShadow: `inset 0 0 0 5px ${e.extra.moldura_borda}`}} />
      </>
    );
  } else if (tipo(e) === 'darkui') {
    const [b1, b2, b3] = e.extra.brilhos;
    decor = (
      <>
        <div style={{position: 'absolute', inset: 0, background:
          `radial-gradient(circle at 12% 14%, ${b1}33, transparent 32%), radial-gradient(circle at 92% 48%, ${b2}2e, transparent 30%), radial-gradient(circle at 30% 92%, ${b3}29, transparent 30%)`}} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${c.INK}20 1.6px, transparent 1.6px)`, backgroundSize: '68px 68px'}} />
      </>
    );
  } else if (tipo(e) === 'terminal') {
    const top = vertical ? 170 : 0;
    decor = (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, top, height: 68, background: e.extra.barra, display: 'flex', alignItems: 'center'}}>
          {e.extra.botoes.map((b: string, k: number) => <div key={k} style={{width: 20, height: 20, borderRadius: 10, background: b, marginLeft: k ? 14 : 40}} />)}
          <div style={{position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 24, color: c.MUTED}}>aula.sh</div>
        </div>
        <div style={{position: 'absolute', left: 60, bottom: vertical ? 310 : 40, fontFamily: 'JetBrains Mono', fontSize: 30, color: c.GOOD, opacity: 0.6}}>$ _</div>
      </>
    );
  } else if (tipo(e) === 'recorte') {
    const [m1, m2, m3] = e.extra.camadas;
    const base = vertical ? H - 330 : H - 95;
    const morro = (y: number, cor: string, fase: number, k: number) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const x = (i / 40) * W; pts.push(`${x},${y - 45 * (0.5 + 0.5 * Math.sin(x / 105 + fase))}`); }
      return <polygon key={k} points={`${pts.join(' ')} ${W},${H} 0,${H}`} fill={cor} style={{filter: 'drop-shadow(0 -10px 0 rgba(0,0,0,0.18))'}} />;
    };
    const nuvem = (cx: number, cy: number, esc: number) => (
      <g style={{filter: 'drop-shadow(8px 8px 0 rgba(0,0,0,0.15))'}} fill={e.extra.nuvem} transform={`translate(${cx} ${cy}) scale(${esc})`}>
        <circle r={43} /><circle cx={-50} cy={8} r={32} /><circle cx={50} cy={7} r={35} /><circle cx={20} cy={-27} r={27} />
      </g>
    );
    decor = (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {nuvem(150, vertical ? 120 : 60, 0.9)}{nuvem(W - 170, vertical ? 150 : 90, 0.7)}
        {[morro(base, m1, 0, 0), morro(base + 60, m2, 1.7, 1), morro(base + 120, m3, 3.4, 2)]}
      </svg>
    );
  } else if (tipo(e) === 'jornal') {
    const top = vertical ? 40 : 30;
    decor = (
      <div style={{position: 'absolute', left: 40, right: 40, top, textAlign: 'center', color: c.INK}}>
        <div style={{fontFamily: 'Playfair Display', fontWeight: 900, fontSize: vertical ? 48 : 38}}>{e.extra.cabecalho}</div>
        <div style={{borderTop: `5px solid ${c.INK}`, borderBottom: `1.5px solid ${c.INK}`, height: 6, margin: '8px 0'}} />
        <div style={{fontFamily: 'Libre Baskerville', fontSize: vertical ? 18 : 15, color: c.MUTED, letterSpacing: 2}}>ANO I · Nº 1 · CADERNO DE ESTUDOS</div>
        <div style={{borderTop: `1.5px solid ${c.INK}`, marginTop: 8}} />
      </div>
    );
  } else if (tipo(e) === 'neon') {
    const chao = vertical ? H - 296 : H - 135;
    const hs = [], vs = [];
    for (let k = 1; k < 8; k++) { const y = chao + Math.pow(k, 1.6) * 12; if (y < H) hs.push(y); }
    for (let k = -8; k <= 8; k++) vs.push(k);
    decor = (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {vertical && <>
          <path d={`M ${W / 2 - 115} ${chao} A 115 115 0 0 1 ${W / 2 + 115} ${chao} Z`} fill={e.extra.sol} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={W / 2 - 130} y={chao - 14 - k * 20} width={260} height={6 + k * 2.5} fill={c.BG} />)}
        </>}
        <g stroke={e.extra.chao} style={{filter: `drop-shadow(0 0 6px ${e.extra.chao})`}}>
          <line x1={0} x2={W} y1={chao} y2={chao} strokeWidth={4} />
          {hs.map((y) => <line key={y} x1={0} x2={W} y1={y} y2={y} strokeWidth={2.5} strokeOpacity={0.6} />)}
          {vs.map((k) => <line key={k} x1={W / 2 + k * 34} x2={W / 2 + k * 190} y1={chao} y2={H} strokeWidth={2.5} strokeOpacity={0.5} />)}
        </g>
      </svg>
    );
  }
  return (
    <AbsoluteFill style={{background: c.BG}}>
      {e.extra.fundo && <Img src={staticFile(e.extra.fundo)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />}
      {decor}
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- texto
type Pos = {x: number; y: number; ancora?: 'esquerda' | 'centro' | 'direita'};
const transX = (a?: Pos['ancora']) => (a === 'esquerda' ? '0' : a === 'direita' ? '-100%' : '-50%');

/** Texto que entra subindo (p: 0 → 1). Fonte, peso e caixa-alta vêm do estilo. */
export const Texto: React.FC<Pos & {e: Estilo; p: number; size?: number; cor?: string; titulo?: boolean; children: React.ReactNode}> =
  ({e, p, x, y, ancora = 'centro', size = 64, cor, titulo, children}) => {
    const alta = titulo ? e.tituloCaixaAlta : e.caixaAlta;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, transform: `translate(${transX(ancora)}, ${(1 - p) * 24}px)`,
        opacity: Math.min(1, p * 1.6), fontFamily: titulo ? e.fonteTitulo : e.fonteTexto, fontWeight: e.pesoTexto,
        fontSize: size, color: cor ?? (titulo ? e.tituloCor ?? e.cor.INK : e.cor.INK), whiteSpace: 'pre',
        textTransform: alta ? 'uppercase' : 'none', lineHeight: 1.1, textShadow: halo(e, cor ?? e.cor.INK),
      }}>{children}</div>
    );
  };

/** Título no visual do estilo. Na colagem, cada palavra é um recorte de cor diferente. */
export const Titulo: React.FC<{e: Estilo; p: number; y: number; size?: number; partes: [string, string?][]}> =
  ({e, p, y, size = 92, partes}) => {
    const {width: W} = useVideoConfig();
    if (tipo(e) === 'colagem' || tipo(e) === 'retro') {
      const cs = e.extra.recortes;
      const fontes: string[] = e.extra.fontesRecorte ?? [e.fonteTitulo, e.fonteTexto];
      const palavras = partes.flatMap(([t]) => t.split(' ').filter(Boolean)).map((w) => (e.tituloCaixaAlta ? w.toUpperCase() : w));
      return (
        <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12}}>
          {palavras.map((w, k) => {
            const bg = cs[k % cs.length];
            const claro = ['#F4EDE0', '#E9C46A', '#F1E9D8', '#F2CF3B'].includes(bg);
            const pk = Math.max(0, Math.min(1, p * palavras.length - k * 0.6));
            return (
              <span key={k} style={{display: 'inline-block', opacity: pk,
                filter: tipo(e) === 'retro' ? 'drop-shadow(6px 7px 0 rgba(0,0,0,0.3))' : undefined,
                transform: `rotate(${[-3, 2, -1, 3][k % 4]}deg) scale(${lerp(0.6, 1, pk)})`}}>
                <span style={{display: 'inline-block',
                  background: bg, color: claro ? '#1A1A1A' : '#FBF7EF', padding: '6px 18px', clipPath: rasgado(k + 11, 5, 10),
                  fontFamily: fontes[k % fontes.length], fontSize: size * (k % 2 ? 0.8 : 0.9),
                }}>{w}</span>
              </span>
            );
          })}
        </div>
      );
    }
    const caixa = e.tituloCaixaAlta ? 'uppercase' : 'none';
    const corT = e.tituloCor ?? e.cor.INK;
    const sub: Record<string, string | undefined> = {
      papel: `8px solid ${e.cor.GOLD}88`, blueprint: `4px double ${e.cor.INK}`, lousa: `5px dashed ${e.cor.GOLD}`,
    };
    const conteudo = (
      <>
        {tipo(e) === 'bauhaus' && <span style={{display: 'inline-block', width: size * 0.8, height: size * 0.8,
          background: e.extra.vermelho, marginRight: 24, verticalAlign: '-0.1em'}} />}
        {tipo(e) === 'darkui' && <span style={{display: 'inline-block', width: 12, height: size * 0.95, borderRadius: 6,
          background: e.cor.C1, marginRight: 26, verticalAlign: '-0.12em'}} />}
        {tipo(e) === 'terminal' && <span style={{color: e.cor.GOOD}}>{'> '}</span>}
        {partes.map(([t, cor], k) => <span key={k} style={{color: tipo(e) === 'recorte' ? '#FFFFFF' : cor,
          textShadow: halo(e, cor ?? corT)}}>{t}</span>)}
        {tipo(e) === 'terminal' && <span style={{display: 'inline-block', width: size * 0.5, height: size * 0.9,
          background: e.cor.INK, marginLeft: 10, verticalAlign: '-0.1em', opacity: 0.85}} />}
      </>
    );
    const estiloSpan: React.CSSProperties = {fontFamily: e.fonteTitulo, fontWeight: e.pesoTexto, fontSize: size, textTransform: caixa,
      color: corT, borderBottom: sub[tipo(e)], paddingBottom: sub[tipo(e)] ? 6 : 0, lineHeight: 1.15,
      letterSpacing: tipo(e) === 'neon' ? 6 : undefined, wordSpacing: tipo(e) === 'neon' ? '0.35em' : undefined};
    if (tipo(e) === 'recorte') {
      Object.assign(estiloSpan, {display: 'inline-block', background: e.extra.faixa, padding: '14px 34px', borderRadius: 18,
        transform: 'rotate(-1.5deg)', boxShadow: '10px 10px 0 rgba(0,0,0,0.22)'});
    }
    return (
      <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 20}px)`}}>
        {tipo(e) === 'jornal' && <div style={{borderTop: `2px solid ${e.cor.INK}`, margin: '0 60px 14px'}} />}
        <span style={estiloSpan}>{conteudo}</span>
        {tipo(e) === 'jornal' && <div style={{borderTop: `2px solid ${e.cor.INK}`, margin: '14px 60px 0'}} />}
      </div>
    );
  };

/** Palavra grande que salta na tela (tipografia cinética). p de pop(). */
export const Cinetica: React.FC<Pos & {e: Estilo; p: number; size?: number; cor?: string; children: React.ReactNode}> =
  ({e, p, x, y, ancora = 'centro', size = 150, cor, children}) => (
    <div style={{textShadow: halo(e, cor ?? e.cor.INK),
      position: 'absolute', left: x, top: y, transform: `translate(${transX(ancora)}, -50%) scale(${p})`,
      opacity: Math.min(1, p * 2), fontFamily: tipo(e) === 'documentario' ? 'Archivo Black' : e.fonteTitulo,
      fontWeight: 800, fontSize: size, color: cor ?? e.cor.INK, letterSpacing: -2, whiteSpace: 'pre',
      textTransform: e.tituloCaixaAlta ? 'uppercase' : 'none',
    }}>{children}</div>
  );

// --------------------------------------------------------------- caixas
/** Caixa de destaque com fundo tingido da cor do texto (equivale ao destacar() do Manim). */
export const Destaque: React.FC<Pos & {e: Estilo; p: number; cor?: string; children: React.ReactNode}> =
  ({e, p, x, y, ancora = 'centro', cor, children}) => {
    const c = cor ?? e.cor.GOLD;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, transform: `translate(${transX(ancora)}, 0) scale(${lerp(0.94, 1, p)})`,
        opacity: p, background: tinta(e, c), border: `5px solid ${c}`, borderRadius: e.cantos, padding: '18px 34px',
        boxShadow: e.sombra ? '10px 10px 0 rgba(0,0,0,0.28)' : undefined, color: c,
        fontFamily: e.fonteTexto, fontWeight: e.pesoTexto, fontSize: 64, whiteSpace: 'pre',
      }}>{children}</div>
    );
  };

/** Recorte de papel colado (colagem), com sombra e leve rotação. Serve de cartão para qualquer conteúdo. */
export const Recorte: React.FC<{e: Estilo; p: number; x: number; y: number; w: number; h: number; cor?: string; rot?: number;
  seed?: number; fita?: boolean; children?: React.ReactNode}> =
  ({e, p, x, y, w, h, cor, rot = -2, seed = 5, fita = true, children}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: Math.min(1, p * 2),
      transform: `rotate(${rot}deg) scale(${lerp(1.15, 1, p)})`, filter: 'drop-shadow(10px 12px 0 rgba(0,0,0,0.25))'}}>
      <div style={{position: 'absolute', inset: 0, background: cor ?? e.cor.PAINEL, clipPath: rasgado(seed, 3, 14)}} />
      {fita && <div style={{position: 'absolute', left: w / 2 - 80, top: -26, width: 160, height: 52,
        background: e.extra.fita ?? '#EFE3B0', opacity: 0.85, transform: 'rotate(4deg)'}} />}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );

// --------------------------------------------------------------- traços
/** Desenha um caminho SVG aos poucos (p: 0 → 1), como caneta. Use com rascunho() para traço à mão. */
export const Traco: React.FC<{f: Forma; p: number; op?: number}> = ({f, p, op = 1}) => (
  <g opacity={op}>
    {f.map((q, i) => (
      <path key={i} d={q.d} stroke={q.stroke} strokeWidth={q.strokeWidth}
        fill={q.fill && q.fill !== 'none' ? q.fill : 'none'} fillOpacity={Math.max(0, Math.min(1, (p - 0.5) * 2))}
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, Math.min(1, p * 1.0001))}
        strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </g>
);

/** SVG do tamanho do quadro, para pôr Traços e formas. */
export const Tela: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width: W, height: H} = useVideoConfig();
  return <svg width={W} height={H} style={{position: 'absolute'}}>{children}</svg>;
};

/** Memoriza formas do rough.js (o desenho não muda a cada quadro). */
export const useFormas = <T,>(fn: () => T): T => useMemo(fn, []);

// --------------------------------------------------------------- personagens
type Expressao = 'feliz' | 'duvida' | 'surpreso' | 'serio';
/**
 * Boneco de papel recortado (estilo recorte, mas serve em qualquer estilo): o aluno, o banco, a banca...
 * (x, y) = pé do boneco. p de pop() para entrar. olhar: -1 esquerda, 0 frente, 1 direita.
 */
export const Boneco: React.FC<{e: Estilo; p: number; x: number; y: number; altura?: number; roupa?: string; pele?: string;
  cabelo?: string; expressao?: Expressao; olhar?: number; aceno?: number}> =
  ({e, p, x, y, altura = 420, roupa, pele = '#F2C29B', cabelo = '#3B2A20', expressao = 'feliz', olhar = 0, aceno = 0}) => {
    const k = altura / 420;
    const r = roupa ?? e.cor.C1;
    const sombra = 'drop-shadow(8px 10px 0 rgba(0,0,0,0.22))';
    const boca = {
      feliz: 'M -26 18 Q 0 44 26 18', serio: 'M -22 26 L 22 26', duvida: 'M -22 28 Q 0 18 22 30', surpreso: '',
    }[expressao];
    return (
      <svg width={360 * k} height={460 * k} viewBox="-180 -440 360 460"
        style={{position: 'absolute', left: x - 180 * k, top: y - 440 * k, overflow: 'visible',
          transform: `scale(${p})`, transformOrigin: '50% 100%', opacity: Math.min(1, p * 2)}}>
        <g style={{filter: sombra}}>
          {/* corpo e braços */}
          <path d="M -95 0 L -80 -170 Q 0 -215 80 -170 L 95 0 Z" fill={r} />
          <path d="M -80 -165 L -128 -60" stroke={r} strokeWidth={34} strokeLinecap="round" />
          <path d={`M 80 -165 L ${128 + aceno * 20} ${-60 - aceno * 170}`} stroke={r} strokeWidth={34} strokeLinecap="round" />
          <circle cx={-128} cy={-58} r={20} fill={pele} />
          <circle cx={128 + aceno * 20} cy={-58 - aceno * 172} r={20} fill={pele} />
          {/* cabeça */}
          <circle cx={0} cy={-280} r={95} fill={pele} />
          <path d="M -95 -290 Q -90 -385 0 -382 Q 92 -385 95 -290 Q 60 -330 0 -332 Q -55 -330 -95 -290 Z" fill={cabelo} />
          <circle cx={-32 + olhar * 12} cy={-282} r={11} fill="#2B2D42" />
          <circle cx={32 + olhar * 12} cy={-282} r={11} fill="#2B2D42" />
          {expressao === 'duvida' && <path d="M 18 -312 L 50 -322" stroke="#2B2D42" strokeWidth={7} strokeLinecap="round" />}
          {expressao === 'surpreso'
            ? <ellipse cx={olhar * 8} cy={-232} rx={14} ry={18} fill="#2B2D42" />
            : <path d={boca} transform="translate(0 -262)" stroke="#2B2D42" strokeWidth={8} fill="none" strokeLinecap="round" />}
        </g>
      </svg>
    );
  };

/** Balão de fala de papel, com a ponta para baixo (ponta = posição x da ponta, relativa à esquerda do balão). */
export const Balao: React.FC<{e: Estilo; p: number; x: number; y: number; largura?: number; ponta?: number; children: React.ReactNode}> =
  ({e, p, x, y, largura = 520, ponta = 80, children}) => (
    <div style={{position: 'absolute', left: x, top: y, width: largura, opacity: Math.min(1, p * 2),
      transform: `scale(${lerp(0.7, 1, p)})`, transformOrigin: `${ponta}px 100%`, filter: 'drop-shadow(8px 8px 0 rgba(0,0,0,0.2))'}}>
      <div style={{background: e.cor.PAINEL, border: `4px solid ${e.cor.INK}`, borderRadius: 34, padding: '22px 30px',
        fontFamily: e.fonteTexto, fontWeight: e.pesoTexto, fontSize: 46, color: e.cor.INK, lineHeight: 1.2}}>{children}</div>
      <svg width={60} height={44} style={{position: 'absolute', left: ponta - 30, bottom: -38}}>
        <path d="M 4 0 L 30 40 L 50 0" fill={e.cor.PAINEL} stroke={e.cor.INK} strokeWidth={4} />
        <rect x={6} y={-4} width={42} height={8} fill={e.cor.PAINEL} />
      </svg>
    </div>
  );
