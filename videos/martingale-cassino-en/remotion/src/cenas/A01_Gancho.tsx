// A01 | O gancho. Roleta editorial em papel; ficha de $10 que ganha, depois a escada de apostas que dispara.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, pop, prog, useSec} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Ficha, Papel, Recorte, Roleta, Txt, V, anguloRoleta, usd, vis, LM, useLatin} from './vorttum';

export const A01_Gancho: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const s = useSec();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.25) : props.duracao + 1);

  // giros da roleta (números reais da roleta europeia: 7, 14, 5 vermelhos; 20, 13, 22 pretos)
  const t10 = t('ten', 1);
  const tf = t('fails', 1);
  const giros = [
    {t0: t('strategy', 1), t1: t10 + 0.9, numero: 7},
    {t0: tf - 0.2, t1: t('thousands', 1), numero: 20},
    {t0: t('bet', 3), t1: t('keep', 3), numero: 14},
    {t0: inicioFala(props, 4), t1: t('lose', 4), numero: 13},
    {t0: t('Lost', 4), t1: t('double', 4, 2), numero: 22},
    {t0: t('going', 4), t1: t('win', 4), numero: 5},
  ];
  const ang = anguloRoleta(s, giros);
  const roda = vis(s, t('strategy', 1) - 0.3);

  // fala 1: ganho de $10, depois a escada de perdas
  const escada = [10, 20, 40, 80, 160, 320, 640, 1280, 2560];
  const f1 = fim(1);
  // fala 3 a 5: o mecanismo
  const quadro = vis(s, t('red', 3) - 0.3, fim(5));
  const passos = [
    {v: 10, t: t('red', 3), cor: V.GOLD},
    {v: 20, t: t('double', 4), cor: V.GOLD},
    {v: 40, t: t('double', 4, 2), cor: V.GOLD},
    {v: 80, t: t('win', 4), cor: V.GOLD},
  ];
  const preto = 1 - prog(s, 0.12, 0.35);

  return (
    <Papel>
      <Roleta cx={545} cy={560} r={415} ang={ang} op={roda} bola={s > t10 + 0.9} />

      {/* fala 1 */}
      <Recorte x={1080} y={150} w={370} h={230} cor={V.C1} p={vis(s, t10 - 0.4, f1)}>
        <span style={{font: `700 54px ${LM}`, color: V.SHEET, letterSpacing: 2, marginTop: 120}}>RED</span>
      </Recorte>
      <Ficha x={1265} y={230} valor={10} r={72} p={vis(s, t10, f1)} />
      <Txt x={1500} y={200} p={pop(s, t10 + 1.0) * vis(s, t10, f1)} size={110} cor={V.GOLD} serif>+$10</Txt>
      {escada.map((v, k) => (
        <Ficha key={v} x={1150 + (k % 5) * 168} y={540 + Math.floor(k / 5) * 168} valor={v} r={74}
          cor={k < 4 ? V.C1 : V.BAD} p={vis(s, tf + k * 0.17, f1)} />
      ))}
      <Txt x={1490} y={800} p={vis(s, t('thousands', 1), f1)} size={110} cor={V.BAD} serif ancora="centro">{usd(-5110)}</Txt>

      {/* fala 2 */}
      {(() => {
        const tm = t('million', 2);
        const n = Math.round(1_000_000 * prog(s, tm - 0.6, 1.2));
        return <>
          <Txt x={1460} y={360} p={vis(s, tm - 0.6, fim(2))} size={140} serif ancora="centro">{n.toLocaleString('en-US')}</Txt>
          <Txt x={1460} y={540} p={vis(s, tm, fim(2))} size={64} cor={V.MUTED} ancora="centro">spins</Txt>
        </>;
      })()}

      {/* falas 3 a 5 */}
      <Recorte x={1075} y={150} w={370} h={210} cor={V.C1} p={quadro}>
        <span style={{font: `700 54px ${LM}`, color: V.SHEET, letterSpacing: 2}}>RED</span>
      </Recorte>
      <Recorte x={1485} y={150} w={370} h={210} cor={V.INK} p={quadro}>
        <span style={{font: `700 54px ${LM}`, color: V.SHEET, letterSpacing: 2}}>BLACK</span>
      </Recorte>
      <Txt x={1260} y={385} p={vis(s, t('keep', 3), t('double', 4) - 0.1)} size={88} cor={V.GOLD} serif ancora="centro">+$10</Txt>
      {passos.map((st, k) => (
        <React.Fragment key={st.v}>
          <Ficha x={1160 + k * 215} y={610} valor={st.v} r={82} cor={k === 3 ? V.GOLD : V.C1} p={vis(s, st.t, fim(5))} />
          {k > 0 && <Txt x={1160 + k * 215 - 108} y={588} p={vis(s, st.t, fim(5))} size={34} cor={V.MUTED} ancora="centro">{'×2'}</Txt>}
          <Txt x={1160 + k * 215} y={715} p={vis(s, t('everything', 5) + k * 0.15, fim(5))} size={54}
            cor={k === 3 ? V.GOLD : V.BAD} ancora="centro">{k === 3 ? '+$80' : usd(-st.v)}</Txt>
        </React.Fragment>
      ))}
      {(() => {
        const p = vis(s, t('ten', 5), fim(5));
        return <div style={{position: 'absolute', left: 1482, top: 830, transform: `translateX(-50%) scale(${0.9 + 0.1 * pop(s, t('ten', 5))})`,
          opacity: p, background: '#EADCBE', border: `3px solid ${V.GOLD}`, padding: '10px 34px'}}>
          <span style={{font: `700 84px ${LM}`, color: V.GOLD}}>= +$10</span>
        </div>;
      })()}

      {/* fala 6 */}
      <Txt x={1470} y={330} p={vis(s, t('casino', 6) - 0.2)} size={96} serif ancora="centro" largura={800}>
        Can you really beat a casino this way?
      </Txt>
      <AbsoluteFill style={{background: '#000', opacity: preto}} />
    </Papel>
  );
};
