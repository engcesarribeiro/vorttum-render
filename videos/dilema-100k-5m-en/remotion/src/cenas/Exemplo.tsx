// Exemplo: a mesma explicação do exemplo_estilos.py, feita no Remotion.
// Funciona em qualquer estilo (props.estilo vem do ESTILO da RemotionScene no video.py).
// Falas: 1 = "Uma dívida de trinta mil reais, com juros de dois por cento ao mês. Os juros de cada mês são a taxa vezes o saldo devedor."
//        2 = "Então, no primeiro mês, os juros são seiscentos reais."
import React from 'react';
import {Props, at, prog, pop, useSec} from '../kit/tempo';
import {estilo} from '../kit/estilos';
import {Palco, Titulo, Texto, Cinetica, Destaque, Recorte, Tela, Traco, rascunho, rough, useFontes, useFormas} from '../kit/componentes';

export const Exemplo: React.FC<Props> = (props) => {
  useFontes();
  const s = useSec();
  const e = estilo(props.estilo);
  const c = e.cor;
  const t = (w: string, fala = 1, nth = 1, d = 0) => at(props, w, fala, nth, d);

  // traço à mão nos estilos de papel; reto nos outros
  const mao = ['quadro', 'papel', 'colagem'].includes(e.nome);
  const F = useFormas(() => {
    const o = (seed: number, extra: any = {}) => ({seed, roughness: mao ? 1.4 : 0.01, bowing: mao ? 1.2 : 0, ...extra});
    return {
      eixo: rascunho(rough.line(200, 1260, 880, 1260, o(1, {stroke: c.MUTED, strokeWidth: 6}))),
      saldo: rascunho(rough.rectangle(200, 1170, 560, 80, o(2, {stroke: c.C1, strokeWidth: 5, fill: c.C1, fillStyle: mao ? 'hachure' : 'solid', hachureGap: 12}))),
      juros: rascunho(rough.rectangle(200, 1070, 120, 80, o(3, {stroke: c.C2, strokeWidth: 5, fill: c.C2, fillStyle: mao ? 'hachure' : 'solid', hachureGap: 10}))),
    };
  });

  const pTit = prog(s, 0, 0.6);
  const pPv = pop(s, t('trinta'));
  const pI = pop(s, t('dois'));
  const pEixo = prog(s, t('saldo'), 0.8);
  const pSaldo = prog(s, t('saldo', 1, 1, 0.3), 1.0);
  const pJuros = prog(s, t('seiscentos', 2), 0.8);
  const pRes = prog(s, t('seiscentos', 2, 1, 0.5), 0.5);

  const dados = (
    <>
      <Texto e={e} p={pPv} x={540} y={480} size={66} cor={c.INK}>PV = R$ 30.000</Texto>
      <Texto e={e} p={pI} x={540} y={575} size={66} cor={c.C2}>i = 2% ao mês</Texto>
    </>
  );

  return (
    <Palco e={e}>
      <Titulo e={e} p={pTit} y={250} size={72} partes={[['Passo 1: ', c.GOLD], ['os juros do mês']]} />
      {e.nome === 'colagem' && <Recorte e={e} p={pPv} x={190} y={450} w={700} h={230} rot={-2} />}
      {dados}
      <Cinetica e={e} p={pop(s, t('juros', 1, 2))} x={540} y={830} size={64} cor={c.INK}>
        {'juros = taxa × saldo'}
      </Cinetica>
      <Tela>
        <Traco f={F.eixo} p={pEixo} />
        <Traco f={F.saldo} p={pSaldo} />
        <Traco f={F.juros} p={pJuros} />
      </Tela>
      <Texto e={e} p={pSaldo} x={790} y={1180} ancora="esquerda" size={52} cor={c.C1}>saldo</Texto>
      <Texto e={e} p={pJuros} x={350} y={1080} ancora="esquerda" size={52} cor={c.C2}>juros</Texto>
      <Destaque e={e} p={pRes} x={540} y={1360} cor={c.GOLD}>J₁ = 0,02 × 30.000 = 600</Destaque>
    </Palco>
  );
};
