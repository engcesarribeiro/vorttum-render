// Registro das cenas Remotion do vídeo: o nome aqui é o COMPOSICAO da RemotionScene no video.py.
import React from 'react';
import {Props} from '../kit/tempo';
import {T01_Gancho} from './T01_Gancho';

export const CENAS: Record<string, React.FC<Props>> = {
  T01_Gancho,
};
