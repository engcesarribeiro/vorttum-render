# API do template e receitas

`from explainer import *` traz o Manim inteiro + o que está abaixo.

## ExplainerScene

| Método | O que faz |
|---|---|
| `self.title(texto)` | Título do topo. **Só nas cenas de questão** ("Questão", "Passo 1: …", "Resumo"); em 9:16 quebra em até 2 linhas. |
| `with self.narrate(F("A01", 1)) as n:` | Gera a voz da fala inteira e toca. O bloco dura no mínimo a fala. Legenda só se `CAPTIONS = True`. |
| `n.wait_until("palavra", nth=1)` | Espera até a palavra ser dita. Use antes de um `play` para a animação começar junto. |
| `n.until("palavra")` | Devolve um `run_time` que faz a animação terminar quando a palavra é dita. |
| `n.remaining` / `n.duration` | Segundos restantes / total da fala. |
| `self.zone("visual" \| "side" \| "full")` | Centro da zona. 16:9: visual = esquerda 60%, side = direita. 9:16: visual = cima, side = baixo. |
| `self.fit(mob, zona)` | Reduz o objeto para caber na zona e centraliza. |
| `self.clear_section(keep_title=False)` | Fade out de tudo. Chame no fim de cada cena (e entre ideias dentro de uma cena longa). |
| `self.clear_except(*manter)` | Fade out de tudo menos `manter` (ex.: o circuito fixo da questão). |
| `self.topo(mob, gap=0.2)` | Encosta o topo do grupo no topo da área útil (abaixo do título, se houver). Use em vez de coordenada fixa. |
| `self.destacar(mob, cor, buff)` | Caixa com fundo escuro tingido atrás do resultado (FadeIn). Devolve a caixa. |
| `self.content_box` | `(topo, base)` da área útil, já descontando título, legenda e área segura do Reels. |
| `self.titulo_rico(partes, cores)` | Título com partes de cor/peso diferentes: `titulo_rico([r"\textbf{Passo 1:}", " a parcela"], [GOLD, INK])`. Não coube? A 1ª parte fica em cima e o resto embaixo. Funciona em todos os estilos (o `\textbf` vira negrito da fonte do estilo). |
| `self.hand_away()` | (quadro) tira a mão da frente. |
| `self.point_at(ponto)` | (quadro) leva a ponta da caneta até um ponto, sem desenhar. |
| `self.questao(img, fonte)` | Print da questão no topo da área útil, com moldura e a fonte embaixo. Devolve o grupo (`q.animate.scale(0.55, about_edge=UP)` para encolher e seguir). |
| `self.pause_e_tente(segundos, texto, zona)` | Contagem regressiva em anel no silêncio, depois da fala que convida. `zona="side"` se a questão estiver em cima. |
| `self.ken_burns(img, duracao, zoom, deslocar, fundo=True)` | Foto com zoom e deslocamento lentos. `fundo=True` cobre a tela (atrás do conteúdo). Devolve a imagem (tire com `FadeOut`). |
| `self.teclar(calc, teclas, n, palavras, resultados)` | Aperta teclas da `Calculadora` (acendem em dourado; visor mostra o digitado). `palavras[k]` = palavra da fala em que a tecla k é apertada (None = segue). `resultados={k: "600,00"}` mostra a resposta. |

Atributos de classe:
- `VOICE` (padrão `pt-BR-ThalitaMultilingualNeural`, aprovada; Antonio e Francisca foram recusadas), `RATE` (`"+0%"`).
- `TITLE_AREA` (True): False em cenas sem título; o conteúdo usa o topo. Padrão de projeto: `class _Teoria(ExplainerScene): TITLE_AREA = False` (base com `_` não é renderizada).
- `CAPTIONS` (False): True liga a legenda em faixa própria com palavra acesa.
- `LEGENDA_CENTRAL` (False): o usuário pediu para tirar. Se ligada (True), com a tela vazia (fora o título) a frase falada aparece no centro com fade, só em espera de pelo menos `LEG_MIN` (3 s), e sai junto do primeiro `play` que desenha algo.
- `ESTILO` (`"documentario"`): `documentario`, `quadro`, `lousa`, `papel`, `colagem`, `recorte`, `bauhaus`, `blueprint`, `darkui`, `terminal`, `jornal` ou `neon`. Por cena; base `_Base` no `video.py` para o padrão do vídeo.
- `MAO` (None): o estilo decide (`quadro` e `lousa` usam a mão). True/False força.
- `CAPTIONS`: False (padrão), True (faixa karaokê) ou `"reels"` (1 a 3 palavras grandes, a falada em dourado; reserva espaço embaixo).
- `MIN_GAP` (0.15): distância mínima usada pelo aviso `[espaço]`.

## Funções

| Função | Uso |
|---|---|
| `sheet(cols, rows, cell)` | Folha finita quadriculada, centrada na origem. Para transformar: `apply_matrix(m, about_point=folha.get_center())`. |
| `faint_plane()` | Grade de fundo quase invisível (referência para a folha se mover). |
| `basis_arrows(cell)` | VGroup [î azul, ĵ laranja] saindo da origem. |
| `colored_matrix(rows, colors=(C1, C2))` | Matriz com colunas coloridas. Aceita números ou strings LaTeX (`"\\cos\\theta"`). |
| `label(texto, color=GOLD)` | Rótulo pequeno em sans, para pôr embaixo de uma matriz/fórmula. |
| `text_tex(texto, size, color)` | Texto comum em LaTeX (com escape). |
| `tex_escape(texto)` | Escapa `% & $ # _ { } ~ ^ \`. |
| `PRONUNCIA` / `para_voz(texto)` | Tabela de grafias enviadas à voz (só áudio). Ex.: `volts` → `vôlts`. Âncoras ignoram acento, então `wait_until("volts")` continua funcionando. |
| `falas_do_roteiro(caminho)` | Lê o roteiro `.md` e devolve `F(cena, n)` com o texto da fala. O roteiro é a fonte única do que é falado. |
| `caixa(mob, cor, buff)` | Retângulo de destaque com fundo tingido (`z_index=-1`, fica atrás). Para partes de uma equação, `buff=0.1`. Na colagem vem com sombra de recorte. |
| `caixa_texto(texto, cor, size=36, w, h, largura_max=5.6)` | Caixa com texto (bloco de diagrama, cartão) que cresce até o texto caber com folga; `str` quebra em linhas sozinho. Devolve `VGroup(caixa, texto)`. |
| `quebra_linhas(texto, size, largura_max, color)` | Texto na fonte do estilo, quebrado em linhas se passar da largura (nunca encolhe a fonte). |
| `fio(*pts)`, `diodo()`, `zener()`, `resistor()`, `capacitor()`, `indutor()`, `fonte_ac()`, `terra()`, `ponte_diodos()` | Kit de circuitos: símbolos deitados no eixo x, com máscara da cor do fundo do estilo. Fio inteiro embaixo, símbolo por cima. |
| `tinge(simbolo, cor)` | Animação que muda só o traço de um símbolo do kit (acender o diodo que conduz). |
| `painel(mob, cor)` | Fundo sólido com faixa de cor à esquerda para blocos de dados (atrás, z<0). |
| `mostra_em_painel(self, n, linhas, palavras, cor)` | Dados do problema uma variável por linha: cada linha entra na sua palavra e o painel cresce junto (nunca vazio). Ex.: `mostra_em_painel(self, n, [pv, taxa, tempo], ["trezentos", "um", "trinta"])`. Devolve o painel. |
| `empilhar(*linhas, buff, w, h)` | Empilha com espaço fixo; só a linha larga demais encolhe. Avisa se não couber em `h` (aí divida em etapas). |
| `boneco(roupa, pele, cabelo, expressao, olhar, altura, aceno)` | Personagem de papel recortado, pé na origem. Expressões: feliz, serio, duvida, surpreso. Sombra nos estilos de recorte. |
| `Calculadora(largura)` | Calculadora financeira genérica (n, i, PV, PMT, FV, dígitos). Use com `self.teclar`. |
| `spin(tracker, velocidade)` | Faz um ângulo girar sozinho. `self.add(tracker)`; pare com `tracker.clear_updaters()`. |

Cores: `BG, INK, MUTED, FAINT, SHEET, C1 (azul), C2 (laranja), GOLD, BAD (vermelho), GOOD (verde)`. São as do documentário; nos outros estilos, cada uma é trocada pela versão do estilo na hora de desenhar (inclusive em `always_redraw`). Por isso, use sempre as constantes, nunca hex solto.

## LousaInfinitaScene (câmera que passeia)

```python
class R01_Mapa(LousaInfinitaScene):
    ESTILO = "lousa"
    def construct(self):
        a = text_tex("Juros simples", 60, C1).move_to(LEFT * 5 + UP * 3)
        with self.narrate(F("R01", 1)) as n:
            self.ir_para(a); self.play(Write(a))
            ...
            self.visao_geral()     # zoom-out: o mapa da matéria inteiro
```
Coloque as partes longe umas das outras (coordenadas grandes, sem se preocupar com a tela). `ir_para(*mobs, margem)` enquadra; `visao_geral()` mostra tudo; `volta()` retorna ao enquadramento inicial. O fundo do estilo acompanha a câmera. Sem título fixo e sem auditoria de layout.

## RemotionScene (cena feita no Remotion)

```python
class A02_Gancho(RemotionScene):
    ESTILO = "colagem"
    FALAS = [F("A02", 1), F("A02", 2)]
    COMPOSICAO = "A02_Gancho"    # opcional; padrão = nome da classe
    CAUDA = 0.4                  # segundos depois da última fala
```
Um número em `FALAS` é silêncio em segundos (ex.: `[F("C01", 1), 5, F("C01", 2)]` para o pause e tente). O Manim fala cada texto em sequência e grava `media/remotion/<Cena>.json` (estilo, duração, fps, início de cada fala e tempo de cada palavra). O `render.py` renderiza a composição com esses props e troca a imagem do MP4 da cena (o áudio fica).

**Kit do Remotion** (`remotion/src/kit/`), tudo em px do quadro de 1080x1920 (ou 1920x1080):

| Peça | Uso |
|---|---|
| `useSec()` | segundos desde o início da cena |
| `at(props, "palavra", fala=1, nth=1, d=0)` | segundo em que a palavra é dita; palavra ausente quebra o render |
| `prog(s, t0, d)` / `pop(s, t0)` / `sai(s, t0)` | 0→1 suave / com passada (salto) / 1→0 |
| `estilo(props.estilo)` | paleta (`e.cor.INK`, `C1`, `GOLD`...), fontes e enfeites do estilo |
| `<Palco e>` | fundo do estilo (envolve a cena toda) |
| `<Titulo e p y partes>` | título no visual do estilo; `partes=[["Passo 1: ", e.cor.GOLD], ["a parcela"]]` |
| `<Texto e p x y size cor ancora>` | texto que entra subindo, na fonte do estilo |
| `<Cinetica e p x y size>` | palavra grande que salta (use com `pop`) |
| `<Destaque e p x y cor>` | caixa com fundo tingido (igual ao `destacar`) |
| `<Recorte e p x y w h rot fita>` | cartão de papel rasgado com sombra e fita (colagem) |
| `<Tela>` + `<Traco f p>` | SVG do quadro; traço desenhado aos poucos. `f = rascunho(rough.circle(...))` para traço à mão |
| `useFontes()` | chame no começo da cena (segura o render até as fontes carregarem) |
| `<Boneco e p x y expressao olhar aceno>` | personagem de papel (x, y = pé) |
| `<Balao e p x y largura ponta>` | balão de fala com a ponta para baixo |
| `<Questao e p src y fonte>` | print da questão (`public/<src>`) |
| `<PauseETente e s t0 segundos>` | contagem regressiva; t0 = fim da fala que convida |
| `<LegendaReels e props s y>` | legenda de 1 a 3 palavras (ponha por último) |
| `<KenBurns src s t0 dur zoom de para x y w h>` | imagem com zoom lento dentro de uma caixa |
| `<Animacao src x y largura inicio>` | Lottie (`public/<src>.json`) |
| `<Objeto3D e p s forma cor x y lado giro arame>` | cubo, esfera, toro, icosaedro, cone ou cilindro girando |

**Kit retro** (`remotion/src/kit/retro.tsx`, feito para o estilo `retro`, serve em qualquer um). Aqui os componentes recebem `t` (segundo em que entram, de `at()`) em vez de `p`, `ate` (segundo em que saem) e tocam um efeito na entrada (`som={false}` desliga). Modelo completo: `cenas/Anuncio.tsx`.

| Peça | Uso |
|---|---|
| `<Palco e faixas>` | no `retro`: kraft, tiras de jornal em cima e embaixo e faixas diagonais fixas (`faixas={[]}` tira; padrão: uma vermelha no meio) |
| `<Etiqueta t ate x y cor fonte size rot seta>` | papel recortado com a palavra-chave. `cor`: preto, vermelho, amarelo, creme, branco. `fonte`: grossa, slab, maquina, condensada. `seta=[x, y]` desenha a seta até o ponto |
| `<Seta t de para cor espessura curva>` | seta grossa que se desenha (`curva={0}` reta) |
| `<Checklist t=[...] itens x y colunas>` | itens com ✓ que entram um por palavra |
| `<Riscar t tRisco tNovo x y texto novo>` | risca a etiqueta e põe outra embaixo (COPIAR → MODELAR) |
| `<CartaoFoto t x y w h src moldura legenda meioTom>` | cartão com fita; `src` png/jpg/svg ou **mp4** (toca a partir da entrada, mudo) |
| `<MeioTom w h passo>` | envolve imagem ou vídeo e imprime em pontos de meio-tom |
| `<Faixa t y ang cor de>` | faixa diagonal que entra varrendo (ponha antes dos outros elementos) |
| `<MaoAponta t x y ang tamanho>` | mão de gravura; (x, y) = ponta do dedo; `ang` 0 direita, 90 baixo, 180 esquerda |
| `<RetratoFalante t props x y largura src boca falas>` | retrato recortado cujo queixo mexe com a voz. Padrão: `retro/cavalheiro.svg`. Foto própria: `boca={{y, y1, x0, x1}}` em frações da imagem e `proporcao` = altura/largura |
| `<Camera batidas tremor>` | envolve o conteúdo: tremor leve e soco de zoom nos segundos de `batidas` |
| `<LegendaRecortes props y size>` | legenda em papéis recortados, palavra falada no vermelho (ponha por último, fora da `Camera`) |
| `<Som nome t volume>` | efeito em `public/sfx/`: pop, papel, rasgo, whoosh, clique, carimbo, risco, digitar, ding, tique |

- A boca do `RetratoFalante` usa o volume real da voz (`props.volume`, gravado pela `RemotionScene` a partir do mp3). Na prévia sem voz, mexe pelas sílabas de cada palavra.
- Tela por fala: guarde `const fim = (f) => inicioFala(props, f + 1, -0.25)` e passe `ate={fim(n)}` em tudo da tela `n`.
- O áudio do Remotion (efeitos) é somado à voz pelo `render.py`; a voz não perde volume.

Nova cena: crie `remotion/src/cenas/<Nome>.tsx` (copie o `Exemplo.tsx`) e registre em `cenas/index.ts`. Estúdio para testar: `cd remotion && npm run estudio`. Conferir tipos: `npm run tipos`.

## Estilos de arte: `<Desenho>` e `<Arte>` (kit/arte.tsx)

- `<Desenho film t0 dur x y w h escala opacidade>`: toca um `Film` do Anidoodle (função pura do quadro) num canvas. O filme inteiro cabe entre `t0` e `t0 + dur` (s da cena); antes fica o 1º quadro, depois o último. Os 32 filmes de demonstração estão em `kit/galeria-anidoodle.ts`; os kits de cada material em `src/anidoodle/src/canvas-core/<estilo>Kit.ts`.
- `<Arte cena t0 dur x y w h tamanho>`: toca `public/huashu/scenes/<cena>.js` (1920x1080). `<Arte desenhar={(c, lt, H) => ...}>`: o seu desenho com `H.PAINT`, `H.MEDIUM`, `H.KIT`, `H.DG`, `H.TY`, `H.CL`, com `lt` em segundos desde `t0`.
- Os dois seguram o quadro (`delayRender`) até o desenho terminar; quadro pesado pode levar segundos.
- Galeria para escolher: composição `Galeria` (um estilo por segundo). Guia completo: `references/estilos-arte.md`.

## Efeitos sonoros, música e legenda em recortes
- **Efeito no Manim:** `self.som("pop")` toca agora; `self.som("whoosh", volume_db=-12, atraso=0.2)`. Ponha logo antes do `play` que ele acompanha.
- **Efeito no Remotion:** os componentes do kit retro já tocam o seu; avulso, `<Som nome="ding" t={t('pronto')} />`.
- **Música:** no `video.py`, `MUSICA = "trilha.mp3"` (arquivo na pasta do vídeo, commitado para o GitHub achar) e `MUSICA_VOLUME = -20`. Entra na junção, repete até o fim, faz fade e baixa sozinha quando a voz fala. Na linha de comando: `--musica arq --musica-volume -22`, ou `--sem-musica`. Trilha vem do usuário ou de banco livre (Biblioteca de áudio do YouTube, Pixabay Music); a skill não gera música.
- **Legenda em recortes:** `CAPTIONS = "recortes"` no Manim; `<LegendaRecortes>` no Remotion. Só no anúncio ou quando o usuário pedir; aula continua sem legenda.

## Imagens do estilo retro
- Em `remotion/public/retro/`: `kraft.jpg`, `jornal_1.png`, `jornal_2.png` (gerados por `scripts/texturas_retro.py`), `mao.svg` (mão apontando) e `cavalheiro.svg` (retrato original em gravura). O Manim lê da mesma pasta da skill.
- **Foto → gravura recortada:** `python <skill>/scripts/gravura.py foto.jpg --saida remotion/public/retrato.png [--estilo linhas] [--sem-fundo]` (meio-tom ou traço, borda de papel creme, fundo transparente). `--sem-fundo` precisa de `pip install rembg onnxruntime`.
- Gravuras antigas de domínio público (Wikimedia Commons, Biblioteca do Congresso) servem; confira a licença. Foto de pessoa real só com autorização.

## Receitas

**Contador animado (crescimento, convergência):**
```python
t = ValueTracker(1.0)
num = always_redraw(lambda: DecimalNumber(t.get_value(), num_decimal_places=2, font_size=44, color=INK).next_to(barra, RIGHT))
self.play(t.animate.set_value(2.70), run_time=n.until("setenta"), rate_func=linear)
```

**Barra que cresce sobre uma reta:** `always_redraw` de um `Rectangle` com largura `reta.n2p(v)[0] - reta.n2p(0)[0]`, `.next_to(reta.n2p(0), UP, buff=0.12, aligned_edge=LEFT)`.

**Fórmula que se transforma passo a passo:** `TransformMatchingTex(MathTex("(a+b)(c+d)"), MathTex("ac+ad+bc+bd"))`. Partes coloridas: `MathTex("a", "d", "-", "b", "c")` e colora por índice.

**Destacar resultado:** `self.destacar(resultado, GOLD)` — caixa com fundo próprio. Deixe ~0,5 até a linha vizinha.

**Dois movimentos lado a lado (comparação):** duas folhas `scale(0.6)`, uma em `zone("full") + LEFT*3.2`, outra `+ RIGHT*3.2`; rótulos `label()` em cima de cada. Não use a zona side nesse caso.

**Linha do tempo histórica:** `NumberLine` longo em MUTED, marcos com `Dot(color=GOLD)` + `label(ano)`; atravesse com `MovingCameraScene` só se for indispensável. Na maioria dos casos, um `Line` com pontos basta.

**Pontos se movendo com a transformação:** `VGroup(*[Dot(p, color=GOLD) for p in pts])` + `ApplyMatrix(m, grupo, about_point=centro)`; trilhas com `TracedPath`.

**3D pontual (projeção manual em 2D):** `ThreeDScene` não herda o layout do template; projete à mão e anime ângulos de câmera com `ValueTracker`:
```python
a, e = ValueTracker(0.95), ValueTracker(0.32)        # giro e inclinação
def P(x, y, z):                                       # (re, im, tempo) -> tela
    av, ev = a.get_value(), e.get_value()
    X = x * np.cos(av) + z * np.sin(av); Z = -x * np.sin(av) + z * np.cos(av)
    return C + np.array([X, y * np.cos(ev) + Z * np.sin(ev), 0])
cena3d = always_redraw(lambda: ...)                   # hélice, seta, eixo usando P()
self.play(a.animate.set_value(PI / 2), e.animate.set_value(0))   # vista de lado
```
Para girar um triângulo em torno da base: `y' = y·cos φ`, perspectiva `f = 7 / (7 − y·sin φ)`.

**Reta tangente percorrendo uma curva (mostrar "ritmo de mudança"):** `always_redraw` de uma `Line` centrada em `axes.c2p(x, f(x))` com direção `axes.c2p(x+0.01, f(x)+f'(x)·0.01) − axes.c2p(x, f(x))`; ao mesmo tempo, `axes.plot(g, x_range=[0, x])` desenha a outra curva até `x`.

**Desenho fixo numa questão:** cada cena de passo começa com `self.add(circuito_pequeno)` (sem animar) e termina com `self.clear_except(circuito_pequeno)`. Assim o desenho atravessa as cenas sem piscar. Acenda o elemento usado no passo com `elemento.animate.set_stroke(GOLD, 7)`.

**Resolução em etapas:** monte duas pilhas no mesmo lugar (`empilhar`); a segunda entra quando a primeira sai (`FadeOut` das contas intermediárias e `FadeIn` do resultado).

## Armadilhas
- `set_color` num símbolo do kit de circuitos pinta a máscara e o símbolo vira um bloco de cor: use `tinge()` ou `set_stroke()`.
- Caixa de tamanho fixo com texto dentro estoura quando a fonte do estilo é mais larga (aviso `[caixa]`): use `caixa_texto()`. Se um texto precisar ficar de propósito sobre um retângulo, marque `texto.sem_caixa = True`.
- Cena com título e desenho em coordenada fixa: invade o título. Use `self.topo(grupo)`.
- `QUADROS=<pasta>` no ambiente salva a tela no fim de cada fala (para o usuário aprovar antes do render com voz).
- `apply_matrix` sem `about_point` gira/estica em torno da origem da tela, não da folha: a folha voa para fora da zona.
- `Write` em objeto grande (folha, gráfico) fica lento e feio; use `FadeIn`/`Create`. `Write` é para texto e fórmulas.
- `always_redraw` com `MathTex` novo a cada frame deixa o render lento; `DecimalNumber` é ok.
- Animação mais longa que a fala é permitida: a próxima fala só começa depois. Mas uma pausa longa sem voz parece travamento; máx ~1,5 s.
- Legenda e título são gerenciados pelo template; não adicione `Text` no rodapé ou no topo manualmente.
- **Updater sem `dt` congela nas esperas:** o Manim só redesenha durante `wait()` se algum objeto tiver updater dependente do tempo (`lambda m, dt: ...`). Algo que deve continuar mudando sozinho precisa receber `dt`.
- **Âncora com palavra que não está na fala:** se o roteiro mudar, confira as âncoras (`wait_until`, `until`); palavra ausente quebra o render. Repetida? use `nth=2`.
- **Pulsar resultado em caixa:** duas formas valem, e pode variar entre elas: (1) pulsar a caixa e o conteúdo juntos (`self.play(VGroup(cx, conta).animate(rate_func=there_and_back).scale(1.1))`); (2) pulsar só o conteúdo, com a caixa parada, sobrando margem de fundo até a borda no pico: dê folga na caixa (`cx = self.destacar(conta, buff=0.45)`) e limite a escala (`k = min(1.1, (cx.width - 0.6) / conta.width, (cx.height - 0.6) / conta.height)`; `conta.animate(rate_func=there_and_back).scale(k)`). Proibido: o conteúdo crescer até a borda ou passar dela. `Indicate` não serve: aumenta demais e troca a cor.
- **Caixa que encosta:** `destacar` adiciona `buff` em volta; conte esse espaço ao empilhar.
- Uma exceção dentro de `construct` pode travar o processo no Windows: rode via `render.py` (timeout), nunca `manim` direto em loop.

## Scripts de saída

- `carrossel.py video.py --vertical [--rascunho|--preview] [--cta "..."] [--pular CENA ...]`: capa (se o 1º quadro tiver capa) + 1 slide por cena (o quadro mais completo antes da limpeza) + chamada final. PNG 1080x1350 em `out/carrossel/`.
- `clone.py <video>.mp4 clone.mp4 [--pos baixo-esq|baixo-dir|cima-esq|cima-dir] [--tamanho 0.34] [--inicio 0] [--audio video|clone]`: clone num círculo com borda dourada, acima da faixa do Reels. Saída `<video>_clone.mp4`.
