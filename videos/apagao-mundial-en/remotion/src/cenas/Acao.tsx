// Acao: cena-teste de personagem, física e impacto (sem narração). 9:16.
// O boneco entra correndo, freia, estranha o "1 + 1", carrega e soca o "1"; o "1" voa e derruba
// o "+" e o outro "1" (física de verdade); os três se juntam num "2" gigante, que cai, faz a onda
// de choque e derruba o boneco. Ele se levanta e comemora. Em cima: "1 + 1 = ?" vira "1 + 1 = 2".
//
// No video.py: class A01_Acao(RemotionScene): ESTILO = "documentario"; FALAS = [ACAO_DURACAO] (13.5 s)
// Tudo é escrito no tempo da AÇÃO (a); o hit-stop congela a ação e o tempo real (s) segue.
import React from 'react';
import {Props, pop, prog} from '../kit/tempo';
import {estilo} from '../kit/estilos';
import {Palco, useFontes} from '../kit/componentes';
import {Chave, MOLAS, POSES, BASE, arco, corrida, medidas, passosDaCorrida, plantado, quadrilEmPe, respira} from '../kit/personagem';
import {Personagem} from '../kit/personagem';
import {Glifo, NoCorpo, baseGlifo, corpoGlifo, simular, useSimulacao} from '../kit/fisica';
import '@fontsource/open-sans/400.css';
import {Camera, Estouro, Flash, Impacto, OndaChao, Particulas, Poeira, Som, SonsDaFisica, SonsDosImpactos, useAcao} from '../kit/impacto';
import {Easing, interpolate} from 'remotion';

const CHAO = 1440;
const ALT = 420;                       // altura do boneco
const T = 220;                         // altura dos glifos (Open Sans, como os números do texto)
const X_UM = 600, X_MAIS = 785, X_UM2 = 955;
const SOCO = 4.28;                     // momento do soco (ação)
const JUNTA = 7.3, DOIS = 8.0;         // os glifos se juntam e viram "2"
const CAI = 9.0, BATE = 9.42;          // o "2" cai e bate no chão
const X_DOIS = 760, Y_DOIS = 820;
const BRANCO = '#FFFFFF';              // números e sinais em branco
const FONTE = 'Open Sans';            // a mesma dos glifos (kit/fonteGlifos.ts)
const ALVO_SOCO: [number, number] = [X_UM - T * 0.075, CHAO - 125];   // punho encosta na haste do "1"

const IMPACTOS: Impacto[] = [
  {t: SOCO, forca: 0.9, congela: 5, inverte: true, x: X_UM - 30, y: CHAO - 120, som: 'soco'},
  {t: DOIS, forca: 0.35, congela: 2, flash: true, x: X_DOIS, y: Y_DOIS, som: 'ding', volume: 0.45},
  {t: BATE, forca: 1, congela: 6, inverte: true, x: X_DOIS, y: CHAO - 200, som: 'estrondo', volume: 0.9},
];
export const ACAO_DURACAO = 13.5;      // real (já com os congelamentos): use no FALAS do video.py

const m = medidas(ALT);
const onde = (x: number, lado = 1) => ({x, chao: CHAO, m, lado});

// ---- linha do tempo do boneco (tempo da ação)
const CORRIDA = {x0: -160, x1: 330, t0: 0, t1: 1.1, chao: CHAO, m, intensidade: 1};
const CORRE = corrida(CORRIDA);
const FREIA = 1.1;
export const CHAVES: Chave[] = [
  {t: 0, pose: CORRE},
  // freada: joga o corpo para trás, pés à frente
  {t: FREIA, mola: MOLAS.PADRAO, pose: plantado({...BASE, x: 365, y: quadrilEmPe(m, CHAO) + 55, tronco: -24, cabeca: 10,
    ombroT: 70, cotoveloT: 30, ombroF: 95, cotoveloF: 20}, m, CHAO, 75)},
  {t: 2.05, mola: MOLAS.BALANCO, pose: (s) => respira(POSES.emPe(onde(365)), s)},
  {t: 2.8, pose: (s) => respira(POSES.duvida(onde(365)), s, 0.6)},
  // antecipação: devagar e funda, para o soco parecer rápido
  {t: 3.7, d: 0.5, curva: Easing.out(Easing.cubic), pose: POSES.carrega(onde(380))},
  // o braço lidera o golpe (cascata baixa) e o punho encosta no "1" exatamente em SOCO
  {t: SOCO - 0.11, mola: MOLAS.ESTALO, sobreposicao: 0.25, pose: POSES.soco(onde(450), ALVO_SOCO)},
  // sobra: volta para a guarda balançando
  {t: SOCO + 0.32, mola: MOLAS.BALANCO, pose: POSES.guarda(onde(395))},
  {t: 5.6, pose: (s) => respira(POSES.emPe(onde(395)), s)},
  {t: 6.5, pose: (s) => respira(POSES.duvida(onde(395)), s, 0.6)},
  {t: JUNTA, mola: MOLAS.BALANCO, pose: {...POSES.susto(onde(390)), cabeca: -22}},
  {t: DOIS + 0.05, mola: MOLAS.BALANCO, pose: (s) => respira(POSES.comemora(onde(390)), s, 1.4)},
  {t: CAI + 0.05, mola: MOLAS.ESTALO, pose: {...POSES.susto(onde(380)), cabeca: -26}},
  // a onda de choque joga o boneco para trás, num arco
  {t: BATE + 0.02, mola: MOLAS.ESTALO, pose: arco(() => ({...POSES.salto(onde(330)), tronco: -50, cabeca: 20}),
    {t0: BATE, t1: BATE + 0.5, x0: 380, x1: 270, y0: quadrilEmPe(m, CHAO), y1: CHAO - 26, altura: 150})},
  {t: BATE + 0.5, mola: MOLAS.PESADO, pose: POSES.caido(onde(275))},
  {t: 10.9, mola: MOLAS.PESADO, ancora: true, pose: POSES.sentado(onde(285))},
  {t: 11.7, mola: MOLAS.PADRAO, ancora: true, pose: POSES.agachado(onde(400))},
  {t: 12.05, mola: MOLAS.BALANCO, pose: (s) => respira(POSES.comemora(onde(410)), s, 1.5)},
];

// passos da corrida: o instante em que cada pé toca o chão
const PASSOS = passosDaCorrida(CORRIDA);

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const angPerto = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));        // ângulo em (−π, π]

export const Acao: React.FC<Props> = (props) => {
  useFontes();
  const e = estilo(props.estilo);
  const c = e.cor;
  const {s, a, fps, imp, real} = useAcao(IMPACTOS);

  const sim = useSimulacao(() => simular({
    duracao: 13, fps, gravidade: 2.4,
    monta: (w) => {
      w.chao(CHAO);
      w.paredes(0, 1080, CHAO);
      corpoGlifo(w, 'um', '1', X_UM, CHAO - baseGlifo('1', T), T, {isStatic: true});
      corpoGlifo(w, 'mais', '+', X_MAIS, CHAO - baseGlifo('+', T), T);
      corpoGlifo(w, 'um2', '1', X_UM2, CHAO - baseGlifo('1', T), T);
    },
    acoes: [{quadro: Math.round(SOCO * fps), corpo: 'um', estatico: false, vel: {x: 24, y: -15}, giro: 0.22}],
  }));

  // os glifos: física até JUNTA, depois voam para o centro do "2" e somem
  const uJunta = interpolate(a, [JUNTA, DOIS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const glifos = ([['um', '1', BRANCO], ['mais', '+', BRANCO], ['um2', '1', BRANCO]] as const).map(([l, g, cor]) => {
    if (uJunta >= 1) return null;
    const f = sim.em(l, a);
    const x = lerp(f.x, X_DOIS, uJunta), y = lerp(f.y, Y_DOIS, uJunta);
    const ang = lerp(angPerto(f.ang), 0, uJunta);
    const esc = 1 - uJunta * 0.6;
    return (
      <g key={l} transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI}) scale(${esc}) translate(${-sim.desvios[l].x} ${-sim.desvios[l].y})`}>
        <Glifo g={g} t={T} cor={cor} brilho={uJunta * 1.5} />
      </g>
    );
  });

  // o "2": aparece em DOIS, flutua, cai em CAI (acelerando) e bate em BATE (achata e volta)
  const pDois = pop(a, DOIS, 0.45);
  const queda = interpolate(a, [CAI, BATE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const altDois = 400;                                                      // altura do "2"
  const yBase = CHAO - altDois / 2;                                        // centro do "2" apoiado no chão
  const yDois = lerp(Y_DOIS + Math.sin(a * 3) * 10 * (1 - queda), yBase, queda);
  const achata = a >= BATE ? 1 - 0.28 * Math.exp(-(a - BATE) / 0.09) * Math.cos((a - BATE) * 26) : 1 + 0.12 * queda;

  // câmera: aproxima devagar na antecipação e solta depois do soco
  const zoom = 1 + 0.07 * prog(a, 3.7, 0.6) - 0.07 * prog(a, SOCO + 0.4, 0.8);
  const colisoesFortes = sim.colisoes.filter((k) => k.forca >= 7 && k.quadro / fps < JUNTA);

  return (
    <Palco e={e}>
      <Camera s={s} imp={imp} zoom={zoom} foco={[540, 1150]}>
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <rect x={-400} y={CHAO} width={1880} height={900} fill={c.PAINEL} />
          <line x1={-400} x2={1480} y1={CHAO} y2={CHAO} stroke={c.BORDA} strokeWidth={8} />
          {glifos}
          {pDois > 0 && (
            <g transform={`translate(${X_DOIS} ${yDois}) scale(${pDois / Math.sqrt(achata)} ${pDois * achata})`}>
              <g style={{filter: `drop-shadow(0 0 ${30 * (1 - queda)}px ${BRANCO})`}}><Glifo g="2" t={altDois} cor={BRANCO} /></g>
            </g>
          )}
        </svg>
        <Personagem chaves={CHAVES} s={a} fps={fps} altura={ALT} cor={c.INK} corTras={c.MUTED} chao={CHAO} rastro={4} />
        {/* soco */}
        <Estouro s={s} t={real(SOCO)} x={X_UM - 30} y={CHAO - 120} forca={0.9} cor={c.INK} cor2={c.GOLD} />
        <Particulas a={a} t={SOCO} x={X_UM - 20} y={CHAO - 120} ang={-20} abertura={90} vel={1500} n={16} cores={[BRANCO, c.MUTED, c.GOLD]} />
        {/* colisões fortes da física viram estilhaços no ponto exato */}
        {colisoesFortes.map((k, i) => (
          <Particulas key={i} a={a} t={k.quadro / fps} x={k.x} y={k.y} n={7} vel={650} vida={0.45} tamanho={11}
            cores={[c.INK, c.MUTED]} semente={i + 20} />
        ))}
        {/* freada e aterrissagens */}
        <Poeira a={a} t={FREIA} x={420} chao={CHAO} forca={0.6} />
        <Poeira a={a} t={BATE} x={X_DOIS} chao={CHAO} forca={1} semente={9} />
        <Poeira a={a} t={BATE + 0.5} x={240} chao={CHAO} forca={0.5} lado={-1} semente={11} />
        <OndaChao s={s} t={real(BATE)} x={X_DOIS} chao={CHAO} cor={BRANCO} />
        <Particulas a={a} t={BATE} x={X_DOIS} y={CHAO - 10} n={22} ang={-90} abertura={150} vel={1300} cores={[BRANCO, c.MUTED]} semente={5} />
      </Camera>
      <Flash s={s} imp={imp} />
      {/* a pergunta em cima (fora da câmera: não treme) */}
      <div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: FONTE, fontWeight: 400,
        fontSize: 130, color: BRANCO, letterSpacing: 10}}>
        1 + 1 ={' '}
        <span style={{display: 'inline-block', color: a >= BATE ? BRANCO : c.MUTED,
          transform: `scale(${a >= BATE ? pop(a, BATE + 0.15, 0.5) : 1})`}}>{a >= BATE + 0.15 ? '2' : '?'}</span>
      </div>
      {/* som: passos, golpe passando, física, impactos */}
      {PASSOS.map((t, i) => <Som key={i} nome="passo" t={real(t)} volume={0.35} />)}
      <Som nome="vupt" t={real(SOCO - 0.1)} volume={0.5} />
      <Som nome="whoosh" t={real(JUNTA)} volume={0.5} />
      <Som nome="vupt" t={real(BATE + 0.02)} volume={0.4} />
      <Som nome="baque" t={real(BATE + 0.5)} volume={0.55} />
      <Som nome="pop" t={real(BATE + 0.15)} volume={0.5} />
      <SonsDaFisica sim={sim} real={real} minimo={3} ignora={['parede']} ate={JUNTA} />
      <SonsDosImpactos imp={imp} />
    </Palco>
  );
};
