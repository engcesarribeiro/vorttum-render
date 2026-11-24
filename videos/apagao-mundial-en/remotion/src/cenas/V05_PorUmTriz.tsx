// V05 | Por um triz: Texas 2021 (neve caindo, usinas congelando, frequência e relógio de 9 minutos, casas cortadas),
// Espanha e Portugal 2025 (menos de 90 s, tensão disparando), Índia 2012 (620 milhões) e todos parando numa fronteira.
// Colagem em papel kraft com recortes de mapa.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, useAcao, Impacto, aleatorio} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {respiro} from './pecas';
import {W, H, Grao, Vinheta, FundoKraft, Bate, Sobe, Rotulo, Cartao, Som, conta, milhar, vida} from './apagao';

type P2 = [number, number];
const TEXAS: P2[] = [[0.35, 0], [0.5, 0], [0.5, 0.32], [0.95, 0.38], [1, 0.62], [0.88, 0.72], [0.72, 0.85], [0.62, 1], [0.5, 0.9],
  [0.42, 0.7], [0.3, 0.62], [0.18, 0.68], [0.05, 0.48], [0, 0.38], [0.35, 0.38]];
const IBERIA: P2[] = [[0.05, 0.15], [0.35, 0.05], [0.75, 0.1], [0.95, 0.2], [0.85, 0.45], [0.7, 0.7], [0.6, 0.9], [0.3, 0.95],
  [0.15, 0.85], [0.05, 0.6], [0, 0.35]];
const PORTUGAL: P2[] = [[0.05, 0.15], [0.2, 0.12], [0.2, 0.85], [0.15, 0.85], [0.05, 0.6], [0, 0.35]];
const INDIA: P2[] = [[0.3, 0], [0.5, 0.05], [0.55, 0.2], [0.8, 0.3], [1, 0.28], [0.95, 0.42], [0.75, 0.45], [0.7, 0.6], [0.55, 0.8],
  [0.5, 1], [0.42, 0.85], [0.3, 0.55], [0.12, 0.45], [0, 0.35], [0.15, 0.25], [0.25, 0.15]];

const Mapa: React.FC<{pts: P2[]; x: number; y: number; w: number; h: number; cor: string; p: number; rot?: number; borda?: number}> =
  ({pts, x, y, w, h, cor, p, rot = 0, borda = 0}) => (
    <g opacity={Math.min(1, p * 2)} transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${rot + (1 - p) * 8}) scale(${lerp(1.25, 1, p)}) translate(${-w / 2} ${-h / 2})`}>
      <polygon points={pts.map(([a, b]) => `${a * w + 10},${b * h + 12}`).join(' ')} fill="rgba(0,0,0,0.25)" />
      <polygon points={pts.map(([a, b]) => `${a * w},${b * h}`).join(' ')} fill={cor} stroke={V.INK} strokeWidth={4} />
      {borda > 0 && <polygon points={pts.map(([a, b]) => `${a * w},${b * h}`).join(' ')} fill="none" stroke={V.INK}
        strokeWidth={14} strokeDasharray="26 16" opacity={borda} />}
    </g>
  );

const Usina: React.FC<{x: number; y: number; cor: string; p: number}> = ({x, y, cor, p}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <path d="M -50 40 L -50 -10 L -20 5 L -20 -10 L 10 5 L 10 -50 L 30 -50 L 30 40 Z" fill={cor} stroke={V.INK} strokeWidth={4} />
  </g>
);

export const V05_PorUmTriz: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;
  const imp: Impacto[] = [
    {t: t('half', 2), forca: 0.35, congela: 0, flash: false},
    {t: t('cut', 4), forca: 0.5, congela: 0, som: 'clique', volume: 0.6, flash: false},
    {t: t('four', 4), forca: 0.5, congela: 0, flash: false},
    {t: t('zero', 5), forca: 0.4, congela: 0, som: 'carimbo', flash: false},
    {t: t('ninety', 6), forca: 0.6, congela: 0, som: 'estrondo', volume: 0.45, flash: false},
    {t: t('india', 8), forca: 0.35, congela: 0, flash: false},
    {t: t('border', 9), forca: 0.5, congela: 0, som: 'carimbo', flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const neve = React.useMemo(() => { const r = aleatorio(5); return [...Array(70)].map(() => ({x: r() * W, v: 60 + r() * 120, f: r() * 10, t: 3 + r() * 6})); }, []);

  // Texas: frequência (minutos depois de 1:40) e relógio
  const tf = t('frequency', 3), tc = t('cut', 4);
  const curva = (m: number) => m < 11 ? 59.62 - 0.02 * m : m < 14 ? 59.4 - (m - 11) * 0.033 : m < 17 ? 59.302 + (m - 14) * 0.13 : Math.min(60.05, 59.69 + (m - 17) * 0.12);
  const minuto = s < tf ? 9 : s < tc ? lerp(9, 13.8, prog(s, tf, tc - tf, (x) => x)) : lerp(13.8, 22, prog(s, tc, 2.2, (x) => x));
  const gx = (m: number) => 180 + (m - 9) * 70, gy = (f: number) => 760 - (f - 59.2) * 520;
  const pts = [] as string[];
  for (let m = 9; m <= minuto; m += 0.1) pts.push(`${gx(m)},${gy(curva(m))}`);
  const usado = s < t('nine', 3) ? 0 : Math.min(263, (s - t('nine', 3)) * 70 + (s > tc ? 0 : 0));
  const congelou = prog(s, t('froze', 2), 1.5, (x) => x);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={respiro(s).zoom} foco={respiro(s).foco}>
        <FundoKraft />
        {/* -------- Texas: falas 1 a 5 -------- */}
        {tela(s, 1, 5) && <AbsoluteFill>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {neve.map((n, i) => <circle key={i} cx={(n.x + Math.sin(s + n.f) * 30) % W} cy={((s * n.v + n.f * 100) % (H + 40)) - 20} r={5} fill="#F3EDE1"
              opacity={vida(s, t('storm', 2) - 0.3, fim(2)) * 0.8} />)}
            <Mapa pts={TEXAS} x={1180} y={200} w={600} h={560} p={pop(s, t('texas', 1)) * sai(s, fim(2), 0.3)} rot={2} cor={lerp(0, 1, congelou) > 0.5 ? '#B9C2C4' : V.GOLD} />
            {[[1320, 470], [1450, 560], [1580, 470], [1420, 380], [1560, 640], [1300, 600]].map(([x, y], k) =>
              <Usina key={k} x={x} y={y} p={pop(s, t('plants', 2) + k * 0.1) * sai(s, fim(2), 0.3)} cor={s > t('froze', 2) + k * 0.25 ? '#9AA6AD' : V.C1} />)}
          </svg>
          <Rotulo s={s} t={t('february', 1)} ate={fim(2)} x={180} y={200} ancora="esquerda" fundo={V.INK} size={58}>TEXAS · FEB 2021</Rotulo>
          <Rotulo s={s} t={t('storm', 2)} ate={fim(2)} x={180} y={330} ancora="esquerda" fundo={V.C2} size={52} rot={2}>WINTER STORM</Rotulo>
          {(() => { const p = vida(s, t('half', 2) - 0.1, fim(2)); return p > 0 && <div style={{position: 'absolute', left: 180, top: 470, opacity: p}}>
            <div style={{width: 760, height: 64, background: V.GOOD, border: `5px solid ${V.INK}`, position: 'relative'}}>
              <div style={{position: 'absolute', right: 0, top: 0, height: '100%', width: `${48.6 * prog(s, t('half', 2), 0.8)}%`, background: V.C1}} /></div>
            <div style={{fontFamily: LM, fontWeight: 700, fontSize: 54, color: V.C1, marginTop: 14}}>48.6% of generation gone</div></div>; })()}
          {/* gráfico da frequência */}
          {s > ini(3) - 0.25 && <Cartao s={s} t={ini(3) - 0.2} x={140} y={150} w={1000} h={780} rot={-1} seed={3} som={false}>
            <svg width={1000} height={780} style={{position: 'absolute'}}>
              <line x1={160} y1={gy(59.4) - 150} x2={980} y2={gy(59.4) - 150} stroke={V.C1} strokeWidth={4} strokeDasharray="14 10" />
              <text x={975} y={gy(59.4) - 162} fontFamily={LM} fontSize={30} fill={V.C1} textAnchor="end">59.4 Hz</text>
              <line x1={160} y1={gy(60) - 150} x2={980} y2={gy(60) - 150} stroke={V.GOOD} strokeWidth={3} strokeDasharray="6 8" />
              <text x={975} y={gy(60) - 162} fontFamily={LM} fontSize={30} fill={V.GOOD} textAnchor="end">60 Hz</text>
              <polyline points={pts.map((q) => { const [a, b] = q.split(','); return `${+a - 20},${+b - 150}`; }).join(' ')} fill="none" stroke={V.INK} strokeWidth={8} strokeLinejoin="round" />
            </svg>
            <div style={{position: 'absolute', left: 60, top: 40, fontFamily: LM, fontWeight: 700, fontSize: 56, color: V.INK}}>
              {`${Math.floor(1 + (40 + minuto) / 60)}:${String(Math.floor((40 + minuto) % 60)).padStart(2, '0')} a.m.`}</div>
          </Cartao>}
          {(() => { const p = vida(s, t('nine', 3) - 0.1, fim(5)); return p > 0 && <div style={{position: 'absolute', left: 1180, top: 160, width: 640, opacity: p}}>
            <div style={{fontFamily: LM, fontWeight: 700, fontSize: 40, color: V.INK, whiteSpace: 'pre'}}>time allowed below 59.4 Hz</div>
            <div style={{height: 70, border: `5px solid ${V.INK}`, background: V.SHEET, marginTop: 14, position: 'relative'}}>
              <div style={{height: '100%', width: `${(usado / 540) * 100}%`, background: V.C1}} /></div>
            <div style={{fontFamily: LM, fontWeight: 700, fontSize: 120, color: s > t('four', 4) ? V.GOLD : V.INK, marginTop: 10}}>
              {(() => { const r = 540 - usado; return `${Math.floor(r / 60)}:${String(Math.round(r % 60)).padStart(2, '0')}`; })()}</div>
          </div>; })()}
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {[...Array(12)].map((_, k) => {
              const x = 1220 + (k % 6) * 100, y = 640 + Math.floor(k / 6) * 110;
              const apagada = s > tc + k * 0.06;
              return <g key={k} opacity={vida(s, tc - 0.4, fim(4))} transform={`translate(${x} ${y})`}>
                <rect x={-34} y={-20} width={68} height={56} fill={apagada ? V.C2 : V.GOLD} stroke={V.INK} strokeWidth={3} />
                <polygon points="-42,-20 0,-56 42,-20" fill={V.INK} />
                <rect x={-10} y={0} width={20} height={20} fill={apagada ? '#2A2826' : '#FFF1D0'} />
              </g>;
            })}
          </svg>
          <Rotulo s={s} t={t('four', 4) + 0.6} ate={fim(4)} x={1450} y={900} fundo={V.GOLD} size={58} rot={-4}>4:37 LEFT</Rotulo>
          <Rotulo s={s} t={t('zero', 5)} x={1440} y={640} fundo={V.C1} size={54} rot={-5} seed={8} som={false}>RESTART FROM ZERO</Rotulo>
          <Rotulo s={s} t={t('weeks', 5)} x={1440} y={780} fundo={V.INK} size={50} rot={4} seed={2}>COULD TAKE WEEKS</Rotulo>
        </AbsoluteFill>}

        {/* -------- Espanha e Portugal: falas 6 e 7 -------- */}
        {tela(s, 6, 7) && (() => {
          const ts = t('ninety', 6);
          const escuro = prog(s, ts - 0.2, 1.2);
          const tens = s < t('voltage', 7) ? 230 : lerp(230, 290, prog(s, t('voltage', 7), 0.6)) + 6 * Math.sin(s * 30);
          return <AbsoluteFill>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              <Mapa pts={IBERIA} x={180} y={230} w={760} h={620} p={pop(s, t('spain', 6))} cor={escuro > 0.5 ? '#3A3633' : V.GOLD} />
              <Mapa pts={PORTUGAL} x={180} y={230} w={760} h={620} p={pop(s, t('portugal', 6))} cor={escuro > 0.5 ? '#2A2826' : V.C1} />
            </svg>
            <Rotulo s={s} t={t('april', 6)} ate={fim(7)} x={180} y={150} ancora="esquerda" fundo={V.INK} size={54}>SPAIN + PORTUGAL · APR 2025</Rotulo>
            <Bate s={s} t={ts} ate={fim(6)} x={1400} y={330} size={150} cor={V.C1}>{'< 90 s'}</Bate>
            <Bate s={s} t={t('sixty', 6)} ate={fim(6)} x={1400} y={520} size={100} cor={V.INK}>{milhar(conta(s, t('sixty', 6), 0.7, 0, 60000000))}</Bate>
            <Sobe s={s} t={t('sixty', 6) + 0.4} ate={fim(6)} x={1400} y={600} size={44} ancora="centro" cor={V.INK}>people</Sobe>
            <Rotulo s={s} t={t('sixteen', 6)} ate={fim(6)} x={1400} y={730} fundo={V.C2} size={56} rot={3}>UP TO 16 H TO RESTORE</Rotulo>
            {s > t('voltage', 7) - 0.3 && <Cartao s={s} t={t('voltage', 7) - 0.3} x={1040} y={260} w={700} h={580} rot={2} seed={4}>
              <div style={{position: 'absolute', left: 50, top: 40, fontFamily: LM, fontWeight: 700, fontSize: 52, color: V.INK}}>voltage surge</div>
              <div style={{position: 'absolute', left: 50, top: 130, width: 660, height: 60, border: `4px solid ${V.INK}`}}>
                <div style={{height: '100%', width: `${((tens - 200) / 100) * 100}%`, background: tens > 255 ? V.C1 : V.GOOD}} /></div>
              <div style={{position: 'absolute', left: 50 + 660 * 0.55, top: 120, width: 6, height: 80, background: V.INK}} />
              <div style={{position: 'absolute', left: 50 + 660 * 0.55 - 60, top: 210, fontFamily: LM, fontSize: 36, color: V.INK}}>safe limit</div>
              <svg width={760} height={600} style={{position: 'absolute'}}>
                {[...Array(6)].map((_, k) => {
                  const off = s > t('disconnected', 7) + k * 0.3;
                  return <g key={k} transform={`translate(${110 + k * 110} 420)`}>
                    <Usina x={0} y={0} cor={off ? '#6E6862' : V.GOLD} p={1} />
                    {off && <text x={0} y={90} fontFamily={LM} fontWeight={700} fontSize={34} fill={V.C1} textAnchor="middle">OFF</text>}
                  </g>;
                })}
              </svg>
            </Cartao>}
          </AbsoluteFill>;
        })()}

        {/* -------- Índia: fala 8 -------- */}
        {tela(s, 8, 8) && <AbsoluteFill>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <Mapa pts={INDIA} x={200} y={170} w={720} h={760} p={pop(s, ini(8))} cor={s > t('india', 8) + 1.2 ? '#3A3633' : V.GOLD} />
            {[...Array(100)].map((_, k) => {
              const x = 1080 + (k % 10) * 70, y = 330 + Math.floor(k / 10) * 60;
              return <circle key={k} cx={x} cy={y} r={20} fill={k < 9 && s > t('nine', 8) + k * 0.05 ? V.C1 : '#B8A98A'}
                opacity={vida(s, t('nine', 8) - 0.5 + (k % 10) * 0.01, fim(8))} />;
            })}
          </svg>
          <Rotulo s={s} t={t('twelve', 8)} x={200} y={140} ancora="esquerda" fundo={V.INK} size={52}>INDIA · JUL 2012</Rotulo>
          <Bate s={s} t={t('six', 8)} x={1430} y={190} size={110} cor={V.INK}>{milhar(conta(s, t('six', 8), 0.8, 0, 620000000))}</Bate>
          <Sobe s={s} t={t('nine', 8) + 0.4} x={1430} y={960} size={52} ancora="centro" cor={V.C1}>9% of everyone on Earth</Sobe>
        </AbsoluteFill>}

        {/* -------- fala 9: todos pararam numa fronteira -------- */}
        {tela(s, 9, 9) && <AbsoluteFill>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <Mapa pts={TEXAS} x={190} y={300} w={460} h={430} p={pop(s, ini(9))} cor="#3A3633" borda={prog(s, t('border', 9), 0.4)} rot={-2} />
            <Mapa pts={IBERIA} x={720} y={320} w={480} h={400} p={pop(s, ini(9) + 0.15)} cor="#3A3633" borda={prog(s, t('border', 9) + 0.1, 0.4)} rot={2} />
            <Mapa pts={INDIA} x={1340} y={270} w={430} h={460} p={pop(s, ini(9) + 0.3)} cor="#3A3633" borda={prog(s, t('border', 9) + 0.2, 0.4)} rot={-1} />
          </svg>
          <Bate s={s} t={t('border', 9)} x={960} y={900} size={110} cor={V.C1} rot={-2} som={false}>STOPPED AT A BORDER</Bate>
        </AbsoluteFill>}
      </Camera>
      <Vinheta forca={0.3} cor="60,40,20" />
      <Grao forca={0.07} />
      <Som nome="clique" t={t('disconnected', 7)} volume={0.45} />
    </AbsoluteFill>
  );
};
