// T01 | O gancho. Terra em corte (gravura em papel), túnel reto pelo centro; uma pessoa cai, passa pelo
// centro e sobe do outro lado nos primeiros segundos. Depois o relógio com "42 min?".
// O movimento segue o vai e vem do modelo uniforme (x = R cos(ωt)), com o tempo acelerado.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, pop, prog, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Papel, Txt, V, LM, useLatin, vis} from './vorttum';

const CX = 640, CY = 540, R = 420;
const CAMADAS = [
  {r: 1, cor: '#B98A6A'},            // manto (terroso)
  {r: 3480 / 6371, cor: '#C9A86A'},  // núcleo externo
  {r: 1221.5 / 6371, cor: '#E3CF9E'}, // núcleo interno
];

/** Travessia de cima para baixo em `dur` segundos (fase 0 → π). Antes de t0: no topo. */
const yPessoa = (s: number, t0: number, dur: number, fasesMax = Math.PI) => {
  const fase = Math.min(fasesMax, Math.max(0, (s - t0) / dur) * Math.PI);
  return CY - (R - 30) * Math.cos(fase);
};

const Pessoa: React.FC<{x: number; y: number; op?: number; rot?: number}> = ({x, y, op = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.7)`} opacity={op}>
    <circle cx={0} cy={-26} r={9} fill={V.INK} />
    <path d="M -9 -14 L 9 -14 L 7 10 L 3 10 L 2 28 L -2 28 L -3 10 L -7 10 Z" fill={V.INK} />
    <path d="M -9 -13 L -20 -30 M 9 -13 L 20 -30" stroke={V.INK} strokeWidth={4.5} strokeLinecap="round" />
  </g>
);

const Relogio: React.FC<{x: number; y: number; r: number; p: number; ang: number}> = ({x, y, r, p, ang}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: p}}>
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * p})`}>
      <circle cx={6} cy={8} r={r + 14} fill="rgba(42,40,38,0.18)" />
      <circle r={r + 14} fill="#6B4A32" />
      <circle r={r} fill={V.SHEET} stroke={V.INK} strokeWidth={3} />
      {Array.from({length: 60}, (_, k) => {
        const a = (k * 6 - 90) * Math.PI / 180;
        const r0 = k % 5 === 0 ? r * 0.82 : r * 0.9;
        return <line key={k} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r * 0.96 * Math.cos(a)} y2={r * 0.96 * Math.sin(a)}
          stroke={V.INK} strokeWidth={k % 5 === 0 ? 4 : 1.5} />;
      })}
      <line x1={0} y1={0} x2={r * 0.5 * Math.cos((ang / 12 - 90) * Math.PI / 180)} y2={r * 0.5 * Math.sin((ang / 12 - 90) * Math.PI / 180)}
        stroke={V.INK} strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={0} x2={r * 0.75 * Math.cos((ang - 90) * Math.PI / 180)} y2={r * 0.75 * Math.sin((ang - 90) * Math.PI / 180)}
        stroke={V.C1} strokeWidth={5} strokeLinecap="round" />
      <circle r={9} fill={V.INK} />
    </g>
  </svg>
);

export const T01_Gancho: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.25) : props.duracao + 1);

  // 1ª travessia: começa no "jumped" e chega ao outro lado em ~7 s (dentro dos 10 primeiros segundos)
  const tPulo = t('jumped', 1);
  const DUR = 7;
  // 2ª travessia (fala 4): congela antes de chegar ao outro lado
  const t2 = t('possible', 4) - 0.3;
  const segunda = s >= t2;
  const y = segunda ? yPessoa(s, t2, 4.2, Math.PI * 0.84) : yPessoa(s, tPulo, DUR);
  const rot = segunda ? 0 : (s > tPulo + DUR / 2 ? 180 : 0);
  const rastro = segunda ? [CY - R + 30, y] : [CY - R + 30, s > tPulo ? y : CY - R + 30];

  const tCentro = t('center', 2);
  const tUp = t('up', 2);
  const tCalc = t('calculation', 3);
  const tMin = t('minutes', 3);
  const giro = Math.max(0, s - tCalc) * 240;

  return (
    <Papel>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <pattern id="hach" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="9" stroke={V.INK} strokeWidth="1.1" opacity="0.28" />
          </pattern>
          <pattern id="pont" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="1.1" fill={V.INK} opacity="0.3" />
          </pattern>
        </defs>
        {/* sombra de recorte e a Terra em corte, como gravura */}
        <circle cx={CX + 12} cy={CY + 14} r={R + 10} fill="rgba(42,40,38,0.2)" />
        <circle cx={CX} cy={CY} r={R + 10} fill="#8C6A4F" stroke={V.INK} strokeWidth={4} />
        {CAMADAS.map((c, k) => (
          <g key={k}>
            <circle cx={CX} cy={CY} r={R * c.r} fill={c.cor} stroke={V.INK} strokeWidth={2.2} />
            <circle cx={CX} cy={CY} r={R * c.r} fill={k === 2 ? 'url(#pont)' : 'url(#hach)'} />
          </g>
        ))}
        {/* túnel */}
        <rect x={CX - 9} y={CY - R - 10} width={18} height={2 * R + 20} fill={V.INK} />
        <rect x={CX - 4} y={CY - R - 10} width={8} height={2 * R + 20} fill={V.SHEET} opacity={0.9} />
        {/* rastro da queda */}
        <line x1={CX} y1={rastro[0]} x2={CX} y2={rastro[1]} stroke={V.C1} strokeWidth={4} strokeDasharray="10 9"
          opacity={s > tPulo ? 0.85 : 0} />
        {/* centro */}
        <circle cx={CX} cy={CY} r={18 + 6 * pop(s, tCentro)} fill="none" stroke={V.GOLD} strokeWidth={5}
          opacity={vis(s, tCentro, fim(2))} />
        <Pessoa x={CX} y={y} rot={rot} />
        {/* fala 2: subindo do outro lado (para longe do centro) */}
        {(() => {
          const p = vis(s, tUp, fim(2));
          const y0 = CY + R * 0.45, y1 = CY + R * 0.82;
          return <g opacity={p}>
            <line x1={CX + 60} y1={y0} x2={CX + 60} y2={y0 + (y1 - y0) * p} stroke={V.GOOD} strokeWidth={7} />
            <path d={`M ${CX + 44} ${y1 - 18} L ${CX + 76} ${y1 - 18} L ${CX + 60} ${y1 + 6} Z`} fill={V.GOOD} />
          </g>;
        })()}
      </svg>

      {/* fala 1 */}
      <Txt x={1180} y={420} p={vis(s, t('impossible', 1) - 0.2, fim(1))} size={70} serif>sounds impossible</Txt>
      {/* fala 2 */}
      <Txt x={1180} y={300} p={vis(s, t('thousands', 2) - 0.2, fim(2))} size={64} serif>7,918 miles</Txt>
      <Txt x={1180} y={390} p={vis(s, t('thousands', 2), fim(2))} size={38} cor={V.MUTED}>of falling</Txt>
      <Txt x={CX + 42} y={CY - 26} p={vis(s, tCentro, fim(2))} size={40} cor={V.GOLD} serif>center</Txt>
      <Txt x={1180} y={560} p={vis(s, tUp, fim(2))} size={50} cor={V.GOOD} serif>then going up</Txt>
      <Txt x={1180} y={640} p={vis(s, t('engine', 2) - 0.1, fim(2))} size={50} serif>no engine</Txt>

      {/* fala 3 e 4: o relógio */}
      <Relogio x={1460} y={430} r={190} p={vis(s, tCalc - 0.2)} ang={giro} />
      {(() => {
        const p = pop(s, tMin);
        return <div style={{position: 'absolute', left: 1460, top: 690, transform: `translateX(-50%) scale(${0.9 + 0.1 * p})`,
          opacity: s < tMin ? 0 : Math.min(1, p * 1.5), background: '#EADCBE', border: `3px solid ${V.GOLD}`, padding: '8px 34px'}}>
          <span style={{font: `700 76px ${LM}`, color: V.GOLD}}>42 min?</span>
        </div>;
      })()}
      <Txt x={1460} y={850} p={vis(s, t('there', 4))} size={44} ancora="centro" serif largura={900}>
        What happens when you get there?
      </Txt>
    </Papel>
  );
};
