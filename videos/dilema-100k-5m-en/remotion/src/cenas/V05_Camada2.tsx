// V05 | Camada 2, quanto tempo de espera: ampulheta, histograma de 200 mil vidas (mediana 13,2 e média 19,0), cafeteria, "sem memória".
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Card, G, GRAY, HIST, Papel, Txt, V, W, H, fmt, lin, useEixos, useT, vis, prog, pop, sai} from './pauta';

const Pessoa: React.FC<{x: number; y: number; k?: number; cor?: string; cartola?: boolean; p: number}> = ({x, y, k = 1, cor = V.C2, cartola, p}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, p * 2)}>
    <circle cx={0} cy={-90} r={26} fill="#E2CFAE" stroke={V.INK} strokeWidth={4} />
    <rect x={-32} y={-62} width={64} height={92} rx={18} fill={cor} stroke={V.INK} strokeWidth={4} />
    {cartola && <><rect x={-36} y={-124} width={72} height={10} fill={V.INK} /><rect x={-24} y={-170} width={48} height={50} fill={V.INK} /></>}
  </g>
);

export const V05_Camada2: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3), f4 = fim(4);
  // fala 1: ampulheta
  const areia = prog(s, t('average', 1), t('years', 1) - t('average', 1) + 0.6, (x) => x);
  const anos = Math.round(19 * prog(s, t('million', 1, 3), Math.max(0.8, t('nineteen', 1) - t('million', 1, 3) + 0.4), (x) => x));
  // fala 2: histograma de 0 a 60 anos
  const E = useEixos(190, 300, 1260, 500, 60, 1);
  const maxC = Math.max(...HIST.bins_1y.slice(0, 60));
  const tHist = t('half', 2);
  const hist = vis(s, t('strange', 2), t('billionaire', 2) - 0.3);
  const coffee = t('billionaire', 2);
  // fala 3 e 4: linhas do tempo (30 px por ano)
  const X0 = 200, PX = 30;
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('when', 1), f1)} transform="translate(420 520)">
          <polygon points="-130,-260 130,-260 20,0 130,260 -130,260 -20,0" fill="#E7DCC0" stroke={V.INK} strokeWidth={7} />
          <polygon points={`-110,${-240 + 220 * areia} 110,${-240 + 220 * areia} 14,-8 -14,-8`} fill={V.GOLD} opacity={1 - areia} />
          <rect x={-8} y={0} width={16} height={260 * areia} fill={V.GOLD} />
          <polygon points={`-120,240 120,240 ${120 - 110 * (1 - areia)},${240 - 220 * areia} ${-120 + 110 * (1 - areia)},${240 - 220 * areia}`} fill={V.GOLD} />
          <rect x={-170} y={-290} width={340} height={30} fill={V.INK} /><rect x={-170} y={260} width={340} height={30} fill={V.INK} />
        </g>
      </svg>
      <Big x={960} y={100} p={vis(s, ini(1) + 0.3, f1)} size={60} cor={V.MUTED}>knowing if you win ≠ knowing when</Big>
      <Big x={1200} y={230} p={vis(s, t('million', 1), f1)} size={96} cor={V.INK}>1,000,000 rolls</Big>
      <Big x={1200} y={350} p={vis(s, t('ten', 1, 2), f1)} size={72} cor={V.MUTED}>× 10 minutes each</Big>
      <Big x={1200} y={500} p={pop(s, t('million', 1, 3))} size={84} cor={V.INK}>= 10,000,000 minutes</Big>
      <Big x={1200} y={700} p={pop(s, t('nineteen', 1))} size={130} cor={V.C1}>≈ {anos} years</Big>
      <Big x={1200} y={840} p={vis(s, t('nineteen', 1), f1)} size={46} cor={V.MUTED}>on average, until the first win</Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2: histograma */}
      <Big x={960} y={95} p={hist} size={52} cor={V.MUTED}>waiting time for the first win · 200,000 simulated lives</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: hist}}>
        <line x1={E.X(0)} y1={E.Y(0)} x2={E.X(60)} y2={E.Y(0)} stroke={V.MUTED} strokeWidth={4} />
        {HIST.bins_1y.slice(0, 60).map((c, k) => {
          const h = (c / maxC) * E.h * prog(s, tHist + k * 0.035, 0.4);
          return <rect key={k} x={E.X(k) + 2} y={E.Y(0) - h} width={E.w / 60 - 4} height={h} fill={k >= 40 && s > t('forty', 2) ? V.C1 : k < 13 ? V.GOOD : V.GOLD}
            stroke={V.INK} strokeWidth={1.5} />;
        })}
        {[0, 10, 20, 30, 40, 50, 60].map((y) => <text key={y} x={E.X(y)} y={E.Y(0) + 46} fontFamily="Latin Modern" fontSize={34} fill={V.MUTED} textAnchor="middle">{y}</text>)}
        <text x={E.X(30)} y={E.Y(0) + 96} fontFamily="Latin Modern" fontSize={38} fill={V.INK} textAnchor="middle">years until the first win</text>
        <g opacity={vis(s, t('thirteen', 2), t('billionaire', 2) - 0.3)}>
          <line x1={E.X(13.2)} y1={E.Y(0)} x2={E.X(13.2)} y2={E.Y(0) - 520} stroke={V.GOOD} strokeWidth={6} strokeDasharray="14 10" />
          <text x={E.X(13.2) - 14} y={E.Y(0) - 530} fontFamily="Latin Modern" fontWeight={700} fontSize={44} fill={V.GOOD} textAnchor="end">median 13.2 y</text>
        </g>
        <g opacity={vis(s, t('nineteen', 2), t('billionaire', 2) - 0.3)}>
          <line x1={E.X(19)} y1={E.Y(0)} x2={E.X(19)} y2={E.Y(0) - 470} stroke={V.C1} strokeWidth={6} strokeDasharray="14 10" />
          <text x={E.X(19) + 14} y={E.Y(0) - 480} fontFamily="Latin Modern" fontWeight={700} fontSize={44} fill={V.C1}>mean 19.0 y</text>
        </g>
      </svg>
      <Big x={1650} y={420} p={vis(s, t('lopsided', 2), t('billionaire', 2) - 0.3)} size={50} cor={V.C1} largura={330}>12% wait more than 40 years</Big>
      {/* cafeteria */}
      <Card x={140} y={150} w={1640} h={760} p={vis(s, coffee - 0.2, f2)} cor="#E2D2B4"><div /></Card>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 7}, (_, k) => <Pessoa key={k} x={330 + k * 150} y={700} k={1.4} cor={[V.C2, V.GOOD, V.GOLD, V.INK][k % 4]} p={vis(s, t('coffee', 2) + k * 0.08, f2)} />)}
        <Pessoa x={1500} y={700} k={1.7} cor={V.C1} cartola p={vis(s, t('billionaire', 2), f2, 0.3)} />
      </svg>
      <Card x={560} y={220} w={840} h={150} p={vis(s, t('coffee', 2), f2)} cor={V.SHEET}>
        <Big x={420} y={75} p={1} size={52} cor={V.INK}>average income in the room</Big>
      </Card>
      <Big x={1000} y={480 - 40 * Math.sin(Math.min(1, prog(s, t('raises', 2), 0.7)) * Math.PI)} p={vis(s, t('raises', 2), f2)} size={96} cor={V.C1}>↑ jumps</Big>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3: sem memória */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, ini(3) + 0.2, f3)}>
          <rect x={X0} y={330} width={50 * PX} height={100} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
          <text x={X0} y={470} fontFamily="Latin Modern" fontSize={36} fill={V.MUTED}>0</text>
          <text x={X0 + 50 * PX} y={470} fontFamily="Latin Modern" fontSize={36} fill={V.MUTED} textAnchor="end">50 years</text>
        </g>
        <g opacity={vis(s, t('twenty', 3), f3)}>
          <rect x={X0} y={330} width={20 * PX * prog(s, t('twenty', 3), 0.8)} height={100} fill={GRAY} stroke={V.INK} strokeWidth={5} />
          <text x={X0 + 10 * PX} y={398} fontFamily="Latin Modern" fontWeight={700} fontSize={46} fill={V.INK} textAnchor="middle">20 years, no win</text>
        </g>
        <g opacity={vis(s, t('thirty', 3), f3)}>
          <rect x={X0 + 20 * PX} y={330} width={30 * PX * prog(s, t('thirty', 3), 1.0)} height={100} fill={V.GOLD} stroke={V.INK} strokeWidth={5} />
          <text x={X0 + 35 * PX} y={398} fontFamily="Latin Modern" fontWeight={700} fontSize={46} fill={V.INK} textAnchor="middle">next 30 years</text>
        </g>
        <path d={`M ${X0 + 20 * PX} 300 l 0 -40`} stroke={V.INK} strokeWidth={5} opacity={vis(s, t('twenty', 3), f3)} />
      </svg>
      <Big x={960} y={190} p={pop(s, t('due', 3))} size={84} cor={V.C1}>“due”? no.</Big>
      <Big x={960} y={600} p={vis(s, t('memory', 3), f3)} size={92} cor={V.INK}>the machine has no memory</Big>
      <Big x={960} y={720} p={vis(s, t('seventy-nine', 3), f3)} size={56} cor={V.INK}>
        P(win in next 30 y | no win in 20 y) = P(win in 30 y) ≈ 79%
      </Big>
      <Big x={960} y={880} p={vis(s, t('roulette', 3), f3)} size={52} cor={V.MUTED}>the same instinct behind the gambler’s fallacy</Big>
      </Jan>
      <Jan s={s} a={ini(4) - 0.1} b={fim(4)}>
      {/* fala 4 */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('ninety', 4), f4)}>
          <rect x={X0} y={420} width={50 * PX * prog(s, t('ninety', 4), 1.5)} height={100} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
          <rect x={X0} y={420} width={43.8 * PX * prog(s, t('ninety', 4), 1.5)} height={100} fill={V.GOLD} stroke={V.INK} strokeWidth={5} />
          <text x={X0} y={580} fontFamily="Latin Modern" fontSize={38} fill={V.MUTED}>0</text>
          <text x={X0 + 50 * PX} y={580} fontFamily="Latin Modern" fontSize={38} fill={V.MUTED} textAnchor="end">50 years</text>
        </g>
        <g opacity={vis(s, t('forty-four', 4), f4)}>
          <line x1={X0 + 43.8 * PX} y1={380} x2={X0 + 43.8 * PX} y2={540} stroke={V.C1} strokeWidth={8} />
        </g>
      </svg>
      <Big x={960} y={250} p={vis(s, t('ninety', 4), f4)} size={84} cor={V.INK}>90% chance of a win</Big>
      <Big x={1150} y={680} p={pop(s, t('forty-four', 4))} size={110} cor={V.C1}>≈ 43.8 years</Big>
      <Big x={960} y={880} p={vis(s, t('fast', 4), f4)} size={72} cor={V.GOLD}>real money · just not fast money</Big>
      </Jan>
      <Som nome="vupt" t={t('average', 1)} volume={0.3} />
      <Som nome="ding" t={t('nineteen', 1)} volume={0.4} />
      <Som nome="toque" t={tHist} volume={0.3} />
      <Som nome="pop" t={t('thirteen', 2)} volume={0.35} />
      <Som nome="pop" t={t('nineteen', 2)} volume={0.35} />
      <Som nome="papel" t={coffee} volume={0.35} />
      <Som nome="baque" t={t('raises', 2)} volume={0.4} />
      <Som nome="carimbo" t={t('memory', 3)} volume={0.4} />
      <Som nome="ding" t={t('forty-four', 4)} volume={0.35} />
    </Papel>
  );
};
