// Modelo de anúncio curto (story/Reels 9:16) no estilo retro, com o kit/retro.tsx inteiro:
// retrato que fala, etiquetas com seta, cartão com vídeo, riscar e trocar, checklist, faixa, mão, câmera,
// legenda em recortes e efeitos sonoros. Cada fala é uma "tela"; tudo da tela sai quando a próxima fala começa.
// Falas (exemplo_anuncio.py):
//  1 "Viu uma aula animada que prendeu você até o fim e pensou: queria fazer uma dessas?"
//  2 "Ela tem gancho, ritmo e desenho no tempo da fala."
//  3 "Copiar não adianta. Você modela a estrutura."
//  4 "E faz tudo sozinho: roteiro, narração, música e legenda."
//  5 "Sem aparecer, sem gravar e sem editar."
//  6 "Clica no botão aqui embaixo."
import React from 'react';
import {Props, at, inicioFala, useSec} from '../kit/tempo';
import {estilo} from '../kit/estilos';
import {Palco, useFontes} from '../kit/componentes';
import {Camera, CartaoFoto, Checklist, Etiqueta, Faixa, LegendaRecortes, MaoAponta, RetratoFalante, Riscar, Seta, Som}
  from '../kit/retro';

export const Anuncio: React.FC<Props> = (props) => {
  useFontes();
  useSec();
  const e = estilo(props.estilo);
  const t = (w: string, fala = 1, nth = 1, d = 0) => at(props, w, fala, nth, d);
  const fim = (fala: number) => (fala < props.falas.length ? inicioFala(props, fala + 1, -0.25) : undefined);

  return (
    <Palco e={e} faixas={[]}>
      <Camera batidas={[t('queria'), t('gancho', 2), t('modela', 3), t('sozinho', 4), t('botão', 6)]}>
        {/* 1: gancho com o retrato que fala */}
        <Faixa t={t('Viu')} ate={fim(1)} y={980} cor="#C8202A" som={false} />
        <RetratoFalante t={t('Viu')} ate={fim(1)} props={props} falas={[1]} x={300} y={430} largura={480} rot={-2} />
        <Etiqueta t={t('aula')} ate={fim(1)} x={330} y={330} cor="preto" size={62} rot={-4}>VIU UMA AULA</Etiqueta>
        <Etiqueta t={t('animada')} ate={fim(1)} x={760} y={400} cor="vermelho" size={70} rot={5}>ANIMADA?</Etiqueta>
        <Etiqueta t={t('queria')} ate={fim(1)} x={540} y={1060} cor="amarelo" fonte="slab" size={54} rot={-3}>
          QUERIA FAZER UMA DESSAS?
        </Etiqueta>
        <MaoAponta t={t('dessas')} ate={fim(1)} x={800} y={760} ang={180} tamanho={260} />

        {/* 2: o que ela tem (cartão com vídeo + etiquetas com seta) */}
        <Faixa t={inicioFala(props, 2)} ate={fim(2)} y={900} cor="#151515" de="direita" />
        <Etiqueta t={t('tem', 2)} ate={fim(2)} x={540} y={300} cor="preto" size={60}>ELA TEM:</Etiqueta>
        <CartaoFoto t={t('Ela', 2)} ate={fim(2)} x={330} y={420} w={420} h={560} src="exemplo_clipe.mp4" rot={2} moldura="preta" />
        <Etiqueta t={t('gancho', 2)} ate={fim(2)} x={200} y={520} cor="amarelo" fonte="slab" size={54} rot={-5} seta={[340, 640]}>
          GANCHO
        </Etiqueta>
        <Etiqueta t={t('ritmo', 2)} ate={fim(2)} x={880} y={640} cor="vermelho" size={54} rot={4} seta={[740, 760]}>RITMO</Etiqueta>
        <Etiqueta t={t('desenho', 2)} ate={fim(2)} x={540} y={1080} cor="creme" fonte="maquina" size={50} rot={-2}>
          DESENHO NO TEMPO DA FALA
        </Etiqueta>

        {/* 3: riscar e trocar */}
        <Faixa t={inicioFala(props, 3)} ate={fim(3)} y={820} cor="#C8202A" />
        <Riscar t={t('Copiar', 3)} tRisco={t('adianta', 3)} tNovo={t('modela', 3)} ate={fim(3)} x={460} y={620}
          texto="COPIAR" novo="MODELAR" size={96} />

        {/* 4: checklist */}
        <Etiqueta t={t('tudo', 4)} ate={fim(4)} x={540} y={330} cor="preto" size={70} rot={-2}>TUDO SOZINHO</Etiqueta>
        <Faixa t={t('tudo', 4)} ate={fim(4)} y={760} cor="#151515" som={false} />
        <Checklist t={[t('roteiro', 4), t('narração', 4), t('música', 4), t('legenda', 4)]} ate={fim(4)}
          itens={['ROTEIRO', 'NARRAÇÃO', 'MÚSICA', 'LEGENDA']} x={110} y={560} />

        {/* 5: sem aparecer, sem gravar, sem editar */}
        <Etiqueta t={t('aparecer', 5)} ate={fim(5)} x={380} y={480} cor="preto" size={66} rot={-3}>SEM APARECER</Etiqueta>
        <Etiqueta t={t('gravar', 5)} ate={fim(5)} x={680} y={640} cor="creme" fonte="slab" size={66} rot={3}>SEM GRAVAR</Etiqueta>
        <Etiqueta t={t('editar', 5)} ate={fim(5)} x={430} y={800} cor="amarelo" size={66} rot={-2}>SEM EDITAR</Etiqueta>

        {/* 6: chamada para ação (o botão "Saiba mais" do story fica embaixo) */}
        <Faixa t={inicioFala(props, 6)} y={900} cor="#C8202A" />
        <Etiqueta t={t('Clica', 6)} x={540} y={420} cor="preto" size={72}>CLICA NO BOTÃO</Etiqueta>
        <Etiqueta t={t('aqui', 6)} x={540} y={540} cor="vermelho" size={66} rot={2}>AQUI EMBAIXO</Etiqueta>
        {[340, 540, 740].map((x, k) => (
          <Seta key={k} t={t('embaixo', 6, 1, k * 0.08)} de={[x, 700]} para={[x, 1000]} curva={0}
            cor={k === 1 ? '#C8202A' : '#151515'} espessura={16} som={k === 0 ? 'whoosh' : false} />
        ))}
        <MaoAponta t={t('embaixo', 6, 1, 0.3)} x={900} y={1180} ang={90} tamanho={240} />
        <Som nome="ding" t={t('embaixo', 6, 1, 0.4)} volume={0.35} />
      </Camera>
      <LegendaRecortes props={props} y={1430} />
    </Palco>
  );
};
