// V08 | A variável escondida, o tempo: muda crescendo da maleta (US$ 100 mil × 1,05^50), cheques do futuro encolhendo e duas barras de horizonte.
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Card, Carimbo, G, GRAY, Maleta, Papel, Txt, V, W, H, fmt, lin, useT, vis, prog, pop, sai} from './pauta';

const Arvore: React.FC<{cx: number; cy: number; k: number; p: number}> = ({cx, cy, k, p}) => (
  <g transform={`translate(${cx} ${cy}) scale(${k})`} opacity={Math.min(1, p * 3)}>
    <path d={`M -14 0 L -8 ${-260 * p} L 8 ${-260 * p} L 14 0 Z`} fill="#6B4A32" stroke={V.INK} strokeWidth={5} />
    {[[-110, -250, 90], [110, -260, 90], [0, -330, 120], [-50, -200, 80], [60, -210, 80]].map(([x, y, r], i) => (
      <circle key={i} cx={x * p} cy={-40 + (y + 40) * p} r={Math.max(2, r * p)} fill={V.GOOD} stroke={V.INK} strokeWidth={5} />
    ))}
  </g>
);

export const V08_Tempo: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3);
  // fala 1: a muda cresce no ritmo de "fifty years"
  const cresce = prog(s, t('grow', 1), t('million', 1) - t('grow', 1) + 0.5, (x) => x);
  // fala 2: linha do tempo, cheques do futuro encolhendo para o valor presente
  const TX0 = 240, TPX = 28;
  const yr = [10, 20, 30, 40, 50];
  const tShrink = t('shrink', 2);
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <Big x={960} y={100} p={vis(s, t('dollar', 1), f1)} size={58} cor={V.MUTED}>a dollar today ≠ a dollar in twenty years</Big>
      <Card x={380} y={420} w={300} h={180} p={vis(s, t('dollar', 1) + 0.3, t('briefcase', 1) - 0.2)} cor="#DFE2D0" borda={V.GOOD}><Big x={150} y={90} p={1} size={90} cor={V.GOOD}>$1</Big></Card>
      <Big x={530} y={650} p={vis(s, t('dollar', 1) + 0.3, t('briefcase', 1) - 0.2)} size={46} cor={V.INK}>today</Big>
      <Card x={1040} y={450} w={220} h={120} p={vis(s, t('twenty', 1), t('briefcase', 1) - 0.2) * 0.6} cor="#DFE2D0" borda={V.MUTED}><Big x={110} y={60} p={1} size={64} cor={V.MUTED}>$1</Big></Card>
      <Big x={1150} y={650} p={vis(s, t('twenty', 1), t('briefcase', 1) - 0.2)} size={46} cor={V.MUTED}>in 20 years: less</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('briefcase', 1), f1)}>
          <Maleta cx={380} cy={900} k={1.0} p={1} />
          <Arvore cx={1600} cy={930} k={1.3} p={Math.max(0.04, cresce)} />
        </g>
      </svg>
      <Big x={380} y={970} p={vis(s, t('briefcase', 1), f1)} size={46} cor={V.INK}>$100,000</Big>
      <Big x={860} y={215} p={vis(s, t('five', 1), f1)} size={74} cor={V.GOLD}>money grows 5% a year</Big>
      <Big x={860} y={330} p={vis(s, t('promise', 1), f1)} size={46} cor={V.MUTED}>a number for the experiment, not a forecast</Big>
      <Big x={860} y={470} p={vis(s, t('fifty', 1), f1)} size={92} cor={V.INK}>$100,000 × 1.05<sup style={{fontSize: 56}}>50</sup></Big>
      <Big x={860} y={640} p={pop(s, t('million', 1))} size={140} cor={V.GOOD}>≈ $1.15 million</Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2: valor presente */}
      <Card x={110} y={130} w={1700} h={820} p={vis(s, ini(2), f2)} cor="#EFE6D0"><div /></Card>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('reverse', 2), f2)}>
          <line x1={TX0} y1={450} x2={TX0 + 50 * TPX} y2={450} stroke={V.MUTED} strokeWidth={5} />
          {[0, ...yr].map((y) => <text key={y} x={TX0 + y * TPX} y={510} fontFamily="Latin Modern" fontSize={34} fill={V.MUTED} textAnchor="middle">{y}</text>)}
          <text x={TX0 + 25 * TPX} y={560} fontFamily="Latin Modern" fontSize={38} fill={V.INK} textAnchor="middle">years from now</text>
        </g>
        {yr.map((y, k) => {
          const sh = prog(s, tShrink + k * 0.18, 0.7);
          const sc = 1 - 0.78 * (y / 50) * sh;
          const x = TX0 + y * TPX - 60 * sc;
          return (
            <g key={y} opacity={vis(s, t('reverse', 2) + 0.2 + k * 0.1, f2)}>
              <rect x={x} y={450 - 40 - 90 * sc} width={120 * sc} height={90 * sc} fill="#EADCBE" stroke={V.INK} strokeWidth={4} opacity={1 - 0.45 * (y / 50) * sh} />
              <text x={x + 60 * sc} y={450 - 40 - 90 * sc / 2 + 12 * sc} fontFamily="Latin Modern" fontWeight={700} fontSize={30 * sc + 6} fill={V.GOOD} textAnchor="middle">$5M</text>
            </g>
          );
        })}
      </svg>
      <Big x={960} y={230} p={vis(s, t('shrink', 2), f2)} size={54} cor={V.MUTED}>shrink every future win back to today’s money</Big>
      <Big x={960} y={650} p={vis(s, t('thirteen', 2), f2)} size={70} cor={V.INK}>$13.1M expected</Big>
      <Big x={960} y={735} p={vis(s, t('four', 2), f2)} size={70} cor={V.GOLD}>→ $4.9M in today’s money</Big>
      <Big x={960} y={820} p={pop(s, t('forty-nine', 2))} size={70} cor={V.GOOD}>≈ 49× the briefcase</Big>
      <Big x={960} y={900} p={vis(s, t('break-even', 2), f2)} size={56} cor={V.C1}>break-even: 1 in 131M → 1 in 49M</Big>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3: horizontes */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('horizon', 3), f3)}>
          <rect x={300} y={300} width={1000} height={90} fill={V.GOLD} stroke={V.INK} strokeWidth={5} />
          <text x={280} y={360} fontFamily="Latin Modern" fontWeight={700} fontSize={50} fill={V.INK} textAnchor="end">50 years</text>
        </g>
        <g opacity={vis(s, t('ten', 3), f3)}>
          <rect x={300} y={560} width={200} height={90} fill={V.C1} stroke={V.INK} strokeWidth={5} />
          <text x={280} y={620} fontFamily="Latin Modern" fontWeight={700} fontSize={50} fill={V.INK} textAnchor="end">10 years</text>
        </g>
      </svg>
      <Big x={1640} y={345} p={vis(s, t('horizon', 3), f3)} size={52} cor={V.INK} largura={480}>92.8% chance · break-even 1 in 131.4M</Big>
      <Big x={1000} y={600} p={vis(s, t('forty-one', 3), f3)} size={54} cor={V.C1} largura={700}>40.9% chance to win</Big>
      <Big x={1000} y={700} p={vis(s, t('break-even', 3), f3)} size={54} cor={V.C1} largura={700}>break-even 1 in 26.3M</Big>
      <Big x={960} y={850} p={vis(s, t('twenty-year-old', 3), f3)} size={52} cor={V.MUTED}>a 20-year-old and someone much older: different deals</Big>
      <Big x={960} y={960} p={pop(s, t('quietly', 3))} size={60} cor={V.INK}>“for your whole life” = “for however long that is”</Big>
      </Jan>
      <Som nome="pop" t={t('grow', 1)} volume={0.35} />
      <Som nome="ding" t={t('million', 1)} volume={0.4} />
      <Som nome="papel" t={ini(2)} volume={0.35} />
      <Som nome="whoosh" t={tShrink} volume={0.35} />
      <Som nome="carimbo" t={t('forty-nine', 2)} volume={0.45} />
      <Som nome="pop" t={t('ten', 3)} volume={0.35} />
      <Som nome="toque" t={t('quietly', 3)} volume={0.35} />
    </Papel>
  );
};
