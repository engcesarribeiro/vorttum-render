// V03 | A máquina de 5 segundos, em papel envelhecido com colagem e um cartão "Manim" para a equação:
// usina e rotor girando, rotores em sincronia, carregador 60 Hz, balança feito × usado que inclina e muda a
// velocidade do rotor e o mostrador, turbina que treme e racha, equação, volante (inércia), conta dos EUA,
// bateria de 5 s que esvazia na tela e a janela de 5 s.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, LinhasVelocidade, useAcao, Impacto} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {W, H, Grao, Vinheta, FundoPapel, Bate, Sobe, Rotulo, Cartao, Som, Medidor, conta, milhar, vida, VE, useLuzes, Luzes} from './apagao';
import {Rotor, Usina, Casa, Balanca, Turbina, Bateria, Circulo, Carimbo, respiro, clamp01, rasgoRet, SOMBRA} from './pecas';

/** Oval à mão numa caixa 0..100 (um pouco mais de uma volta). */
const oval = (seed: number) => {
  let x = seed * 9301 + 49297;
  const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const pts: string[] = [];
  for (let i = 0; i <= 46; i++) {
    const a = (i / 40) * Math.PI * 2 - 2.2, k = 1 + (r() - 0.5) * 0.05 + (i / 40) * 0.04;
    pts.push(`${50 + Math.cos(a) * 50 * k} ${50 + Math.sin(a) * 50 * k}`);
  }
  return 'M ' + pts.join(' L ');
};

export const V03_Maquina: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;

  const imp: Impacto[] = [
    {t: t('sixty', 2), forca: 0.35, congela: 0, flash: false},
    {t: t('tear', 5), forca: 0.8, congela: 0, som: 'estrondo', volume: 0.4},
    {t: t('five', 9), forca: 0.5, congela: 0, flash: false},
    {t: ini(10), forca: 0.6, congela: 0, som: 'soco', flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const r = respiro(s);

  // velocidade do rotor (voltas/s) ao longo da cena: base, acelera em "speed", freia em "slow", volta em "balance"
  const tMais = t('speed', 4) - 0.6, tMenos = t('slow', 4) - 0.6, tEq = t('balance', 4);
  const vel = (x: number) => {
    let v = 0.55;
    if (x > tMais && x < tMenos) v += 0.6 * prog(x, tMais, 0.8);
    if (x >= tMenos && x < tEq) v -= 0.33 * prog(x, tMenos, 0.8);
    return v;
  };
  let ang = 0;
  for (let x = 0; x < s; x += 1 / 30) ang += vel(x) * 12;   // graus por quadro
  const vAgora = vel(s);
  const freq = 60 + (vAgora - 0.55) * 0.5;
  const inclina = s > tMais && s < tMenos ? -9 * prog(s, tMais, 0.7) : s >= tMenos && s < tEq ? 9 * prog(s, tMenos, 0.7) : 0;
  const balAng = s < tEq ? inclina : lerp(9, 0, prog(s, tEq, 0.8));

  // fala 8: luzes da cidade (os 500 GW chegando)
  const luzes = useLuzes([[1450, 760, 0.9], [1650, 820, 0.6]], 120, 31);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={r.zoom} foco={r.foco}>
        <FundoPapel deriva={(s % 30) / 30} />

        {/* ---------- falas 1 e 2: a usina, o rotor, a sincronia, o carregador ---------- */}
        {tela(s, 1, 2) && <AbsoluteFill>
          {(() => {
            const pUs = pop(s, ini(1) + 0.1), pRot = pop(s, t('wheel', 1) - 0.1);
            const desliza = prog(s, t('sync', 1) - 0.3, 0.6);
            const pSync = prog(s, t('sync', 1), 0.5);
            const xs = [360, 660, 960, 1260, 1560];
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <g opacity={1 - desliza} transform={`translate(${-desliza * 200} 0)`}>
                  <g transform={`translate(560 820) scale(${pUs * 2.3}) translate(-560 -820)`}>
                    <Usina x={560} y={820} s={s} seed={2} />
                  </g>
                  {/* corte: o rotor sai de dentro da usina */}
                  {pRot > 0 && <>
                    <line x1={600} y1={650} x2={1080} y2={480} stroke={V.INK} strokeWidth={4} strokeDasharray="12 10" opacity={pRot} />
                    <g transform={`translate(1280 480) scale(${pRot}) translate(-1280 -480)`}>
                      <Rotor x={1280} y={480} r={250} ang={ang} vel={vAgora} />
                    </g>
                  </>}
                </g>
                {/* cinco usinas com rotores girando juntos */}
                {desliza > 0 && xs.map((x, i) => {
                  const p = pop(s, t('sync', 1) - 0.2 + i * 0.1);
                  return <g key={i} opacity={clamp01(p * 2)} transform={`translate(0 ${(1 - p) * 60})`}>
                    <Usina x={x} y={900} k={0.75} s={s + i} seed={i + 4} cor={['#B9A27E', '#A9B08C', '#C2A48A', '#B3A68F', '#A99C80'][i]} />
                    <Rotor x={x} y={420} r={110} ang={ang} seed={i + 3} cor={[V.C2, V.GOOD, V.C1, V.C2, V.GOLD][i]} marca={VE.LUZ} />
                    <line x1={x} y1={560} x2={x} y2={700} stroke={V.INK} strokeWidth={3} strokeDasharray="8 8" />
                  </g>;
                })}
                {pSync > 0 && (() => {
                  const a = (ang * Math.PI) / 180;
                  const yM = 420 - Math.cos(a) * 110 * 0.78;
                  return <line x1={260} y1={yM} x2={260 + 1400 * pSync} y2={yM} stroke={V.C1} strokeWidth={5} strokeDasharray="18 12" opacity={0.85} />;
                })()}
              </svg>
              <Rotulo s={s} t={t('generator', 1)} ate={t('sync', 1) - 0.3} x={1280} y={800} fundo={V.C2} size={56} rot={-3}>GENERATOR</Rotulo>
              <Rotulo s={s} t={t('others', 1)} ate={t('sixty', 2) - 0.1} x={960} y={150} fundo={V.C1} size={56} rot={2} seed={6}>ALL IN SYNC</Rotulo>
              <Bate s={s} t={t('sixty', 2)} ate={t('hertz', 2) - 0.2} x={960} y={160} size={110} cor={V.INK}>60 turns per second</Bate>
            </>;
          })()}
          {/* carregador */}
          <Cartao s={s} t={t('hertz', 2) - 0.3} ate={fim(2)} x={1180} y={180} w={620} h={420} fundo="#F3EDE0" rot={4} seed={9}>
            <svg width={620} height={420}>
              <rect x={60} y={60} width={200} height={300} rx={26} fill="#E6E0D4" stroke={V.INK} strokeWidth={5} />
              <rect x={110} y={20} width={26} height={60} fill={V.INK} /><rect x={184} y={20} width={26} height={60} fill={V.INK} />
              <text x={290} y={150} fontFamily="JetBrains Mono" fontSize={26} fill={V.INK}>INPUT:</text>
              <text x={290} y={195} fontFamily="JetBrains Mono" fontSize={26} fill={V.INK}>100-240V ~</text>
              <text x={290} y={250} fontFamily="JetBrains Mono" fontSize={44} fontWeight={700} fill={V.INK}>50/60Hz</text>
              <text x={290} y={300} fontFamily="JetBrains Mono" fontSize={22} fill={V.MUTED}>0.5A</text>
              <Circulo cx={430} cy={236} rx={140} ry={44} p={prog(s, t('charger', 2) - 0.2, 0.6)} />
            </svg>
          </Cartao>
        </AbsoluteFill>}

        {/* ---------- falas 3 e 4: a balança feito × usado ---------- */}
        {tela(s, 3, 4) && <AbsoluteFill style={{opacity: prog(s, ini(3) - 0.25, 0.35)}}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <Balanca x={960} y={420} braco={360} ang={balAng}
              esquerda={(cx, cy) => <g>
                <Usina x={cx - 60} y={cy - 4} k={0.55} s={s} seed={11} />
                <Usina x={cx + 60} y={cy - 4} k={0.55} s={s + 1} seed={12} cor="#A9B08C" />
                {s > tMais && s < tMenos && <g opacity={pop(s, tMais)}><Usina x={cx} y={cy - 70} k={0.55} s={s + 2} seed={13} cor="#C2A48A" /></g>}
              </g>}
              direita={(cx, cy) => <g>
                {[-80, 0, 80].map((dx, i) => <Casa key={i} x={cx + dx} y={cy - 4} k={0.9} seed={i + 20} cor={['#A2674A', '#5F8466', '#82648F'][i]} />)}
                {s >= tMenos && s < tEq + 0.2 && [-40, 40].map((dx, i) => <g key={i} opacity={pop(s, tMenos + i * 0.15)}>
                  <Casa x={cx + dx} y={cy - 64} k={0.9} seed={i + 30} cor={['#82648F', '#A2674A'][i]} /></g>)}
              </g>} />
            {/* rotor e mostrador acompanham a balança */}
            <g opacity={vida(s, t('going', 3))}>
              <Rotor x={300} y={300} r={135} ang={ang} vel={vAgora} />
            </g>
            <g opacity={vida(s, t('make', 4))}>
              <Medidor cx={1600} cy={400} r={160 * lerp(1, 1.2, prog(s, t('meter', 4), 0.5))} f={freq} tinta={V.INK} />
            </g>
          </svg>
          <Rotulo s={s} t={t('rule', 3)} ate={t('make', 4) - 0.2} x={960} y={160} fundo={V.INK} cor={V.SHEET} size={56} rot={-1.5}>POWER IN  =  POWER OUT</Rotulo>
          <Rotulo s={s} t={t('going', 3)} x={600} y={880} fundo={V.GOLD} cor={V.SHEET} size={50} rot={-3} seed={4}>MADE</Rotulo>
          <Rotulo s={s} t={t('coming', 3)} x={1320} y={880} fundo={V.C2} cor={V.SHEET} size={50} rot={3} seed={5}>USED</Rotulo>
          <Rotulo s={s} t={t('speed', 4)} ate={tMenos} x={370} y={500} fundo={V.GOOD} size={50} rot={-4}>SPEEDS UP</Rotulo>
          <Rotulo s={s} t={t('slow', 4)} ate={tEq} x={370} y={500} fundo={V.C1} size={50} rot={3} seed={8}>SLOWS DOWN</Rotulo>
          <Rotulo s={s} t={t('meter', 4)} x={1600} y={660} fundo={V.SHEET} cor={V.INK} size={44} rot={-2} seed={10}>a live meter</Rotulo>
          {s > tMais && s < tMenos && <LinhasVelocidade x={300} y={300} altura={300} lado={-1} intensidade={0.8} s={s} cor={V.INK} />}
        </AbsoluteFill>}

        {/* ---------- fala 5: a turbina que treme e racha ---------- */}
        {tela(s, 5, 5) && <AbsoluteFill style={{opacity: prog(s, ini(5) - 0.25, 0.35)}}>
          {(() => {
            const tremor = prog(s, t('push', 5), 1.2) * 0.4 + prog(s, t('vibrate', 5), 0.6) * 0.8;
            const racha = prog(s, t('tear', 5), 0.6);
            const calma = prog(s, t('watches', 5) - 0.3, 0.5);
            const xs = [260, 540, 820, 1100, 1380, 1660];
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <g opacity={1 - calma} transform={`translate(960 520) scale(${pop(s, t('turbines', 5) - 0.1) * (1 - 0.4 * calma)}) translate(-960 -520)`}>
                  <Turbina x={960} y={520} r={330} ang={s * 300} tremor={tremor * (1 - calma)} racha={racha} s={s} />
                </g>
                {calma > 0 && xs.map((x, i) => {
                  const p = pop(s, t('watches', 5) + i * 0.08);
                  return <g key={i} opacity={clamp01(p * 2)}>
                    <Usina x={x} y={960} k={0.6} s={s + i} seed={40 + i} />
                    <Medidor cx={x} cy={660} r={95} f={60 + 0.08 * Math.sin(s * 3 + i)} tinta={V.INK} />
                  </g>;
                })}
              </svg>
              <Rotulo s={s} t={t('exact', 5)} ate={t('push', 5) + 0.6} x={960} y={150} fundo={V.C2} size={50} rot={-2}>ONE EXACT SPEED</Rotulo>
              <Bate s={s} t={t('vibrate', 5)} ate={t('watches', 5) - 0.3} x={1460} y={230} size={78} cor={V.C1} rot={6} som={false}>VIBRATION</Bate>
              <Rotulo s={s} t={t('watches', 5) + 0.4} x={960} y={200} fundo={V.INK} cor={V.SHEET} size={52} rot={1.5}>EVERY PLANT WATCHES THE FREQUENCY</Rotulo>
            </>;
          })()}
        </AbsoluteFill>}

        {/* ---------- falas 6 e 7: a equação (cartão Manim) e o volante ---------- */}
        {tela(s, 6, 7) && <AbsoluteFill>
          {(() => {
            const p = pop(s, ini(6) - 0.1, 0.5);
            const escreve = prog(s, t('engineers', 6), 1.4, (x) => x);
            const cel = (k: number) => clamp01(escreve * 4 - k);
            const fr = (a: React.ReactNode, b: React.ReactNode, op: number) => (
              <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 18px', opacity: op}}>
                <div style={{padding: '0 8px'}}>{a}</div>
                <div style={{height: 5, alignSelf: 'stretch', background: VE.INK}} />
                <div style={{padding: '0 8px'}}>{b}</div>
              </div>
            );
            const mk = (p0: number, cor: string, seed: number, rot: string, filho: React.ReactNode, rotulo?: string, tr?: number) => (
              <span style={{position: 'relative', display: 'inline-flex'}}>
                {filho}
                {p0 > 0 && <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', left: -26, top: -22,
                  width: 'calc(100% + 52px)', height: 'calc(100% + 44px)', overflow: 'visible', pointerEvents: 'none'}}>
                  <path d={oval(seed)} fill="none" stroke={cor} strokeWidth={7} vectorEffect="non-scaling-stroke" strokeLinecap="round"
                    pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(p0)} />
                </svg>}
                {rotulo && tr !== undefined && <span style={{position: 'absolute', left: '50%', top: 'calc(100% + 30px)', whiteSpace: 'nowrap',
                  transform: `translateX(-50%) translateY(${(1 - prog(s, tr, 0.4)) * 20}px)`, opacity: prog(s, tr, 0.4),
                  fontSize: 36, fontWeight: 700, color: cor, fontStyle: 'normal'}}>{rotulo}</span>}
                {void rot}
              </span>
            );
            return <div style={{position: 'absolute', left: 150, top: 170, width: 1100, height: 500, opacity: clamp01(p * 2),
              transform: `rotate(-1.5deg) scale(${lerp(1.15, 1, p)})`, filter: 'drop-shadow(12px 14px 0 rgba(0,0,0,0.3))'}}>
              <svg width={1100} height={500} style={{position: 'absolute'}}>
                <path d={rasgoRet(0, 0, 1100, 500, 21, 9)} fill={VE.BG} />
              </svg>
              <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontFamily: LM, fontSize: 84, color: VE.INK}}>
                {mk(prog(s, t('left', 6), 0.6), VE.GOLD, 3, '', fr(<span>d<i>f</i></span>, <span>d<i>t</i></span>, cel(0)), 'how fast it changes', t('changing', 6))}
                <span style={{margin: '0 30px', opacity: cel(1)}}>=</span>
                {fr(<span><i>f</i><sub style={{fontSize: 48}}>0</sub></span>,
                  <span>2{mk(prog(s, t('inertia', 7), 0.5), VE.GOOD, 7, '', <i style={{color: s > t('inertia', 7) ? VE.GOOD : VE.INK, padding: '0 4px'}}>H</i>)}</span>, cel(1.5))}
                <span style={{margin: '0 14px', opacity: cel(2)}}>·</span>
                {mk(prog(s, t('right', 6), 0.6), VE.C1, 5, '', fr(<span><i>P</i><sub style={{fontSize: 42}}>made</sub> – <i>P</i><sub style={{fontSize: 42}}>used</sub></span>, <span><i>S</i></span>, cel(2.6)), 'the gap', t('gap', 6))}
              </div>
            </div>;
          })()}
          {/* lado direito: mostrador caindo (esquerda da equação) e a balança pequena (direita) */}
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <g opacity={vida(s, t('left', 6), t('right', 6))}>
              <Medidor cx={1560} cy={470} r={170} f={60 - 0.6 * ((s * 0.5) % 1)} tinta={V.INK} />
            </g>
            <g opacity={vida(s, t('right', 6), ini(7) - 0.1)}>
              <g transform="translate(1560 300) scale(0.62) translate(-1560 -300)"><Balanca x={1560} y={300} braco={200} ang={8 * Math.sin(s * 2)} /></g>
            </g>
            <g opacity={vida(s, t('inertia', 7))}>
              <Rotor x={1540} y={420} r={180 * pop(s, t('inertia', 7))} ang={s * 90} cor="#4A4540" marca={VE.LUZ} seed={9} />
              {s > t('energy', 7) && [...Array(10)].map((_, i) => {
                const a = (i / 10) * Math.PI * 2 + s * 1.5, rr = 215 + 15 * Math.sin(s * 4 + i);
                return <circle key={i} cx={1540 + Math.cos(a) * rr} cy={420 + Math.sin(a) * rr} r={12} fill={V.GOLD} opacity={prog(s, t('energy', 7), 0.5)} />;
              })}
            </g>
          </svg>
          <Rotulo s={s} t={t('inertia', 7) + 0.2} x={1540} y={720} fundo={V.GOOD} size={52} rot={-3}>H = INERTIA</Rotulo>
          <Sobe s={s} t={t('spinning', 7)} x={1060} y={760} size={40} ancora="centro" cor={V.INK}>energy stored in spinning metal</Sobe>
        </AbsoluteFill>}

        {/* ---------- fala 8: os números dos EUA ---------- */}
        {tela(s, 8, 8) && <AbsoluteFill style={{opacity: prog(s, ini(8) - 0.25, 0.35)}}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {[200, 420, 640].map((x, i) => <g key={i} opacity={pop(s, t('united', 8) + i * 0.12)}><Usina x={x} y={960} k={0.85} s={s + i} seed={50 + i} /></g>)}
            {s > t('average', 8) && [...Array(16)].map((_, i) => {
              const u = (s * 0.45 + i / 16) % 1;
              const x = lerp(700, 1380, u), y = 820 - Math.sin(u * Math.PI) * 140 + (i % 3) * 18;
              return <circle key={i} cx={x} cy={y} r={11} fill={V.GOLD} opacity={prog(s, t('average', 8), 0.5) * 0.9} />;
            })}
            <path d={rasgoRet(1240, 640, 560, 340, 61, 8)} fill="#2C3346" opacity={pop(s, t('average', 8) - 0.2)} style={{filter: SOMBRA}} />
          </svg>
          {s > t('average', 8) && <Luzes luzes={luzes} s={s} ligada={() => prog(s, t('five', 8), 0.6) * (0.85 + 0.15 * Math.sin(s * 9))} />}
          <Cartao s={s} t={t('ran', 8)} x={170} y={150} w={960} h={320} fundo="#EEE6D3" rot={-2} seed={12}>
            <div style={{position: 'absolute', left: 50, top: 30, fontFamily: LM, fontWeight: 700, fontSize: 40, color: V.MUTED, letterSpacing: 3}}>U.S. GRID · LAST YEAR</div>
            <div style={{position: 'absolute', left: 50, top: 100, fontFamily: LM, fontWeight: 700, fontSize: 130, color: V.INK}}>
              {s > t('four', 8) ? milhar(conta(s, t('four', 8), 1.0, 0, 4400)) : '?'}<span style={{fontSize: 60}}> TWh</span>
            </div>
          </Cartao>
          <Sobe s={s} t={t('works', 8)} x={1210} y={520} size={46} ancora="esquerda" cor={V.INK}>÷ 8,760 hours  =</Sobe>
          <Bate s={s} t={t('five', 8)} x={1500} y={200} size={120} cor={V.C1}>500 GW</Bate>
          <Rotulo s={s} t={t('moment', 8)} x={1500} y={330} fundo={V.INK} cor={V.SHEET} size={42} rot={2}>EVERY MOMENT</Rotulo>
        </AbsoluteFill>}

        {/* ---------- falas 9 e 10: a bateria de 5 segundos e a janela ---------- */}
        {tela(s, 9, 10) && <AbsoluteFill>
          {(() => {
            const t5 = t('five', 9);
            const nivel = s < t5 ? 1 : 1 - clamp01((s - t5) / 5);
            const restam = Math.max(0, Math.ceil(5 - (s - t5)));
            const pB = pop(s, ini(9) - 0.1);
            const sobe = prog(s, t('cushion', 10) - 0.3, 0.6);
            const caiu = t('free', 10);
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <g opacity={clamp01(pB * 2)} transform={`translate(0 ${-sobe * 260}) translate(960 520) scale(${lerp(1, 0.6, sobe)}) translate(-960 -520)`}>
                  <Bateria x={460} y={340} w={940} h={360} nivel={nivel} />
                  <Rotor x={620} y={520} r={110} ang={s * 200 * nivel} cor="#4A4540" marca={VE.LUZ} op={0.9} />
                </g>
                {/* janela de 5 s */}
                {sobe > 0 && (() => {
                  const x0 = 280, x1 = 1640, y = 700;
                  const pj = prog(s, t('cushion', 10), 0.6);
                  return <g opacity={pj}>
                    <path d={rasgoRet(x0, y - 70, (x1 - x0) * pj, 140, 71, 6)} fill={V.GOLD} opacity={0.35} />
                    <line x1={x0} y1={y - 90} x2={x0} y2={y + 90} stroke={V.INK} strokeWidth={8} />
                    <line x1={x1} y1={y - 90} x2={x1} y2={y + 90} stroke={V.INK} strokeWidth={8} opacity={pj > 0.9 ? 1 : 0} />
                    {[0, 1, 2, 3, 4, 5].map((k) => <text key={k} x={lerp(x0, x1, k / 5)} y={y + 140} fontFamily={LM} fontSize={40} fill={V.INK} textAnchor="middle">{k} s</text>)}
                    <g opacity={prog(s, t('broken', 10), 0.3)}>
                      <Usina x={x0 + 120} y={y + 50} k={0.6} s={s} ligada={0} seed={80} />
                      <path d={`M ${x0 + 70} ${y - 80} L ${x0 + 170} ${y + 30} M ${x0 + 170} ${y - 80} L ${x0 + 70} ${y + 30}`} stroke={V.C1} strokeWidth={14} strokeLinecap="round" />
                    </g>
                    <g opacity={prog(s, caiu, 0.3)}>
                      <Medidor cx={x1 - 180} cy={y + 40} r={110} f={lerp(60, 57.2, prog(s, caiu, 2.2))} tinta={V.INK} />
                    </g>
                  </g>;
                })()}
              </svg>
              <Rotulo s={s} t={t('stores', 9)} ate={t5 - 0.1} x={960} y={250} fundo={V.INK} cor={V.SHEET} size={50} rot={-2}>ALL THE SPINNING METAL IN THE U.S.</Rotulo>
              {s >= t5 && s < t5 + 5.2 && s < t('cushion', 10) - 0.3 && <div style={{position: 'absolute', left: 960, top: 240, transform: 'translate(-50%, -50%)',
                fontFamily: LM, fontWeight: 700, fontSize: 210, color: restam <= 2 ? V.C1 : V.INK}}>{restam}</div>}
              <Bate s={s} t={ini(10)} ate={t('cushion', 10) - 0.3} x={960} y={860} size={140} cor={V.C1} som={false}>5 SECONDS</Bate>
              <Rotulo s={s} t={t('cushion', 10)} x={960} y={530} fundo={V.GOLD} cor={V.SHEET} size={50} rot={-2}>THE WHOLE CUSHION</Rotulo>
              <Rotulo s={s} t={t('react', 10)} x={960} y={940} fundo={V.INK} cor={V.SHEET} size={44} rot={1.5}>EVERYTHING ELSE MUST REACT IN HERE</Rotulo>
            </>;
          })()}
        </AbsoluteFill>}
      </Camera>
      <Vinheta forca={0.35} cor="60,40,20" />
      <Grao forca={0.06} />
      <Som nome="baque" t={t('tear', 5)} volume={0.5} />
      {[0, 1, 2, 3, 4].map((k) => <Som key={k} nome="tique" t={t('five', 9) + k} volume={0.35} />)}
    </AbsoluteFill>
  );
};
