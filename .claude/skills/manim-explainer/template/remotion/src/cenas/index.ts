// Registro das cenas Remotion do vídeo: o nome aqui é o COMPOSICAO da RemotionScene no video.py
// (por padrão, o nome da classe). Crie um arquivo por cena em src/cenas/ e acrescente aqui.
import React from 'react';
import {Props} from '../kit/tempo';
import {Exemplo} from './Exemplo';
import {Formatos} from './Formatos';
import {Anuncio} from './Anuncio';
import {Galeria} from './Galeria';

export const CENAS: Record<string, React.FC<Props>> = {
  Exemplo,
  Formatos,
  Anuncio,
  Galeria,
};
