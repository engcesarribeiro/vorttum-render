// V06 | Camada 3, quanto vale: E[vitórias] = n × p, pilha de cheques de US$ 5 mi, barras do número de vitórias, variante "para na 1ª".
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Card, Carimbo, G, GRAY, Papel, Txt, V, W, H, fmt, pc, lin, useT, vis, prog, pop, sai} from './pauta';

const Cheque: React.FC<{x: number; y: number; p: number; fr?: number; rot?: number; valor?: string}> = ({x, y, p, fr = 1, rot = 0, valor = '$5,000,000'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 560 * fr, height: 190, overflow: 'hidden', opacity: Math.min(1, p * 2),
    transform: `translateY(${(1 - p) * -70}px) rotate(${rot}deg)`, boxShadow: '6px 8px 0 rgba(42,40,38,0.2)'}}>
    <div style={{width: 560, height: 190, background: '#EADCBE', border: `4px solid ${V.INK}`, boxSizing: 'border-box', padding: '16px 24px',
      fontFamily: 'Latin Modern', color: V.INK}}>
      <div style={{fontSize: 96, fontWeight: 700, color: V.GOOD, marginTop: 30, whiteSpace: 'nowrap'}}>{valor}</div>
    </div>
  </div>
);

export const V06_Camada3: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3), f4 = fim(4);
  // fala 3: distribuição do número de vitórias
  const P = G['1in1M_P_exactly'] as Record<string, number>;
  const vals = [P['0'], P['1'], P['2'], P['3'], P['4'], 1 - (P['0'] + P['1'] + P['2'] + P['3'] + P['4'])];
  const labs = ['0', '1', '2', '3', '4', '5+'];
  const X0 = 130, Y0 = 800, BW = 150, GAP = 40, HMAX = 520, VMAX = 0.26;
  const tBar = t('whole', 3);
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <Big x={960} y={140} p={vis(s, ini(1) + 0.3, t('much', 1) - 0.1)} size={64} cor={V.MUTED}>so far: whether you win, and when</Big>
      <Big x={960} y={140} p={vis(s, t('much', 1), f1)} size={90} cor={V.MUTED}>now: how much?</Big>
      <Big x={960} y={330} p={vis(s, t('expected', 1), f1)} size={112} cor={V.INK}>E[wins] = n × p</Big>
      <Big x={960} y={500} p={vis(s, t('million', 1), f1)} size={104} cor={V.INK}>= 2,628,000 × 1 / 1,000,000</Big>
      <Big x={960} y={690} p={pop(s, t('wins', 1, 2))} size={170} cor={V.C1}>= 2.628 wins</Big>
      <Big x={960} y={880} p={vis(s, t('stop', 1) , f1)} size={50} cor={V.MUTED}>it does not stop after the first win</Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2: cheques */}
      <Cheque x={170} y={560} p={vis(s, t('five', 2), f2)} rot={-2} />
      <Cheque x={250} y={400} p={vis(s, t('five', 2) + 0.35, f2)} rot={1} />
      <Cheque x={330} y={240} p={vis(s, t('five', 2) + 0.7, f2)} rot={-1} valor="$3,140,000" />
      <Big x={900} y={150} p={vis(s, t('five', 2), f2)} size={60} cor={V.MUTED}>2.628 checks of $5 million</Big>
      <Carimbo x={1400} y={400} p={pop(s, t('thirteen', 2))} size={110} cor={V.GOLD} rot={-5}>$13,140,000</Carimbo>
      <Big x={1400} y={560} p={vis(s, t('thirteen', 2), f2)} size={56} cor={V.MUTED} largura={700}>expected value of envelope 2</Big>
      <div style={{position: 'absolute', left: 1010, top: 720, width: 80, height: 52, background: '#6B4A32', border: `4px solid ${V.INK}`,
        opacity: vis(s, t('hundred', 2, 2), f2)}} />
      <Big x={1400} y={880} p={vis(s, t('hundred', 2, 2), f2)} size={56} cor={V.MUTED} largura={760}>$100,000 (the briefcase), to scale</Big>
      <Big x={1450} y={720} p={pop(s, t('thirty-one', 2))} size={120} cor={V.C1}>131×</Big>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3: barras */}
      <Big x={960} y={110} p={vis(s, t('slippery', 3), f3)} size={64} cor={V.INK}>number of wins in 50 years (1 in 1,000,000)</Big>
      <Big x={960} y={520} p={vis(s, t('receives', 3), t('whole', 3) - 0.1)} size={120} cor={V.C1}>nobody gets 2.6 wins</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={X0 - 30} y1={Y0} x2={X0 + 6 * (BW + GAP)} y2={Y0} stroke={V.MUTED} strokeWidth={4} opacity={vis(s, tBar, f3)} />
        {vals.map((v, k) => {
          const h = (v / VMAX) * HMAX * prog(s, tBar + k * 0.25, 0.6);
          const hi = (k === 2 && s > t('exactly', 3) && s < t('twice', 3)) || (k === 0 && s > t('zero', 3));
          const sel = (k >= 2 && s > t('twice', 3) && s < t('half', 3)) || (k >= 3 && s > t('half', 3));
          return (
            <g key={k} opacity={vis(s, tBar, f3)}>
              <rect x={X0 + k * (BW + GAP)} y={Y0 - h} width={BW} height={h} fill={k === 0 ? GRAY : sel ? V.GOLD : hi ? V.C1 : V.GOLD} stroke={V.INK} strokeWidth={5}
                opacity={k === 0 || hi || sel || s < t('twice', 3) ? 1 : 0.55} />
              <text x={X0 + k * (BW + GAP) + BW / 2} y={Y0 + 54} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.INK} textAnchor="middle">{labs[k]}</text>
              <text x={X0 + k * (BW + GAP) + BW / 2} y={Y0 - h - 14} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.INK} textAnchor="middle">{pc(v)}</text>
            </g>
          );
        })}
      </svg>
      <Big x={X0 + 3 * (BW + GAP)} y={Y0 + 130} p={vis(s, tBar, f3)} size={40} cor={V.MUTED}>wins</Big>
      <Big x={1590} y={300} p={pop(s, t('exactly', 3))} size={56} cor={V.C1} largura={420}>most likely: exactly 2 wins · 24.9%</Big>
      <Big x={1590} y={480} p={vis(s, t('twice', 3), f3)} size={58} cor={V.GOLD} largura={440}>2 or more: 73.8%</Big>
      <Big x={1590} y={630} p={vis(s, t('half', 3), f3)} size={58} cor={V.GOLD} largura={440}>3 or more: 48.9%</Big>
      <Big x={1590} y={790} p={vis(s, t('zero', 3), f3)} size={58} cor={V.MUTED} largura={440}>zero: 7.2%</Big>
      </Jan>
      <Jan s={s} a={ini(4) - 0.1} b={fim(4)}>
      {/* fala 4: variante "para na 1ª" */}
      <Card x={140} y={110} w={1640} h={860} p={vis(s, t('shut', 4), f4)} cor="#EFE6D0"><div /></Card>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={450} y={800 - 520 * prog(s, t('shut', 4), 0.9)} width={300} height={520 * prog(s, t('shut', 4), 0.9)} fill={V.GOLD} stroke={V.INK} strokeWidth={6} opacity={vis(s, t('shut', 4), f4)} />
        <rect x={1170} y={800 - 520 * 0.0215} width={300} height={520 * 0.0215} fill="#6B4A32" stroke={V.INK} strokeWidth={6} opacity={vis(s, t('forty-six', 4), f4)} />
        <line x1={300} y1={800} x2={1620} y2={800} stroke={V.MUTED} strokeWidth={4} opacity={vis(s, t('shut', 4), f4)} />
      </svg>
      <Big x={820} y={190} p={vis(s, t('shut', 4), f4)} size={60} cor={V.INK}>if it stopped at the first win</Big>
      <Big x={600} y={880} p={vis(s, t('shut', 4), f4)} size={76} cor={V.INK}>≈ $4.64 million</Big>
      <Big x={1320} y={880} p={vis(s, t('forty-six', 4), f4)} size={76} cor={V.INK}>$100,000</Big>
      <Big x={1400} y={330} p={pop(s, t('forty-six', 4))} size={150} cor={V.C1}>≈ 46×</Big>
      <Carimbo x={1400} y={540} p={pop(s, t('knockout', 4))} esc0={1.0} size={64} cor={V.GOOD}>KNOCKOUT</Carimbo>
      <Big x={1400} y={705} p={vis(s, t('dial', 4), f4)} size={56} cor={V.MUTED} largura={760}>…we chose this number</Big>
      </Jan>
      <Som nome="digitar" t={t('expected', 1)} volume={0.35} />
      <Som nome="carimbo" t={t('wins', 1, 2)} volume={0.45} />
      <Som nome="papel" t={t('five', 2)} volume={0.4} />
      <Som nome="carimbo" t={t('thirteen', 2)} volume={0.55} />
      <Som nome="toque" t={tBar} volume={0.3} />
      <Som nome="pop" t={t('exactly', 3)} volume={0.4} />
      <Som nome="baque" t={t('zero', 3)} volume={0.35} />
      <Som nome="carimbo" t={t('knockout', 4)} volume={0.5} />
    </Papel>
  );
};
