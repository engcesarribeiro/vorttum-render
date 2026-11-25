// V03 | Contando as tentativas: mostrador de 144 tracinhos, barra do ano, barra de 50 anos e a conta 6 × 24 × 365 × 50.
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Bilhete, Card, G, Papel, Txt, V, W, H, fmt, lin, useT, vis, prog, pop, sai} from './pauta';

export const V03_Contagem: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3);
  // fala 1
  const tHora = t('hour', 1), tSix = t('six', 1), tDia = t('day', 1), t144 = t('hundred', 1), tAno = t('year', 1), tFifty = t('fifty', 1), tTwo = t('two', 1);
  const n144 = Math.round(144 * prog(s, tDia, Math.max(0.4, t144 - tDia + 0.5)));
  const n52 = Math.round(52560 * prog(s, t('fifty-two', 1), 1.3));
  const n50y = Math.round(2628000 * prog(s, tTwo, 1.6));
  const R = 250, cx = 420, cy = 520;
  // fala 2: bilhetes
  const grade = Array.from({length: 7 * 5}, (_, k) => k);
  // fala 3
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* mostrador do dia: 144 tracinhos (6 por hora × 24 h) */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, tHora - 0.1, f1)}>
          <circle cx={cx} cy={cy} r={R + 30} fill={V.SHEET} stroke={V.INK} strokeWidth={6} />
          {Array.from({length: 144}, (_, i) => {
            const a = (i / 144) * 2 * Math.PI;
            const on = i < n144;
            const hora = i % 6 === 0;
            return <line key={i} x1={cx + (R - (hora ? 36 : 22)) * Math.sin(a)} y1={cy - (R - (hora ? 36 : 22)) * Math.cos(a)}
              x2={cx + R * Math.sin(a)} y2={cy - R * Math.cos(a)} stroke={on ? V.GOLD : '#CFC6B2'} strokeWidth={hora ? 6 : 4} />;
          })}
          <text x={cx} y={cy + 24} fontFamily="Latin Modern" fontWeight={700} fontSize={110} textAnchor="middle" fill={V.INK}>{n144}</text>
          <text x={cx} y={cy + 90} fontFamily="Latin Modern" fontSize={38} textAnchor="middle" fill={V.MUTED}>rolls a day</text>
        </g>
        {/* barras do ano e de 50 anos */}
        <g opacity={vis(s, tAno, f1)}>
          <rect x={900} y={300} width={900 / 50} height={64} fill={V.GOLD} stroke={V.INK} strokeWidth={4} />
          <text x={900} y={284} fontFamily="Latin Modern" fontWeight={700} fontSize={44} fill={V.INK}>1 year</text>
        </g>
        <g opacity={vis(s, tFifty, f1)}>
          <rect x={900} y={520} width={900 * prog(s, tFifty, 1.4)} height={64} fill={V.C1} stroke={V.INK} strokeWidth={4} />
          <text x={900} y={504} fontFamily="Latin Modern" fontWeight={700} fontSize={44} fill={V.INK}>50 years</text>
        </g>
      </svg>
      <Txt x={900} y={376} p={vis(s, t('fifty-two', 1), f1)} size={60} cor={V.GOLD} serif>{fmt(n52)} rolls a year</Txt>
      <Txt x={900} y={600} p={vis(s, tTwo, f1)} size={70} cor={V.C1} serif>{fmt(n50y)} chances</Txt>
      {/* a conta */}
      <Big x={1230} y={860} p={vis(s, tSix, f1)} size={64} cor={V.INK}>
        {[['6', tSix], ['× 24', t('twenty-four', 1)], ['× 365', t('three', 1)], ['× 50', tFifty]].map(([txt, tt], k) =>
          <span key={k} style={{opacity: s >= (tt as number) ? 1 : 0}}>{txt as string}{' '}</span>)}
        <span style={{opacity: s >= tTwo ? 1 : 0, color: V.C1}}>= 2,628,000</span>
      </Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2: um bilhete contra uma montanha de bilhetes */}
      <Card x={110} y={120} w={1700} h={840} p={vis(s, ini(2), f2)} cor="#EFE6D0"><div /></Card>
      <Big x={960} y={330} p={vis(s, ini(2) + 0.3, t('ticket', 2) - 0.15)} size={84} cor={V.C1}>hiding in plain sight</Big>
      <Bilhete x={200} y={420} w={300} h={140} p={pop(s, t('ticket', 2))} texto="1 in 1,000,000" cor={V.C1} rot={-4} />
      <Txt x={200} y={300} p={vis(s, t('ticket', 2), f2)} size={50} serif>one ticket</Txt>
      {grade.map((k) => {
        const tk = t('getting', 2) + (k / grade.length) * 1.6;
        return <Bilhete key={k} x={620 + (k % 7) * 160} y={190 + Math.floor(k / 7) * 100} w={140} h={80} p={vis(s, tk, f2, 0.3)} rot={(k % 5) - 2} />;
      })}
      <Big x={1250} y={800} p={pop(s, t('million', 2)) * sai(s, f2 - 0.1, 0.3)} size={90} cor={V.GOLD}>2,628,000 free tickets</Big>
      <Txt x={620} y={880} p={vis(s, t('nothing', 2), f2)} size={50} cor={V.INK} serif>cost: $0, only time</Txt>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3: um dia */}
      <Card x={110} y={120} w={1700} h={840} p={vis(s, ini(3), f3)} cor="#EFE6D0"><div /></Card>
      <Big x={600} y={310} p={vis(s, t('single', 3), f3)} size={64} cor={V.MUTED}>on any given day</Big>
      <Big x={600} y={470} p={pop(s, t('seven', 3))} size={150} cor={V.C1}>1 in 6,945</Big>
      <div style={{position: 'absolute', left: 1130, top: 190, width: 540, height: 700, background: V.SHEET, border: `6px solid ${V.INK}`, borderRadius: 50,
        opacity: vis(s, t('phone', 3), f3), boxShadow: '9px 11px 0 rgba(42,40,38,0.2)'}} />
      <Big x={1400} y={420} p={vis(s, t('nothing', 3), f3)} size={74} cor={V.MUTED} largura={440}>No new wins</Big>
      <Big x={1400} y={600} p={vis(s, t('nothing', 3), f3)} size={120} cor={V.INK}>0</Big>
      <Big x={960} y={880} p={vis(s, t('count', 3), f3)} size={60} cor={V.GOLD}>so how does “almost nothing” become something?</Big>
      </Jan>
      <Som nome="tique" t={tDia} volume={0.3} />
      <Som nome="ding" t={t('two', 1)} volume={0.35} />
      <Som nome="papel" t={ini(2)} volume={0.35} />
      <Som nome="pop" t={t('ticket', 2)} volume={0.4} />
      <Som nome="whoosh" t={t('getting', 2)} volume={0.35} />
      <Som nome="clique" t={t('phone', 3)} volume={0.35} />
    </Papel>
  );
};
