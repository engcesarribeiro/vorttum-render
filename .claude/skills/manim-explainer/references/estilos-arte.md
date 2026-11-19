# Estilos de arte em código (Anidoodle e Huashu)

80 estilos de pintura e desenho feitos 100% em código, tocados dentro das cenas Remotion (`RemotionScene`). Eles vêm de dois motores de terceiros, trazidos inteiros para a skill com as licenças:

| Motor | Autor, licença | Onde está | O que traz |
|---|---|---|---|
| Anidoodle | Alex Greenshpun, Apache-2.0 (`src/anidoodle/LICENSE`, `NOTICE`) | `template/remotion/src/anidoodle/` | 32 estilos de material (giz de cera, nanquim, gravura, risografia...), cada um com o **desenho se fazendo traço a traço** |
| Huashu Art Motion | 花叔 (alchaincyf), MIT (`public/huashu/LICENSE`) | `template/remotion/public/huashu/` | 48 estilos da história da arte (rupestre, vitral, Van Gogh, Klimt, Bauhaus, nanquim chinês...) |

Estes 80 não substituem os 14 estilos da skill (`ESTILO = "..."`). São uma camada de **desenho** que entra na cena: a ilustração do conceito, o cenário de um exemplo, a abertura de um bloco. Texto, fórmula, caixa e dados continuam com o kit de sempre (`Texto`, `Destaque`, `caixa_texto`...), por cima.

Ficaram de fora, de propósito, as receitas do Huashu que imitam estúdio ou série com marca registrada: Ghibli, Shinkai, Rick and Morty, South Park e Pixar.

## Ver todos

A composição `Galeria` (`src/cenas/Galeria.tsx`) mostra um estilo por segundo, com o nome. Os desenhos são as demonstrações dos autores (balão, farol, gato tomando chá...), servem só para escolher o traço.

```bash
cd remotion && npx remotion still src/index.ts Galeria g.png --frame=$((30*K)) --props='{"vertical":false,"duracao":81}'
```
`K` vai de 0 (estilo 1) a 79 (estilo 80). A lista com ids está em `kit/galeria-anidoodle.ts` (1 a 32) e em `HUASHU` dentro de `Galeria.tsx` (33 a 80).

## Usar numa cena

```tsx
import {Desenho, Arte} from '../kit/arte';
import {sumiE} from '../anidoodle/src/canvas-core/sumiE';

// Anidoodle: o filme do estilo se desenha entre t0 e t0 + dur (s da cena). Antes: 1º quadro; depois: pronto.
<Desenho film={sumiE} t0={t('bambu')} dur={6} x={40} y={300} w={1000} h={1000} />

// Huashu: a cena de estilo do autor (pintada em 1920x1080), a partir de t0.
<Arte cena="17_ink" t0={t('nanquim')} x={0} y={500} w={1080} h={608} />

// Huashu com o SEU desenho, usando as ferramentas do motor (pincel com fio seco, aguada, aquarela...).
<Arte t0={t('fio')} tamanho={[1080, 1920]} desenhar={(c, lt, H) => {
  const P = H.PAINT;
  P.brush(c, [[160, 900], [920, 890]], {w: 26, tone: 0.85, dry: 0.5, reveal: Math.min(1, lt / 1.5), seed: 3});
}} />
```

- **Sincronia (regra dura da skill):** o `t0` é sempre a palavra que nomeia o desenho (`at(props, "palavra")`). O `dur` controla a velocidade do traço: o desenho termina quando a fala termina de explicar.
- O `<Desenho>` e o `<Arte>` são canvas posicionados (`x`, `y`, `w`, `h` em px do quadro 1080x1920). Respeite a área segura do Reels (topo ~230 px, rodapé ~384 px).
- Desenho pesado (óleo, aquarela, pontilhismo) leva segundos por quadro. O render espera até 4 min por quadro; para iterar, renderize um `still` da cena antes do vídeo.
- Uma resolução de Huashu por cena (`tamanho` do primeiro `<Arte>` vale para a página toda).

## Fazer o conteúdo da aula no estilo (o que dá valor de verdade)

As demonstrações mostram balão, farol e gato. Para a aula, o desenho é o conceito (o transformador, o circuito, a casa da NBR). O caminho:

1. Escolha o estilo na galeria.
2. Leia a receita do estilo: Anidoodle em `references/anidoodle/estilos/<id>.md` e no cabeçalho do módulo (`src/anidoodle/src/canvas-core/<id>.ts`: material, traço, borda, ordem dos traços). Huashu em `references/huashu/receitas/<nº>_<id>.md` (em chinês: traduza a parte que precisar) e no código da cena (`public/huashu/scenes/<id>.js`).
3. Desenhe o seu conteúdo com as ferramentas do motor:
   - **Anidoodle:** cada estilo tem um kit (`sumiEKit`, `stippleKit`, `halftoneKit`, `woodcutKit`, `blueprintKit`, `colouredPencilKit`, `scratchboardKit`, `scrapbookKit`, `pixelArtKit`...). Monte um `Film` com um `shot` cujo `draw(ctx, quadro, env)` usa o kit, e passe ao `<Desenho>`. O módulo do estilo é o modelo de como usar o kit.
   - **Huashu:** `<Arte desenhar>` com `H.PAINT` (`brush`, `leaf`, `inkWash`, `watercolor`, `impasto`, `texture`, `cached`), `H.MEDIUM`, `H.KIT`, `H.DG` (diagramas), `H.TY` (tipografia), `H.CL` (colagem).
4. Lei do Anidoodle que vale aqui: **um estilo é um jeito de fazer marcas**, não uma troca de paleta. Mude o material, a borda e a ordem dos traços. E o desenho é **feito**, não aparece em fade (`references/anidoodle/craft-bar.md`).
5. Siga o fluxo de sempre: quadros completos para aprovação antes do render com voz.

## Referências trazidas

- `references/anidoodle/estilos/*.md`: receitas dos estilos (o índice está em `INDEX.md`; o cabeçalho de cada módulo também traz a receita).
- `references/anidoodle/styles.md`, `craft-bar.md`, `motion-grammar.md`, `workflows/drawing-process.md`, `workflows/explainer.md`: método do autor (em inglês).
- `references/huashu/receitas/*.md`: receitas dos 48 estilos; `references/huashu/04-纯代码绘制.md`: como pintar em código puro (em chinês).
