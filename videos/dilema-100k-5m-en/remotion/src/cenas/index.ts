// Registro das cenas Remotion do vídeo: o nome aqui é o COMPOSICAO da RemotionScene no video.py.
import React from 'react';
import {Props} from '../kit/tempo';
import {V01_Gancho} from './V01_Gancho';
import {V02_Regras} from './V02_Regras';
import {V03_Contagem} from './V03_Contagem';
import {V04_Camada1} from './V04_Camada1';
import {V05_Camada2} from './V05_Camada2';
import {V06_Camada3} from './V06_Camada3';
import {V07_Botao} from './V07_Botao';
import {V08_Tempo} from './V08_Tempo';
import {V09_Instinto} from './V09_Instinto';
import {V10_Final} from './V10_Final';

export const CENAS: Record<string, React.FC<Props>> = {
  V01_Gancho, V02_Regras, V03_Contagem, V04_Camada1, V05_Camada2, V06_Camada3, V07_Botao, V08_Tempo, V09_Instinto, V10_Final,
};
