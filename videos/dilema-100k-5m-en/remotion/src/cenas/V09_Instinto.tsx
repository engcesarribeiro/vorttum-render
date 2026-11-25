// V09 | Por que o instinto diz "pega o dinheiro": efeito certeza (balança), a pessoa sozinha na fatia cinza e as três camadas lado a lado.
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Card, Carimbo, G, GRAY, Papel, Pizza, Txt, V, W, H, lin, useT, vis, prog, pop, sai} from './pauta';

const Cerebro: React.FC<{cx: number; cy: number; k: number; cor: string}> = ({cx, cy, k, cor}) => (
  <g transform={`translate(${cx} ${cy}) scale(${k})`}>
    {[[-46, -10], [0, -30], [46, -10], [-26, 24], [26, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={40} fill={cor} stroke={V.INK} strokeWidth={5} />)}
    <path d="M 0 -60 Q -14 -20 0 20 Q 14 50 0 64" fill="none" stroke={V.INK} strokeWidth={4} />
  </g>
);

export const V09_Instinto: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3);
  // fala 1: balança; o prato "sure" pesa mais
  const tilt = prog(s, t('weight', 1), 1.0);
  const tiltAng = 9 * tilt;                     // + = lado esquerdo desce
  // fala 3: painéis
  const pn = [
    {x: 120, tt: t('chance', 3), tit: 'Will I win?', val: '92.8%', cor: V.GOLD, sub: 'chance of ever winning'},
    {x: 700, tt: t('time', 3), tit: 'When?', val: '13.2 y', cor: V.GOOD, sub: 'median wait'},
    {x: 1280, tt: t('average', 3), tit: 'How much?', val: '$13.1M', cor: V.C1, sub: 'expected value'},
  ];
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <Card x={110} y={80} w={1300} h={110} p={vis(s, t('Kahneman', 1), f1)} cor="#EADCBE">
        <Big x={650} y={55} p={1} size={46} cor={V.INK}>Certainty effect · Kahneman &amp; Tversky, 1979</Big>
      </Card>
      <Big x={960} y={250} p={vis(s, t('gamble', 1), f1)} size={60} cor={V.GOOD}>the math says: gamble</Big>
      <Big x={960} y={330} p={vis(s, t('gut', 1), f1)} size={60} cor={V.C1}>why does the gut say “briefcase”?</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('weight', 1) - 0.3, f1)} transform="translate(0 110)">
          <polygon points="960,780 880,900 1040,900" fill={V.INK} />
          <rect x={940} y={420} width={40} height={380} fill={V.INK} />
          <g transform={`rotate(${tiltAng} 960 430)`}>
            <rect x={400} y={418} width={1120} height={24} fill={V.INK} />
            <g transform={`rotate(${-tiltAng} 460 430)`}>
              <line x1={460} y1={430} x2={460} y2={560} stroke={V.INK} strokeWidth={5} />
              <rect x={320} y={560} width={280} height={30} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
              <Cerebro cx={460} cy={500} k={0.85} cor={V.GOLD} />
            </g>
            <g transform={`rotate(${-tiltAng} 1460 430)`}>
              <line x1={1460} y1={430} x2={1460} y2={560} stroke={V.INK} strokeWidth={5} />
              <rect x={1320} y={560} width={280} height={30} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
              <Cerebro cx={1460} cy={500} k={0.85} cor={GRAY} />
            </g>
          </g>
        </g>
      </svg>
      <Big x={460} y={830} p={vis(s, t('sure', 1), f1)} size={60} cor={V.GOLD}>SURE · $100,000</Big>
      <Big x={460} y={905} p={vis(s, t('sure', 1), f1)} size={40} cor={V.MUTED}>feels bigger than its size</Big>
      <Big x={1460} y={830} p={vis(s, t('ninety-three', 1), f1)} size={60} cor={V.MUTED}>93% CHANCE</Big>
      <Big x={1460} y={905} p={vis(s, t('ninety-three', 1), f1)} size={40} cor={V.MUTED}>feels smaller than its size</Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2: a pessoa sozinha na fatia cinza */}
      <Big x={960} y={480} p={vis(s, t('honestly', 2), t('average', 2) - 0.15)} size={96} cor={V.INK}>the gut is not always wrong</Big>
      <Card x={110} y={110} w={1700} h={840} p={vis(s, t('average', 2) - 0.3, f2)} cor="#EFE6D0"><div /></Card>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Pizza cx={620} cy={560} r={310} a={0.928} cor1={V.GOLD} cor2={GRAY} p={vis(s, t('average', 2), f2)} sep={0} />
        <g opacity={vis(s, t('person', 2), f2)}>
          <circle cx={800} cy={300} r={22} fill="#E2CFAE" stroke={V.INK} strokeWidth={4} />
          <rect x={774} y={324} width={52} height={74} rx={14} fill={V.C2} stroke={V.INK} strokeWidth={4} />
        </g>
      </svg>
      <Big x={620} y={170} p={vis(s, t('average', 2), f2)} size={50} cor={V.MUTED}>an average over many lives</Big>
      <Big x={620} y={930} p={vis(s, t('one', 2), f2)} size={46} cor={V.INK}>but you only get one</Big>
      <Card x={1120} y={240} w={640} h={300} p={vis(s, t('debt', 2), f2)} cor="#F3EDE1" rot={3}>
        <Big x={320} y={90} p={1} size={52} cor={V.C1}>RENT DUE</Big>
        <Big x={320} y={190} p={1} size={38} cor={V.MUTED} largura={560}>$100,000 today would change everything</Big>
      </Card>
      <Big x={1430} y={650} p={vis(s, t('certainty', 2), f2)} size={50} cor={V.GOOD} largura={620}>certainty has a value the formula does not see</Big>
      <Big x={1430} y={745} p={vis(s, t('rounding', 2), f2)} size={44} cor={V.MUTED} largura={640}>to the average: a rounding error</Big>
      <Big x={1430} y={860} p={pop(s, t('whole', 2))} size={52} cor={V.C1} largura={660}>to them: their whole life</Big>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3: três painéis */}
      <Big x={960} y={140} p={vis(s, t('three', 3), f3)} size={64} cor={V.INK}>the honest answer has three layers</Big>
      {pn.map((p, k) => (
        <React.Fragment key={k}>
          <Card x={p.x} y={250} w={520} h={560} p={vis(s, p.tt, f3)} cor={V.SHEET} borda={p.cor}>
            <div />
          </Card>
          <Big x={p.x + 260} y={340} p={vis(s, p.tt, f3)} size={64} cor={V.INK}>{p.tit}</Big>
          <Big x={p.x + 260} y={530} p={pop(s, p.tt + 0.1)} size={130} cor={p.cor}>{p.val}</Big>
          <Big x={p.x + 260} y={700} p={vis(s, p.tt + 0.2, f3)} size={44} cor={V.MUTED}>{p.sub}</Big>
        </React.Fragment>
      ))}
      <Big x={960} y={930} p={vis(s, t('biggest', 3), f3)} size={60} cor={V.GOLD}>a smart choice looks at all three</Big>
      </Jan>
      <Som nome="papel" t={t('Kahneman', 1)} volume={0.35} />
      <Som nome="baque" t={t('weight', 1) + 0.5} volume={0.4} />
      <Som nome="papel" t={ini(2)} volume={0.35} />
      <Som nome="clique" t={t('person', 2)} volume={0.4} />
      <Som nome="carimbo" t={t('debt', 2)} volume={0.4} />
      {pn.map((p, k) => <Som key={k} nome="pop" t={p.tt} volume={0.35} />)}
    </Papel>
  );
};
