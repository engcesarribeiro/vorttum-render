// A06 | O experimento: regras na mesa e os primeiros giros reais da simulação (semente 2026).
import React from 'react';
import {Props, at, inicioFala, prog, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Papel, Roleta, Txt, V, VERMELHAS, anguloRoleta, corCasa, usd, vis, LM, useLatin} from './vorttum';

// giros reais (simulacao.py, resultados.json -> primeiros_giros)
const GIROS = [
  {g: 1, n: 7, aposta: 10, saldo: 10010},
  {g: 2, n: 20, aposta: 10, saldo: 10000},
  {g: 3, n: 32, aposta: 20, saldo: 10020},
  {g: 10, n: 35, aposta: 10, saldo: 10040},
  {g: 11, n: 31, aposta: 20, saldo: 10020},
  {g: 12, n: 28, aposta: 40, saldo: 9980},
  {g: 13, n: 15, aposta: 80, saldo: 9900},
  {g: 14, n: 0, aposta: 160, saldo: 9740},
  {g: 15, n: 5, aposta: 320, saldo: 10060},
];
const nomeCor = (n: number) => (n === 0 ? 'green' : VERMELHAS.has(n) ? 'red' : 'black');

export const A06_Experimento: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.25) : props.duracao + 1);

  // quando cada giro termina (a roleta para no número) e quando a linha entra na fita
  const tRow7 = t('row', 7);
  const t10 = t('tenth', 7);
  const passo = Math.max(0.35, (tRow7 - t10) / 5);
  const chega = [
    t('seven', 5), t('twenty', 6), t('red', 6),
    ...[0, 1, 2, 3, 4].map((k) => t10 + passo * (k + 1)),
    t('won', 8),
  ];
  const linha = [t('won', 5), t('lost', 6), t('twenty', 6, 3), ...chega.slice(3, 8), t('sixty', 8)];
  const inicio = [t('first', 5), t('second', 6), t('third', 6), ...[0, 1, 2, 3, 4].map((k) => t10 + passo * k), t('reached', 8)];
  const giros = GIROS.map((x, k) => ({t0: inicio[k], t1: chega[k], numero: x.n}));
  const ang = anguloRoleta(s, giros);
  const tRed = t('red', 1), tBlack = t('black', 1), tZero = t('zero', 1);
  const foco = (n: number) => {
    if (s < tRed || s > fim(1)) return 1;
    const cor = nomeCor(n);
    const atual = s < tBlack ? 'red' : s < tZero ? 'black' : 'green';
    return atual === cor ? 1 : 0.3;
  };

  // painel de regras (falas 2 a 4)
  const regras: [string, string, number, string][] = [
    ['Bankroll', '$10,000', t('thousand', 2), V.INK],
    ['First bet', '$10', t('first', 2), V.INK],
    ['Win', 'back to $10', t('win', 2), V.GOLD],
    ['Loss', 'double the bet', t('double', 2), V.C1],
    ["Can't cover the next bet", 'session over', t('over', 3), V.BAD],
    ['New session', 'same rules', t('new', 3), V.INK],
    ['Total', '1,000,000 spins', t('million', 4), V.INK],
  ];
  const sairRegras = fim(4);
  const xL = 1000;

  return (
    <Papel>
      <Roleta cx={480} cy={560} r={330} ang={ang} op={vis(s, t('strategy', 1))} destaque={foco}
        bola={s >= chega[0]} />
      {regras.map(([a, b, t0, cor], k) => (
        <React.Fragment key={a}>
          <Txt x={xL} y={170 + k * 100} p={vis(s, t0, sairRegras)} size={38} cor={V.MUTED}>{a}</Txt>
          <Txt x={1820} y={170 + k * 100} p={vis(s, t0, sairRegras)} size={42} cor={cor} ancora="direita">{b}</Txt>
        </React.Fragment>
      ))}

      {/* fita dos giros */}
      {GIROS.map((x, k) => {
        const y = 150 + (k < 3 ? k : k + 1) * 82;
        const p = vis(s, linha[k]);
        const ganhou = VERMELHAS.has(x.n);
        const destaque = x.n === 0 ? prog(s, t('zero', 7), 0.4) : 0;
        return (
          <div key={x.g} style={{position: 'absolute', left: xL, top: y, width: 830, height: 66, opacity: Math.min(1, p * 1.5),
            transform: `translateX(${(1 - p) * 30}px)`, display: 'flex', alignItems: 'center', gap: 26,
            fontFamily: LM, fontWeight: 700, fontSize: 36, color: V.INK,
            background: destaque ? `rgba(94,107,67,${0.18 * destaque})` : 'transparent', padding: '0 12px'}}>
            <span style={{width: 70, color: V.MUTED}}>#{x.g}</span>
            <span style={{width: 56, height: 56, borderRadius: 28, background: corCasa(x.n), color: V.SHEET, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28}}>{x.n}</span>
            <span style={{width: 110, color: corCasa(x.n)}}>{nomeCor(x.n)}</span>
            <span style={{width: 170}}>bet {usd(x.aposta)}</span>
            <span style={{width: 130, color: ganhou ? V.GOLD : V.BAD}}>{ganhou ? usd(x.aposta, true) : usd(-x.aposta)}</span>
            <span style={{width: 150, textAlign: 'right', fontWeight: 700}}>{usd(x.saldo)}</span>
          </div>
        );
      })}
      <Txt x={xL + 70} y={150 + 3 * 82 + 6} p={vis(s, t10)} size={36} cor={V.MUTED}>{'⋯'}</Txt>
    </Papel>
  );
};
