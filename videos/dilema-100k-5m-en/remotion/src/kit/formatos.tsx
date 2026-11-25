// Formatos prontos para cenas Remotion: questão da banca, pause e tente, legenda Reels,
// imagem com movimento lento (Ken Burns), animação Lottie e objeto 3D (Three.js).
// Arquivos de imagem, vídeo e Lottie ficam em remotion/public/ e entram por staticFile("nome.png").
import React, {useEffect, useState} from 'react';
import {Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {ThreeCanvas} from '@remotion/three';
import {Estilo, halo} from './estilos';
import {Props, lerp, prog} from './tempo';

// ------------------------------------------------------------ questão da banca
/** Print da questão (public/<src>) com moldura e a fonte embaixo ("FGV · SEFAZ-CE 2025"). */
export const Questao: React.FC<{e: Estilo; p: number; src: string; y: number; largura?: number; fonte?: string}> =
  ({e, p, src, y, largura = 940, fonte}) => {
    const {width: W} = useVideoConfig();
    return (
      <div style={{position: 'absolute', left: (W - largura) / 2, top: y, width: largura, opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`}}>
        <Img src={staticFile(src)} style={{width: '100%', display: 'block', border: `3px solid ${e.cor.MUTED}`,
          borderRadius: Math.min(10, e.cantos), boxShadow: e.sombra ? '10px 10px 0 rgba(0,0,0,0.25)' : undefined}} />
        {fonte && <div style={{marginTop: 12, textAlign: 'center', fontFamily: e.fonteTexto, fontSize: 30, color: e.cor.MUTED}}>{fonte}</div>}
      </div>
    );
  };

// ------------------------------------------------------------ pause e tente
/** Contagem regressiva em anel. t0 = segundo em que começa (ex.: fim da fala que convida a pausar). */
export const PauseETente: React.FC<{e: Estilo; s: number; t0: number; segundos?: number; y?: number; texto?: string}> =
  ({e, s, t0, segundos = 5, y = 760, texto = 'Pause e tente'}) => {
    const {width: W} = useVideoConfig();
    const entra = prog(s, t0, 0.4);
    const sai = 1 - prog(s, t0 + segundos + 0.2, 0.3);
    if (entra <= 0 || sai <= 0) return null;
    const frac = Math.max(0, Math.min(1, (s - t0) / segundos));
    const num = Math.max(1, segundos - Math.floor(frac * segundos));
    const R = 150, C = 2 * Math.PI * R;
    return (
      <div style={{position: 'absolute', left: 0, width: W, top: y, textAlign: 'center', opacity: Math.min(entra, sai)}}>
        <div style={{fontFamily: e.fonteTitulo, fontWeight: e.pesoTexto, fontSize: 72, color: e.cor.INK,
          textShadow: halo(e, e.cor.INK), textTransform: e.tituloCaixaAlta ? 'uppercase' : 'none'}}>{texto}</div>
        <svg width={360} height={360} style={{marginTop: 30}}>
          <circle cx={180} cy={180} r={R} fill="none" stroke={e.cor.MUTED} strokeOpacity={0.35} strokeWidth={22} />
          <circle cx={180} cy={180} r={R} fill="none" stroke={e.cor.GOLD} strokeWidth={22} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * frac} transform="rotate(-90 180 180)" />
          <text x={180} y={180} textAnchor="middle" dominantBaseline="central" fontFamily={e.fonteTitulo}
            fontSize={150} fill={e.cor.INK}>{num}</text>
        </svg>
        <div style={{fontFamily: e.fonteTexto, fontSize: 34, color: e.cor.MUTED, marginTop: 18}}>(a resolução vem logo depois)</div>
      </div>
    );
  };

// ------------------------------------------------------------ legenda Reels
/** Legenda de 1 a 3 palavras grandes, a falada em dourado. Ponha por último na cena (fica por cima). */
export const LegendaReels: React.FC<{e: Estilo; props: Props; s: number; y?: number; size?: number}> =
  ({e, props, s, y, size = 78}) => {
    const {width: W, height: H} = useVideoConfig();
    const blocos: {ws: [string, number][]}[] = [];
    for (const f of props.falas) {
      let cur: [string, number][] = [];
      for (const w of f.palavras) {
        const txt = [...cur.map((c) => c[0]), w[0]].join(' ');
        if (cur.length && (cur.length >= 3 || txt.length > 16)) { blocos.push({ws: cur}); cur = []; }
        cur.push(w);
        if (/[.,?!:;]$/.test(w[0])) { blocos.push({ws: cur}); cur = []; }
      }
      if (cur.length) blocos.push({ws: cur});
    }
    const atual = [...blocos].reverse().find((b) => b.ws[0][1] <= s + 0.02);
    const fim = props.falas.find((f) => s >= f.inicio && s <= f.inicio + f.duracao + 0.3);
    if (!atual || !fim) return null;
    const ativa = [...atual.ws].reverse().find((w) => w[1] <= s + 0.02);
    const fonte = ['neon', 'colagem'].includes(e.nome) ? 'Inter' : e.fonteTitulo;  // retro: use <LegendaRecortes> (kit/retro.tsx)
    return (
      <div style={{position: 'absolute', left: 40, right: 40, top: y ?? H * 0.66, textAlign: 'center', fontFamily: fonte,
        fontWeight: 800, fontSize: size, lineHeight: 1.1, textTransform: 'uppercase',
        WebkitTextStroke: '0px', textShadow: '0 0 4px #000, 0 4px 0 #000, 0 0 14px rgba(0,0,0,0.8)'}}>
        {atual.ws.map(([w, t], k) => (
          <span key={k} style={{color: ativa && t === ativa[1] ? e.cor.GOLD : '#FFFFFF', marginRight: '0.28em'}}>{w}</span>
        ))}
      </div>
    );
  };

// ------------------------------------------------------------ Ken Burns
/** Imagem (public/<src>) com zoom e deslocamento lentos dentro de uma caixa (por padrão, a tela inteira). */
export const KenBurns: React.FC<{src: string; s: number; t0: number; dur: number; zoom?: [number, number];
  de?: [number, number]; para?: [number, number]; x?: number; y?: number; w?: number; h?: number; cantos?: number}> =
  ({src, s, t0, dur, zoom = [1, 1.15], de = [0, 0], para = [-3, -2], x = 0, y = 0, w, h, cantos = 0}) => {
    const {width: W, height: H} = useVideoConfig();
    const k = Math.max(0, Math.min(1, (s - t0) / dur));
    const z = lerp(zoom[0], zoom[1], k);
    const tx = lerp(de[0], para[0], k), ty = lerp(de[1], para[1], k);
    const op = interpolate(s, [t0, t0 + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w ?? W, height: h ?? H, overflow: 'hidden', borderRadius: cantos, opacity: op}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${z}) translate(${tx}%, ${ty}%)`}} />
      </div>
    );
  };

// ------------------------------------------------------------ Lottie
/** Animação Lottie (public/<src>.json, ex.: baixada do LottieFiles). inicio = segundo em que começa a tocar. */
export const Animacao: React.FC<{src: string; x: number; y: number; largura: number; inicio?: number; loop?: boolean; velocidade?: number}> =
  ({src, x, y, largura, inicio = 0, loop = true, velocidade = 1}) => {
    const [dados, setDados] = useState<LottieAnimationData | null>(null);
    const [h] = useState(() => delayRender(`lottie ${src}`));
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    useEffect(() => {
      fetch(staticFile(src)).then((r) => r.json()).then((j) => { setDados(j); continueRender(h); })
        .catch((err) => { console.error(err); continueRender(h); });
    }, [h, src]);
    if (!dados || frame < inicio * fps) return null;
    return (
      <div style={{position: 'absolute', left: x, top: y, width: largura}}>
        <Lottie animationData={dados} loop={loop} playbackRate={velocidade} />
      </div>
    );
  };

// ------------------------------------------------------------ 3D
type Forma3D = 'cubo' | 'esfera' | 'toro' | 'icosaedro' | 'cone' | 'cilindro';
/**
 * Objeto 3D girando (Three.js), com luz suave. Bom no estilo darkui e para geometria espacial.
 * (x, y, lado) = caixa onde o 3D é desenhado. p de prog()/pop() para entrar; giro = voltas por segundo.
 */
export const Objeto3D: React.FC<{e: Estilo; p: number; s: number; forma?: Forma3D; cor?: string; x: number; y: number; lado: number;
  giro?: number; arame?: boolean}> =
  ({e, p, s, forma = 'icosaedro', cor, x, y, lado, giro = 0.15, arame = false}) => {
    const c = cor ?? e.cor.C1;
    const ang = s * giro * Math.PI * 2;
    const geo = {
      cubo: <boxGeometry args={[1.6, 1.6, 1.6]} />,
      esfera: <sphereGeometry args={[1.1, 48, 48]} />,
      toro: <torusGeometry args={[0.9, 0.35, 32, 96]} />,
      icosaedro: <icosahedronGeometry args={[1.2, 0]} />,
      cone: <coneGeometry args={[1, 1.8, 48]} />,
      cilindro: <cylinderGeometry args={[0.8, 0.8, 1.8, 48]} />,
    }[forma];
    return (
      <div style={{position: 'absolute', left: x, top: y, width: lado, height: lado, opacity: Math.min(1, p * 1.5),
        transform: `scale(${lerp(0.7, 1, p)})`}}>
        <ThreeCanvas width={lado} height={lado} linear camera={{position: [0, 0, 4.2], fov: 45}}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 4, 5]} intensity={2.4} />
          <pointLight position={[-4, -2, 3]} intensity={18} color={e.cor.C2} />
          <mesh rotation={[0.5 + ang * 0.6, ang, 0]}>
            {geo}
            <meshStandardMaterial color={c} wireframe={arame} metalness={0.25} roughness={0.35} flatShading={forma === 'icosaedro'} />
          </mesh>
        </ThreeCanvas>
      </div>
    );
  };
