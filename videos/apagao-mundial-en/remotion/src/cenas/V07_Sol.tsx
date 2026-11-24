// V07 | O Sol, em papel envelhecido com traço de gravura: 1859, a nuvem viajando até a Terra, auroras até Havana,
// telégrafos danificados, as linhas de hoje, Quebec 1989, o índice Dst e as duas estimativas de probabilidade.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, Particulas, useAcao, Impacto, Estouro} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {respiro} from './pecas';
import {W, H, Grao, Vinheta, FundoPapel, Bate, Sobe, Rotulo, Cartao, Som, Torre, vida} from './apagao';

const SEPIA = '#5B4330';
const curvaAlta = (a: number) => 1 - Math.pow(1 - 0.12, a / 10);
const curvaBaixa = (a: number) => 1 - Math.pow(1 - 0.007, a / 10);

/** Sol em gravura: disco com hachura e raios que giram devagar. */
const SolGravura: React.FC<{x: number; y: number; r: number; s: number; p: number; clarao?: number}> = ({x, y, r, s, p, clarao = 0}) => (
  <g opacity={Math.min(1, p * 2)} transform={`translate(${x} ${y}) scale(${p})`}>
    <g transform={`rotate(${s * 6})`}>
      {[...Array(24)].map((_, k) => <path key={k} d={`M ${-r * 0.08} ${-r * 1.08} L 0 ${-r * (1.45 + 0.12 * (k % 2))} L ${r * 0.08} ${-r * 1.08} Z`}
        fill={k % 2 ? V.GOLD : SEPIA} transform={`rotate(${k * 15})`} />)}
    </g>
    <circle r={r} fill="#E6C98E" stroke={SEPIA} strokeWidth={6} />
    {[...Array(9)].map((_, k) => <line key={k} x1={-r} y1={-r + (k + 1) * r * 0.2} x2={r} y2={-r + (k + 1) * r * 0.2} stroke={SEPIA} strokeWidth={2} opacity={0.35}
      clipPath="circle()" />)}
    <circle r={r * 0.25} cx={r * 0.35} cy={-r * 0.2} fill="#FFF6DC" opacity={clarao} />
    <circle r={r * 0.6} cx={r * 0.35} cy={-r * 0.2} fill="#FFF6DC" opacity={clarao * 0.35} />
  </g>
);

export const V07_Sol: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;
  const imp: Impacto[] = [
    {t: t('burst', 1), forca: 0.5, congela: 0, som: 'estrondo', volume: 0.4},
    {t: t('hit', 3), forca: 0.6, congela: 0, som: 'estrondo', volume: 0.5},
    {t: t('damaged', 4), forca: 0.4, congela: 0, som: 'carimbo', flash: false},
    {t: t('quebec', 6), forca: 0.4, congela: 0, flash: false},
    {t: t('zero', 11), forca: 0.4, congela: 0, som: 'carimbo', flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);

  // fala 2: a viagem
  const viagem = prog(s, t('cloud', 2), Math.max(1, t('day', 2) - t('cloud', 2) + 0.3), (x) => x);
  const horas = Math.round(21 * prog(s, t('speed', 2), Math.max(0.8, t('day', 2) - t('speed', 2) + 0.2), (x) => x));

  // gráfico (falas 8 a 11)
  const gx = (a: number) => 260 + a * 18, gy = (p: number) => 900 - p * 1250;
  const traco = (fn: (a: number) => number, ate: number) => {
    const pts: string[] = [];
    for (let a = 0; a <= ate; a += 0.5) pts.push(`${gx(a)},${gy(fn(a))}`);
    return pts.join(' ');
  };
  const pAlta = prog(s, t('thirty', 9) - 0.3, 1.2, (x) => x) * 60;
  const pBaixa = prog(s, t('zero', 10) - 0.2, 1.2, (x) => x) * 60;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={respiro(s).zoom} foco={respiro(s).foco}>
        <FundoPapel deriva={(s % 25) / 25} />
        {/* -------- falas 1 a 3 -------- */}
        {tela(s, 1, 3) && (() => {
          const zT = prog(s, ini(3) - 0.2, 0.8);
          return <AbsoluteFill>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              <SolGravura x={lerp(600, 400, prog(s, ini(2) - 0.2, 0.7))} y={560} r={lerp(230, 170, prog(s, ini(2) - 0.2, 0.7))} s={s}
                p={pop(s, ini(1) + 0.1, 0.9) * (1 - zT)} clarao={prog(s, t('burst', 1), 0.2) * sai(s, t('burst', 1) + 1.2, 0.8)} />
              {/* a nuvem */}
              {s > t('cloud', 2) - 0.1 && s < ini(3) && <g transform={`translate(${lerp(480, 1460, viagem)} ${560 + 30 * Math.sin(s * 3)})`}>
                {[[0, 0, 70], [-60, 20, 50], [55, 25, 55], [10, -45, 45], [-90, -10, 35]].map(([x, y, r], k) =>
                  <circle key={k} cx={x} cy={y} r={r * (1 + 0.6 * viagem)} fill={V.C1} opacity={0.75} stroke={SEPIA} strokeWidth={3} />)}
              </g>}
              {/* a Terra */}
              <g opacity={vida(s, t('cloud', 2), undefined)} transform={`translate(${lerp(1600, 960, zT)} ${lerp(560, 640, zT)}) scale(${lerp(1, 4.2, zT)})`}>
                <circle r={70} fill="#6F9AB5" stroke={SEPIA} strokeWidth={4 / lerp(1, 4.2, zT)} />
                <path d="M -40 -30 Q -10 -50 10 -30 Q 30 -10 0 0 Q -30 10 -40 -30 Z M 10 20 Q 40 10 45 35 Q 20 55 5 40 Z" fill="#8FAE5E" />
                {/* auroras (fala 3) */}
                {[0, 1, 2].map((k) => <path key={k} d={`M -75 ${-60 - k * 9} Q -30 ${-100 - k * 10 + 10 * Math.sin(s * 3 + k)} 0 ${-78 - k * 9} T 75 ${-60 - k * 9}`}
                  fill="none" stroke={['#5FA36A', '#8CC07A', '#C97A8E'][k]} strokeWidth={4} opacity={prog(s, t('auroras', 3), 0.6) * 0.9} />)}
                {s > t('havana', 3) && <g opacity={prog(s, t('havana', 3), 0.3)}><circle cx={-22} cy={-2} r={3.5} fill={V.C1} /></g>}
              </g>
            </svg>
            <Rotulo s={s} t={t('september', 1)} ate={fim(1)} x={1320} y={260} fundo={SEPIA} cor={V.SHEET} size={62}>SEPT 1, 1859</Rotulo>
            <Sobe s={s} t={t('carrington', 1)} ate={fim(1)} x={1320} y={350} size={52} ancora="centro" cor={SEPIA}>Richard Carrington</Sobe>
            <Sobe s={s} t={t('two', 2)} ate={fim(2)} x={960} y={150} size={60} ancora="centro" cor={V.C1}>up to 2,000 km/s</Sobe>
            {s > t('speed', 2) && s < ini(3) && <div style={{position: 'absolute', left: 960, top: 850, transform: 'translateX(-50%)', fontFamily: LM, fontWeight: 700, fontSize: 90, color: SEPIA}}>{horas} h</div>}
            <Rotulo s={s} t={t('day', 2)} ate={fim(2)} x={1500} y={860} fundo={V.C1} size={56} rot={-3}>{'< 1 DAY'}</Rotulo>
            <Bate s={s} t={t('largest', 3)} x={960} y={140} size={80} cor={SEPIA} som={false}>the largest solar storm ever recorded</Bate>
            <Rotulo s={s} t={t('havana', 3)} x={1220} y={880} fundo={V.SHEET} cor={SEPIA} size={50} rot={3}>AURORAS AS FAR SOUTH AS HAVANA</Rotulo>
          </AbsoluteFill>;
        })()}
        {/* -------- falas 4 e 5: telégrafo e linhas de hoje -------- */}
        {tela(s, 4, 5) && (() => {
          const hoje = prog(s, t('today', 5), 0.8);
          const pulso = (s * 1.2) % 1;
          return <AbsoluteFill>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              {[...Array(5)].map((_, k) => {
                const x = 240 + k * 360, y = 760;
                return <g key={k} opacity={1 - hoje} transform={`translate(0 ${(1 - pop(s, ini(4) - 0.2 + k * 0.08)) * 200})`}>
                  <rect x={x - 8} y={y - 330} width={16} height={330} fill={SEPIA} />
                  <rect x={x - 60} y={y - 320} width={120} height={14} fill={SEPIA} />
                </g>;
              })}
              <path d={`M 240 450 ${[...Array(4)].map((_, k) => `Q ${420 + k * 360} 500 ${600 + k * 360} 450`).join(' ')}`} fill="none" stroke={SEPIA} strokeWidth={5} opacity={1 - hoje} />
              {hoje > 0 && [...Array(5)].map((_, k) => <Torre key={k} x={300 + k * 330} y={900} h={lerp(200, 420, hoje)} cor={SEPIA} op={hoje} />)}
              {hoje > 0 && <path d={`M 220 ${900 - 0.8 * 420 * hoje} L 1700 ${900 - 0.8 * 420 * hoje}`} stroke={s > t('needs', 5) ? V.C1 : SEPIA} strokeWidth={6} opacity={hoje} />}
              {s > t('currents', 4) && [...Array(10)].map((_, k) => {
                const u = (k / 10 + pulso) % 1;
                const y = hoje > 0.5 ? 900 - 0.8 * 420 : 455 + 20 * Math.sin(u * Math.PI * 12);
                return <circle key={k} cx={(hoje > 0.5 ? 220 : 240) + u * (hoje > 0.5 ? 1480 : 1440)} cy={y} r={12} fill={V.C1} opacity={0.9} />;
              })}
            </svg>
            <Particulas a={s} t={t('damaged', 4) - 0.1} x={800} y={460} n={20} cores={[V.GOLD, V.C1]} />
            <Estouro s={s} t={t('damaged', 4) - 0.1} x={800} y={460} forca={0.5} cor="#FFF6DC" cor2={V.C1} />
            <Rotulo s={s} t={t('telegraph', 4)} ate={fim(4)} x={960} y={180} fundo={SEPIA} cor={V.SHEET} size={60}>TELEGRAPH, 1859</Rotulo>
            <Rotulo s={s} t={t('damaged', 4)} ate={fim(4)} x={1400} y={300} fundo={V.C1} size={66} rot={-6} som={false}>DAMAGED</Rotulo>
            <Rotulo s={s} t={t('hundreds', 5)} x={960} y={180} fundo={V.INK} size={58}>HUNDREDS OF MILES OF WIRE</Rotulo>
          </AbsoluteFill>;
        })()}
        {/* -------- falas 6 e 7: Quebec e o Dst -------- */}
        {tela(s, 6, 7) && <AbsoluteFill>
          <Cartao s={s} t={t('march', 6) - 0.2} x={150} y={170} w={720} h={520} rot={-3} seed={9} fundo="#F1E8D4">
            <div style={{position: 'absolute', left: 50, top: 40, fontFamily: LM, fontWeight: 700, fontSize: 46, color: SEPIA, borderBottom: `4px solid ${SEPIA}`, paddingBottom: 10, width: 620}}>MARCH 1989</div>
            <div style={{position: 'absolute', left: 50, top: 150, fontFamily: LM, fontWeight: 700, fontSize: 84, color: V.INK, lineHeight: 1.0}}>QUEBEC<br />GRID DOWN</div>
            <div style={{position: 'absolute', left: 50, top: 380, fontFamily: LM, fontSize: 40, color: SEPIA, width: 620}}>a much smaller storm</div>
          </Cartao>
          {(() => {
            const p = vida(s, t('dst', 7) - 0.2, undefined), q = prog(s, t('quebec', 7), 0.7), c = prog(s, t('carrington', 7), 0.9);
            return p > 0 && <svg width={W} height={H} style={{position: 'absolute', opacity: p}}>
              <text x={1000} y={210} fontFamily={LM} fontWeight={700} fontSize={56} fill={SEPIA}>Dst index (nT)</text>
              <line x1={1000} y1={260} x2={1820} y2={260} stroke={SEPIA} strokeWidth={5} />
              <rect x={1080} y={260} width={240} height={560 * 589 / 850 * q} fill={V.C2} stroke={SEPIA} strokeWidth={4} />
              <text x={1200} y={260 + 560 * 589 / 850 * q + 60} fontFamily={LM} fontWeight={700} fontSize={50} fill={V.INK} textAnchor="middle" opacity={q}>−589</text>
              <text x={1200} y={320} fontFamily={LM} fontSize={36} fill={V.SHEET} textAnchor="middle" opacity={q}>Quebec</text>
              <rect x={1460} y={260} width={240} height={560 * c} fill={V.C1} stroke={SEPIA} strokeWidth={4} />
              <text x={1580} y={260 + 560 * c + 60} fontFamily={LM} fontWeight={700} fontSize={50} fill={V.INK} textAnchor="middle" opacity={c}>≈ −850</text>
              <text x={1580} y={320} fontFamily={LM} fontSize={36} fill={V.SHEET} textAnchor="middle" opacity={c}>Carrington</text>
            </svg>;
          })()}
          <Rotulo s={s} t={t('half', 7)} x={500} y={860} fundo={V.GOLD} size={70} rot={-3}>≈ 1.5× STRONGER</Rotulo>
        </AbsoluteFill>}
        {/* -------- falas 8 a 11: as chances -------- */}
        {tela(s, 8, 11) && <AbsoluteFill>
          <Cartao s={s} t={ini(8) - 0.2} x={150} y={100} w={1150} h={890} rot={-1} seed={6} fundo="#F1E8D4" som={false}>
            <svg width={1180} height={900} style={{position: 'absolute'}}>
              <line x1={150} y1={790} x2={1140} y2={790} stroke={SEPIA} strokeWidth={4} />
              <line x1={150} y1={790} x2={150} y2={70} stroke={SEPIA} strokeWidth={4} />
              {[0, 10, 20, 30, 40, 50, 60].map((a) => <text key={a} x={gx(a) - 110} y={835} fontFamily={LM} fontSize={30} fill={SEPIA} textAnchor="middle">{a}</text>)}
              {[0.1, 0.2, 0.3, 0.4, 0.5].map((p) => <text key={p} x={135} y={gy(p) - 110 + 10} fontFamily={LM} fontSize={30} fill={SEPIA} textAnchor="end">{Math.round(p * 100)}%</text>)}
              <text x={640} y={880} fontFamily={LM} fontSize={32} fill={SEPIA} textAnchor="middle">years from now</text>
              <g transform="translate(-110 -110)">
                {pAlta > 0 && <polyline points={traco(curvaAlta, pAlta)} fill="none" stroke={V.C1} strokeWidth={9} />}
                {pBaixa > 0 && <polyline points={traco(curvaBaixa, pBaixa)} fill="none" stroke={V.C2} strokeWidth={9} />}
                {s > t('percent', 9) - 0.2 && <><line x1={gx(30)} y1={900} x2={gx(30)} y2={gy(curvaAlta(30))} stroke={SEPIA} strokeDasharray="10 8" strokeWidth={3} />
                  <circle cx={gx(30)} cy={gy(curvaAlta(30))} r={16} fill={V.C1} />
                  <text x={gx(30) - 30} y={gy(curvaAlta(30)) - 30} fontFamily={LM} fontWeight={700} fontSize={52} fill={V.C1} textAnchor="end">32%</text></>}
                {s > t('two', 10) - 0.2 && <text x={gx(42)} y={gy(curvaBaixa(30)) - 30} fontFamily={LM} fontWeight={700} fontSize={48} fill={V.C2}>2%</text>}
              </g>
            </svg>
          </Cartao>
          <Rotulo s={s} t={t('agree', 8)} x={1520} y={190} fundo={V.INK} size={36} rot={3}>SCIENTISTS DON'T AGREE</Rotulo>
          <Cartao s={s} t={t('twelve', 8) - 0.3} x={1340} y={250} w={520} h={190} rot={2} seed={3} fundo={V.SHEET}>
            <div style={{padding: '30px 34px', fontFamily: LM, color: V.C1}}><div style={{fontSize: 40}}>Riley, 2012</div><div style={{fontSize: 52, fontWeight: 700, whiteSpace: 'pre'}}>12% / decade</div></div>
          </Cartao>
          {(() => { const p = vida(s, t('three', 9), undefined); return p > 0 && <div style={{position: 'absolute', left: 1350, top: 500, opacity: p, display: 'flex', gap: 20, alignItems: 'center'}}>
            {[0, 1, 2].map((k) => <div key={k} style={{width: 76, height: 76, borderRadius: 38, background: k === 0 ? V.C1 : 'transparent', border: `6px solid ${V.C1}`, transform: `scale(${pop(s, t('three', 9) + k * 0.12)})`}} />)}
            <div style={{fontFamily: LM, fontWeight: 700, fontSize: 58, color: V.C1}}>1 in 3</div></div>; })()}
          <Cartao s={s} t={t('zero', 10) - 0.3} x={1340} y={660} w={520} h={190} rot={-2} seed={7} fundo={V.SHEET}>
            <div style={{padding: '30px 34px', fontFamily: LM, color: V.C2}}><div style={{fontSize: 40}}>later analysis</div><div style={{fontSize: 52, fontWeight: 700, whiteSpace: 'pre'}}>0.7% / decade</div></div>
          </Cartao>
          <Rotulo s={s} t={t('fifty', 11)} x={960} y={130} fundo={V.GOLD} size={50}>BETWEEN 1 IN 50 AND 1 IN 3</Rotulo>
          <Rotulo s={s} t={t('zero', 11)} x={1480} y={920} fundo={V.C1} size={54} rot={-5} som={false}>NOBODY SAYS ZERO</Rotulo>
        </AbsoluteFill>}
      </Camera>
      <Vinheta forca={0.35} cor="60,40,20" />
      <Grao forca={0.06} />
      <Som nome="whoosh" t={t('hit', 3) - 0.4} volume={0.45} />
    </AbsoluteFill>
  );
};
