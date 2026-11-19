// A03 | O detalhe: as 37 casas viram recortes de papel (18 vermelhas, 18 pretas, 1 verde) e a barra de probabilidade.
import React from 'react';
import {Props, at, inicioFala, pop, prog, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {ORDEM, Papel, Recorte, Roleta, Txt, V, VERMELHAS, vis, LM, useLatin} from './vorttum';

export const A03_Detalhe: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.25) : props.duracao + 1);

  const tR = t('red', 2), tB = t('black', 2), tG = t('green', 2);
  const tWin = t('win', 3), tLose = t('nineteen', 3);
  // roleta: entra, depois destaca cada cor quando é nomeada
  const foco = (n: number) => {
    if (s < tR || s > fim(3)) return 1;
    const cor = n === 0 ? 'g' : VERMELHAS.has(n) ? 'r' : 'b';
    const atual = s < tB ? 'r' : s < tG ? 'b' : 'all';
    return atual === 'all' || atual === cor ? 1 : 0.25;
  };
  const roda = vis(s, t('wheel', 1) - 0.2, fim(3));
  const vermelhas = ORDEM.filter((n) => VERMELHAS.has(n)).sort((a, b) => a - b);
  const pretas = ORDEM.filter((n) => n !== 0 && !VERMELHAS.has(n)).sort((a, b) => a - b);

  const tile = (n: number, k: number, x0: number, y0: number, cor: string, t0: number) => (
    <Recorte key={n} x={x0 + (k % 9) * 84} y={y0 + Math.floor(k / 9) * 84} w={70} h={70} cor={cor}
      p={vis(s, t0 + k * 0.035, fim(3))} rot={((n * 37) % 7) - 3}>
      <span style={{font: `700 32px ${LM}`, color: V.SHEET}}>{n}</span>
    </Recorte>
  );
  const gx = 980;
  // fala 3: grupos ganha (18) x perde (19)
  const pW = vis(s, tWin, fim(3));
  const pL = vis(s, tLose, fim(3));

  // falas 4 e 5: barra de probabilidade
  const bx = 260, bw = 1400, by = 520, bh = 110;
  const pBar = vis(s, t('chance', 4), fim(6));
  const xWin = bx + bw * 18 / 37;
  const tFifty = t('fifty', 4);
  return (
    <Papel>
      <Roleta cx={470} cy={560} r={330} ang={0} op={roda} destaque={foco} />
      <Txt x={1000} y={470} p={vis(s, t('thirtyseven', 1), fim(1))} size={84} serif>37 pockets</Txt>

      {vermelhas.map((n, k) => tile(n, k, gx, 150, V.C1, tR))}
      {pretas.map((n, k) => tile(n, k, gx, 420, V.INK, tB))}
      {tile(0, 0, gx, 690, V.GOOD, tG)}
      <Txt x={gx} y={95} p={vis(s, tR, fim(3))} size={34} cor={V.C1}>18 red</Txt>
      <Txt x={gx} y={365} p={vis(s, tB, fim(3))} size={34} cor={V.INK}>18 black</Txt>
      <Txt x={gx + 100} y={700} p={vis(s, t('zero', 2), fim(3))} size={34} cor={V.GOOD}>1 green: the zero</Txt>

      {/* fala 3: chaves de ganha e perde */}
      <div style={{position: 'absolute', left: gx + 770, top: 150, width: 10, height: 154, background: V.GOLD, opacity: pW}} />
      <Txt x={gx + 800} y={190} p={pW} size={40} cor={V.GOLD}>win</Txt>
      <div style={{position: 'absolute', left: gx + 770, top: 420, width: 10, height: 340, background: V.BAD, opacity: pL}} />
      <Txt x={gx + 800} y={560} p={pL} size={40} cor={V.BAD}>lose</Txt>

      {/* falas 4 a 6: barra */}
      <div style={{position: 'absolute', left: bx, top: by, width: (xWin - bx) * prog(s, t('chance', 4), 0.8), height: bh,
        background: V.C1, opacity: pBar, boxShadow: '6px 8px 0 rgba(42,40,38,0.2)'}} />
      <div style={{position: 'absolute', left: xWin, top: by, width: (bx + bw - xWin) * prog(s, t('chance', 4) + 0.3, 0.8),
        height: bh, background: V.INK, opacity: pBar, boxShadow: '6px 8px 0 rgba(42,40,38,0.2)'}} />
      <div style={{position: 'absolute', left: bx + bw / 2 - 2, top: by - 50, width: 0, height: bh + 100,
        borderLeft: `4px dashed ${V.GOLD}`, opacity: vis(s, tFifty, fim(6))}} />
      <Txt x={bx + bw / 2} y={by - 110} p={vis(s, tFifty, fim(6))} size={36} cor={V.GOLD} ancora="centro">50%</Txt>
      <Txt x={bx} y={by + bh + 30} p={vis(s, t('fortyeight', 4), fim(6))} size={56} cor={V.C1} serif>48.65% win</Txt>
      <Txt x={bx + bw} y={by + bh + 30} p={vis(s, t('fiftyone', 5), fim(6))} size={56} cor={V.INK} serif ancora="direita">51.35% lose</Txt>
      <Txt x={bx + bw / 2} y={by + bh + 130} p={vis(s, t('small', 5), fim(6))} size={34} cor={V.MUTED} ancora="centro">a small difference</Txt>
      {/* fala 6: repetir milhares de vezes */}
      {Array.from({length: 40}).map((_, k) => (
        <div key={k} style={{position: 'absolute', left: bx + k * 35, top: 300, width: 26, height: 70,
          background: `linear-gradient(90deg, ${V.C1} 0 48.65%, ${V.INK} 48.65% 100%)`,
          opacity: vis(s, t('repeat', 6) + k * 0.03, fim(6)) * 0.85}} />
      ))}
      <Txt x={bx + bw / 2} y={200} p={vis(s, t('thousands', 6), fim(6))} size={40} cor={V.INK} ancora="centro">repeated thousands of times</Txt>

      {/* fala 7 */}
      <Txt x={960} y={420} p={pop(s, t('money', 7) - 0.1)} size={70} serif ancora="centro" largura={1400}>
        How much money would you need to survive a really bad streak?
      </Txt>
    </Papel>
  );
};
