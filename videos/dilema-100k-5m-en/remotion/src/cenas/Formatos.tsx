// Formatos prontos no Remotion: questão da banca, pause e tente, boneco com balão, objeto 3D,
// Lottie, Ken Burns e legenda Reels. Arquivos de exemplo em remotion/public/.
// Falas: 1 = "Olha a questão que caiu na prova. Pause o vídeo e tente resolver."
//        2 = "O aluno pergunta: quanto eu pago de juros? E a resposta aparece aqui."
import React from 'react';
import {Props, at, prog, pop, useSec, inicioFala} from '../kit/tempo';
import {estilo} from '../kit/estilos';
import {Palco, Titulo, Boneco, Balao, Destaque, useFontes} from '../kit/componentes';
import {Questao, PauseETente, Objeto3D, Animacao, KenBurns, LegendaReels} from '../kit/formatos';

export const Formatos: React.FC<Props> = (props) => {
  useFontes();
  const s = useSec();
  const e = estilo(props.estilo);
  const t = (w: string, fala = 1, nth = 1, d = 0) => at(props, w, fala, nth, d);
  const fimF1 = inicioFala(props, 1) + props.falas[0].duracao;
  const fase2 = inicioFala(props, 2);
  const naFase1 = s < fase2 - 0.2;
  const sai1 = 1 - prog(s, fase2 - 0.5, 0.4);

  return (
    <Palco e={e}>
      {naFase1 && (
        <div style={{opacity: sai1}}>
          <Titulo e={e} p={prog(s, 0, 0.5)} y={250} size={70} partes={[['Questão da banca']]} />
          <Questao e={e} p={prog(s, t('questão'), 0.6)} src="questao_exemplo.png" y={400} fonte="Banca · Concurso · Ano" />
          <PauseETente e={e} s={s} t0={fimF1} segundos={4} y={900} />
        </div>
      )}
      {!naFase1 && (
        <>
          <KenBurns src="cidade_exemplo.jpg" s={s} t0={fase2} dur={props.duracao - fase2} x={90} y={300} w={900} h={520} cantos={e.cantos} />
          <Boneco e={e} p={pop(s, t('aluno', 2))} x={300} y={1400} altura={380} expressao="duvida" olhar={1} />
          <Balao e={e} p={pop(s, t('pergunta', 2))} x={340} y={880} largura={560} ponta={60}>Quanto eu pago de juros?</Balao>
          <Objeto3D e={e} p={prog(s, t("resposta", 2), 0.6)} s={s} forma="icosaedro" x={640} y={960} lado={340} />
          <Animacao src="pulso.json" x={90} y={1100} largura={200} inicio={t('aparece', 2)} />
          <Destaque e={e} p={prog(s, t("aparece", 2), 0.5)} x={730} y={1330}>J = R$ 600</Destaque>
        </>
      )}
      <LegendaReels e={e} props={props} s={s} y={1450} size={60} />
    </Palco>
  );
};
