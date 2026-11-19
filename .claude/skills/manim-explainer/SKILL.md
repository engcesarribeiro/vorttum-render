---
name: "manim-explainer"
description: "Cria vídeos-aula e anúncios curtos animados com Manim e Remotion, em 14 estilos misturáveis por cena (documentário, quadro branco e lousa com mão, papel, envelhecido, colagem, colagem retrô com jornal e gravuras, Bauhaus, blueprint, dark UI com 3D, terminal, recorte com personagens, jornal, neon) mais 80 estilos de arte em código para os desenhos (Anidoodle e Huashu: nanquim, gravura, giz, aquarela, risografia, vitral, Van Gogh, Klimt...), com formatos prontos (questão da banca, pause e tente, calculadora, lousa infinita, legenda Reels ou em recortes, retrato que fala, carrossel, clone de IA), narração TTS PT-BR sincronizada, efeitos sonoros e trilha com ducking, do roteiro ao MP4 em 16:9 ou 9:16 (Reels/story), com teoria explicada pelo porquê e questões resolvidas passo a passo."
---

# Manim Explainer

Use sempre que o usuário pedir vídeo com Manim ou Remotion, vídeo em quadro branco ou lousa com mão desenhando, estilo papel, colagem, colagem retrô (kraft, jornal antigo, gravura, etiquetas recortadas), Bauhaus, blueprint, dark UI, terminal, recorte, jornal ou neon, anúncio animado ou criativo de story/Reels ("faz um vídeo igual a esse anúncio"), carrossel tirado do vídeo, clone de IA no vídeo, animação matemática, vídeo explicativo de um conceito (matemática, física, eletricidade, estatística, finanças, algoritmos), "vídeo estilo 3Blue1Brown", "explica X com animação", aula animada, ou quiser transformar um conceito ou questão em vídeo animado didático — mesmo que não diga "Manim". Não use para editar vídeo gravado com pessoa falando. Anúncio segue `references/anuncio.md`.

Gera vídeos em que **cada ideia vira um movimento na tela**, narrados como um professor particular dando aula na lousa (detalhista, conta completa para cada caso, regra com a fonte), com identidade visual fixa e espaçamento limpo.

O valor desta skill está nos arquivos testados — não os reescreva do zero:
- `template/explainer.py` — `ExplainerScene`: layout com área segura do Reels, paleta, voz sincronizada, auditoria de margem e de espaçamento, caixas de destaque, leitura das falas do roteiro, `painel`/`mostra_em_painel` (bloco de dados que cresce) e `titulo_rico` (título com "Passo N:" em negrito).
- `template/estilos.py` — os 14 estilos (paleta, fontes, fundo, título, mão, brilho, digitação). Cada cena escolhe o seu com `ESTILO = "..."`; o código da cena não muda.
- `template/remotion/` — projeto Remotion com o kit dos mesmos estilos e dos formatos (3D, Lottie, Ken Burns, boneco...) e o kit retro (`kit/retro.tsx`: etiquetas, setas, checklist, riscar, cartão com vídeo, meio-tom, mão, retrato que fala, câmera, legenda em recortes, efeitos), para cenas em React (`RemotionScene`).
- `template/remotion/src/kit/arte.tsx` — `<Desenho>` e `<Arte>`: 80 estilos de arte feitos em código (Anidoodle, 32; Huashu, 48), com o desenho se fazendo no tempo da fala. Ver `references/estilos-arte.md`.
- `scripts/render.py` também soma os efeitos sonoros do Remotion à voz e põe a trilha (`MUSICA`) com ducking.
- `scripts/render.py` — renderiza cada cena num processo com timeout (Manim, e o Remotion quando a cena é `RemotionScene`) e junta tudo num MP4 com o áudio alinhado.

**Arquivos da skill** (`<skill>` = `.claude/skills/manim-explainer/` na raiz do repositório):

```
<skill>/
├── SKILL.md
├── template/
│   ├── explainer.py      # base de todas as cenas (ExplainerScene, RemotionScene)
│   ├── estilos.py        # os 14 estilos; lido direto da skill (não precisa copiar)
│   ├── capa.py           # capa_grupo(): capa no primeiro quadro
│   ├── exemplo.py        # vídeo de 2 cenas
│   ├── exemplo_estilos.py # a mesma cena em todos os estilos (comparar e testar)
│   ├── exemplo_formatos.py # cada formato pronto numa cena curta
│   ├── exemplo_anuncio.py  # anúncio de story no estilo retro (desenho em remotion/src/cenas/Anuncio.tsx)
│   └── remotion/         # projeto Remotion: kit (estilos, formatos, retro, arte, 3D, Lottie) + cenas Exemplo, Formatos, Anuncio e Galeria
│       ├── src/anidoodle/ # motor Anidoodle (Apache-2.0): 32 estilos de material desenhados em código
│       └── public/       # retro/ (kraft, jornal, mão, cavalheiro), sfx/ (efeitos), huashu/ (motor Huashu, MIT: 48 estilos), exemplos
├── fonts/                # fontes dos estilos (licenças OFL/Apache junto)
├── assets/               # mão com caneta (estilo quadro)
├── scripts/
│   ├── render.py         # renderiza, refaz cenas com falha, junta e gera o _celular.mp4
│   ├── contact_sheet.py  # folha de frames para revisar
│   ├── juncoes.py        # acha emendas de vogal que a voz engole
│   ├── amostras.py       # 3 amostras de áudio de 30–40 s (opcional)
│   ├── sincronia.py      # confere voz do vídeo final contra cada cena
│   ├── carrossel.py      # vídeo pronto -> carrossel do Instagram (PNG 1080x1350)
│   ├── clone.py          # põe o vídeo do clone de IA num círculo no canto
│   ├── gravura.py        # foto -> recorte em meio-tom ou traço de gravura (estilo retro)
│   ├── sfx.py            # refaz os efeitos sonoros (sintetizados, livres)
│   └── texturas_retro.py # refaz o kraft e as tiras de jornal do estilo retro
└── references/
    ├── narrativa.md      # roteiro, tom, questões resolvidas, voz (aula)
    ├── anuncio.md        # modo anúncio: oferta, estrutura, ritmo, CTA, área segura do story
    ├── estilo.md         # regras visuais e de espaçamento
    ├── estilos-arte.md   # os 80 estilos de arte (Anidoodle e Huashu): galeria, uso, conteúdo próprio
    ├── anidoodle/        # receitas e método do Anidoodle
    └── huashu/           # receitas do Huashu
    └── api.md            # API do template, receitas e armadilhas
```

## Estilos e motores

**14 estilos**, escolhidos por cena com `ESTILO` (padrão `"documentario"`). Um vídeo pode misturar: gancho em colagem, teoria em Bauhaus, questão no quadro, resumo no papel.

| Estilo | Visual | Quando usar |
|---|---|---|
| `documentario` | fundo escuro, LaTeX, cor com significado (3Blue1Brown) | padrão; matemática densa |
| `quadro` | quadro branco com moldura, letra de marcador; **mão desenha cada elemento** | resolução de questão, "professor na lousa" |
| `lousa` | quadro verde de giz com moldura de madeira; **mesma mão** | aula clássica de cursinho, público de concurso |
| `papel` | caderno pautado, letra de mão, tinta azul-marinho | anotação, resumo, passo a passo leve |
| `envelhecido` | papel antigo amarelado (grão, manchas, bordas queimadas, pauta desbotada), letra de mão, tinta sépia | questão e resumo com cara de caderno antigo |
| `colagem` | kraft, recortes com sombra, fita, título em letras recortadas | gancho, contexto, comparação |
| `retro` | colagem retrô editorial: kraft, tiras de jornal antigo, faixa diagonal vermelha, gravuras em meio-tom, etiquetas preto/vermelho/amarelo/creme; kit completo no Remotion (`kit/retro.tsx`) | anúncio, gancho, lista, "antes e depois", quebra de objeção |
| `recorte` | papel recortado em camadas (céu, nuvens, morros), letra arredondada; combina com `boneco()` | história com personagens (o aluno, o banco) |
| `bauhaus` | creme com formas vermelho/azul/amarelo, tipografia geométrica | conceito, estrutura, abertura de bloco |
| `blueprint` | planta técnica azul, grade, borda, letra de desenhista | elétrica, NBR, projeto, engenharia |
| `darkui` | escuro com brilhos difusos, painéis de vidro, Inter; 3D no Remotion | tecnologia, IA, visual "caro" |
| `terminal` | janela de terminal, fonte mono, **texto entra digitado** | TI, lógica, algoritmo, banco de dados |
| `jornal` | papel-jornal, manchete com fios, serifa clássica | "a questão que derrubou 80%", história |
| `neon` | synthwave escuro, chão quadriculado, **brilho em tudo** | abertura, gancho curto (cansa em vídeo longo) |

- O código da cena é o mesmo em qualquer estilo: escreva com `INK`, `C1`, `C2`, `GOLD`... e o estilo troca as cores sozinho. Texto que muda de fonte vai por `text_tex()`, `label()` e `self.title()`/`titulo_rico()`; `MathTex` segue em LaTeX.
- Estilo padrão do vídeo: uma base no `video.py` (`class _Base(ExplainerScene): ESTILO = "papel"`); a cena diferente sobrescreve `ESTILO`.
- `quadro` e `lousa`: a 1ª animação de desenho de cada `play` vira traço da caneta. `self.hand_away()` tira a mão; `self.point_at(ponto)` aponta; `MAO = False` desliga.
- `terminal`: texto e fórmula entram letra por letra. `neon`: halo da mesma cor em traços e letras. `darkui`: painéis translúcidos.
- Detalhes visuais: `references/estilo.md`.

**80 estilos de arte para o desenho** (só no Remotion), além dos 14: Anidoodle (giz de cera, cianotipia, carvão, lápis de cor, bordado, papel rasgado, retícula de jornal, isométrico, quadrinho a marcador, risografia, low-poly, gravura de linha única, giz na lousa, óleo, pixel art, esferográfica, lápis e aquarela, desenho animado anos 30, álbum de recortes, raspagem, pontilhismo a nanquim, sumi-e, xilogravura ukiyo-e, nanquim e aguada...) e Huashu (rupestre, egípcio, grego, mosaico, vitral, Renascimento, impressionismo, Van Gogh, art nouveau, cubismo, Bauhaus, pop art, 8 bits, nanquim chinês, Klimt, Munch, Seurat, Matisse, Rembrandt, teatro de sombras, miniatura persa...). O desenho entra com `<Desenho film=... t0=...>` ou `<Arte cena=... t0=...>`, na palavra que o nomeia, e o texto da aula fica por cima com o kit de sempre. Para mostrar ao usuário, renderize a composição `Galeria`. Para a aula, desenhe o conteúdo (circuito, gráfico, objeto) com o kit do estilo, não use a demonstração do autor. Tudo em `references/estilos-arte.md`.

**Formatos prontos** (qualquer estilo; Manim e Remotion):

| Formato | Manim | Remotion |
|---|---|---|
| Questão real da banca no topo | `self.questao("q.png", "FGV · 2025")` | `<Questao src="q.png" fonte=...>` |
| Pause e tente (contagem regressiva) | `self.pause_e_tente(5)` | `<PauseETente t0=... segundos={5}>`; na `RemotionScene`, um número em `FALAS` vira silêncio |
| Calculadora financeira animada | `Calculadora()` + `self.teclar(calc, ["3","0","0","PV"], n=n, palavras=[...])` | (use Manim) |
| Lousa infinita (câmera passeia, zoom-out final) | `class X(LousaInfinitaScene)` + `self.ir_para(mob)`, `self.visao_geral()` | (use Manim) |
| Legenda estilo Reels (palavra acende) | `CAPTIONS = "reels"` | `<LegendaReels props={props} s={s}>` |
| Legenda em recortes (bilhete recortado) | `CAPTIONS = "recortes"` | `<LegendaRecortes props={props}>` |
| Retrato que fala (queixo mexe com a voz) | (use Remotion) | `<RetratoFalante props={props} ...>` |
| Etiqueta com seta, checklist, riscar e trocar, cartão com vídeo, mão apontando | (use Remotion) | kit retro (`api.md`) |
| Efeito sonoro | `self.som("pop")` | `<Som nome="pop" t={...}>` (kit retro já toca) |
| Trilha de fundo com ducking | `MUSICA = "trilha.mp3"` no `video.py` | igual |
| Personagens de papel | `boneco(C1, expressao="duvida")` | `<Boneco>` + `<Balao>` |
| Imagem com movimento lento | `self.ken_burns("foto.jpg", n.remaining)` | `<KenBurns src=...>` |
| Animação Lottie | (use Remotion) | `<Animacao src="arquivo.json">` |
| Objeto 3D girando | (use Remotion) | `<Objeto3D forma="icosaedro">` |
| Desenho em estilo de arte se fazendo (80 estilos) | (use Remotion) | `<Desenho film={sumiE} t0=... dur=...>`, `<Arte cena="17_ink">` ou `<Arte desenhar={...}>` |
| Carrossel do Instagram | `python <skill>/scripts/carrossel.py video.py --vertical` (depois do render) | igual |
| Clone de IA no canto | `python <skill>/scripts/clone.py out/<video>_celular.mp4 clone.mp4` | igual |

- Questão da banca: use o print real que o usuário mandar e cite a banca e o ano na fala e no rótulo. Nunca invente questão como se fosse de banca.
- Pause e tente: antes, uma fala que convida ("Pause o vídeo e tente resolver antes de continuar."); a contagem roda no silêncio.
- Clone: o vídeo do clone vem de fora (HeyGen ou outro). O script recorta em círculo com borda e põe acima da faixa do Reels; `--audio clone` usa a fala do clone no lugar da narração.
- Imagens, fotos, trilhas e Lottie vêm do usuário (ou de bancos livres); a skill não gera imagem nem música. No Remotion, ficam em `remotion/public/`. Exceções que já vêm na skill: texturas e desenhos do retro (`public/retro/`) e efeitos sonoros (`public/sfx/`). Foto vira gravura recortada com `scripts/gravura.py`.
- Modelos: `template/exemplo_formatos.py` (Manim) e `template/remotion/src/cenas/Formatos.tsx`.

**2 motores**, no mesmo vídeo e com a mesma voz:
- **Manim** (padrão): cenas `ExplainerScene` no `video.py`.
- **Remotion** (React): para tipografia cinética, colagem com recortes animados, traço à mão (rough.js) e layouts de cartaz. A cena vira `RemotionScene` no `video.py` (só as falas) e o desenho fica em `remotion/src/cenas/<Cena>.tsx`. O Manim gera a voz e os tempos de cada palavra; o `render.py` renderiza a composição com esses tempos e troca a imagem da cena, mantendo o áudio. Junção, `_celular.mp4` e `sincronia.py` seguem iguais.
- Escolha: Manim para conta, gráfico, geometria, calculadora e lousa infinita; Remotion para texto em movimento, recortes, cartaz, 3D, Lottie, personagens com balão e os 80 estilos de arte. Na dúvida, Manim.
- Motion Canvas/Revideo (usado no vídeo `inequacao-trig`) não faz parte da skill: faz o mesmo que o Remotion.

## Fluxo

### 0. Aula ou anúncio?
Anúncio, criativo, VSL curta ou "vídeo igual a esse anúncio" → **modo anúncio**: leia `references/anuncio.md` antes do roteiro. Lá o gancho, o CTA, o nome da marca, a legenda em recortes, a música e os efeitos são parte do formato, e o fecho "Salve este vídeo..." não entra. O resto deste fluxo (aprovações, quadros completos, rascunho no GitHub) vale igual. Estilo padrão do anúncio: `retro`, com a cena em Remotion (modelo `exemplo_anuncio.py` + `Anuncio.tsx`).

### 1. Briefing (rápido)
Descubra, sem interrogar: tema, público, se tem questão resolvida, formato e estilo (um só ou misturado por cena; se o usuário não disser, proponha no resumo das cenas, ex.: gancho em colagem, teoria em Bauhaus, questão no quadro). **Neste repositório o padrão é 9:16 (Reels)**; pergunte o formato antes do roteiro se houver dúvida, pois trocar depois obriga a refazer layout e âncoras (cada formato fica na sua pasta, ex.: `videos/tema/` e `videos/tema-reels/`). Assuma o resto e diga o que assumiu. O conteúdo define a duração, inclusive no Reels: não há limite de tempo, não corte conteúdo para caber em 3 min.

### 1b. Tema baseado em norma ou projeto técnico: checklist antes do roteiro
Antes de escrever, monte o checklist dos requisitos da norma que se aplicam ao caso (ex.: NBR 5410 numa casa: previsão de cargas, divisão de circuitos, seção mínima, capacidade com fatores de agrupamento e temperatura, neutro e terra, eletroduto (taxa de ocupação), disjuntor (Ib ≤ In ≤ Iz e capacidade de interrupção), DR, DPS, esquema de aterramento, equipotencialização, queda de tensão, banheiro (volumes), quadro: reserva, identificação e advertência). Confira o projeto item por item e mostre o checklist ao usuário. Montar o projeto só pelos temas conhecidos deixou de fora o espaço de reserva do quadro e mais sete itens no vídeo da NBR 5410. Item ou número de tabela que não conseguir confirmar: não cite o número, diga só "a norma exige".

### 2. Roteiro (`roteiro.md`, fonte única do texto falado)
**Antes do roteiro, confira toda conta em código** (Python), com o mesmo arredondamento que a tela vai mostrar (ex.: tabela de banco arredonda mês a mês). Prefira dados tabelados que o aluno usaria na prova (fator de valor atual com 6 casas) a potências arredondadas: (1,02)⁶ com 4 casas errava a parcela nos centavos. Os números conferidos ficam no topo do `roteiro.md`.

Escreva seguindo `references/narrativa.md`. O essencial:
- **Base antes do conceito e o porquê de cada regra** — defina período, frequência etc. antes de usar; justifique toda convenção.
- **Tom de professor particular:** conectores ("então", "agora", "ou seja", "por isso", "pois"); **sem vícios** ("olha só", "tá", "né", "beleza"); **sem perguntas retóricas** ("Por quê? Porque…" → "…, pois …").
- **Questões:** enunciado escrito, passos numerados e justificados, desenho sempre visível com valores na forma da conta.
- **Fecho:** "Salve este vídeo para estudar quando precisar." **Sem nome de marca.** (Na aula. Anúncio: `references/anuncio.md`.)
- Rode `python <skill>/scripts/juncoes.py roteiro.md` e reescreva as emendas de vogal que escondem número ou mudam sentido ("um sessenta avos" → "um segundo dividido por sessenta").

Não é preciso aprovar o roteiro palavra por palavra: quem avalia, avalia vendo o vídeo. Dê um resumo das cenas e siga.
**Amostras de voz (opcional):** se o usuário quiser ouvir antes, `python <skill>/scripts/amostras.py roteiro.md` gera 3 trechos de 30–40 s (começo, meio e fim).

### Sincronia: professor no quadro (regra dura)
Cada elemento entra na tela **na palavra que o nomeia**, como um professor que desenha enquanto fala. Ele não desenha uma parte antes e explica depois.
- Nada é desenhado antes de ser falado: eixos, bases de gráfico, legendas, cabeçalhos de tabela, molduras e rótulos também só entram quando a fala chega neles.
- O que a fala nunca menciona não aparece (ex.: valores de cada coluna, marcas de eixo, cartão vazio em volta do enunciado). Se o elemento é necessário, escreva a frase que o apresenta no roteiro ("Cada coluna aqui é um mês…").
- No código, todo `play` que mostra algo vem depois de um `n.wait_until("palavra")` com a palavra que o nomeia. Revise a cena procurando `play` no início da fala sem âncora.
- Na revisão das folhas de frames, pergunte em cada quadro: tudo o que está na tela já foi dito?
- **Nada de pedaço solto.** Rótulo, frase e equação entram inteiros. Primeiro o desenho com seus rótulos (barra "parcela", depois "juros", depois "amortização"); a equação vem completa depois, com fala própria ("ou seja, a parcela é igual aos juros mais a amortização"). Nunca mostre "parcela =" sozinho esperando o resto.
- **Dados do problema como variáveis, uma por linha** (`PV = R$ 300.000`, `i = 1% ao mês`, `Δt = 30 anos`), cada uma na palavra que a diz, dentro de um bloco com fundo que cresce junto (`mostra_em_painel`). Os pedidos/itens ficam fora do bloco.
- **Bloco ou caixa nunca aparece vazio**, e transição entre telas não sobrepõe conteúdo: tire o que sai antes (ou transforme um no outro) em vez de um surgir por trás do outro.

### 3. Projeto
```
videos/<slug-do-tema>/
├── roteiro.md       # falas: "### A01 — ..." + "**Fala 1:** ..."
├── explainer.py     # cópia de <skill>/template/explainer.py
├── video.py         # cenas, na ordem do vídeo
├── remotion/        # só se houver RemotionScene: cópia de <skill>/template/remotion (sem node_modules)
└── out/             # MP4 final (render.py cria; fora do Git)
```
`cp <skill>/template/explainer.py <skill>/template/capa.py videos/<slug>/`. O `estilos.py`, as fontes e a mão são lidos direto da skill (fonte única: `git pull` atualiza). Com cena Remotion: `cp -r <skill>/template/remotion videos/<slug>/` (o `render.py` roda `npm ci` na 1ª vez). `media/`, `out/` e `node_modules/` estão no `.gitignore`.

### 4. Código das cenas
Leia `references/api.md` antes da primeira cena. Esqueleto:

```python
from explainer import *
from pathlib import Path

F = falas_do_roteiro(Path(__file__).with_name("roteiro.md"))


class _Teoria(ExplainerScene):
    TITLE_AREA = False            # teoria sem título: a explicação está na voz


class A01_Movimento(_Teoria):
    def construct(self):
        folha = sheet(4, 4, 0.9); setas = basis_arrows(0.9)
        VGroup(folha, setas).move_to(self.zone("visual"))
        with self.narrate(F("A01", 1)) as n:
            self.play(FadeIn(folha))
            n.wait_until("azul")                  # anima quando a palavra é dita
            self.play(GrowArrow(setas[0]))
        self.clear_section()                       # sempre feche a cena limpando a tela


class C03_Passo1(ExplainerScene):               # questão: título de passo + desenho fixo
    def construct(self):
        circ = meu_circuito_pequeno(); self.add(circ)   # o desenho da questão, definido no video.py
        self.title("Passo 1: como os elementos estão ligados?")
        ...
        self.destacar(resultado)                   # caixa com fundo próprio
        self.clear_except(circ)                    # o desenho atravessa os passos
```

**Cena em Remotion:**
```python
class A02_Gancho(RemotionScene):
    ESTILO = "colagem"                      # chega no React em props.estilo
    FALAS = [F("A02", 1), F("A02", 2)]      # o que é falado; o desenho fica em remotion/src/cenas/A02_Gancho.tsx
```
No `.tsx`, use o kit (`remotion/src/kit/`): `at(props, "palavra", fala, nth)` dá o segundo em que a palavra é dita (mesma regra do `wait_until`), `Palco` põe o fundo do estilo, `Titulo`, `Texto`, `Cinetica`, `Recorte`, `Destaque`, `Traco` (traço à mão com `rascunho(rough...)`), `Boneco`/`Balao` e os formatos de `kit/formatos.tsx`. Registre a cena em `remotion/src/cenas/index.ts` com o mesmo nome. Desenhe em 1080x1920 (9:16) ou 1920x1080, respeitando a área segura do Reels (topo ~230 px, rodapé ~384 px). Modelo completo: `template/remotion/src/cenas/Exemplo.tsx`.

Padrões do template: voz `pt-BR-ThalitaMultilingualNeural`, cada fala gerada inteira, idioma pt-BR declarado; **sem legenda** (`CAPTIONS = False`); área segura do Reels em 9:16. No anúncio: `RATE = "+8%"`, legenda em recortes, `MUSICA` e efeitos.

**Cena no estilo retro (Remotion):** use o kit `kit/retro.tsx` (componentes por tempo `t`, com efeito sonoro na entrada): `Etiqueta` com `seta`, `Checklist`, `Riscar`, `CartaoFoto` (imagem ou mp4), `MeioTom`, `Faixa`, `MaoAponta`, `RetratoFalante`, `Camera`, `LegendaRecortes`, `Som`. Uma tela por fala, e tudo da tela sai 0,25 s antes da próxima fala (sem tela vazia no meio). Detalhes em `api.md`; modelo em `cenas/Anuncio.tsx`.

**Circuitos (elétrica, eletrônica):** use o kit do template, não desenhe à mão: `fio`, `diodo`, `zener`, `resistor`, `capacitor`, `indutor`, `fonte_ac`, `terra`, `ponte_diodos` e `tinge` (acende o traço). Os símbolos vêm deitados no eixo x; gire com `.rotate(PI / 2)`. Desenhe o fio inteiro e ponha o símbolo por cima (a máscara esconde o fio). Rótulo de componente fica fora do circuito ou embaixo do fio, nunca entre dois componentes (o "C" e o "carga" se sobrepuseram no filtro com capacitor). Blocos de diagrama (transistor, referência, amplificador) vão em `caixa_texto()`.

### 4b. Capa no primeiro quadro
O primeiro quadro do vídeo é a miniatura do Reels, e tela preta no começo afasta. Toda abertura começa com uma **capa**: título grande (2 linhas, a 2ª em GOLD), subtítulo curto, o desenho que mostra o resultado final do vídeo (ex.: a planta pronta) e um selo dourado ("passo a passo completo"), dentro da área segura. Na 1ª cena: `self.add(capa)` antes da primeira fala (sem animação, para o quadro 0 já ser a capa) e `FadeOut(capa)` na primeira âncora do conteúdo. Antes, gere 2 ou 3 opções como imagem (`manim -s -r 1080,1920 capas.py CapaA`), mostre ao usuário e use a escolhida.

### 5. Prévia → revisar → corrigir
```bash
python "<skill>/scripts/render.py" video.py --vertical --no-tts --jobs 4   # 9:16, 960p15, rápido, 4 cenas por vez
python "<skill>/scripts/contact_sheet.py" media/preview_v/videos/video/960p15/*.mp4 --n 8 --cols 8 --width 270 --out sheets
```
Olhe as folhas de frames de **todas as cenas** (Read nas PNGs) antes de mostrar ao usuário. Corrija:
- todo aviso `[layout]` (fora da margem), todo `[caixa]` (texto passando da borda da caixa em que está) e todo `[espaço]` que envolva texto (elementos encostados);
- texto pequeno, objeto cortado, tela cheia demais. Não coube? **mostre em etapas**, não esprema.

Para iterar numa cena: `--only A03_Nome`.

Os avisos `[espaço]` entre formas de gráfico (linhas, barras, pontos, eixos) e entre pedaços da mesma frase já são ignorados pela auditoria; o que sobra merece atenção.

**Fonte do estilo é mais larga que o LaTeX:** o blueprint (caixa-alta) e a colagem (máquina de escrever) estouraram linhas que cabiam no documentário. Rode a prévia já no estilo final de cada cena. Texto em caixa ou cartão vai por `caixa_texto()` (a caixa cresce e a linha quebra sozinha); rótulo longo solto vai por `quebra_linhas()`. Nunca encolha a fonte para caber.

**Conteúdo nunca passa da borda da caixa** (regra do usuário). Nem no pulso: ver "Pulsar resultado em caixa" em `api.md`.

**Cena com título:** posicione o desenho com `self.topo(grupo)` (alinha logo abaixo do título), não com coordenada fixa; coordenada fixa invadiu o título em seis cenas do vídeo do filtro com capacitor.

**Largura no 9:16:** a área útil vai de x = −3,3 a 3,3 (6,6 de largura). Linha de texto alinhada em −3,2 cabe até ~6,3; em painel (`painel`/`mostra_em_painel`), o fundo soma ~0,4 de cada lado, então alinhe o texto em −2,8. Antes de escrever uma linha longa, meça (`mob.width`) e quebre em duas se passar. Só mande para o rascunho com voz depois de **zero `[layout]`** na prévia sem voz.

### 5b. Rascunho com voz → aprovação do usuário
**Quadros completos para aprovação (antes do rascunho):** rode a prévia com `QUADROS=quadros` no ambiente (`QUADROS=quadros python <skill>/scripts/render.py video.py --vertical --no-tts --jobs 4`). O template salva a tela no fim de cada fala (`quadros/<Cena>_NN.png`), com todos os elementos já na tela. Monte uma folha por cena (ou um PDF com uma página por cena) e mande ao usuário; ele aprova pelos quadros antes de gastar render com voz.

Com a prévia limpa e os quadros aprovados, renderize o **rascunho**: 540x960, 30 fps, com voz (`--rascunho`; no GitHub, `qualidade=rascunho`). No GitHub, com uma máquina por cena, um vídeo de 11 min e 20 cenas saiu em ~6 min. Entregue o `_celular.mp4` e espere o usuário aprovar. **O final em 1080p só depois da aprovação**: cada final leva perto de uma hora. Durante renders longos, mande o tempo restante a cada 3 min se o usuário pedir.

### 6. Final e entrega
```bash
python "<skill>/scripts/render.py" video.py --final --vertical --jobs 3    # 1080x1920, 30 fps (em background)
python "<skill>/scripts/sincronia.py" video.py --vertical                  # voz alinhada? (>= 99% em toda cena)
```
Com `--final`, o `render.py` gera dois arquivos em `out/`: o master (30 fps, áudio 48 kHz; 60 fps era desperdício, pois a cópia de celular já sai em 30) e o **`_celular.mp4`** (30 fps, AAC 44,1 kHz, volume normalizado em −16 LUFS). **Entregue sempre o `_celular`**: o master pareceu mudo no celular do usuário. Lembre de dizer que a prévia dentro do chat pode abrir sem som; o certo é baixar e abrir.

Revise frames do final nas cenas que mudaram. Depois de corrigir uma cena, renderize **só ela** (`--final --vertical --only CENA`) e refaça a junção com `--concat-only`. Entregue o MP4 (SendUserFile) com o que mudou e como foi verificado.

## Regras de estilo (por quê)
Detalhes em `references/estilo.md`. Valem para os 14 estilos e para os 2 motores.
- **Lousa de professor.** Pergunte em cada cena: o professor escreveria um título aqui? Ele escreve o cabeçalho de uma lista ("Circuitos:"), de uma conta ("Cálculo da queda de tensão:"), de uma regra ("Iluminação (item 9.5.2.1)"), de uma tabela ("Quadro de previsão de cargas:"). Num gancho ou numa intuição desenhada, não escreve. Nunca uma lista solta sem cabeçalho.
- **Detalhista: conta completa para cada caso.** Se a regra se aplica a seis cômodos ou cinco circuitos, a conta aparece (e é falada) para cada um, não só para o primeiro. O tempo do vídeo não importa.
- **O quê, por quê, como, e de onde vem.** Toda regra entra com o que é, por que existe, como se aplica e a fonte (item da norma, tabela, lei). Exemplo aplicado quando ajudar.
- **Aula x anúncio.** Gancho de efeito, CTA, marca, legenda queimada e música são do anúncio (`references/anuncio.md`); na aula continuam fora.
- **Sem legenda central na tela vazia.** Foi testada e o usuário pediu para tirar (`LEGENDA_CENTRAL = False`). Tela vazia com voz: comece a escrever logo, em vez de pôr texto de apoio.
- **Nada encosta em nada.** Espaço mínimo entre todos os elementos; quando não couber, etapas.
- **Legível no celular.** Fontes grandes; só a linha larga encolhe, nunca o bloco.
- **Resultado em caixa com fundo tingido** (`destacar`): contraste chama o olho.
- **Cor = significado, sempre o mesmo** (C1 azul, C2 laranja, GOLD total/destaque).
- **3D só pontual,** onde ajuda a entender.
- **Animação no tempo da fala:** `n.wait_until("palavra")` e `run_time=n.until("palavra")`; nunca adivinhe segundos.
- **`clear_section()` entre ideias** (ou `clear_except` para manter o desenho da questão).

## Ambiente (sessão na nuvem)
Se o Manim não estiver instalado:
```bash
apt-get install -y libcairo2-dev libpango1.0-dev pkg-config texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-science dvisvgm cm-super lmodern
```
```bash
python3 -m venv /home/user/.venv-manim && /home/user/.venv-manim/bin/pip install -U pip setuptools wheel && /home/user/.venv-manim/bin/pip install manim edge-tts
```
Rode os scripts com `/home/user/.venv-manim/bin/python`. A voz precisa do host `speech.platform.bing.com` liberado na rede do ambiente; o template já passa o proxy (`HTTPS_PROXY`) ao edge-tts. A legenda opcional usa a fonte Inter.

### Voz bloqueada na nuvem → render no GitHub Actions
Na sessão do Claude na nuvem o edge-tts costuma estar bloqueado. Teste uma vez (`edge-tts -t "Teste." --write-media t.mp3`); se falhar, não insista: faça a prévia sem voz (`--no-tts`) e o final pelo GitHub:
1. Edite `.github/render-pedido.txt` (`pasta=videos/<tema>`, `qualidade=rascunho|final`, `vertical=true|false`), faça commit e push em `main`. Isso dispara o workflow **Renderizar vídeo** (`.github/workflows/render.yml`), que instala Manim, LaTeX e edge-tts (e o Remotion, se o vídeo tiver a pasta `remotion/`), renderiza com a voz e refaz sozinho as cenas em que a voz falhar (até 3 vezes). Uma máquina por cena: o rascunho de um vídeo de 11 min com 20 cenas levou ~6 min de relógio. A cota de 2.000 min grátis/mês conta a soma das máquinas (20 cenas × alguns min cada), não o tempo de relógio.
2. Acompanhe com `gh api repos/<dono>/<repo>/actions/runs?per_page=1` até `completed success`.
3. O download de Artifacts costuma ser bloqueado na sessão. Escreva `run_id=<id>` em `.github/publicar-pedido.txt` e faça push: o workflow **Publicar vídeo** copia os MP4 para o ramo `renders`.
4. `git clone --depth 1 -b renders <repo>` e entregue o arquivo `…_celular.mp4` de `videos/`.
A sessão não tem permissão de disparar nem cancelar workflow pela API (403); por isso os disparos são por arquivo de pedido. **Para cancelar** renders em andamento, escreva qualquer linha nova em `.github/cancelar-pedido.txt` e faça push: o workflow **Cancelar renders** cancela todas as execuções do "Renderizar vídeo" em andamento.
A junção das cenas é feita uma cena por vez (concat demuxer); juntar todas num filtro só estourou a memória do GitHub com 41 cenas em 1080p.

## Quando algo dá errado
- **Render parado por minutos:** o Manim pode travar depois de uma exceção; `render.py` corta por timeout e mostra o log — leia o traceback.
- **Erro de LaTeX:** em `MathTex` escreva LaTeX cru (escape `%` como `\%`); decimal com vírgula: `4{,}4`.
- **Texto saiu como "extbf" ou "ext{":** a string não era crua e `\t` virou tabulação. Todo texto com LaTeX vai em `r"..."`, inclusive quando o código é gerado por outro script.
- **Palavra pronunciada em outro idioma:** a fala foi picada em trechos curtos ou o idioma não foi declarado. Gere a fala inteira (o template já faz) e não fragmente para dar ênfase.
- **Palavra com vogal errada** ("vólts" em vez de "vôlts"): acrescente na tabela `PRONUNCIA` do template (`explainer.py`). Vale só para o áudio e para todos os vídeos; volt/volts já estão lá.
- **Palavras emendadas** ("sessenta vós"): `juncoes.py` e reescreva o trecho. O serviço recusa `<break>` e `<lang>`.
- **Voz cortada, adiantada ou atrasando a cada cena no vídeo final:** a junção não completou o áudio de cada cena ou emendou pedaços AAC (cada um soma ~30 ms de atraso). O `render.py` atual emenda em WAV e codifica uma vez; refaça a junção com `--concat-only` e confira com `sincronia.py` (aceita `--rascunho`).
- **Algo para de se mover nas esperas:** updater sem `dt` (ver `api.md`).
- **Efeito sonoro não toca:** nome fora da lista (`public/sfx/`), ou `t` antes do início da cena. No Manim, `self.som()` quebra com o nome errado.
- **Música não entrou:** o arquivo de `MUSICA` não está na pasta do vídeo (o `render.py` avisa) ou não foi commitado (render no GitHub).
- **Retrato com o queixo cortado torto:** ajuste `boca={{y, y1, x0, x1}}` (frações da imagem); `y` é a linha da boca, `y1` o fim do queixo.
- **Cena Remotion falhou:** o `render.py` mostra o erro do Remotion. Palavra de `at()` ausente na fala quebra igual ao `wait_until`. Sem Chrome na máquina, defina `CHROME_PATH`. Teste a composição no estúdio: `cd remotion && npm run estudio`.
- **Símbolo de circuito virou um bloco de cor ao acender:** `set_color` pinta também o fundo (a máscara) do símbolo. Use `tinge(simbolo, GOLD)` ou `set_stroke(cor)` só nos traços.
- **Texto passa da borda da caixa (`[caixa]`):** a caixa foi feita com tamanho fixo. Use `caixa_texto()`, que cresce com o texto, e ligue os fios nas bordas da caixa (`g[0].get_left()`...), não em coordenadas fixas.
- **Cor de um elemento não mudou com o estilo:** a cor foi escrita em hex solto; use as constantes (`INK`, `C1`, `GOLD`...). Texto feito com `Tex(...)` direto não troca de fonte; use `text_tex()`.
- **`ValueError: palavra 'x' não está na narração`:** a âncora não está na fala (ou o roteiro mudou). Confira o texto; repetida, use `nth=2`.
