// V01 | Gancho: tela preta, dois envelopes, maleta de US$ 100 mil de um lado e a máquina "every 10 min" do outro; relógio batendo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Som} from '../kit/retro';
import {useLatin} from './vorttum';
import {Big, Carimbo, Envelope, Maleta, Maquina, Papel, Relogio, V, W, H, useT, vis, prog, pop, sai} from './pauta';

export const V01_Gancho: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const {t, fim} = useT(props);
  const f1 = fim(1);
  const f2 = fim(2);
  const tEnv = t('envelopes', 1);
  const tHund = t('hundred', 1);
  const tSec = t('second', 1);
  return (
    <Papel>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Relogio cx={960} cy={170} r={95} s={s} p={vis(s, 0.4)} />
        <Maleta cx={380} cy={385} k={1.15} p={vis(s, tHund)} />
        <Maquina cx={1340} cy={250} k={1.25} p={vis(s, t('machine', 1))} s={s} rola={s > t('rolls', 1)} />
      </svg>
      <Envelope x={170} y={455} p={vis(s, tEnv)} aberto={prog(s, tHund, 0.3)}>1</Envelope>
      <Envelope x={1130} y={455} p={vis(s, tEnv + 0.15)} aberto={prog(s, tSec, 0.3)}>2</Envelope>
      <Big x={380} y={810} p={pop(s, t('thousand', 1))} size={92} cor={V.GOLD}>$100,000</Big>
      <Big x={1340} y={810} p={pop(s, t('five', 1))} size={92} cor={V.C1}>$5,000,000</Big>
      {/* fala 2 */}
      <Big x={380} y={895} p={vis(s, t('sure', 2), f2)} size={58} cor={V.MUTED}>the sure thing</Big>
      <Big x={380} y={965} p={pop(s, t('seconds', 2)) * vis(s, 0, f2)} size={58} cor={V.C1}>grabbed in ~2 seconds</Big>
      <Carimbo x={960} y={430} p={pop(s, t('single', 2)) * vis(s, 0, t('hundred', 2) - 0.1)} size={52} cor={V.C2} rot={-4}>ONE NUMBER</Carimbo>
      <Big x={960} y={620} p={vis(s, t('single', 2) + 0.2, t('hundred', 2) - 0.1)} size={170} cor={V.C2}>?</Big>
      <Big x={890} y={600} p={pop(s, t('hundred', 2)) * sai(s, t('nothing', 2) - 0.1, 0.25)} size={150} cor={V.GOOD}>100×</Big>
      <Big x={890} y={600} p={pop(s, t('nothing', 2))} size={130} cor={V.BAD}>≈ $0</Big>
      <AbsoluteFill style={{background: '#000', opacity: 1 - prog(s, 0.15, 0.6)}} />
      <Som nome="clique" t={tEnv} volume={0.5} />
      <Som nome="vupt" t={tEnv + 0.15} volume={0.4} />
      <Som nome="carimbo" t={t('thousand', 1)} volume={0.5} />
      <Som nome="pop" t={t('machine', 1)} volume={0.5} />
      <Som nome="carimbo" t={t('single', 2)} volume={0.45} />
      <Som nome="ding" t={t('hundred', 2)} volume={0.4} />
      <Som nome="baque" t={t('nothing', 2)} volume={0.45} />
    </Papel>
  );
};
