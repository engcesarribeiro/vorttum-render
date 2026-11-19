// Registro das cenas Remotion do vídeo: o nome aqui é o COMPOSICAO da RemotionScene no video.py.
import React from 'react';
import {Props} from '../kit/tempo';
import {A01_Gancho} from './A01_Gancho';
import {A03_Detalhe} from './A03_Detalhe';
import {A06_Experimento} from './A06_Experimento';

export const CENAS: Record<string, React.FC<Props>> = {
  A01_Gancho,
  A03_Detalhe,
  A06_Experimento,
};
