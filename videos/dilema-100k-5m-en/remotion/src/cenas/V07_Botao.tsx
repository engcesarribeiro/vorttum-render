// V07 | Girando o botão das chances: placar de 3 linhas (≥ 1 vitória, valor esperado, veredito), ponto de empate, Powerball e pôster final.
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Big, Botao, Card, Carimbo, G, GRAY, Papel, Txt, V, W, H, fmt, lin, usd, useT, vis, prog, pop, sai} from './pauta';

const PB = G.powerball.odds_1_in;
type Linha = [string, string, number, string?];

export const V07_Botao: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3), f4 = fim(4), f5 = fim(5), f6 = fim(6);
  // expoente das chances (log10 de "1 em N") no tempo: o botão gira entre as fases
  const tl = [ini(1), t('hundred', 1) - 0.1, t('hundred', 1) + 0.5, ini(2) + 0.2, t('ten', 2) + 0.1, ini(3), t('hundred', 3) + 0.2,
    ini(4), t('hundred', 4, 2) + 0.4, ini(5), t('Powerball', 5, 2) + 0.4];
  const ex = lin(s, tl, [6, 6, 5, 5, 7, 7, 8, 8, Math.log10(1.314e8), Math.log10(1.314e8), Math.log10(PB)]);
  const ang = -100 + ((ex - 5) / 3.5) * 200;
  const rot = (e: number) => 'bem';
  const painel = (f: number, a: number, b: number, rows: Linha[]) => rows.map(([nome, val, tt, cor], k) => (
    <React.Fragment key={`${f}-${k}`}>
      <Txt x={1030} y={215 + k * 215} p={vis(s, a, b)} size={56} cor={V.MUTED} serif>{nome}</Txt>
      <Txt x={1030} y={282 + k * 215} p={vis(s, tt, b)} size={k === 2 ? 52 : 62} cor={cor || V.INK} serif largura={720}>{val}</Txt>
    </React.Fragment>
  ));
  const verde = V.GOOD, verm = V.C1;
  // fala 6: pôster
  const L0 = 5, L1 = 9.4, PX0 = 330, PW = 1380;
  const XL = (l: number) => PX0 + ((l - L0) / (L1 - L0)) * PW;
  return (
    <Papel>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={sai(s, ini(6) - 0.1, 0.3) * vis(s, ini(1), f5)}>
          <Botao cx={470} cy={560} r={230} ang={ang} p={1} rotulo="odds per try" />
        </g>
      </svg>
      <Big x={470} y={200} p={vis(s, ini(1), f1)} size={84} cor={V.INK}>1 in 100,000</Big>
      <Big x={470} y={200} p={vis(s, ini(2) + 0.1, f2)} size={84} cor={V.INK}>1 in 10,000,000</Big>
      <Big x={470} y={200} p={vis(s, ini(3) + 0.1, f3)} size={84} cor={V.INK}>1 in 100,000,000</Big>
      <Big x={470} y={200} p={vis(s, ini(4) + 0.1, f4)} size={84} cor={V.GOLD}>1 in 131,400,000</Big>
      <Big x={470} y={200} p={vis(s, ini(5) + 0.1, f5)} size={72} cor={V.C1}>1 in 292,201,338</Big>
      <Card x={990} y={140} w={810} h={830} p={vis(s, ini(1), f3)}><div /></Card>
      {painel(1, ini(1), f1, [
        ['chance of ≥ 1 win', '≈ 100%', t('Losing', 1), verde],
        ['expected value', '≈ $131 million', t('hundred', 1, 2), V.GOLD],
        ['verdict', 'not a gamble anymore: a salary', t('salary', 1), verde],
      ])}
      {painel(2, ini(2), f2, [
        ['chance of ≥ 1 win', '23.1%', t('twenty-three', 2), verm],
        ['expected value', '$1,314,000 · 13×', t('thirteen', 2), V.GOLD],
        ['verdict', 'great average, yet 77% walk away with nothing', t('nothing', 2), verm],
      ])}
      {painel(3, ini(3), f3, [
        ['chance of ≥ 1 win', '2.6%', t('ninety-seven', 3), verm],
        ['expected value', '$131,400 > $100,000', t('thousand', 3), V.GOLD],
        ['verdict', 'wins on paper; about 97 of 100 get nothing', t('paper', 3), verm],
      ])}
      {/* fala 4: ponto de empate */}
      <Card x={990} y={140} w={810} h={830} p={vis(s, ini(4), f4)}><div /></Card>
      <Big x={1395} y={235} p={vis(s, t('tipping', 4), f4)} size={58} cor={V.MUTED} largura={740} peso={400}>the exact tipping point</Big>
      <Big x={1395} y={380} p={vis(s, t('equal', 4), f4)} size={58} cor={V.INK} largura={740}>n × p × $5,000,000 = $100,000</Big>
      <Big x={1395} y={540} p={pop(s, t('hundred', 4, 2))} size={64} cor={V.GOLD} largura={740}>p = 1 / 131,400,000</Big>
      <Carimbo x={1395} y={680} p={pop(s, t('answer', 4))} size={56} cor={V.GOLD} rot={-3}>BREAK-EVEN</Carimbo>
      <Txt x={1030} y={770} p={vis(s, t('Better', 4), f4)} size={56} cor={V.GOOD} serif largura={740}>better odds → gamble</Txt>
      <Txt x={1030} y={850} p={vis(s, t('Worse', 4), f4)} size={56} cor={V.C1} serif largura={740}>worse odds → briefcase</Txt>
      {/* fala 5: Powerball */}
      <Card x={990} y={140} w={810} h={830} p={vis(s, ini(5), f5)}><div /></Card>
      <Big x={1395} y={260} p={vis(s, t('Powerball', 5), t('white', 5) - 0.1)} size={64} cor={V.C1} largura={740}>the Powerball jackpot</Big>
      <Big x={1395} y={450} p={vis(s, t('prize', 5), t('white', 5) - 0.1)} size={56} cor={V.MUTED} largura={720} peso={400}>odds from the game’s own prize chart</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('white', 5), f5)}>
          {Array.from({length: 69}, (_, k) => (
            <circle key={k} cx={1040 + (k % 23) * 31} cy={240 + Math.floor(k / 23) * 34} r={13} fill={V.SHEET} stroke={V.INK} strokeWidth={2.5}
              opacity={s > t('white', 5) + k * 0.012 ? 1 : 0} />
          ))}
        </g>
        <g opacity={vis(s, t('red', 5), f5)}>
          {Array.from({length: 26}, (_, k) => (
            <circle key={k} cx={1040 + (k % 23) * 31} cy={370 + Math.floor(k / 23) * 34} r={13} fill={V.C1} stroke={V.INK} strokeWidth={2.5} />
          ))}
        </g>
      </svg>
      <Big x={1395} y={510} p={vis(s, t('white', 5), f5)} size={56} cor={V.INK} largura={740}>5 of 69 white<br />+ 1 of 26 red</Big>
      <Big x={1395} y={630} p={pop(s, t('ninety-two', 5))} size={60} cor={V.INK} largura={740}>C(69,5) × 26 = 292,201,338</Big>
      <Big x={1395} y={770} p={vis(s, t('less', 5), f5)} size={56} cor={V.C1} largura={740}>chance of ever winning: 0.90% (1 in 112)</Big>
      <Big x={1395} y={895} p={vis(s, t('forty-five', 5), f5)} size={56} cor={V.GOLD} largura={740}>expected value ≈ $44,969</Big>
      {/* fala 6: pôster final */}
      <Card x={110} y={150} w={1700} h={800} p={vis(s, ini(6), f6)} cor="#EFE6D0"><div /></Card>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={vis(s, t('whole', 6), f6)}>
          <rect x={XL(5)} y={500} width={XL(8.1186) - XL(5)} height={90} fill={V.GOOD} stroke={V.INK} strokeWidth={5} />
          <rect x={XL(8.1186)} y={500} width={XL(L1) - XL(8.1186)} height={90} fill={V.C1} stroke={V.INK} strokeWidth={5} />
          <text x={(XL(5) + XL(8.1186)) / 2} y={560} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.SHEET} textAnchor="middle">GAMBLE</text>
          <text x={(XL(8.1186) + XL(L1)) / 2} y={560} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.SHEET} textAnchor="middle">BRIEFCASE</text>
          {[[5, '1 in 100K'], [6, '1 in 1M'], [7, '1 in 10M'], [8, '1 in 100M']].map(([l, lab]) => (
            <g key={lab as string}><line x1={XL(l as number)} y1={600} x2={XL(l as number)} y2={640} stroke={V.INK} strokeWidth={5} />
              <text x={XL(l as number)} y={690} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.INK} textAnchor="middle">{lab}</text></g>
          ))}
        </g>
        <g opacity={vis(s, t('dial', 6), f6)}>
          <line x1={XL(8.1186)} y1={380} x2={XL(8.1186)} y2={640} stroke={V.GOLD} strokeWidth={9} />
          <text x={XL(8.1186) - 16} y={370} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.GOLD} textAnchor="end">break-even 1 in 131.4M</text>
        </g>
        <g opacity={vis(s, t('generous', 6), f6)}>
          <circle cx={XL(Math.log10(PB))} cy={617} r={18} fill={V.SHEET} stroke={V.INK} strokeWidth={6} />
          <line x1={XL(Math.log10(PB))} y1={635} x2={XL(Math.log10(PB))} y2={735} stroke={V.INK} strokeWidth={4} />
          <text x={XL(Math.log10(PB))} y={780} fontFamily="Latin Modern" fontWeight={700} fontSize={52} fill={V.INK} textAnchor="middle">Powerball 1 in 292M</text>
        </g>
      </svg>
      <Big x={960} y={260} p={vis(s, t('whole', 6), f6)} size={64} cor={V.INK}>the whole decision lives on one dial</Big>
      <Big x={960} y={830} p={pop(s, t('ignoring', 6))} size={64} cor={V.C1}>…and we have been ignoring something huge</Big>
      <Som nome="tique" t={ini(1) + 0.3} volume={0.3} />
      <Som nome="ding" t={t('salary', 1)} volume={0.35} />
      <Som nome="tique" t={t('ten', 2)} volume={0.3} />
      <Som nome="baque" t={t('nothing', 2)} volume={0.35} />
      <Som nome="tique" t={ini(3) + 0.3} volume={0.3} />
      <Som nome="carimbo" t={t('answer', 4)} volume={0.55} />
      <Som nome="pop" t={t('white', 5)} volume={0.3} />
      <Som nome="baque" t={t('briefcase', 5)} volume={0.35} />
      <Som nome="papel" t={ini(6)} volume={0.35} />
      <Som nome="toque" t={t('ignoring', 6)} volume={0.4} />
    </Papel>
  );
};
