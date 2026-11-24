// V04 | A cascata simulada, em colagem sobre kraft com o gráfico em cartão "Manim":
// as 1.000 usinas (quadradinhos) que se desligam na ordem da simulação, o relé que abre, os limiares,
// os testes de 5%, 8% e 10%, o paradoxo, e o corte de carga com as casas que apagam de propósito.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes, Boneco} from '../kit/componentes';
import {estilo} from '../kit/estilos';
import {Camera, Estouro, useAcao, Impacto, aleatorio} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {W, H, Grao, Vinheta, FundoKraft, Bate, Sobe, Rotulo, Cartao, Som, Medidor, Interruptor, conta, milhar, vida, VE} from './apagao';
import {Usina, Casa, ArvoreColagem, GraficoManim, Carimbo, respiro, clamp01, rasgoRet, SOMBRA, fEm} from './pecas';
import G from './graficos.json';

type Caso = {t: number[]; f: number[]; desliga: (number | null)[]; colapso: number | null};
const C = G.casos as unknown as Record<string, Caso>;

/** Grade de usinas. estado(i): 0 acesa, 1 desligada (relé), 2 removida. */
const Grade: React.FC<{x: number; y: number; cel: number; s: number; estado: (i: number) => number; mudou: (i: number) => number; p: number}> =
  ({x, y, cel, s, estado, mudou, p}) => {
    const cols = 40;
    return (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d={rasgoRet(x - 24, y - 24, cols * cel + 48, 25 * cel + 48, 3, 10)} fill="#2C2A27" opacity={clamp01(p * 2)} style={{filter: SOMBRA}} />
        {Array.from({length: 1000}, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const pi = clamp01(p * 3 - (c / cols) * 2);
          if (pi <= 0) return null;
          const e = estado(i);
          const dt = s - mudou(i);
          const brilho = e === 1 && dt < 0.3 ? 1 - dt / 0.3 : 0;
          if (e === 2 && dt > 0.4) return null;
          const cor = e === 0 ? V.GOLD : e === 1 ? (brilho > 0 ? '#F2E2B0' : '#4A4540') : V.C1;
          const cai = e === 2 ? dt * dt * 900 : 0;
          return <rect key={i} x={x + c * cel + cel * 0.12} y={y + r * cel + cel * 0.12 + cai} width={cel * 0.76 * pi} height={cel * 0.76 * pi}
            fill={cor} opacity={e === 2 ? 1 - dt / 0.4 : 1} />;
        })}
      </svg>
    );
  };

export const V04_Cascata: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const e = estilo('recorte');
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;

  // ordem aleatória fixa para escolher as usinas removidas
  const ordem = useMemo(() => {
    const r = aleatorio(77);
    const idx = Array.from({length: 1000}, (_, i) => i);
    for (let i = 999; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const pos = new Array(1000);
    idx.forEach((v, k) => (pos[v] = k));
    return pos as number[];
  }, []);

  // relógios da simulação
  const t5 = t('five', 3), t8 = t('eight', 4), tTrip = t('trip', 5), t10 = t('ten', 6), tCorte = ini(10);
  const k8 = 3.95 / Math.max(2, tTrip - t8);
  const sim5 = (s: number) => (s - t5) * 0.9;
  const sim8 = (s: number) => (s - t8) * k8;
  const sim10 = (s: number) => (s - t10) * 1.2;
  const simC = (s: number) => (s - tCorte) * 1.3;

  const imp: Impacto[] = [
    {t: t('disconnects', 2), forca: 0.35, congela: 0, som: 'clique', flash: false},
    {t: t8 + 3.95 / k8, forca: 0.8, congela: 0, som: 'estrondo', volume: 0.45},
    {t: t('paradox', 7), forca: 0.5, congela: 0, flash: false},
    {t: t('real', 9), forca: 0.3, congela: 0, flash: false},
    {t: t('survives', 10), forca: 0.35, congela: 0, flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const r = respiro(s);

  // estado da grade em cada teste
  const teste = s < ini(4) - 0.1 ? 5 : s < t10 - 0.1 ? 8 : s < ini(8) - 0.2 ? 10 : 99;
  const pct = teste === 5 ? 50 : teste === 8 ? 80 : 100;
  const tRem = teste === 5 ? t5 : teste === 8 ? t8 : teste === 10 ? t10 : t('cuts', 8) + 99;
  const caso = teste === 8 ? C.p8 : teste === 10 ? C.p10 : null;
  const simAgora = teste === 8 ? sim8(s) : teste === 10 ? sim10(s) : 0;
  const tReal = (x: number) => (teste === 8 ? t8 + x / k8 : t10 + x / 1.2);
  const estado = (i: number) => {
    if (s >= tRem && ordem[i] < pct) return 2;
    if (caso && caso.desliga[i] !== null && simAgora >= (caso.desliga[i] as number)) return 1;
    return 0;
  };
  const mudou = (i: number) => (ordem[i] < pct && s >= tRem ? tRem + (ordem[i] / pct) * 0.5 : caso && caso.desliga[i] !== null ? tReal(caso.desliga[i] as number) : 0);
  // na fase final (corte de carga): removidas 10%, nenhuma desliga
  const estadoC = (i: number) => (ordem[i] < 100 && s >= tCorte ? 2 : 0);
  const mudouC = (i: number) => tCorte + (ordem[i] / 100) * 0.5;

  // casas (clientes): 20, uma (5%) apaga quando f < 59.3 na simulação com corte
  const fC = s > tCorte ? fEm(C.p10_corte, simC(s)) : 60;
  let tCasa = 1e9;
  for (let k = 0; k < C.p10_corte.t.length; k++) if (C.p10_corte.f[k] < 59.3) { tCasa = tCorte + C.p10_corte.t[k] / 1.3; break; }

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={r.zoom} foco={r.foco}>
        <FundoKraft />

        {/* ---------- fala 1: as 1.000 usinas ---------- */}
        {tela(s, 1, 1) && <AbsoluteFill>
          <Grade x={480} y={230} cel={24} s={s} estado={() => 0} mudou={() => 0} p={prog(s, ini(1) + 0.2, 1.4)} />
          <Rotulo s={s} t={Math.min(t('simulation', 1), ini(1) + 0.4)} x={960} y={130} fundo={V.INK} cor={V.SHEET} size={56} rot={-2}>OUR SIMULATION</Rotulo>
          <Bate s={s} t={t('thousand', 1)} x={960} y={940} size={72} cor={V.INK} som={false}>{milhar(conta(s, t('thousand', 1), 1.2, 0, 1000))} power plants</Bate>
          {s > t('connected', 1) && <svg width={W} height={H} style={{position: 'absolute'}}>
            {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={480} y1={230 + 120 * k + 60} x2={480 + 960 * prog(s, t('connected', 1) + k * 0.08, 0.6)} y2={230 + 120 * k + 60}
              stroke={V.SHEET} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />)}
          </svg>}
        </AbsoluteFill>}

        {/* ---------- fala 2: o relé e os limiares ---------- */}
        {tela(s, 2, 2) && <AbsoluteFill>
          {(() => {
            const tq = t('drops', 2), td = t('disconnects', 2);
            const aberto = s > td;
            const pR = prog(s, t('set', 2) - 0.3, 0.6);
            const rnd = aleatorio(5);
            const hist = Array.from({length: 15}, (_, i) => 0.4 + rnd() * 0.6);
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <g transform={`translate(0 ${-pR * 140}) translate(960 600) scale(${lerp(1, 0.7, pR)}) translate(-960 -600)`}>
                  <g opacity={pop(s, ini(2))}><Usina x={520} y={760} k={1.8} s={s} ligada={aberto ? 0 : 1} seed={3} /></g>
                  {/* linha usina → relé → rede */}
                  <line x1={700} y1={560} x2={880} y2={560} stroke={V.INK} strokeWidth={8} />
                  <line x1={1040} y1={560} x2={1500} y2={560} stroke={aberto ? V.MUTED : V.GOLD} strokeWidth={8} />
                  <g opacity={pop(s, t('relay', 2))}>
                    <rect x={880} y={470} width={160} height={180} fill={V.SHEET} stroke={V.INK} strokeWidth={5} style={{filter: SOMBRA}} />
                    <line x1={900} y1={560} x2={aberto ? 990 : 1020} y2={aberto ? 490 : 560} stroke={V.C1} strokeWidth={10} strokeLinecap="round" />
                    <circle cx={900} cy={560} r={10} fill={V.INK} /><circle cx={1020} cy={560} r={10} fill={V.INK} />
                  </g>
                  <g opacity={vida(s, tq - 0.3)}><Medidor cx={1500} cy={520} r={170} f={lerp(60, 58.6, prog(s, tq, 1.2))} tinta={V.INK} /></g>
                </g>
                {/* limiares dos relés: 57.5 a 58.9 Hz */}
                {pR > 0 && (() => {
                  const X = (f: number) => lerp(300, 1620, (f - 57) / 3.2);
                  return <g opacity={pR}>
                    <line x1={X(57)} y1={900} x2={X(60.2)} y2={900} stroke={V.INK} strokeWidth={6} />
                    {[57, 58, 59, 60].map((f) => <g key={f}><line x1={X(f)} y1={890} x2={X(f)} y2={920} stroke={V.INK} strokeWidth={5} />
                      <text x={X(f)} y={965} fontFamily={LM} fontSize={40} fill={V.INK} textAnchor="middle">{f} Hz</text></g>)}
                    {hist.map((h, i) => {
                      const f0 = 57.5 + (i / 15) * 1.4, ph = prog(s, t('between', 2) + i * 0.05, 0.4);
                      return <path key={i} d={rasgoRet(X(f0) + 2, 890 - h * 200 * ph, X(57.5 + 1.4 / 15) - X(57.5) - 4, h * 200 * ph, i + 3, 3)} fill={i % 2 ? V.C1 : '#C8613F'} />;
                    })}
                  </g>;
                })()}
              </svg>
              <Rotulo s={s} t={t('relay', 2)} ate={t('set', 2) - 0.3} x={960} y={360} fundo={V.C1} size={50} rot={-3}>SAFETY RELAY</Rotulo>
              <Sobe s={s} t={t('protect', 2)} ate={t('set', 2) - 0.3} x={520} y={860} size={40} ancora="centro" cor={V.INK} >protects the machine</Sobe>
              <Rotulo s={s} t={t('between', 2)} x={1350} y={620} fundo={V.SHEET} cor={V.INK} size={44} rot={2}>1,000 RELAYS · 57.5 TO 58.9 Hz</Rotulo>
            </>;
          })()}
        </AbsoluteFill>}

        {/* ---------- falas 3 a 6: os testes ---------- */}
        {tela(s, 3, 6) && <AbsoluteFill style={{opacity: prog(s, ini(3) - 0.25, 0.35)}}>
          <Grade x={140} y={300} cel={19} s={s} estado={estado} mudou={mudou} p={pop(s, ini(3) - 0.2, 0.6)} />
          <GraficoManim x={980} y={170} w={820} h={600} p={pop(s, ini(3), 0.5)} tmax={6} titulo="grid frequency"
            linhas={[{f: 58.9, cor: VE.C1, rotulo: 'relays start tripping'}]}
            curvas={[
              ...(teste === 5 ? [{t: C.p5.t, f: C.p5.f, cor: VE.GOOD, ate: sim5(s)}] : []),
              ...(teste >= 8 ? [{t: C.p8.t, f: C.p8.f, cor: VE.GOLD, ate: sim8(s)}] : []),
              ...(teste === 10 ? [{t: C.p10.t, f: C.p10.f, cor: VE.C1, ate: sim10(s)}] : []),
            ]} />
          <Rotulo s={s} t={t('first', 3)} ate={ini(4) - 0.2} x={520} y={210} fundo={V.INK} cor={V.SHEET} size={46} rot={-2}>TEST 1</Rotulo>
          <Rotulo s={s} t={t5} ate={ini(4) - 0.2} x={520} y={880} fundo={V.C1} size={64} rot={2}>–5%</Rotulo>
          <Carimbo s={s} t={t('holds', 3)} ate={ini(4) - 0.2} x={1390} y={560} cor={V.GOOD} size={76} fundo={V.SHEET}>HOLDS</Carimbo>
          <Rotulo s={s} t={ini(4)} ate={t10 - 0.2} x={520} y={210} fundo={V.INK} cor={V.SHEET} size={46} rot={2} seed={9}>TEST 2</Rotulo>
          <Rotulo s={s} t={t8} ate={t10 - 0.2} x={520} y={880} fundo={V.C1} size={64} rot={-2} seed={4}>–8%</Rotulo>
          <Rotulo s={s} t={t('gap', 5)} ate={ini(6) - 0.2} x={1390} y={810} fundo={V.SHEET} cor={V.INK} size={38} rot={-2}>BIGGER GAP</Rotulo>
          <Rotulo s={s} t={t('inertia', 5)} ate={ini(6) - 0.2} x={1390} y={865} fundo={V.C2} size={38} rot={2} seed={6}>LESS INERTIA</Rotulo>
          <Rotulo s={s} t={t('faster', 5)} ate={ini(6) - 0.2} x={1390} y={920} fundo={V.C1} size={38} rot={-1} seed={7}>FALLS FASTER</Rotulo>
          {/* cliques dos relés */}
          <Bate s={s} t={t('four', 6)} ate={t10 - 0.2} x={1390} y={890} size={110} cor={V.C1}>3.9 s</Bate>
          <Rotulo s={s} t={t10} x={520} y={210} fundo={V.INK} cor={V.SHEET} size={46} rot={-2} seed={10}>TEST 3 · –10%</Rotulo>
          <Bate s={s} t={t('half', 6)} x={1390} y={890} size={110} cor={V.C1}>2.5 s</Bate>
        </AbsoluteFill>}

        {/* ---------- fala 7: o paradoxo ---------- */}
        {tela(s, 7, 7) && <AbsoluteFill style={{opacity: prog(s, ini(7) - 0.25, 0.35)}}>
          {(() => {
            const pE = pop(s, t('safety', 7)), pP = prog(s, t('problem', 7), 0.6), pD = pop(s, t('darkness', 7));
            const pT = prog(s, t('tree', 7) - 0.3, 0.5);
            return <>
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <g opacity={1 - pT}>
                  {/* escudo */}
                  <g transform={`translate(480 560) scale(${pE})`} style={{filter: SOMBRA}}>
                    <path d="M 0 -220 L 190 -150 Q 190 90 0 220 Q -190 90 -190 -150 Z" fill={V.C2} />
                    <path d="M -80 0 L -20 60 L 100 -70" stroke={V.SHEET} strokeWidth={30} fill="none" strokeLinecap="round" />
                  </g>
                  <path d={`M 720 560 L ${720 + 420 * pP} 560`} stroke={V.INK} strokeWidth={14} strokeLinecap="round" />
                  {pP > 0.95 && <path d="M 1120 520 L 1160 560 L 1120 600" stroke={V.INK} strokeWidth={14} fill="none" strokeLinecap="round" />}
                  <g transform={`translate(1440 560) scale(${pD})`}>
                    <path d={rasgoRet(-220, -220, 440, 440, 4, 12)} fill="#121318" style={{filter: SOMBRA}} />
                  </g>
                </g>
                {pT > 0 && <g opacity={pT}>
                  <ArvoreColagem x={560} y={900} h={520} balanco={Math.sin(s * 1.5) * 2} seed={7} />
                </g>}
              </svg>
              <Bate s={s} t={t('paradox', 7)} ate={t('tree', 7) - 0.3} x={960} y={160} size={140} cor={V.C1}>THE PARADOX</Bate>
              <Sobe s={s} t={t('safety', 7)} ate={t('tree', 7) - 0.3} x={480} y={830} size={44} ancora="centro" cor={V.INK}>the safety system</Sobe>
              <Sobe s={s} t={t('darkness', 7)} ate={t('tree', 7) - 0.3} x={1440} y={830} size={44} ancora="centro" cor={V.INK}>total darkness</Sobe>
              <Estouro s={s} t={t('tree', 7) + 0.1} x={600} y={560} forca={0.7} cor="#FFF1D0" cor2={V.C1} />
              <Bate s={s} t={t('fifty', 7)} x={1300} y={420} size={130} cor={V.INK}>50 million</Bate>
              <Bate s={s} t={t('seven', 7)} x={1300} y={620} size={130} cor={V.C1}>7 seconds</Bate>
            </>;
          })()}
        </AbsoluteFill>}

        {/* ---------- falas 8 a 10: o corte de carga ---------- */}
        {tela(s, 8, 10) && <AbsoluteFill style={{opacity: prog(s, ini(8) - 0.25, 0.35)}}>
          <Grade x={140} y={240} cel={19} s={s} estado={estadoC} mudou={mudouC} p={pop(s, ini(8) - 0.2, 0.6)} />
          <GraficoManim x={980} y={170} w={820} h={540} p={pop(s, ini(8), 0.5)} tmax={6} titulo="10% lost, with load shedding"
            linhas={s > t('below', 8) ? [{f: 59.3, cor: VE.GOLD, rotulo: '59.3 Hz: cut 5% of customers'}] : []}
            curvas={s > tCorte ? [{t: C.p10_corte.t, f: C.p10_corte.f, cor: VE.GOOD, ate: simC(s)}] : []} />
          {/* 20 casas = os clientes */}
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {Array.from({length: 20}, (_, i) => {
              const p = pop(s, t('customers', 8) - 0.3 + i * 0.04);
              const apagada = i === 7 && s > tCasa;
              const marca = i === 7 && s > t('cuts', 8) && s < tCorte;
              return <g key={i} opacity={clamp01(p * 2)}>
                <Casa x={200 + i * 80} y={985} k={0.85} luz={apagada ? 0 : 1} seed={i + 50}
                  cor={['#A2674A', '#5F8466', '#82648F', '#C29A55'][i % 4]} />
                {marca && <circle cx={200 + i * 80} cy={950} r={70} fill="none" stroke={V.C1} strokeWidth={6} strokeDasharray="10 8" />}
              </g>;
            })}
          </svg>
          <Rotulo s={s} t={t('change', 8)} ate={ini(9) - 0.2} x={520} y={170} fundo={V.GOOD} size={46} rot={-2}>ONE CHANGE</Rotulo>
          <Rotulo s={s} t={t('cuts', 8)} ate={ini(9) - 0.2} x={1390} y={790} fundo={V.C1} size={42} rot={2}>CUT 5% OF CUSTOMERS</Rotulo>
          {/* fala 9: o documento real */}
          <Cartao s={s} t={t('real', 9) - 0.3} ate={ini(10) - 0.2} x={120} y={230} w={820} h={500} fundo="#F1EADB" rot={-2} seed={13}>
            <svg width={820} height={500}>
              <text x={60} y={90} fontFamily="JetBrains Mono" fontSize={30} fill={V.MUTED}>GRID PROTECTION · FIELD EQUIPMENT</text>
              <rect x={60} y={140} width={260} height={300} fill="#D8D2C4" stroke={V.INK} strokeWidth={5} />
              <circle cx={190} cy={230} r={60} fill="none" stroke={V.INK} strokeWidth={5} />
              <line x1={190} y1={230} x2={225} y2={200} stroke={V.C1} strokeWidth={6} />
              {[0, 1, 2].map((k) => <rect key={k} x={100 + k * 70} y={330} width={40} height={60} fill={k === 1 ? V.GOOD : V.INK} />)}
              <text x={350} y={230} fontFamily={LM} fontWeight={700} fontSize={40} fill={V.INK}>UNDER-FREQUENCY</text>
              <text x={350} y={300} fontFamily={LM} fontWeight={700} fontSize={40} fill={V.C1}>LOAD SHEDDING</text>
              <text x={350} y={370} fontFamily="JetBrains Mono" fontSize={30} fill={V.INK}>installed · waiting</text>
            </svg>
          </Cartao>
          <Carimbo s={s} t={t('real', 9)} ate={ini(10) - 0.2} x={760} y={820} cor={V.C1} size={70}>REAL</Carimbo>
          {/* fala 10 */}
          <Carimbo s={s} t={t('survives', 10)} x={1390} y={560} cor={V.GOOD} size={76} rot={-6} fundo={V.SHEET}>SURVIVES</Carimbo>
          {s > t('people', 10) - 0.2 && <Boneco e={e} p={pop(s, t('people', 10) - 0.2)} x={760} y={880} altura={180} roupa={V.C2} expressao="duvida" olhar={1} />}
          <Rotulo s={s} t={t('purpose', 10)} x={760} y={660} fundo={V.INK} cor={V.SHEET} size={46} rot={-3}>DARK ON PURPOSE</Rotulo>
          <Sobe s={s} t={tCorte + 0.4} x={1390} y={660} size={40} ancora="centro" cor={V.INK}>{fC.toFixed(2)} Hz</Sobe>
        </AbsoluteFill>}

        {/* ---------- fala 11: pessoas antes das máquinas ---------- */}
        {tela(s, 11, 11) && <AbsoluteFill style={{opacity: prog(s, ini(11) - 0.25, 0.35)}}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <g transform="translate(560 500)" opacity={pop(s, ini(11))}>
              <Interruptor x={0} y={0} h={300} ligado={1 - prog(s, t('people', 11), 0.25)} />
              {[-140, 0, 140].map((dx, i) => <Casa key={i} x={dx} y={360} k={1.3} luz={1 - prog(s, t('people', 11) + 0.1, 0.2)} seed={i + 90} />)}
            </g>
            <g transform="translate(1360 500)" opacity={pop(s, t('machines', 11))}>
              <Interruptor x={0} y={0} h={300} ligado={1} />
              {[-140, 0, 140].map((dx, i) => <Usina key={i} x={dx} y={360} k={0.6} s={s + i} seed={i + 95} />)}
            </g>
          </svg>
          <Rotulo s={s} t={t('people', 11)} x={560} y={230} fundo={V.C1} size={50} rot={-2}>PEOPLE: OFF FIRST</Rotulo>
          <Rotulo s={s} t={t('machines', 11)} x={1360} y={230} fundo={V.GOOD} size={50} rot={2} seed={8}>MACHINES: STAY ON</Rotulo>
          <Bate s={s} t={t('cascade', 11)} x={960} y={110} size={84} cor={V.INK} som={false}>how you stop a cascade</Bate>
        </AbsoluteFill>}
      </Camera>
      <Vinheta forca={0.3} cor="60,40,20" />
      <Grao forca={0.06} />
      <Som nome="estrondo" t={t8 + 3.95 / k8} volume={0.45} />
      {tCasa < props.duracao && <Som nome="clique" t={tCasa} volume={0.5} />}
      <Som nome="carimbo" t={t('real', 9)} volume={0.45} />
    </AbsoluteFill>
  );
};
