// V09 | Por que não voltaria, em papel envelhecido com colagem e a mão de gravura:
// o transformador entre a usina e a rua, a corrente lenta da tempestade (como uma bateria na linha),
// o núcleo que esquenta e cozinha, os 350 transformadores do relatório, a espera de 128 semanas
// e a fila de centenas de pedidos na mesma semana.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, Estouro, useAcao, Impacto} from '../kit/impacto';
import {MaoAponta} from '../kit/retro';
import {useLatin, LM, V} from './vorttum';
import {W, H, Grao, Vinheta, FundoPapel, Bate, Sobe, Rotulo, Cartao, Som, conta, vida, VE} from './apagao';
import {Usina, Casa, Transformador, Bateria, Carimbo, respiro, clamp01, rasgoRet, SOMBRA} from './pecas';

const Mini: React.FC<{x: number; y: number; k: number; ruim: number}> = ({x, y, k, ruim}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-20} y={-30} width={40} height={30} fill={ruim > 0.5 ? V.C1 : '#7E8F79'} />
    {[-12, 0, 12].map((b) => <rect key={b} x={b - 3} y={-44} width={6} height={14} fill="#D9CFBE" />)}
  </g>
);

export const V09_Transformador: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;

  const imp: Impacto[] = [
    {t: t('transformer', 1) + 0.15, forca: 0.45, congela: 0, som: 'baque', flash: false},
    {t: t('cook', 2), forca: 0.5, congela: 0, flash: false},
    {t: t('two', 5), forca: 0.5, congela: 0, flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const r = respiro(s);
  const calor = prog(s, t('core', 2) - 0.3, 1.2) * 0.6 + prog(s, t('overheat', 2), 1.0) * 0.4;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={r.zoom} foco={r.foco}>
        <FundoPapel deriva={(s % 25) / 25} />

        {/* ---------- falas 1 e 2: o transformador e a corrente da tempestade ---------- */}
        {tela(s, 1, 2) && <AbsoluteFill>
          {(() => {
            const pT = pop(s, t('transformer', 1) - 0.1, 0.5);
            const fluxo = (s * 0.8) % 1;
            const pSol = pop(s, t('solar', 2) - 0.2);
            const pDC = prog(s, t('steady', 2) - 0.2, 0.8);
            const pBat = pop(s, t('battery', 2));
            const dcX = lerp(330, 860, pDC);
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <path d={`M 0 ${H - 110} Q 600 ${H - 160} 1200 ${H - 120} T 1920 ${H - 130} L 1920 ${H} L 0 ${H} Z`} fill="#C2B27E" />
                {/* linha usina → transformador → rua */}
                <line x1={300} y1={760} x2={840} y2={760} stroke={V.INK} strokeWidth={8} />
                <line x1={1080} y1={760} x2={1640} y2={760} stroke={V.INK} strokeWidth={8} />
                {s > t('up', 1) && [...Array(10)].map((_, i) => {
                  const u = (i / 10 + fluxo) % 1;
                  const x = u < 0.5 ? lerp(300, 840, u * 2) : lerp(1080, 1640, (u - 0.5) * 2);
                  return <circle key={i} cx={x} cy={760} r={u < 0.5 ? 9 : 14} fill={V.GOLD} opacity={0.9 * (1 - calor * 0.7)} />;
                })}
                <g opacity={pop(s, ini(1))}><Usina x={220} y={950} k={1.3} s={s} seed={5} /></g>
                {[1520, 1640, 1760].map((x, i) => <g key={i} opacity={pop(s, t('street', 1) + i * 0.1)}>
                  <Casa x={x} y={950} k={1.5} seed={i + 7} cor={['#A2674A', '#5F8466', '#82648F'][i]} luz={1 - 0.6 * calor} /></g>)}
                <g transform={`translate(960 900) scale(${pT}) translate(-960 -900)`}>
                  <Transformador x={960} y={900} k={1.25} calor={calor} s={s} />
                </g>
                {/* sol e a corrente lenta */}
                {pSol > 0 && <g transform={`translate(300 250) scale(${0.75 * pSol}) rotate(${s * 10})`}>
                  {[...Array(14)].map((_, i) => <path key={i} d="M -18 -150 L 0 -215 L 18 -150 Z" fill={V.GOLD} transform={`rotate(${i * 360 / 14})`} />)}
                  <circle r={130} fill="#D9A441" />
                  <circle r={130} fill="none" stroke={V.INK} strokeWidth={4} />
                </g>}
                {pDC > 0 && <g>
                  <path d={`M 300 640 L ${dcX} 640`} stroke={V.C1} strokeWidth={26} strokeLinecap="round" opacity={0.85} />
                  <path d={`M ${dcX - 10} 600 L ${dcX + 40} 640 L ${dcX - 10} 680 Z`} fill={V.C1} />
                </g>}
                {pBat > 0 && <g transform={`translate(560 700) scale(${pBat}) translate(-560 -700)`}>
                  <Bateria x={470} y={650} w={180} h={90} nivel={1} cor={V.C2} />
                  <text x={500} y={712} fontFamily={LM} fontWeight={700} fontSize={50} fill={V.SHEET}>+  –</text>
                </g>}
                {/* termômetro */}
                <g opacity={vida(s, t('overheat', 2) - 0.2)}>
                  <rect x={1290} y={260} width={50} height={320} rx={25} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
                  <circle cx={1315} cy={600} r={45} fill={V.C1} stroke={V.INK} strokeWidth={5} />
                  <rect x={1300} y={580 - 300 * prog(s, t('overheat', 2), 1.6)} width={30} height={300 * prog(s, t('overheat', 2), 1.6)} fill={V.C1} />
                </g>
              </svg>
              <MaoAponta som={false} t={t('weak', 1)} ate={t('giant', 1)} x={760} y={420} ang={20} tamanho={300} />
              <Rotulo s={s} t={t('weak', 1)} ate={fim(1)} x={960} y={150} fundo={V.C1} size={60} rot={-2}>THE WEAK POINT</Rotulo>
              <Rotulo s={s} t={t('up', 1)} ate={fim(1)} x={570} y={700} fundo={V.SHEET} cor={V.INK} size={40} rot={-3} seed={4}>STEP UP</Rotulo>
              <Rotulo s={s} t={t('down', 1)} ate={fim(1)} x={1360} y={700} fundo={V.SHEET} cor={V.INK} size={40} rot={3} seed={5}>STEP DOWN</Rotulo>
              <Rotulo s={s} t={t('steady', 2)} ate={t('core', 2) - 0.2} x={600} y={560} fundo={V.C1} size={44} rot={-2}>SLOW, STEADY CURRENT</Rotulo>
              <Rotulo s={s} t={t('never', 2)} ate={t('core', 2) - 0.2} x={1440} y={200} fundo={V.INK} cor={V.SHEET} size={44} rot={3} seed={6}>NEVER BUILT FOR THIS</Rotulo>
              <Rotulo s={s} t={t('saturates', 2)} x={1440} y={200} fundo={V.C1} size={46} rot={-2} seed={8}>CORE SATURATES</Rotulo>
              <Rotulo s={s} t={t('overheat', 2)} x={1500} y={320} fundo={V.GOLD} cor={V.SHEET} size={46} rot={2} seed={9}>WINDINGS OVERHEAT</Rotulo>
              <Estouro s={s} t={t('cook', 2)} x={960} y={560} forca={0.6} cor="#F6D9A8" cor2={V.C1} />
              <Carimbo s={s} t={t('cook', 2) + 0.2} x={960} y={420} cor={V.BAD} size={90} rot={-8} fundo={V.SHEET}>COOKED</Carimbo>
            </>;
          })()}
        </AbsoluteFill>}

        {/* ---------- fala 3: os 350 ---------- */}
        {tela(s, 3, 3) && <AbsoluteFill style={{opacity: prog(s, ini(3) - 0.25, 0.35)}}>
          <Cartao s={s} t={t('report', 3) - 0.2} x={150} y={170} w={520} h={680} fundo="#F1EADB" rot={-3} seed={14}>
            <svg width={520} height={680}>
              <text x={50} y={90} fontFamily="JetBrains Mono" fontSize={30} fill={V.MUTED}>REPORT</text>
              <text x={50} y={150} fontFamily={LM} fontWeight={700} fontSize={44} fill={V.INK}>Severe solar storm</text>
              <text x={50} y={200} fontFamily={LM} fontWeight={700} fontSize={44} fill={V.INK}>· United States</text>
              {[...Array(8)].map((_, i) => <rect key={i} x={50} y={260 + i * 46} width={420 - (i % 3) * 70} height={14} fill="#CFC5B2" />)}
            </svg>
          </Cartao>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {Array.from({length: 350}, (_, i) => {
              const c = i % 25, rr = Math.floor(i / 25);
              const p = pop(s, t('severe', 3) + (i / 350) * 2.0, 0.3);
              if (p <= 0) return null;
              const ruim = prog(s, t('damage', 3) + (i % 7) * 0.05, 0.2) * (i % 3 === 0 || s > t('fifty', 3) + 0.4 ? 1 : 0);
              return <Mini key={i} x={800 + c * 39} y={250 + rr * 46} k={p * 0.9} ruim={ruim} />;
            })}
          </svg>
          <Bate s={s} t={t('three', 3)} x={1270} y={940} size={96} cor={V.C1}>{conta(s, t('three', 3), 1.4, 0, 350)}+ transformers</Bate>
          <Rotulo s={s} t={t('damage', 3)} x={410} y={920} fundo={V.C1} size={46} rot={2}>DAMAGED</Rotulo>
        </AbsoluteFill>}

        {/* ---------- falas 4 e 5: a espera e a fila ---------- */}
        {tela(s, 4, 5) && <AbsoluteFill style={{opacity: prog(s, ini(4) - 0.25, 0.35)}}>
          {(() => {
            const pB1 = prog(s, t('five', 4), 0.8), pB2 = prog(s, t('today', 4), 2.0, (x) => x);
            const semanas = Math.round(128 * pB2);
            const X = (m: number) => 420 + m * 34;      // meses → px (128 semanas ≈ 29,5 meses)
            const fila = prog(s, t('picture', 5), 3.5, (x) => x);
            const sai4 = prog(s, ini(5) + 0.3, 0.6);
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                {/* prateleira vazia */}
                <g opacity={vida(s, t('shelf', 4) - 0.2, t('twenty', 4) - 0.2)}>
                  {[360, 560, 760].map((y) => <path key={y} d={rasgoRet(560, y, 800, 26, y, 4)} fill="#6A4A33" />)}
                  <path d={rasgoRet(560, 340, 26, 460, 3, 4)} fill="#6A4A33" /><path d={rasgoRet(1334, 340, 26, 460, 4, 4)} fill="#6A4A33" />
                </g>
                {/* barras de espera */}
                <g opacity={(1 - sai4) * vida(s, t('twenty', 4) - 0.2)}>
                  <text x={380} y={330} fontFamily={LM} fontWeight={700} fontSize={48} fill={V.INK} textAnchor="end">2010</text>
                  <path d={rasgoRet(X(5), 285, (X(16) - X(5)) * pB1, 60, 11, 5)} fill={V.GOOD} />
                  <path d={rasgoRet(X(0), 300, (X(5) - X(0)) * pB1, 30, 12, 4)} fill="#B7C39A" />
                  {pB1 > 0.9 && <text x={X(16) + 20} y={330} fontFamily={LM} fontSize={40} fill={V.INK}>5 to 16 months</text>}
                  <text x={380} y={560} fontFamily={LM} fontWeight={700} fontSize={48} fill={V.INK} textAnchor="end" opacity={prog(s, t('today', 4), 0.3)}>today</text>
                  <path d={rasgoRet(X(0), 510, (X(29.5) - X(0)) * pB2 + 1, 70, 13, 6)} fill={V.C1} />
                  {s > t('today', 4) && <text x={X(29.5 * pB2) + 20} y={562} fontFamily={LM} fontWeight={700} fontSize={56} fill={V.C1}>{semanas} weeks</text>}
                  {/* calendário que vira */}
                  {s > t('today', 4) && <g transform="translate(960 800)">
                    <path d={rasgoRet(-130, -110, 260, 220, 21, 5)} fill={V.SHEET} stroke={V.INK} strokeWidth={4} style={{filter: SOMBRA}} />
                    <rect x={-130} y={-110} width={260} height={56} fill={V.C1} />
                    <text x={0} y={-68} fontFamily={LM} fontWeight={700} fontSize={36} fill={V.SHEET} textAnchor="middle">WEEK</text>
                    <text x={0} y={60} fontFamily={LM} fontWeight={700} fontSize={110} fill={V.INK} textAnchor="middle">{Math.max(1, semanas)}</text>
                  </g>}
                </g>
                {/* fala 5: um transformador, depois a fila */}
                {sai4 > 0 && <g opacity={sai4} transform={`translate(${-fila * 1400} 0)`}>
                  {Array.from({length: 24}, (_, i) => {
                    const p = i === 0 ? pop(s, t('one', 5)) : pop(s, t('picture', 5) + i * 0.12);
                    const x = 960 + i * 300;
                    return <g key={i} opacity={clamp01(p * 2)}>
                      <Transformador x={x} y={900} k={i === 0 ? 0.9 : 0.75} s={s} seed={i + 30} />
                      <g transform={`translate(${x + 60} 520) rotate(${(i % 3 - 1) * 5})`}>
                        <path d={rasgoRet(-70, -40, 140, 80, i + 40, 4)} fill={V.SHEET} stroke={V.INK} strokeWidth={3} />
                        <text x={0} y={-5} fontFamily="JetBrains Mono" fontSize={20} fill={V.MUTED} textAnchor="middle">ORDER</text>
                        <text x={0} y={25} fontFamily="JetBrains Mono" fontWeight={700} fontSize={24} fill={V.INK} textAnchor="middle">#{String(i + 1).padStart(3, '0')}</text>
                      </g>
                    </g>;
                  })}
                </g>}
              </svg>
              <Carimbo s={s} t={t('order', 4)} ate={t('twenty', 4) - 0.2} x={960} y={560} cor={V.C1} size={90} rot={-6} fundo={V.SHEET}>BUILT TO ORDER</Carimbo>
              <Bate s={s} t={t('two', 5)} ate={t('picture', 5) - 0.2} x={960} y={260} size={150} cor={V.C1}>2.5 YEARS</Bate>
              <Sobe s={s} t={t('one', 5)} ate={t('picture', 5) - 0.2} x={960} y={380} size={48} ancora="centro" cor={V.INK}>for just one</Sobe>
              <Bate s={s} t={t('hundreds', 5)} x={960} y={200} size={120} cor={V.INK}>hundreds of them</Bate>
              <Carimbo s={s} t={t('week', 5)} x={1400} y={340} cor={V.C1} size={70} rot={6} fundo={V.SHEET}>ALL THE SAME WEEK</Carimbo>
            </>;
          })()}
        </AbsoluteFill>}
      </Camera>
      <Vinheta forca={0.35} cor="60,40,20" />
      <Grao forca={0.06} />
      <Som nome="baque" t={t('transformer', 1) + 0.15} volume={0.45} />
    </AbsoluteFill>
  );
};
