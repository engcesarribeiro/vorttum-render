// V10 | Encerramento: de volta aos dois envelopes, o botão sem rótulo entre eles; a pergunta para os comentários e o cartão de tela final.
import React from 'react';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Jan, Big, Botao, Card, Envelope, Papel, Relogio, V, W, H, lin, useT, vis, prog, pop, sai} from './pauta';

export const V10_Final: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim, ini} = useT(props);
  const f1 = fim(1);
  // fala 2: o botão gira e para num rótulo em branco com "?"
  const gira = lin(s, [ini(2), t('next', 2), t('comments', 2) + 0.5], [-80, 700, 760]);
  const fimPergunta = props.duracao + 1;
  return (
    <Papel>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Relogio cx={960} cy={170} r={95} s={s} p={vis(s, 0.2)} />
      </svg>
      <Envelope x={170} y={430} p={vis(s, 0.2)}>1</Envelope>
      <Envelope x={1330} y={430} p={vis(s, 0.35)}>2</Envelope>
      <Big x={380} y={790} p={vis(s, 0.5)} size={64} cor={V.GOLD}>$100,000</Big>
      <Big x={1540} y={790} p={vis(s, 0.5)} size={64} cor={V.C1}>$5M / 10 min</Big>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Botao cx={960} cy={600} r={150} ang={s < ini(2) ? lin(s, [0, ini(2)], [-30, 30]) : gira} p={vis(s, 0.4)} />
      </svg>
      <Jan s={s} a={ini(1) - 0.1} b={fim(1)}>
      {/* fala 1 */}
      <Big x={960} y={290} p={vis(s, t('machine', 1), f1)} size={54} cor={V.GOOD}>1 in 1,000,000 · 50 years → the machine</Big>
      <Big x={960} y={880} p={vis(s, t('Powerball', 1), f1)} size={54} cor={V.C1}>Powerball odds → the briefcase</Big>
      <Big x={960} y={985} p={pop(s, t('tipping', 1))} size={64} cor={V.GOLD}>your personal tipping point</Big>
      </Jan>
      <Jan s={s} a={ini(2) - 0.1} b={fim(2)}>
      {/* fala 2 */}
      <Card x={110} y={860} w={1700} h={170} p={vis(s, t('comments', 2) - 0.2, fimPergunta)} cor="#F3EDE1" rot={0}>
        <Big x={850} y={85} p={1} size={48} cor={V.INK} largura={1560}>What is the worst odds per roll at which you would still give up the $100,000 and take the machine?</Big>
      </Card>
      <Big x={960} y={790} p={vis(s, t('comments', 2) + 0.4, fimPergunta)} size={110} cor={V.C1}>?</Big>
      <Big x={1640} y={150} p={vis(s, t('next', 2), fimPergunta)} size={44} cor={V.MUTED} largura={420}>next video →</Big>
      </Jan>
      <Som nome="tique" t={ini(2)} volume={0.3} />
      <Som nome="ding" t={t('comments', 2)} volume={0.4} />
    </Papel>
  );
};
