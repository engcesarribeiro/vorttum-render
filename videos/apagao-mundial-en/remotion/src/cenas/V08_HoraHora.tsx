// V08 | Hora a hora, em papel recortado: uma rua à noite (casas, torre de celular, hospital, posto) e um personagem com o celular.
// A câmera passeia até o que a fala nomeia; o relógio no canto pula de 0 s até 96 h; no fim, a partida a frio e "anos".
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Props, at, inicioFala, prog, pop, sai, lerp} from '../kit/tempo';
import {useFontes, Boneco} from '../kit/componentes';
import {estilo} from '../kit/estilos';
import {Camera, useAcao, Impacto, aleatorio} from '../kit/impacto';
import {useLatin, LM, V} from './vorttum';
import {W, H, Grao, Vinheta, Bate, Sobe, Rotulo, Cartao, Som, Torre, vida} from './apagao';

const NOITE = '#24304A', MORRO1 = '#33405A', MORRO2 = '#3F4B5E', CHAO = '#5A5248', LUZ = '#F5C463';

export const V08_HoraHora: React.FC<Props> = (props) => {
  useFontes();
  useLatin();
  const e = estilo('recorte');
  const t = (w: string, f: number, nth = 1, d = 0) => at(props, w, f, nth, d);
  const ini = (f: number) => inicioFala(props, f);
  const fim = (f: number) => (f < props.falas.length ? inicioFala(props, f + 1, -0.2) : props.duracao + 1);
  const imp: Impacto[] = [
    {t: t('out', 2), forca: 0.6, congela: 0, som: 'estrondo', volume: 0.5, flash: false},
    {t: t('kick', 3), forca: 0.35, congela: 0, som: 'clique', flash: false},
    {t: t('silent', 5), forca: 0.3, congela: 0, flash: false},
    {t: t('hospitals', 7), forca: 0.3, congela: 0, flash: false},
    {t: t('years', 9), forca: 0.6, congela: 0, som: 'estrondo', volume: 0.5, flash: false},
  ];
  const {s, imp: impR} = useAcao(imp);
  const estrelas = React.useMemo(() => { const r = aleatorio(3); return [...Array(80)].map(() => ({x: r() * W, y: r() * 420, f: r() * 9})); }, []);

  // câmera: [instante, zoom, foco x, foco y]
  const chaves: [number, number, number, number][] = [
    [0, 1.0, 960, 540], [t('zero', 2), 1.0, 960, 540], [t('hospitals', 3) - 0.3, 1.55, 1300, 600], [t('phone', 4) - 0.3, 1.6, 760, 640],
    [t('tower', 4) - 0.2, 1.45, 960, 520], [t('kitchen', 5) - 0.3, 1.5, 420, 640], [t('gas', 6) - 0.4, 1.55, 1690, 640],
    [t('hospitals', 7) - 0.3, 1.55, 1300, 600], [ini(8) - 0.2, 0.92, 960, 540],
  ];
  let k = 0;
  while (k < chaves.length - 1 && s >= chaves[k + 1][0]) k++;
  const [t0, z0, x0, y0] = chaves[k];
  const prox = chaves[Math.min(k + 1, chaves.length - 1)];
  const u = k === chaves.length - 1 ? 1 : prog(s, prox[0] - 0.01, 0.01);
  const v = prog(s, t0, 0.8);
  const anterior = chaves[Math.max(0, k - 1)];
  const zoom = lerp(anterior[1], z0, v), fx = lerp(anterior[2], x0, v), fy = lerp(anterior[3], y0, v);
  void u;

  const apagou = s > t('out', 2);
  const gerador = s > t('kick', 3);
  const bateriaTorre = s < t('two', 4) ? 1 : lerp(1, 0, prog(s, t('two', 4), Math.max(1, t('silent', 5) - t('two', 4)), (x) => x));
  const semSinal = s > t('silent', 5);
  const combustivel = s < t('hospitals', 7) ? 1 : lerp(1, 0, prog(s, t('hospitals', 7), 2.2));
  const relogio = s < t('zero', 2) ? '' : s < t('ten', 3) ? '0 s' : s < t('two', 4) ? '10 s' : s < t('four', 5) ? '2 h' :
    s < t('hour', 6) ? '4 h' : s < t('hour', 7) ? '48 h' : s < ini(8) ? '96 h' : s < ini(9) ? 'then' : 'years?';
  const trocou = [t('zero', 2), t('ten', 3), t('two', 4), t('four', 5), t('hour', 6), t('hour', 7), ini(8), ini(9)];
  const ultima = Math.max(...trocou.filter((x) => x <= s), -10);
  const batida = 1 + 0.25 * Math.exp(-(s - ultima) * 6);

  const janela = (x: number, y: number, acesa: boolean, key: number) =>
    <rect key={key} x={x} y={y} width={46} height={50} fill={acesa ? LUZ : '#24262B'} stroke="#1B1C20" strokeWidth={3} />;
  const casa = (x: number, h: number, cor: string, key: number) => (
    <g key={key} style={{filter: 'drop-shadow(8px 10px 0 rgba(0,0,0,0.3))'}}>
      <rect x={x} y={900 - h} width={180} height={h} fill={cor} />
      <polygon points={`${x - 20},${900 - h} ${x + 90},${900 - h - 90} ${x + 200},${900 - h}`} fill="#3A2E28" />
      {janela(x + 28, 900 - h + 40, !apagou, 1)}{janela(x + 106, 900 - h + 40, !apagou, 2)}
      <rect x={x + 70} y={900 - 90} width={40} height={90} fill="#2A221E" />
    </g>
  );

  return (
    <AbsoluteFill style={{background: NOITE, overflow: 'hidden'}}>
      <Camera s={s} imp={impR} zoom={zoom} foco={[fx, fy]}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <rect width={W} height={H} fill={NOITE} />
          {estrelas.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={2.2} fill="#E9E2D0" opacity={(apagou ? 0.9 : 0.35) * (0.6 + 0.4 * Math.sin(s * 2 + q.f))} />)}
          <circle cx={1650} cy={150} r={60} fill="#E9E2D0" opacity={0.9} />
          <path d={`M 0 760 Q 300 640 640 720 T 1300 700 T 1920 690 L 1920 1080 L 0 1080 Z`} fill={MORRO1} />
          <path d={`M 0 830 Q 400 760 900 810 T 1920 800 L 1920 1080 L 0 1080 Z`} fill={MORRO2} />
          <rect x={0} y={900} width={W} height={180} fill={CHAO} />
          {/* casas */}
          {[[120, 220, '#A2674A'], [330, 260, '#5F8466'], [540, 200, '#82648F']].map(([x, h, c], i) => casa(x as number, h as number, c as string, i))}
          {/* poste e semáforo */}
          <rect x={760} y={620} width={14} height={280} fill="#1E1F22" />
          <circle cx={767} cy={615} r={22} fill={apagou ? '#30333A' : LUZ} />
          {!apagou && <circle cx={767} cy={615} r={70} fill={LUZ} opacity={0.18} />}
          {/* torre de celular */}
          <Torre x={960} y={900} h={430} cor="#1E1F22" />
          {!semSinal && [1, 2, 3].map((k2) => <path key={k2} d={`M ${960 - 30 * k2} ${470 - 10 * k2} A ${40 * k2} ${40 * k2} 0 0 1 ${960 + 30 * k2} ${470 - 10 * k2}`}
            fill="none" stroke={LUZ} strokeWidth={6} opacity={0.4 + 0.6 * Math.abs(Math.sin(s * 3 - k2))} />)}
          {semSinal && <g opacity={prog(s, t('silent', 5), 0.3)}><line x1={920} y1={420} x2={1000} y2={500} stroke={V.C1} strokeWidth={10} /><line x1={1000} y1={420} x2={920} y2={500} stroke={V.C1} strokeWidth={10} /></g>}
          {/* bateria da torre */}
          <g opacity={vida(s, t('backup', 4) - 0.8, fim(5))} transform="translate(1010 560)">
            <rect width={110} height={50} rx={6} fill="none" stroke="#E9E2D0" strokeWidth={5} /><rect x={110} y={14} width={10} height={22} fill="#E9E2D0" />
            <rect x={7} y={7} width={96 * bateriaTorre} height={36} fill={bateriaTorre < 0.3 ? V.C1 : V.GOOD} />
          </g>
          {/* hospital */}
          <g style={{filter: 'drop-shadow(8px 10px 0 rgba(0,0,0,0.3))'}}>
            <rect x={1150} y={560} width={320} height={340} fill="#DCD5C6" />
            <rect x={1280} y={590} width={60} height={60} fill={V.C1} /><rect x={1300} y={570} width={20} height={100} fill={V.C1} /><rect x={1260} y={600} width={100} height={20} fill={V.C1} />
            {[...Array(6)].map((_, i) => janela(1175 + (i % 3) * 100, 690 + Math.floor(i / 3) * 90, !apagou || (gerador && combustivel > 0.05 && Math.sin(s * 25 + i) > -0.95), 10 + i))}
          </g>
          {/* gerador do hospital */}
          {gerador && <g transform={`translate(${1500 + Math.sin(s * 40) * 2} 840)`} opacity={combustivel > 0.05 ? 1 : 0.5}>
            <rect x={0} y={0} width={110} height={60} fill="#6B6F57" stroke="#1E1F22" strokeWidth={4} />
            <rect x={80} y={-30} width={14} height={30} fill="#1E1F22" />
            {combustivel > 0.05 && [0, 1, 2].map((k3) => <circle key={k3} cx={87 + Math.sin(s * 2 + k3) * 6} cy={-40 - ((s * 60 + k3 * 20) % 60)} r={10 + k3 * 3} fill="#9A9286" opacity={0.5} />)}
          </g>}
          {/* posto */}
          <g style={{filter: 'drop-shadow(8px 10px 0 rgba(0,0,0,0.3))'}}>
            <rect x={1560} y={700} width={300} height={30} fill={V.GOLD} />
            <rect x={1580} y={730} width={14} height={170} fill="#1E1F22" /><rect x={1826} y={730} width={14} height={170} fill="#1E1F22" />
            {[0, 1].map((k4) => <rect key={k4} x={1650 + k4 * 110} y={800} width={50} height={100} fill={s > t('pumps', 6) ? '#4A4540' : V.C1} />)}
          </g>
        </svg>
        {/* personagem com o celular */}
        <Boneco e={e} p={pop(s, t('your', 1, 1) - 0.1)} x={700} y={1040} altura={330} roupa={V.C2}
          expressao={semSinal ? 'surpreso' : apagou ? 'duvida' : 'feliz'} olhar={1} />
        <div style={{position: 'absolute', left: 790, top: 820, width: 70, height: 120, borderRadius: 12, background: '#1E1F22', border: '4px solid #E9E2D0',
          opacity: vida(s, t('phone', 4) - 0.2, undefined), display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: LM, fontWeight: 700, fontSize: 15, color: semSinal ? V.C1 : '#E9E2D0', textAlign: 'center', whiteSpace: 'pre'}}>{semSinal ? 'NO\nSIGNAL' : '68%'}</div>
      </Camera>

      {/* relógio fixo e cartões (fora da câmera) */}
      {relogio && <div style={{position: 'absolute', left: 70, top: 60, transform: `scale(${batida})`, transformOrigin: 'left top',
        background: '#F3EDE1', padding: '10px 36px', boxShadow: '8px 10px 0 rgba(0,0,0,0.35)', fontFamily: LM, fontWeight: 700, fontSize: 110,
        color: relogio === 'years?' ? V.C1 : V.INK}}>{relogio}</div>}
      {trocou.map((x, i) => <Som key={i} nome="pop" t={x} volume={0.4} />)}
      <Rotulo s={s} t={t('next', 1)} ate={fim(1)} x={960} y={160} fundo="#F3EDE1" cor={V.INK} size={70}>YOUR NEXT 96 HOURS</Rotulo>
      <Rotulo s={s} t={t('fridge', 2)} ate={fim(2)} x={1400} y={300} fundo={V.C1} size={52} rot={3}>EVERYTHING OFF</Rotulo>
      <Rotulo s={s} t={t('code', 3)} ate={fim(3)} x={1400} y={260} fundo={V.GOOD} size={50} rot={-3}>GENERATORS: WITHIN 10 S</Rotulo>
      <Rotulo s={s} t={t('backup', 4)} ate={fim(4)} x={1400} y={260} fundo={V.GOLD} size={50} rot={3}>TOWERS: 2 TO 4 H OF BATTERY</Rotulo>
      <Rotulo s={s} t={t('calls', 5)} ate={fim(5)} x={1250} y={250} fundo={V.C1} size={44} rot={-2}>NO CALLS · NO TEXTS · NO INTERNET</Rotulo>
      <Rotulo s={s} t={t('safe', 5)} ate={fim(5)} x={1400} y={370} fundo="#F3EDE1" cor={V.INK} size={46} rot={2}>FRIDGE FOOD: NOT SAFE</Rotulo>
      <Rotulo s={s} t={t('freezer', 6)} ate={fim(6)} x={1300} y={260} fundo="#F3EDE1" cor={V.INK} size={48} rot={3}>FULL FREEZER: THAWED</Rotulo>
      <Rotulo s={s} t={t('refuel', 6)} ate={fim(6)} x={1300} y={380} fundo={V.C1} size={48} rot={-3}>NO PUMPS, NO GAS</Rotulo>
      {(() => { const p = vida(s, t('fuel', 7) - 0.3, fim(7)); return p > 0 && <div style={{position: 'absolute', left: 1330, top: 200, opacity: p, background: '#F3EDE1', padding: '24px 30px', boxShadow: '8px 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: LM, fontWeight: 700, fontSize: 44, color: V.INK}}>hospital fuel on site</div>
        <div style={{width: 420, height: 50, border: `4px solid ${V.INK}`, marginTop: 12}}><div style={{height: '100%', width: `${combustivel * 100}%`, background: combustivel < 0.3 ? V.C1 : V.GOOD}} /></div>
        <div style={{fontFamily: LM, fontSize: 38, color: V.C1, marginTop: 10, opacity: prog(s, t('electricity', 7), 0.3)}}>the fuel pumps need electricity</div></div>; })()}
      {/* fala 8: partida a frio (usinas religando uma a uma) */}
      {s > ini(8) - 0.2 && s < fim(8) + 0.05 && <svg width={W} height={H} style={{position: 'absolute'}}>
        {[...Array(7)].map((_, k5) => {
          const on = s > t('plant', 8) + k5 * 0.45;
          return <g key={k5} transform={`translate(${260 + k5 * 230} 260)`} opacity={vida(s, ini(8) + 0.2 + k5 * 0.05, fim(8))}>
            <rect x={-70} y={-60} width={140} height={120} fill={on ? V.GOLD : '#4A4540'} stroke="#F3EDE1" strokeWidth={4} />
            <text y={14} fontFamily={LM} fontWeight={700} fontSize={36} fill="#F3EDE1" textAnchor="middle">{on ? 'ON' : 'OFF'}</text>
            {k5 < 6 && <line x1={70} y1={0} x2={160} y2={0} stroke={on ? V.GOLD : '#4A4540'} strokeWidth={8} />}
          </g>;
        })}
      </svg>}
      <Rotulo s={s} t={t('black', 8)} ate={fim(8)} x={960} y={470} fundo="#F3EDE1" cor={V.INK} size={66} rot={-2}>BLACK START: ONE PLANT AT A TIME</Rotulo>
      <Sobe s={s} t={t('normal', 8)} ate={fim(8)} x={960} y={560} size={50} ancora="centro" cor="#F3EDE1">normal blackout: hours to days</Sobe>
      <Bate s={s} t={t('years', 9)} x={960} y={540} size={170} cor={V.C1} som={false}>YEARS?</Bate>
      <Vinheta forca={0.5} />
      <Grao forca={0.06} />
    </AbsoluteFill>
  );
};
