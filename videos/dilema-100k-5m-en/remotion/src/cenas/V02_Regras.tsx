// V02 | As regras do jogo: o título esconde a chance; cartão de regras escrito item a item; a palavra "every".
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Botao, Card, Carimbo, Papel, Relogio, Txt, V, W, H, lin, useT, vis, prog, pop, sai} from './pauta';

export const V02_Regras: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1), f2 = fim(2), f3 = fim(3);
  const regras: [string, number][] = [
    ['1 try every 10 minutes, 24/7', t('once', 2)],
    ['every try independent, same chance p', t('independent', 2)],
    ['first try 10 minutes after you choose', t('first', 2)],
    ['it does not stop when you win', t('stop', 2)],
    ['50 more years', t('fifty', 2)],
    ['p = 1 in 1,000,000 per try', t('one-in-a-million', 2)],
  ];
  const flip = Math.floor((s - t('flip', 1)) * 1.6) % 2 === 0;
  return (
    <Papel>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <Card x={110} y={90} w={720} h={110} p={vis(s, t('thought', 1), f1)} cor="#EADCBE">
        <Big x={360} y={55} p={1} size={52} cor={V.INK}>A THOUGHT EXPERIMENT</Big>
      </Card>
      <Big x={960} y={310} p={vis(s, t('odds', 1), f1)} size={110} cor={V.C1}>the odds = ?</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Botao cx={960} cy={640} r={190} ang={-80 + 160 * (0.5 + 0.5 * Math.sin(Math.max(0, s - t('dial', 1)) * 1.4))}
          p={vis(s, t('dial', 1), f1)} rotulo="odds per try" />
      </svg>
      <Big x={960} y={960} p={vis(s, t('flip', 1), f1)} size={64} cor={flip ? V.GOOD : V.C1}>{flip ? 'take the money' : 'take the machine'}</Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2: regras */}
      <Card x={110} y={110} w={1240} h={800} p={vis(s, ini(2), f2)}>
        <div />
      </Card>
      {regras.map(([txt, tt], k) => (
        <React.Fragment key={k}>
          <Txt x={170} y={150 + k * 108} p={vis(s, tt, f2)} size={42} cor={V.C1} serif>{`Rule ${k + 1}`}</Txt>
          <Txt x={370} y={150 + k * 108} p={vis(s, tt + 0.05, f2)} size={44} peso={400}>{txt}</Txt>
        </React.Fragment>
      ))}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Relogio cx={1560} cy={300} r={150} s={s} p={vis(s, t('once', 2), f2)} />
      </svg>
      <Txt x={170} y={810} p={vis(s, t('taxes', 2), f2)} size={34} cor={V.MUTED} peso={400}>no taxes, no inflation (for now) · math, not financial advice</Txt>
      <Big x={1560} y={600} p={vis(s, t('fifty', 2), f2)} size={150} cor={V.GOLD}>50 y</Big>
      <Big x={1560} y={770} p={vis(s, t('fifty', 2), f2)} size={40} cor={V.MUTED} largura={440} peso={400}>a round example, not a statistic</Big>
      </Jan>
      <Jan s={s} a={ini(3) - 0.1} b={fim(3)}>
      {/* fala 3 */}
      <Big x={960} y={330} p={vis(s, t('million', 3), f3)} size={150} cor={V.INK}>
        1 in <span style={{textDecoration: s > t('million', 3, 2) ? 'line-through' : 'none', textDecorationColor: V.C1, textDecorationThickness: 10}}>1,000,000</span>
      </Big>
      <Carimbo x={960} y={560} p={pop(s, t('never', 3))} size={90} cor={V.C1}>NEVER?</Carimbo>
      <Carimbo x={960} y={780} p={pop(s, t('every', 3))} size={190} cor={V.GOLD} rot={-3}>EVERY</Carimbo>
      </Jan>
      <Som nome="papel" t={ini(2)} volume={0.4} />
      {regras.map(([, tt], k) => <Som key={k} nome="risco" t={tt} volume={0.3} />)}
      <Som nome="tique" t={t('dial', 1)} volume={0.35} />
      <Som nome="carimbo" t={t('never', 3)} volume={0.45} />
      <Som nome="carimbo" t={t('every', 3)} volume={0.6} />
    </Papel>
  );
};
