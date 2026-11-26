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
  // Geometria (1920 x 1080): eixo vertical em x = 960. Centros X dos grupos a 960 ± 480; mesmos centros Y.
  const CXE = 480, CXD = 1440, YENV = 490, YBASE = 420, YROT = 830;
  return (
    <Papel>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <Relogio cx={960} cy={170} r={95} s={s} p={vis(s, 0.4)} />
        <Maleta cx={CXE} cy={YBASE} k={1.0} p={vis(s, tHund)} />
        <Maquina cx={CXD} cy={YBASE - 169} k={1.3} p={vis(s, t('machine', 1))} s={s} rola={s > t('rolls', 1)} />
      </svg>
      <Envelope x={CXE - 210} y={YENV} p={vis(s, tEnv)} aberto={prog(s, tHund, 0.3)}>1</Envelope>
      <Envelope x={CXD - 210} y={YENV} p={vis(s, tEnv + 0.15)} aberto={prog(s, tSec, 0.3)}>2</Envelope>
      <Big x={CXE} y={YROT} p={pop(s, t('thousand', 1))} size={92} cor={V.GOLD}>$100,000</Big>
      <Big x={CXD} y={YROT} p={pop(s, t('five', 1))} size={92} cor={V.C1}>$5,000,000</Big>
      {/* fala 2: rótulos espelhados */}
      <Big x={CXE} y={905} p={vis(s, t('sure', 2), f2)} size={58} cor={V.MUTED}>the sure thing</Big>
      <Big x={CXE} y={970} p={pop(s, t('seconds', 2)) * vis(s, 0, f2)} size={58} cor={V.C1}>grabbed in ~2 seconds</Big>
      <Big x={CXD} y={905} p={vis(s, t('sure', 2), f2)} size={58} cor={V.MUTED}>the machine</Big>
      <Big x={CXD} y={970} p={pop(s, t('seconds', 2)) * vis(s, 0, f2)} size={58} cor={V.C2}>a roll every 10 min</Big>
      {/* área livre central (x 690 a 1230, entre os envelopes; y 300 a 760) */}
      <Carimbo x={960} y={420} p={pop(s, t('single', 2)) * vis(s, 0, t('hundred', 2) - 0.1)} size={44} cor={V.C2} rot={-3} esc0={1.0}>ONE NUMBER</Carimbo>
      <Big x={960} y={600} p={vis(s, t('single', 2) + 0.2, t('hundred', 2) - 0.1)} size={150} cor={V.C2}>?</Big>
      <Big x={960} y={600} p={pop(s, t('hundred', 2)) * sai(s, t('nothing', 2) - 0.1, 0.25)} size={130} cor={V.GOOD}>100×</Big>
      <Big x={960} y={600} p={pop(s, t('nothing', 2))} size={110} cor={V.BAD}>≈ $0</Big>
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
