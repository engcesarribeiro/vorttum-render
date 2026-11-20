import React from 'react';
import {Composition} from 'remotion';
import {Props} from './kit/tempo';
import {CENAS} from './cenas';

// Props de amostra, só para abrir no estúdio (npm run estudio) sem rodar o Manim.
// No render, o render.py passa os tempos reais da voz (media/remotion/<Cena>.json).
const AMOSTRA: Props = {
  cena: 'Exemplo', composicao: 'Exemplo', estilo: 'colagem', duracao: 14, fps: 30,
  largura: 1080, altura: 1920, vertical: true,
  falas: [
    {texto: 'Uma dívida de trinta mil reais, com juros de dois por cento ao mês. Os juros de cada mês são a taxa vezes o saldo devedor.',
      inicio: 0, duracao: 9,
      palavras: 'Uma dívida de trinta mil reais, com juros de dois por cento ao mês. Os juros de cada mês são a taxa vezes o saldo devedor.'
        .split(' ').map((w, i) => [w, i * 0.36] as [string, number])},
    {texto: 'Então, no primeiro mês, os juros são seiscentos reais.', inicio: 9.4, duracao: 4,
      palavras: 'Então, no primeiro mês, os juros são seiscentos reais.'.split(' ').map((w, i) => [w, 9.4 + i * 0.4] as [string, number])},
  ],
};

// Remotion não aceita "_" no id da composição: A01_Abertura vira A01-Abertura (o explainer.py troca igual).
export const Root: React.FC = () => (
  <>
    {Object.entries(CENAS).map(([id, Comp]) => (
      <Composition
        key={id}
        id={id.replace(/_/g, '-')}
        component={Comp as React.FC<any>}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={Math.round(AMOSTRA.duracao * 30)}
        defaultProps={{...AMOSTRA, cena: id, composicao: id}}
        calculateMetadata={({props}) => {
          const p = props as Props;
          const fps = p.fps || 30;
          return {
            fps,
            durationInFrames: Math.max(1, Math.round(p.duracao * fps)),
            width: p.vertical === false ? 1920 : 1080,
            height: p.vertical === false ? 1080 : 1920,
          };
        }}
      />
    ))}
  </>
);
