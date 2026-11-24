// V01 | Gancho. Noite com 50 milhões de luzes; a árvore encosta no fio; o apagão corre em onda por 7 s.
// Texas: o ponteiro despenca, o interruptor desliga, o relógio cai de 9:00 até 4:37.
// O mundo: o globo gira e apaga, "NOT A HACKER" carimbado, clarão dourado do Sol e corte seco para preto.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes} from '../kit/componentes';
import {Camera, Flash, Estouro, Particulas, LinhasVelocidade, useAcao, Impacto} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {ArvoreColagem} from './pecas';
import {VE, W, H, Grao, Vinheta, FundoNoite, Bate, Sobe, Rotulo, Som, Torre, pontaTorre, Cabo, Arvore, useLuzes, Luzes,
  Medidor, Globo, Interruptor, conta, milhar, vida} from './apagao';

export const V01_Gancho: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const f2 = inicioFala(props, 2), f3 = inicioFala(props, 3);
  const tTree = t('tree', 1), tSeven = t('seven', 1), tFifty = t('fifty', 1);
  const tPurpose = t('purpose', 2), tFour = t('four', 2), tTexas = t('texas', 2);
  const tEntire = t('entire', 3), tHacker = t('hacker', 3), tBefore = t('before', 3);
  const fimOnda = tFifty + 0.2;

  const impactos: Impacto[] = [
    {t: tTree + 0.05, forca: 0.75, congela: 0, som: 'estrondo', volume: 0.5},
    {t: tSeven, forca: 0.35, congela: 0, flash: false},
    {t: tSeven + 1.0, forca: 0.3, congela: 0, flash: false},
    {t: tFifty, forca: 0.6, congela: 0, flash: false},
    {t: f2 + 0.05, forca: 0.5, congela: 0, som: 'whoosh', flash: false},
    {t: tTexas + 0.6, forca: 0.45, congela: 0, flash: false},
    {t: tPurpose + 0.1, forca: 0.7, congela: 0, som: 'clique', volume: 0.7},
    {t: tFour + 1.0, forca: 0.6, congela: 0, som: 'soco', flash: false},
    {t: f3 + 0.05, forca: 0.4, congela: 0, som: 'whoosh', flash: false},
    {t: tEntire + 0.2, forca: 0.35, congela: 0, flash: false},
    {t: tHacker, forca: 0.7, congela: 0, som: 'carimbo', volume: 0.7},
    {t: tBefore + 0.1, forca: 0.9, congela: 0, som: 'estrondo', volume: 0.6},
  ];
  const {s, imp} = useAcao(impactos);

  // ---------------- tela 1: noite
  const luzes = useLuzes([[700, 330, 1.2], [1050, 200, 0.9], [1380, 330, 1.1], [1700, 220, 0.8], [900, 620, 1.0],
    [1280, 700, 1.3], [1650, 640, 0.9], [560, 820, 0.7], [1500, 930, 0.8], [1850, 470, 0.6], [380, 470, 0.5]], 150, 5);
  const ligada = (l: {x: number}) => 1 - prog(s, tSeven + ((l.x - 250) / 1700) * (fimOnda - tSeven - 0.3), 0.25);
  const seg = Math.min(7, Math.max(0, (s - tSeven) / Math.max(0.5, fimOnda - tSeven) * 7));
  const v1 = s < f2 - 0.15 ? 1 : 0;
  const flecha = lerp(70, 210, prog(s, tTree - 0.25, 0.3));
  const [ax, ay] = pontaTorre(170, 1010, 330, 1), [bx, by] = pontaTorre(640, 1010, 330, -1);
  const zoom1 = lerp(1.0, 1.08, prog(s, 0, Math.max(1, f2), (x) => x));
  const ida = prog(s, tTree - 0.3, 0.5) * (1 - prog(s, tSeven - 0.2, 0.6));
  const foco1: [number, number] = [lerp(960, 480, ida), lerp(540, 760, ida)];

  // ---------------- tela 2: Texas
  const v2 = s >= f2 - 0.15 && s < f3 - 0.15 ? 1 : 0;
  const entra2 = 1 - prog(s, f2 - 0.15, 0.35);
  const freq = lerp(60.0, 59.3, prog(s, tTexas + 0.1, 0.9, (x) => x * x)) + 0.03 * Math.sin(s * 40) * prog(s, tTexas + 0.3, 0.2) * sai(s, tTexas + 1.3, 0.5);
  const lig = 1 - prog(s, tPurpose, 0.12);
  const relogio = Math.round(lerp(540, 277, prog(s, tFour - 0.1, 1.1, (x) => 1 - Math.pow(1 - x, 3))));
  const mmss = `${Math.floor(relogio / 60)}:${String(relogio % 60).padStart(2, '0')}`;
  const pulso = 0.5 + 0.5 * Math.sin(s * 7);

  // ---------------- tela 3: o mundo
  const v3 = s >= f3 - 0.15 ? 1 : 0;
  const giro = -60 + (s - f3) * 28;
  const varre = (lon: number) => 1 - prog(s, tEntire + ((lon + 180) / 360) * 1.3, 0.3);
  const rGlobo = lerp(120, 330, pop(s, f3 - 0.1, 0.7));
  const sol = prog(s, tBefore - 0.05, 0.55, (x) => 1 - Math.pow(1 - x, 3));
  const preto = prog(s, props.duracao - 0.18, 0.12);

  return (
    <AbsoluteFill style={{background: VE.BG, overflow: 'hidden'}}>
      <Camera s={s} imp={imp} zoom={v1 ? zoom1 * (1 + 0.35 * ida) : 1} foco={v1 ? foco1 : undefined}>
        <FundoNoite />
        {/* ---- tela 1 ---- */}
        {v1 > 0 && <AbsoluteFill>
          <Luzes luzes={luzes} s={s} ligada={ligada} />
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <Torre x={170} y={1010} h={330} cor={VE.INK} />
            <Torre x={640} y={1010} h={330} cor={VE.INK} />
            <Cabo a={[ax, ay]} b={[bx, by]} flecha={flecha} cor={s > tTree ? VE.C1 : VE.MUTED} w={6} />
            <ArvoreColagem x={405} y={1040} h={300} balanco={Math.sin(s * 1.3) * 1.5} queimada={0.35 + 0.4 * prog(s, tTree, 0.5)} seed={5} />
          </svg>
          <Particulas a={s} t={tTree + 0.05} x={405} y={800} n={26} ang={-90} abertura={220} vel={900} cores={[VE.LUZ, VE.C1, '#FFF1D0']} tamanho={14} />
          <Estouro s={s} t={tTree + 0.05} x={405} y={790} forca={0.7} cor="#FFF1D0" cor2={VE.C1} />
        </AbsoluteFill>}
        {/* ---- tela 2 ---- */}
        {v2 > 0 && <AbsoluteFill style={{transform: `translateX(${entra2 * 1400}px)`}}>
          <AbsoluteFill style={{background: `radial-gradient(ellipse at 35% 55%, rgba(201,105,75,${0.08 + 0.14 * pulso * prog(s, tTexas + 0.6, 0.4)}) 0%, rgba(0,0,0,0) 60%)`}} />
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <Medidor cx={640} cy={720} r={360} f={freq} />
            <Interruptor x={1230} y={520} h={240} ligado={lig} />
          </svg>
        </AbsoluteFill>}
        {/* ---- tela 3 ---- */}
        {v3 > 0 && <AbsoluteFill>
          <Globo cx={lerp(960, 760, prog(s, tHacker - 0.2, 0.6))} cy={540} r={rGlobo} giro={giro}
            apaga={(lat, lon) => varre(lon)} n={1100} borda={sol > 0.2 ? VE.GOLD : VE.MUTED} />
          <AbsoluteFill style={{background: `radial-gradient(circle at ${lerp(2500, 1980, sol)}px 540px, rgba(240,200,120,${0.95 * sol}) 0px, rgba(210,180,126,${0.55 * sol}) 260px, rgba(210,180,126,0) ${lerp(300, 900, sol)}px)`}} />
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <circle cx={lerp(2500, 2080, sol)} cy={540} r={330} fill="#E8C27A" opacity={sol} />
          </svg>
        </AbsoluteFill>}
      </Camera>

      {/* textos fora da câmera (não tremem demais) */}
      {v1 > 0 && <>
        {s > tSeven - 0.05 && <div style={{position: 'absolute', left: 960, top: 70, transform: `translateX(-50%) scale(${lerp(1.6, 1, pop(s, tSeven, 0.3))})`,
          fontFamily: LM, fontWeight: 700, fontSize: 150, color: VE.C1, opacity: prog(s, tSeven - 0.05, 0.15)}}>{seg.toFixed(1)} s</div>}
        <Som nome="tique" t={tSeven} volume={0.3} />
        <Bate s={s} t={tFifty} x={1300} y={470} size={150} cor={VE.INK}>{milhar(conta(s, tFifty, 0.6, 0, 50000000))}</Bate>
        <Rotulo s={s} t={tFifty + 0.45} x={1300} y={620} fundo={VE.C1} cor={'#F6F1E6'} size={60} rot={-3}>IN THE DARK</Rotulo>
      </>}
      {v2 > 0 && <>
        <Rotulo s={s} t={f2 + 0.15} x={150} y={150} ancora="esquerda" fundo={V.SHEET} cor={V.INK} size={46} rot={-2} som={false}>TEXAS · FEB 2021</Rotulo>
        <Bate s={s} t={tFour - 0.1} x={1600} y={500} size={180} cor={VE.GOLD} som={false}>{mmss}</Bate>
        {[0, 0.15, 0.3, 0.45, 0.6, 0.75].map((d) => <Som key={d} nome="tique" t={tFour - 0.1 + d} volume={0.35} />)}
        <Sobe s={s} t={tFour + 1.0} x={1600} y={630} size={44} ancora="centro" cor={VE.INK}>from losing everything</Sobe>
        <Sobe s={s} t={tPurpose + 0.1} x={1230} y={665} size={40} ancora="centro" cor={VE.C2}>on purpose</Sobe>
      </>}
      {v3 > 0 && <>
        <Rotulo s={s} t={tHacker} x={1380} y={300} fundo={V.SHEET} cor={V.INK} size={88} rot={-6} seed={9} som={false}>NOT A HACKER</Rotulo>
        {s > tHacker && <div style={{position: 'absolute', left: 1080, top: 300, width: 600, height: 10, background: VE.C1,
          transform: `scaleX(${prog(s, tHacker + 0.25, 0.2)}) rotate(-6deg)`, transformOrigin: 'left center', opacity: 0}} />}
      </>}
      {v2 > 0 && <LinhasVelocidade x={1700} y={540} altura={900} lado={-1} intensidade={entra2} s={s} cor="rgba(236,229,214,0.6)" />}
      {v3 > 0 && <LinhasVelocidade x={1700} y={540} altura={900} lado={-1} intensidade={1 - prog(s, f3 - 0.15, 0.35)} s={s} cor="rgba(236,229,214,0.6)" />}
      <Flash s={s} imp={imp} cor="#FFF1D0" />
      <Vinheta forca={0.6} />
      <Grao forca={0.07} />
      <AbsoluteFill style={{background: '#000', opacity: preto}} />
    </AbsoluteFill>
  );
};
