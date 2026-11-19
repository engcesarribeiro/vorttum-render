// Os 32 estilos do Anidoodle (cada um com o filme de demonstração do autor).
// Use na galeria e como modelo: o desenho de cada estilo está no módulo indicado.
import type {Film} from '../anidoodle/src/canvas-core/film';
import {balloonDraw} from '../anidoodle/src/canvas-core/balloonDraw';
import {blueprint} from '../anidoodle/src/canvas-core/blueprint';
import {brokenColour} from '../anidoodle/src/canvas-core/brokenColour';
import {charcoalErasure} from '../anidoodle/src/canvas-core/charcoalErasure';
import {colouredPencil} from '../anidoodle/src/canvas-core/colouredPencil';
import {dreamGlazeDraw} from '../anidoodle/src/canvas-core/dreamGlazeDraw';
import {embroidery} from '../anidoodle/src/canvas-core/embroidery';
import {flatVector} from '../anidoodle/src/canvas-core/flatVector';
import {folkTale} from '../anidoodle/src/canvas-core/folkTale';
import {foxDraw} from '../anidoodle/src/canvas-core/foxDraw';
import {halftone} from '../anidoodle/src/canvas-core/halftone';
import {isometric} from '../anidoodle/src/canvas-core/isometric';
import {koiDraw} from '../anidoodle/src/canvas-core/koiDraw';
import {lighthouseDraw} from '../anidoodle/src/canvas-core/lighthouseDraw';
import {lowPoly} from '../anidoodle/src/canvas-core/lowPoly';
import {mellanUnspool} from '../anidoodle/src/canvas-core/mellanUnspool';
import {midCentury} from '../anidoodle/src/canvas-core/midCentury';
import {moonPhasesDraw} from '../anidoodle/src/canvas-core/moonPhasesDraw';
import {paintedOil} from '../anidoodle/src/canvas-core/paintedOil';
import {paperCraft} from '../anidoodle/src/canvas-core/paperCraft';
import {pixelArt} from '../anidoodle/src/canvas-core/pixelArt';
import {pocketWatchDraw} from '../anidoodle/src/canvas-core/pocketWatchDraw';
import {ranunculusDraw} from '../anidoodle/src/canvas-core/ranunculusDraw';
import {rubberHose} from '../anidoodle/src/canvas-core/rubberHose';
import {scrapbook} from '../anidoodle/src/canvas-core/scrapbook';
import {scratchboard} from '../anidoodle/src/canvas-core/scratchboard';
import {stipple} from '../anidoodle/src/canvas-core/stipple';
import {storybookDraw} from '../anidoodle/src/canvas-core/storybookDraw';
import {sumiE} from '../anidoodle/src/canvas-core/sumiE';
import {toyBrick} from '../anidoodle/src/canvas-core/toyBrick';
import {woodcut} from '../anidoodle/src/canvas-core/woodcut';
import {wrenDraw} from '../anidoodle/src/canvas-core/wrenDraw';

export const ANIDOODLE: {id: string; nome: string; film: Film}[] = [
  {id: 'balloonDraw', nome: 'Giz de cera', film: balloonDraw},
  {id: 'blueprint', nome: 'Cianotipia (planta)', film: blueprint},
  {id: 'brokenColour', nome: 'Pinceladas de cor pura', film: brokenColour},
  {id: 'charcoalErasure', nome: 'Carvão apagado e refeito', film: charcoalErasure},
  {id: 'colouredPencil', nome: 'Lápis de cor', film: colouredPencil},
  {id: 'dreamGlazeDraw', nome: 'Óleo liso (surreal)', film: dreamGlazeDraw},
  {id: 'embroidery', nome: 'Bordado', film: embroidery},
  {id: 'flatVector', nome: 'Vetor chapado', film: flatVector},
  {id: 'folkTale', nome: 'Livro de conto (guache)', film: folkTale},
  {id: 'foxDraw', nome: 'Papel rasgado', film: foxDraw},
  {id: 'halftone', nome: 'Retícula de jornal', film: halftone},
  {id: 'isometric', nome: 'Corte isométrico', film: isometric},
  {id: 'koiDraw', nome: 'Quadrinho a marcador', film: koiDraw},
  {id: 'lighthouseDraw', nome: 'Risografia', film: lighthouseDraw},
  {id: 'lowPoly', nome: 'Low-poly', film: lowPoly},
  {id: 'mellanUnspool', nome: 'Gravura de linha única', film: mellanUnspool},
  {id: 'midCentury', nome: 'Guache anos 50', film: midCentury},
  {id: 'moonPhasesDraw', nome: 'Giz na lousa', film: moonPhasesDraw},
  {id: 'paintedOil', nome: 'Óleo sobre tela', film: paintedOil},
  {id: 'paperCraft', nome: 'Teatro de papel', film: paperCraft},
  {id: 'pixelArt', nome: 'Pixel art', film: pixelArt},
  {id: 'pocketWatchDraw', nome: 'Caneta esferográfica', film: pocketWatchDraw},
  {id: 'ranunculusDraw', nome: 'Lápis e aquarela', film: ranunculusDraw},
  {id: 'rubberHose', nome: 'Desenho animado anos 30', film: rubberHose},
  {id: 'scrapbook', nome: 'Álbum de recortes antigo', film: scrapbook},
  {id: 'scratchboard', nome: 'Raspagem (scratchboard)', film: scratchboard},
  {id: 'stipple', nome: 'Pontilhismo a nanquim', film: stipple},
  {id: 'storybookDraw', nome: 'Livro infantil', film: storybookDraw},
  {id: 'sumiE', nome: 'Sumi-e (nanquim japonês)', film: sumiE},
  {id: 'toyBrick', nome: 'Bloco de montar', film: toyBrick},
  {id: 'woodcut', nome: 'Xilogravura ukiyo-e', film: woodcut},
  {id: 'wrenDraw', nome: 'Nanquim e aguada', film: wrenDraw},
];
