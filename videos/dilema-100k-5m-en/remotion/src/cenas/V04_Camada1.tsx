// V04 | Camada 1, probabilidade acumulada: faixa de caixinhas cinza (perdeu), (1 − p)^n, curva de 50 anos e a pizza 92,8% / 7,2%.
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Card, G, GRAY, Pizza, Papel, Txt, V, W, H, lin, pc, useEixos, useT, vis, prog, pop, sai} from './pauta';

export const V04_Camada1: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3), f4 = fim(4);
  // fala 1: faixa de caixinhas (cada uma = 10 minutos)
  const N = 48;
  const tLose = t('lose', 1, 2);
  // fala 3: curva (1 − p)^n
  const E = useEixos(230, 150, 1180, 700, 50, 1);
  const cum = (y: number) => 1 - Math.pow(1 - 1e-6, 52560 * y);
  const pts: [number, string, number][] = [
    [1, '5.1%', t('five', 3)], [5, '23.1%', t('twenty-three', 3)], [10, '40.9%', t('forty-one', 3)],
    [20, '65.0%', t('sixty-five', 3)], [30, '79.3%', t('seventy-nine', 3)], [50, '92.8%', t('ninety-three', 3)],
  ];
  const tYear = [t('one', 3), t('five', 3, 2), t('ten', 3), t('twenty', 3), t('thirty', 3), t('fifty', 3)];
  const yReveal = lin(s, [ini(3), ...tYear], [0, 1, 5, 10, 20, 30, 50]);
  const curva = Array.from({length: 101}, (_, i) => i / 2).filter((y) => y <= yReveal)
    .map((y) => `${E.X(y)},${E.Y(cum(y))}`).join(' ');
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <Txt x={110} y={90} p={vis(s, t('flip', 1), f1)} size={54} cor={V.MUTED} serif>the question, flipped</Txt>
      <Big x={960} y={250} p={vis(s, t('lose', 1), f1)} size={72} cor={V.C1}>what is the chance I lose every single time?</Big>
      {Array.from({length: N}, (_, k) => {
        const tk = tLose + (k / N) * 2.2;
        return <div key={k} style={{position: 'absolute', left: 120 + (k % 16) * 107, top: 380 + Math.floor(k / 16) * 96, width: 88, height: 72,
          background: s > tk ? GRAY : V.SHEET, border: `4px solid ${V.INK}`, opacity: vis(s, tLose - 0.4, f1) }}>
          <div style={{fontFamily: 'Latin Modern', fontSize: 24, color: V.MUTED, textAlign: 'center', marginTop: 20}}>{s > tk ? 'lose' : '10 min'}</div>
        </div>;
      })}
      <Big x={960} y={720} p={pop(s, t('nine', 1))} size={66} cor={V.INK}>lose once: 999,999 / 1,000,000</Big>
      <Big x={960} y={820} p={vis(s, t('twice', 1), f1)} size={66} cor={V.INK}>twice in a row: (1 − p) × (1 − p)</Big>
      <Big x={960} y={950} p={pop(s, t('power', 1))} size={96} cor={V.GOLD}>n times: (1 − p)<sup style={{fontSize: 64}}>n</sup></Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2 */}
      <Big x={960} y={330} p={vis(s, ini(2) + 0.2, f2)} size={60} cor={V.MUTED}>at least one win</Big>
      <Big x={960} y={500} p={pop(s, t('minus', 2))} size={130} cor={V.INK}>P = 1 − (1 − p)<sup style={{fontSize: 76}}>n</sup></Big>
      <div style={{position: 'absolute', left: 330, top: 700, width: 1260, height: 60, border: `4px solid ${V.INK}`, background: V.SHEET, opacity: vis(s, t('tiny', 2), f2)}}>
        <div style={{width: `${100 * prog(s, t('rust', 2), 2.6)}%`, height: '100%', background: V.C1}} />
      </div>
      <Big x={960} y={860} p={vis(s, t('rust', 2), f2)} size={60} cor={V.C1}>slow · invisible · relentless</Big>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3: curva */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, ini(3), f3)}>
          <line x1={E.X(0)} y1={E.Y(0)} x2={E.X(50)} y2={E.Y(0)} stroke={V.MUTED} strokeWidth={4} />
          <line x1={E.X(0)} y1={E.Y(0)} x2={E.X(0)} y2={E.Y(1)} stroke={V.MUTED} strokeWidth={4} />
          {[0, 10, 20, 30, 40, 50].map((y) => <text key={y} x={E.X(y)} y={E.Y(0) + 44} fontFamily="Latin Modern" fontSize={34} fill={V.MUTED} textAnchor="middle">{y}</text>)}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => <text key={p} x={E.X(0) - 16} y={E.Y(p) + 12} fontFamily="Latin Modern" fontSize={34} fill={V.MUTED} textAnchor="end">{Math.round(p * 100)}%</text>)}
          <text x={E.X(25)} y={E.Y(0) + 96} fontFamily="Latin Modern" fontSize={38} fill={V.INK} textAnchor="middle">years</text>
          <polyline points={curva} fill="none" stroke={V.C1} strokeWidth={9} strokeLinejoin="round" />
        </g>
        {pts.map(([y, lab, tt], k) => (
          <g key={y} opacity={vis(s, tt, f3)}>
            <circle cx={E.X(y)} cy={E.Y(cum(y))} r={16} fill={V.GOLD} stroke={V.INK} strokeWidth={5} />
            <text x={E.X(y) + (k === 5 ? -24 : 8)} y={E.Y(cum(y)) + (k === 5 ? -34 : 62)} fontFamily="Latin Modern" fontWeight={700} fontSize={44} fill={V.INK}
              textAnchor={k === 5 ? 'end' : 'start'}>{lab}</text>
          </g>
        ))}
      </svg>
      <Big x={1650} y={400} p={vis(s, tYear[0], f3)} size={120} cor={V.GOLD}>{pc(cum(Math.max(0.01, yReveal)), 1)}</Big>
      <Big x={1650} y={520} p={vis(s, tYear[0], f3)} size={44} cor={V.MUTED} largura={360}>chance of ≥ 1 win by year {Math.round(yReveal)}</Big>
      </Jan>
      <Jan s={s} a={ini(4) - 0.1} b={fim(4)}>
      {/* fala 4: pizza */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Pizza cx={600} cy={540} r={300} a={0.928} cor1={V.GOLD} cor2={GRAY} p={vis(s, t('words', 4), f4)} sep={s > t('never', 4) ? 26 : 0} />
      </svg>
      <Big x={600} y={150} p={vis(s, t('words', 4), f4)} size={64} cor={V.GOLD}>92.8% win</Big>
      <Big x={1300} y={420} p={pop(s, t('thirteen', 4))} size={100} cor={V.GOLD}>13 of every 14</Big>
      <Big x={1300} y={560} p={vis(s, t('thirteen', 4), f4)} size={46} cor={V.MUTED}>win at least once in 50 years</Big>
      <Big x={1360} y={740} p={pop(s, t('person', 4))} size={100} cor={V.INK}>1 in 14: 7.2%</Big>
      <Big x={1360} y={850} p={vis(s, t('never', 4), f4)} size={52} cor={V.C1}>never hears it ring</Big>
      </Jan>
      <Som nome="tique" t={tLose} volume={0.3} />
      <Som nome="carimbo" t={t('power', 1)} volume={0.4} />
      <Som nome="carimbo" t={t('minus', 2)} volume={0.4} />
      {pts.map(([y, , tt]) => <Som key={y} nome="pop" t={tt} volume={0.3} />)}
      <Som nome="pop" t={t('words', 4)} volume={0.4} />
      <Som nome="baque" t={t('never', 4)} volume={0.4} />
    </Papel>
  );
};
