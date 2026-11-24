// V10 | Encerramento: volta à noite do gancho. As luzes reacendem ("as luzes voltaram"), o mostrador vibra em 60 Hz,
// um brilho dourado na borda lembra o Sol, e a pergunta para os comentários enquanto as luzes vão apagando devagar.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, useAcao, Impacto} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {VE, W, H, Grao, Vinheta, FundoNoite, Bate, Sobe, Rotulo, Som, useLuzes, Luzes, Medidor, vida} from './apagao';

export const V10_Fim: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const imp: Impacto[] = [
    {t: t('switch', 1), forca: 0.35, congela: 0, som: 'carimbo', flash: false},
    {t: t('back', 2), forca: 0.25, congela: 0, flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const luzes = useLuzes([[500, 380, 1.1], [900, 250, 0.9], [1300, 360, 1.2], [1650, 260, 0.8], [700, 700, 1.0], [1150, 760, 1.3],
    [1600, 700, 0.9], [300, 820, 0.6], [1850, 520, 0.5]], 150, 11);
  const tBack = t('back', 2);
  const ligada = (l: {x: number}) => {
    const volta = prog(s, tBack - 0.6 + (l.x / W) * 1.0, 0.3);
    const apaga = prog(s, t('tonight', 4) + (l.x / W) * 3.5, 0.5);
    return Math.max(0.05, volta * (1 - 0.9 * apaga));
  };
  const freq = 60 + 0.04 * Math.sin(s * 9) + 0.02 * Math.sin(s * 23);
  const sol = prog(s, t('up', 3), 0.9) * sai(s, fim(3), 0.5);

  return (
    <AbsoluteFill style={{background: VE.BG, overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={lerp(1.08, 1.0, prog(s, 0, props.duracao, (x) => x))}>
        <FundoNoite />
        <Luzes luzes={luzes} s={s} ligada={ligada} />
        {s > ini(3) - 0.2 && s < fim(3) && <svg width={W} height={H} style={{position: 'absolute'}}>
          <Medidor cx={960} cy={760} r={300} f={freq} op={vida(s, t('seconds', 3) - 0.6, fim(3))} />
        </svg>}
        <AbsoluteFill style={{background: `radial-gradient(circle at 1980px 540px, rgba(240,200,120,${0.8 * sol}) 0px, rgba(210,180,126,${0.3 * sol}) 260px, rgba(0,0,0,0) 700px)`}} />
      </Camera>
      {/* fala 1 */}
      <Rotulo s={s} t={ini(1) + 0.3} ate={fim(1)} x={960} y={300} fundo={V.SHEET} cor={V.INK} size={96} rot={-3} som={false}>NO OFF SWITCH</Rotulo>
      {['no hacker', 'no tree', 'no single mistake'].map((txt, k) => {
        const tk = t(['hacker', 'tree', 'single'][k], 1);
        return <React.Fragment key={k}>
          <Bate s={s} t={tk} ate={fim(1)} x={[420, 920, 1460][k]} y={560} size={58} cor={VE.INK}>{txt}</Bate>
          {s > tk + 0.3 && s < fim(1) && <div style={{position: 'absolute', left: [420, 920, 1460][k] - [150, 120, 250][k], top: 556, width: [300, 240, 500][k] * prog(s, tk + 0.3, 0.2), height: 8, background: VE.C1}} />}
        </React.Fragment>;
      })}
      {/* fala 2 */}
      <Bate s={s} t={t('local', 2)} ate={fim(2)} x={960} y={200} size={90} cor={VE.INK}>every blackout so far: local</Bate>
      <Rotulo s={s} t={tBack} ate={fim(2)} x={960} y={900} fundo={VE.GOOD} cor={V.SHEET} size={64} rot={2}>THE LIGHTS CAME BACK</Rotulo>
      {/* fala 3 */}
      <Bate s={s} t={t('seconds', 3)} ate={fim(3)} x={960} y={200} size={84} cor={VE.GOLD}>a few seconds of spinning metal</Bate>
      <Sobe s={s} t={t('day', 3)} ate={fim(3)} x={1500} y={330} size={54} ancora="centro" cor={VE.C1}>and one thing up there</Sobe>
      {/* fala 4 */}
      <Bate s={s} t={t('tonight', 4)} x={960} y={420} size={86} cor={VE.INK}>If your power went out tonight...</Bate>
      <Bate s={s} t={t('hours', 4)} x={960} y={570} size={100} cor={VE.GOLD}>how many hours would you last?</Bate>
      <Sobe s={s} t={t('comments', 4)} x={960} y={700} size={50} ancora="centro" cor={VE.MUTED}>tell me in the comments</Sobe>
      <Vinheta forca={0.6} />
      <Grao forca={0.07} />
      <Som nome="ding" t={t('hours', 4)} volume={0.35} />
      <AbsoluteFill style={{background: '#000', opacity: prog(s, props.duracao - 0.6, 0.5)}} />
    </AbsoluteFill>
  );
};
