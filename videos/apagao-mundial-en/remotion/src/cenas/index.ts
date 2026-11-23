// Registro das cenas Remotion do vídeo: o nome aqui é o COMPOSICAO da RemotionScene no video.py.
import React from 'react';
import {Props} from '../kit/tempo';
import {V01_Gancho} from './V01_Gancho';
import {V02_Arvore} from './V02_Arvore';
import {V05_PorUmTriz} from './V05_PorUmTriz';
import {V06_Botao} from './V06_Botao';
import {V07_Sol} from './V07_Sol';
import {V08_HoraHora} from './V08_HoraHora';
import {V10_Fim} from './V10_Fim';

export const CENAS: Record<string, React.FC<Props>> = {
  V01_Gancho,
  V02_Arvore,
  V05_PorUmTriz,
  V06_Botao,
  V07_Sol,
  V08_HoraHora,
  V10_Fim,
};
