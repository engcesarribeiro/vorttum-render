// V06 | Existe um botão de desligar o mundo? Bauhaus em movimento: cada rede é uma roda que gira no seu próprio ritmo;
// a do Texas para e não contamina a do Oeste; a fronteira; o hacker diante de dezenas de cadeados; o círculo maior que tudo; o Sol.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, useAcao, Impacto} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {respiro} from './pecas';
import {W, H, Grao, Bate, Sobe, Rotulo, Som, vida} from './apagao';

const CREME = '#EFE8DA';

const Roda: React.FC<{x: number; y: number; r: number; cor: string; ang: number; p: number; nome: string; apagada?: number}> =
  ({x, y, r, cor, ang, p, nome, apagada = 0}) => (
    <g opacity={Math.min(1, p * 2)} transform={`translate(${x} ${y}) scale(${p})`}>
      <circle r={r} fill={apagada > 0.5 ? V.INK : cor} />
      <g transform={`rotate(${ang})`}>
        {[0, 1, 2, 3].map((k) => <rect key={k} x={-r * 0.06} y={-r * 0.92} width={r * 0.12} height={r * 0.92} fill={apagada > 0.5 ? '#4A4540' : CREME} transform={`rotate(${k * 90})`} />)}
        <circle cy={-r * 0.78} r={r * 0.11} fill={apagada > 0.5 ? '#4A4540' : V.INK} />
      </g>
      <circle r={r * 0.16} fill={CREME} />
      <text y={r + 46} fontFamily={LM} fontWeight={700} fontSize={Math.max(30, r * 0.3)} fill={V.INK} textAnchor="middle">{nome}</text>
    </g>
  );

export const V06_Botao: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;
  const imp: Impacto[] = [
    {t: t('cascade', 3) + 0.1, forca: 0.45, congela: 0, som: 'estrondo', volume: 0.4, flash: false},
    {t: t('edge', 4), forca: 0.35, congela: 0, som: 'carimbo', flash: false},
    {t: t('bigger', 6), forca: 0.4, congela: 0, flash: false},
    {t: t('miles', 7), forca: 0.6, congela: 0, som: 'estrondo', volume: 0.5, flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const tc = t('cascade', 3);
  const parouTexas = prog(s, tc, 0.6);
  const redes = [
    {nome: 'West', x: 260, y: 380, r: 120, cor: V.C2, vel: 70, t0: t('three', 2) + 0.25},
    {nome: 'East', x: 560, y: 380, r: 150, cor: V.GOLD, vel: 52, t0: t('three', 2)},
    {nome: 'Texas', x: 410, y: 700, r: 100, cor: V.C1, vel: 88, t0: t('three', 2) + 0.5},
    {nome: 'Europe', x: 930, y: 380, r: 130, cor: V.C2, vel: 61, t0: t('europe', 2)},
    {nome: 'China', x: 1260, y: 380, r: 150, cor: V.GOLD, vel: 45, t0: t('china', 2)},
    {nome: 'India', x: 1590, y: 380, r: 115, cor: V.C1, vel: 77, t0: t('india', 2)},
    {nome: 'Brazil', x: 1030, y: 730, r: 115, cor: V.GOOD, vel: 66, t0: t('brazil', 2)},
    {nome: 'Australia', x: 1420, y: 730, r: 110, cor: V.C2, vel: 58, t0: t('australia', 2)},
  ].map((r) => ({...r, x: 960 + (r.x - 960) * 0.86, y: 540 + (r.y - 540) * 0.92}));
  const texX = redes[2].x, texY = redes[2].y + 60;
  const angulo = (k: number) => {
    const r = redes[k];
    if (k === 2) { const tp = tc; return s < tp ? (s - r.t0) * r.vel : (tp - r.t0) * r.vel + (1 - Math.exp(-(s - tp) * 3)) * r.vel / 3; }
    return (s - r.t0) * r.vel + k * 40;
  };
  // formas Bauhaus que se movem sempre (fundo)
  const fundo = (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <circle cx={1680 + 30 * Math.sin(s * 0.5)} cy={180} r={80} fill={V.GOLD} opacity={0.35} />
      <rect x={150 + 30 * Math.sin(s * 0.4)} y={950} width={420} height={40} fill={V.C1} opacity={0.4} />
      <path d={`M 1800 990 L 1800 ${830 + 30 * Math.sin(s * 0.6)} L 1630 990 Z`} fill={V.C2} opacity={0.35} />
    </svg>
  );

  return (
    <AbsoluteFill style={{background: CREME, overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={respiro(s).zoom} foco={respiro(s).foco}>
        {fundo}
        {/* fala 1 */}
        {s < t('three', 2) + 0.3 && <AbsoluteFill style={{opacity: sai(s, t('three', 2), 0.3), transform: `scale(${lerp(1, 0.6, prog(s, t('no', 2), 0.8))})`}}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M 960 540 L ${960 + 300 * Math.cos((k * 60 + s * 30) * Math.PI / 180)} ${540 + 300 * Math.sin((k * 60 + s * 30) * Math.PI / 180)} A 300 300 0 0 1 ${960 + 300 * Math.cos(((k + 1) * 60 + s * 30) * Math.PI / 180)} ${540 + 300 * Math.sin(((k + 1) * 60 + s * 30) * Math.PI / 180)} Z`}
              fill={[V.C1, V.GOLD, V.C2, V.INK, V.GOOD, V.GOLD][k]} opacity={pop(s, ini(1) + k * 0.08)} />)}
          </svg>
          <Bate s={s} t={t('off', 1)} ate={fim(1)} x={960} y={540} size={300} cor={CREME}>?</Bate>
          <Sobe s={s} t={t('entire', 1)} ate={fim(1)} x={960} y={900} size={62} ancora="centro" cor={V.INK}>Could anyone turn off the entire world?</Sobe>
        </AbsoluteFill>}
        {/* falas 2 a 4 */}
        {tela(s, 2, 4) && <AbsoluteFill>
          <Sobe s={s} t={ini(2) + 0.2} ate={fim(2)} x={960} y={110} size={54} ancora="centro" cor={V.INK}>there is no world grid</Sobe>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {redes.map((r, k) => <Roda key={r.nome} x={r.x} y={r.y + 60} r={r.r} cor={r.cor} ang={angulo(k)} p={pop(s, r.t0 - 0.1)}
              nome={r.nome} apagada={k === 2 ? parouTexas : 0} />)}
            {s > tc && <circle cx={texX} cy={texY} r={lerp(100, 300, prog(s, tc, 0.9))} fill="none" stroke={V.INK} strokeWidth={lerp(14, 0, prog(s, tc, 0.9))} />}
            {/* a fronteira (fala 4) */}
            {s > t('edge', 4) - 0.2 && <rect x={texX - 160} y={texY - 160} width={320} height={320} fill="none" stroke={V.INK} strokeWidth={14}
              strokeDasharray="34 18" opacity={prog(s, t('edge', 4) - 0.2, 0.4)} />}
          </svg>
          <Rotulo s={s} t={t('together', 3)} ate={fim(3)} x={960} y={140} fundo={V.INK} cor={CREME} size={50} rot={-2}>THEY DON'T SPIN TOGETHER</Rotulo>
          <Rotulo s={s} t={t('california', 3)} x={340} y={240} fundo={V.GOOD} cor={CREME} size={38} rot={3}>STILL SPINNING</Rotulo>
          <Rotulo s={s} t={t('edge', 4)} x={760} y={930} fundo={V.C1} cor={CREME} size={46} rot={-2} som={false}>STOPS AT THE EDGE</Rotulo>
        </AbsoluteFill>}
        {/* fala 5: o hacker */}
        {tela(s, 5, 5) && (() => {
          const td = t('dozens', 5);
          const alvo = Math.floor(Math.max(0, s - td) * 6) % 30;
          return <AbsoluteFill>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              {[...Array(30)].map((_, k) => {
                const x = 790 + (k % 6) * 170, y = 230 + Math.floor(k / 6) * 150;
                const p = pop(s, td + k * 0.04);
                return <g key={k} transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
                  <rect x={-60} y={-30} width={120} height={95} fill={[V.C2, V.GOLD, V.C1, V.GOOD][k % 4]} />
                  <path d="M -32 -30 L -32 -62 A 32 32 0 0 1 32 -62 L 32 -30" fill="none" stroke={V.INK} strokeWidth={12} />
                  <circle cy={12} r={11} fill={V.INK} />
                  {s > td + 0.8 && k === alvo && <rect x={-70} y={-82} width={140} height={160} fill="none" stroke={V.INK} strokeWidth={6} />}
                </g>;
              })}
            </svg>
            <Bate s={s} t={t('hacker', 5)} x={390} y={360} size={100} cor={V.INK}>a hacker</Bate>
            {s > t('moment', 5) && <div style={{position: 'absolute', left: 100, top: 360, width: 460 * prog(s, t('moment', 5), 0.3), height: 14, background: V.C1}} />}
            <Sobe s={s} t={t('moment', 5)} x={390} y={520} size={54} ancora="centro" cor={V.C1}>all at the same moment?</Sobe>
          </AbsoluteFill>;
        })()}
        {/* falas 6 e 7: maior que qualquer rede; o Sol */}
        {tela(s, 6, 7) && (() => {
          const g = prog(s, t('bigger', 6) - 0.2, 0.8);
          const sol = prog(s, t('miles', 7) - 0.6, 0.9);
          return <AbsoluteFill>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              {redes.map((r, k) => <Roda key={k} x={635 + (k % 4) * 150} y={430 + Math.floor(k / 4) * 170} r={60} cor={r.cor}
                ang={s * r.vel + k * 40} p={pop(s, ini(6) + k * 0.06)} nome="" />)}
              <circle cx={860} cy={515} r={lerp(60, 400, g)} fill="none" stroke={V.INK} strokeWidth={18} opacity={g} />
              <circle cx={lerp(2300, 1560, sol)} cy={500} r={170} fill={V.GOLD} />
              {[...Array(16)].map((_, k) => { const a = (k * 22.5 + s * 10) * Math.PI / 180; const cx = lerp(2300, 1560, sol);
                return <line key={k} x1={cx + 190 * Math.cos(a)} y1={500 + 190 * Math.sin(a)} x2={cx + 240 * Math.cos(a)} y2={500 + 240 * Math.sin(a)} stroke={V.GOLD} strokeWidth={18} />; })}
            </svg>
            <Rotulo s={s} t={t('bigger', 6)} ate={fim(6)} x={860} y={140} fundo={V.INK} cor={CREME} size={48}>BIGGER THAN ANY GRID</Rotulo>
            <Bate s={s} t={t('miles', 7)} x={1520} y={840} size={58} cor={V.INK} som={false}>93,000,000 miles away</Bate>
          </AbsoluteFill>;
        })()}
      </Camera>
      <Grao forca={0.05} />
    </AbsoluteFill>
  );
};
