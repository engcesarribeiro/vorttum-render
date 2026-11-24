// V02 | 14 de agosto de 2003, em papel envelhecido com colagem: termômetro e ares-condicionados, a sala de controle
// com os alarmes congelados, a linha que cede na árvore, a cascata de 7 s, os números e o mapa que apaga.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes, Boneco} from '../kit/componentes';
import {estilo} from '../kit/estilos';
import {Camera, Estouro, Particulas, useAcao, Impacto} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {ArvoreColagem, respiro} from './pecas';
import {W, H, Grao, Vinheta, FundoPapel, Bate, Sobe, Rotulo, Cartao, Som, Torre, pontaTorre, Cabo, Arvore, conta, milhar, vida} from './apagao';

const Ventilador: React.FC<{x: number; y: number; s: number; p: number}> = ({x, y, s, p}) => (
  <g opacity={Math.min(1, p)} transform={`translate(${x} ${y}) scale(${p * 1.9})`}>
    <rect x={-70} y={-55} width={140} height={110} rx={10} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
    {[...Array(6)].map((_, i) => <line key={i} x1={-55} y1={-38 + i * 15} x2={-10} y2={-38 + i * 15} stroke={V.MUTED} strokeWidth={3} />)}
    <g transform={`translate(30 0) rotate(${s * 900})`}>
      {[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={-17} rx={9} ry={18} fill={V.C2} transform={`rotate(${a})`} />)}
      <circle r={6} fill={V.INK} />
    </g>
  </g>
);

export const V02_Arvore: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const e = estilo('recorte');
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const tela = (s: number, a: number, b: number) => s >= ini(a) - 0.25 && s < fim(b) + 0.05;

  const imp: Impacto[] = [
    {t: t('august', 1), forca: 0.35, congela: 0, som: 'carimbo', flash: false},
    {t: t('stopped', 2), forca: 0.4, congela: 0, flash: false},
    {t: t('tree', 4) + 0.05, forca: 0.7, congela: 0, som: 'estrondo', volume: 0.45},
    {t: t('seven', 6), forca: 0.8, congela: 0, som: 'estrondo', volume: 0.5},
    {t: t('five', 7), forca: 0.3, congela: 0, flash: false},
    {t: t('fifty', 8), forca: 0.45, congela: 0, flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const z = lerp(1, 1.06, (s % 12) / 12);

  // tela 1-3: escritório
  const temp = lerp(72, 91, prog(s, t('hot', 1), 1.6));
  const travado = s > t('stopped', 2);
  const rolagem = travado ? t('stopped', 2) : s;

  // tela 4-5: paisagem
  const [a1, b1] = [pontaTorre(320, 900, 360, 1), pontaTorre(960, 900, 360, -1)];
  const [a2, b2] = [pontaTorre(960, 900, 360, 1), pontaTorre(1600, 900, 360, -1)];
  const sag1 = lerp(60, 230, prog(s, t('sags', 4) - 0.2, 0.9));
  const quente1 = prog(s, t('heats', 4), 0.6);
  const morta = prog(s, t('shuts', 5), 0.3);
  const quente2 = prog(s, t('overheat', 5), 0.6);
  const sag2 = lerp(60, 220, prog(s, t('sagging', 5), 0.9));
  const fluxo = (s * 1.4) % 1;

  // tela 6: linha do tempo
  const hora = prog(s, t('hour', 6) - 0.2, Math.max(0.8, t('seven', 6) - t('hour', 6) - 0.2), (x) => x);
  const estouro = prog(s, t('seven', 6), 0.35);

  // tela 8: mapa
  const estados = [
    {n: 'MI', x: 700, y: 290, w: 190, h: 200}, {n: 'OH', x: 760, y: 520, w: 170, h: 170}, {n: 'PA', x: 960, y: 470, w: 230, h: 140},
    {n: 'NY', x: 1050, y: 290, w: 240, h: 170}, {n: 'NJ', x: 1210, y: 480, w: 70, h: 120}, {n: 'CT', x: 1300, y: 410, w: 80, h: 60},
    {n: 'VT', x: 1300, y: 230, w: 70, h: 120}, {n: 'MA', x: 1390, y: 360, w: 140, h: 60}, {n: 'ON', x: 600, y: 120, w: 560, h: 140},
  ];
  const tf = t('fifty', 8);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={respiro(s).zoom} foco={respiro(s).foco}>
        <FundoPapel deriva={(s % 20) / 20} />
        {/* ---------- falas 1 a 3: o escritório ---------- */}
        {tela(s, 1, 3) && <AbsoluteFill>
          <Bate s={s} t={t('august', 1)} x={170} y={160} size={92} ancora="esquerda" cor={V.INK} som={false} rot={-2}>August 14, 2003</Bate>
          <Rotulo s={s} t={t('ohio', 1)} ate={fim(1)} x={180} y={290} ancora="esquerda" fundo={V.C1} size={48}>OHIO · 3:05 P.M.</Rotulo>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {/* termômetro */}
            <g opacity={vida(s, t('hot', 1), fim(1))}>
              <rect x={1640} y={170} width={56} height={430} rx={28} fill={V.SHEET} stroke={V.INK} strokeWidth={5} />
              <circle cx={1668} cy={620} r={50} fill={V.C1} stroke={V.INK} strokeWidth={5} />
              <rect x={1652} y={600 - (temp - 60) * 11} width={32} height={(temp - 60) * 11} fill={V.C1} />
              <text x={1600} y={190 + (91 - temp) * 11} fontFamily={LM} fontWeight={700} fontSize={54} fill={V.INK} textAnchor="end">{Math.round(temp)}°F</text>
            </g>
            <g opacity={sai(s, fim(1), 0.3)} transform={`translate(1250 ${560}) rotate(${s * 8})`}>
              <circle r={150} fill={V.GOLD} opacity={0.85} />
              {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={-175} x2={0} y2={-235} stroke={V.GOLD} strokeWidth={14} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
            </g>
            {[0, 1, 2].map((k) => <Ventilador key={k} x={420 + k * 330} y={720 + (k % 2) * 60} s={s}
              p={pop(s, t('conditioners', 1) + k * 0.18) * sai(s, fim(1), 0.3)} />)}
          </svg>
          {/* sala de controle */}
          <Cartao s={s} t={t('control', 2)} x={160} y={380} w={900} h={560} fundo={V.SHEET} rot={-1.5} seed={7}>
            <div style={{position: 'absolute', left: 60, top: 50, width: 780, height: 300, background: '#22201E', overflow: 'hidden', border: `6px solid ${V.INK}`}}>
              {[...Array(14)].map((_, i) => {
                const y = ((i * 46 - rolagem * 140) % 644 + 644) % 644 - 40;
                return <div key={i} style={{position: 'absolute', left: 24, top: y, fontFamily: 'JetBrains Mono', fontSize: 26,
                  color: travado ? '#8A8278' : '#C9D8A8'}}>{`ALARM ${String(1400 + i * 7).padStart(5, '0')}  LINE ${['STAR-JUNIPER', 'HANNA-JUNIPER', 'CHAMBERLIN', 'SAMMIS-STAR'][i % 4]}`}</div>;
              })}
              {travado && <svg width={780} height={300} style={{position: 'absolute', left: 0, top: 0}}>
                <line x1={20} y1={20} x2={20 + 740 * prog(s, t('stopped', 2), 0.25)} y2={20 + 260 * prog(s, t('stopped', 2), 0.25)} stroke={V.C1} strokeWidth={14} strokeLinecap="round" />
                <line x1={760} y1={20} x2={760 - 740 * prog(s, t('stopped', 2) + 0.2, 0.25)} y2={20 + 260 * prog(s, t('stopped', 2) + 0.2, 0.25)} stroke={V.C1} strokeWidth={14} strokeLinecap="round" />
              </svg>}
            </div>
            <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: LM, fontWeight: 700, fontSize: 44, color: V.INK}}>control room, near Cleveland</div>
          </Cartao>
          {tela(s, 2, 3) && <>
            <Boneco e={e} p={pop(s, t('operators', 2))} x={1240} y={940} altura={300} roupa={V.C2} expressao="serio" olhar={-1} />
            <Boneco e={e} p={pop(s, t('operators', 2) + 0.15)} x={1460} y={940} altura={320} roupa={V.GOLD} expressao="duvida" olhar={-1} />
          </>}
          {/* fala 3 */}
          <Rotulo s={s} t={t('bug', 3)} ate={fim(3)} x={1440} y={240} fundo={V.C1} size={56} rot={4} seed={11}>SOFTWARE BUG</Rotulo>
          {(() => {
            const t0 = t('minute', 3) - 0.2, p = vida(s, t0, fim(3));
            const rapido = prog(s, t0 + 0.2, 0.5), lento = prog(s, t0 + 0.2, 7.5, (x) => x);
            return p > 0 && <div style={{position: 'absolute', left: 1160, top: 380, width: 580, opacity: p, fontFamily: LM, fontSize: 38, color: V.INK}}>
              <div>screen refresh:</div>
              <div style={{marginTop: 14}}>normal · 1 to 3 s</div>
              <div style={{height: 34, background: '#E3D9C4', border: `3px solid ${V.INK}`, marginTop: 6}}><div style={{height: '100%', width: `${rapido * 100}%`, background: V.GOOD}} /></div>
              <div style={{marginTop: 18, color: V.C1, fontWeight: 700}}>that day · 59 s</div>
              <div style={{height: 34, background: '#E3D9C4', border: `3px solid ${V.INK}`, marginTop: 6}}><div style={{height: '100%', width: `${lento * 100}%`, background: V.C1}} /></div>
            </div>;
          })()}
        </AbsoluteFill>}

        {/* ---------- falas 4 e 5: a linha e a árvore ---------- */}
        {tela(s, 4, 5) && <AbsoluteFill style={{transform: `translateX(${(1 - prog(s, ini(4) - 0.25, 0.4)) * 1500}px)`}}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <path d={`M 0 ${H - 120} Q 480 ${H - 190} 960 ${H - 140} T 1920 ${H - 150} L 1920 ${H} L 0 ${H} Z`} fill="#C2B27E" />
            <Torre x={320} y={900} h={360} cor={V.INK} />
            <Torre x={960} y={900} h={360} cor={V.INK} />
            <Torre x={1600} y={900} h={360} cor={V.INK} />
            <Cabo a={a1} b={b1} flecha={sag1} cor={morta > 0.5 ? V.MUTED : quente1 > 0.3 ? V.C1 : V.INK} w={quente1 > 0.3 && morta < 0.5 ? 9 : 6} op={1 - 0.5 * morta} />
            <Cabo a={a2} b={b2} flecha={sag2} cor={quente2 > 0.3 ? V.C1 : V.INK} w={quente2 > 0.3 ? 9 : 6} />
            {/* energia correndo no cabo (pontinhos) */}
            {[...Array(8)].map((_, i) => {
              const u = (i / 8 + fluxo) % 1;
              const naPrimeira = morta < 0.5;
              const [p0, p1, fl] = naPrimeira ? [a1, b1, sag1] : [a2, b2, sag2];
              const x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u) + fl * 2 * 2 * u * (1 - u);
              return <circle key={i} cx={x} cy={y} r={9} fill={V.GOLD} opacity={s > t('line', 4) ? 0.9 : 0} />;
            })}
            <ArvoreColagem x={640} y={1000} h={330} balanco={Math.sin(s * 1.6) * 2} queimada={0.5 * prog(s, t('tree', 4), 0.6)} seed={3} />
            <ArvoreColagem x={1280} y={1000} h={300} balanco={Math.sin(s * 1.4 + 1) * 2} queimada={0.5 * prog(s, t('trees', 5), 0.6)} seed={8} />
          </svg>
          <Estouro s={s} t={t('tree', 4) + 0.05} x={640} y={720} forca={0.8} cor="#FFF1D0" cor2={V.C1} />
          <Particulas a={s} t={t('tree', 4) + 0.05} x={640} y={720} n={22} cores={[V.GOLD, V.C1]} />
          <Estouro s={s} t={t('trees', 5) + 0.05} x={1280} y={740} forca={0.6} cor="#FFF1D0" cor2={V.C1} semente={4} />
          <Rotulo s={s} t={t('nobody', 4)} ate={fim(4)} x={640} y={260} fundo={V.SHEET} cor={V.INK} size={48} rot={-3}>A TREE NOBODY TRIMMED</Rotulo>
          <Rotulo s={s} t={t('jumps', 5)} ate={fim(5)} x={1280} y={260} fundo={V.GOLD} cor={V.SHEET} size={48} rot={3}>THE POWER JUMPS</Rotulo>
        </AbsoluteFill>}

        {/* ---------- fala 6: uma hora, depois 7 segundos ---------- */}
        {tela(s, 6, 6) && <AbsoluteFill>
          <Sobe s={s} t={ini(6)} x={960} y={250} size={56} ancora="centro" cor={V.INK}>3:05 p.m.  →  4:10 p.m.</Sobe>
          <div style={{position: 'absolute', left: 220, top: 420, width: 1480, height: 70, border: `5px solid ${V.INK}`, background: '#E3D9C4'}}>
            <div style={{height: '100%', width: `${hora * 96}%`, background: V.GOLD}} />
            <div style={{position: 'absolute', right: 0, top: -10, height: 90, width: `${4 * estouro}%`, background: V.C1}} />
          </div>
          <Sobe s={s} t={t('hour', 6)} x={220} y={520} size={44} cor={V.MUTED}>about an hour, slowly</Sobe>
          <Bate s={s} t={t('seven', 6)} x={1200} y={720} size={150} cor={V.C1} som={false} rot={-3}>7 SECONDS</Bate>
        </AbsoluteFill>}

        {/* ---------- fala 7: os números ---------- */}
        {tela(s, 7, 7) && <AbsoluteFill>
          <Bate s={s} t={t('five', 7)} x={360} y={420} size={200} cor={V.GOLD}>{conta(s, t('five', 7), 0.7, 0, 508)}</Bate>
          <Sobe s={s} t={t('generating', 7)} x={360} y={560} size={44} ancora="centro" cor={V.INK}>generating units</Sobe>
          <Bate s={s} t={t('two', 7)} x={960} y={420} size={200} cor={V.GOLD}>{conta(s, t('two', 7), 0.7, 0, 265)}</Bate>
          <Sobe s={s} t={t('plants', 7)} x={960} y={560} size={44} ancora="centro" cor={V.INK}>power plants</Sobe>
          {(() => {
            const t0 = t('york', 7), q = prog(s, t0 + 0.2, 1.4);
            return s > t0 - 0.1 && <div style={{position: 'absolute', left: 1400, top: 240, width: 340}}>
              <div style={{fontFamily: LM, fontWeight: 700, fontSize: 50, color: V.INK, opacity: prog(s, t0, 0.3)}}>New York</div>
              <div style={{position: 'relative', height: 420, width: 140, border: `5px solid ${V.INK}`, background: '#E3D9C4', marginTop: 12}}>
                <div style={{position: 'absolute', bottom: 0, width: '100%', height: `${100 - 80 * q}%`, background: V.GOOD}} />
              </div>
              <div style={{position: 'absolute', left: 170, top: 260, fontFamily: LM, fontWeight: 700, fontSize: 64, color: V.C1, opacity: prog(s, t0 + 0.3, 0.3)}}>−80%</div>
              <div style={{position: 'absolute', left: 170, top: 340, fontFamily: LM, fontSize: 40, color: V.INK, opacity: prog(s, t('six', 7), 0.3)}}>in 6 s</div>
            </div>;
          })()}
        </AbsoluteFill>}

        {/* ---------- fala 8: o mapa ---------- */}
        {tela(s, 8, 8) && <AbsoluteFill>
          {estados.map((q, k) => {
            const p = pop(s, ini(8) - 0.1 + k * 0.06);
            const apaga = prog(s, tf + 0.2 + k * 0.12, 0.25);
            return <div key={q.n} style={{position: 'absolute', left: q.x, top: q.y + 80, width: q.w, height: q.h, transform: `scale(${p}) rotate(${(k % 3 - 1) * 1.5}deg)`,
              background: apaga > 0.5 ? V.INK : V.GOLD, boxShadow: '7px 9px 0 rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: LM, fontWeight: 700, fontSize: 34, color: apaga > 0.5 ? V.MUTED : V.SHEET}}>{q.n}</div>;
          })}
          <Bate s={s} t={tf} x={960} y={880} size={130} cor={V.INK}>{milhar(conta(s, tf, 0.8, 0, 50000000))} people</Bate>
          <Rotulo s={s} t={t('eight', 8)} x={370} y={560} fundo={V.SHEET} cor={V.INK} size={38} rot={3}>8 STATES + ONTARIO</Rotulo>
          <Rotulo s={s} t={t('four', 8)} x={370} y={680} fundo={V.C1} size={38} rot={-3}>SOME: UP TO 4 DAYS</Rotulo>
        </AbsoluteFill>}

        {/* ---------- fala 9: a tomada ---------- */}
        {tela(s, 9, 9) && (() => {
          const zt = prog(s, t('spinning', 9) - 0.1, 1.0);
          return <AbsoluteFill>
            <div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%, -50%) scale(${lerp(1, 3.2, zt)})`, opacity: 1 - 0.9 * zt}}>
              <svg width={300} height={420}>
                <rect x={10} y={10} width={280} height={400} rx={40} fill={V.SHEET} stroke={V.INK} strokeWidth={8} />
                <rect x={95} y={120} width={22} height={70} rx={6} fill={V.INK} /><rect x={183} y={120} width={22} height={70} rx={6} fill={V.INK} />
                <circle cx={150} cy={280} r={22} fill={V.INK} />
              </svg>
            </div>
            <svg width={W} height={H} style={{position: 'absolute', opacity: zt}}>
              <g transform={`translate(960 520) rotate(${s * 360 * 0.8})`}>
                <circle r={230} fill="none" stroke={V.GOOD} strokeWidth={16} />
                {[...Array(6)].map((_, i) => <line key={i} x1={0} y1={0} x2={0} y2={-200} stroke={V.INK} strokeWidth={12} transform={`rotate(${i * 60})`} />)}
                <circle r={20} fill={V.INK} /><circle cy={-200} r={16} fill={V.GOLD} />
              </g>
            </svg>
            <Bate s={s} t={t('spare', 9)} x={1560} y={860} size={84} cor={V.C1} rot={-3}>how much time?</Bate>
          </AbsoluteFill>;
        })()}
      </Camera>
      <Vinheta forca={0.35} cor="60,40,20" />
      <Grao forca={0.06} />
      <Som nome="estrondo" t={t('seven', 6)} volume={0.45} />
    </AbsoluteFill>
  );
};
