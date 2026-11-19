# Estilo visual

Base: documentário matemático (fundo escuro, LaTeX, cor com significado), ajustado com as
correções de um usuário professor em vídeos 9:16 para Reels.

## Texto na tela
- **Título como na lousa.** Pense no professor escrevendo no quadro. Ele escreve o cabeçalho quando vai listar, calcular, enunciar uma regra ou montar uma tabela: "Etapas do projeto:", "Circuitos:", "Cálculo da corrente de cada circuito:", "Iluminação: a regra (item 9.5.2.1)", "Quadro de cargas:". Lista sem cabeçalho não existe. Em gancho, intuição desenhada ou planta que ocupa a tela toda, ele não escreve título (`TITLE_AREA = False`).
- **Sem legenda central na tela vazia.** Foi testada e o usuário pediu para tirar (`LEGENDA_CENTRAL = False`). Tela vazia com voz: comece a escrever logo, em vez de pôr texto de apoio.
- **Sem legenda queimada no vídeo** (`CAPTIONS = False`, padrão). Quem lê a legenda não vê o desenho; quem quiser legenda usa a automática da plataforma. Se o usuário pedir legenda, `CAPTIONS = True` liga a faixa própria (fonte sem serifa, fundo escuro, palavra falada acesa).
- **Legível no celular:** fórmulas 46–62, rótulos 34–44, nada abaixo de ~32. Se uma linha não couber na largura, só ela encolhe (`empilhar`); nunca encolha o bloco todo.

## Espaçamento (regra dura)
- **Nenhum elemento encosta em outro:** texto em texto, texto em figura, figura em figura. Mínimo de ~0,2 entre vizinhos e ~0,5 entre linhas de uma resolução.
- **Não coube? Mostre em etapas,** não esprema: a primeira linha sai e a segunda entra; o resultado entra no lugar das contas intermediárias; a figura sai antes da próxima conta.
- A auditoria do template imprime `[espaço]` quando dois elementos se tocam e `[layout]` quando algo sai da margem. Antes de entregar, corrija **todo** aviso que envolva texto. Camadas intencionais (curva dentro dos eixos, caixa em volta do próprio texto, setas saindo do mesmo ponto) podem ficar.
- Caixa de destaque (`caixa`/`destacar`) com `buff=0.2` precisa de pelo menos ~0,5 até a linha vizinha.

## Anotações e comparações
- Texto que compara dois valores (diferença, "+269 mil") fica **fora** do espaço entre eles, ao lado (à direita da barra maior, com chave), longe dos dois números. Entre as barras ele cola no valor menor.
- Quando não couber na largura do 9:16, **quebre a linha** ou mostre em etapas. Não encolha o bloco com `scale_to_fit_width`: o texto fica pequeno demais no celular.

## Atributos pré-atentivos (texto não pode ficar uniforme)
Use contraste para o olho achar o que importa antes de ler, sem exagerar (1 ou 2 por bloco):
- **Negrito** em nomes e rótulos (Price, SAC, letras dos itens a) b) c), "Passo 1:" do título em dourado).
- **Cor com significado** nos dados: variável de juros em laranja, resultado/fator em dourado; o resto em INK.
- **Fundo sólido** para blocos de dados (painel escuro com faixa de cor à esquerda) e **faixas alternadas** em listas (resumo).
- **Sublinhado** na palavra-chave de uma regra ("amortização \underline{constante}", "\underline{menos no total}").
- **Contorno tracejado** na fórmula geral, caixa sólida no resultado.
- Dados do problema ficam num bloco com fundo; os itens/pedidos ficam fora do bloco.
- Dados entram como variáveis, uma por linha (PV = …, i = …, Δt = …), cada uma quando é dita; o painel cresce junto.

## Caixas com texto
- **O conteúdo nunca passa da borda da caixa** (regra do usuário). A caixa cresce com o texto (`caixa_texto`) e a linha longa quebra em duas; nunca encolha a fonte.
- As fontes dos estilos são mais largas que o LaTeX (blueprint em caixa-alta, colagem em máquina de escrever): meça no estilo final.
- Fios de diagrama ligam nas bordas da caixa, nunca atravessam o texto.

## Destaque
- Resultado importante vai numa **caixa com fundo escuro tingido da cor** (`destacar(mob, cor)`), não só contornado: o contraste do texto colorido sobre o fundo é o que chama o olho.
- Dentro de uma equação, destaque partes com `caixa(parte, C1/C2, buff=0.1)` (ex.: parte real e imaginária).

## Composição em 9:16 (Reels)
- **Área segura:** topo ~12% (perfil/áudio), rodapé ~20% (descrição e botões) e laterais ficam livres. A faixa vazia embaixo é intencional. O template já calcula as zonas.
- Zona `visual` (cima) e `side` (baixo). Sem título, a zona de cima ganha o espaço do topo.
- No máximo 3–4 grupos na tela; espaço vazio é intencional.

## Desenhos de questão (circuitos etc.)
- Compacto, fixo no topo durante a resolução, rótulos grandes e com folga entre si (alargue o desenho em vez de apertar rótulos).
- Valores na forma da conta (220∠0° V, j60 Ω, −j20 Ω).

## Cor
| Cor | Papel |
|---|---|
| C1 azul | 1ª grandeza (ex.: tensão), parte real/resistiva (R, P) |
| C2 laranja | 2ª grandeza (ex.: corrente), parte reativa (X, Q) |
| GOLD | total, destaque, resultado (Z, S, θ) |
| BAD vermelho | impossível, erro |
| GOOD verde | conferência certa (✓), use pouco |
| INK | texto e bordas |
| MUTED | eixos, notas secundárias |

Escolha o papel de cada cor no início e mantenha até o fim.

## Movimento
- Entradas: `FadeIn` (shift sutil), `Create` para linhas, `GrowArrow` para setas, `Write` só para texto/fórmula.
- **3D só em momentos pontuais** que ajudam a entender (ex.: a espiral do fasor vista de lado e de frente; um triângulo girando no espaço). Faça em 2D com projeção manual (ver `api.md`), para manter o layout do template.
- Saídas: `clear_section()` (ou `clear_except(...)` para manter o desenho da questão).

## Tipografia e fundo
- Fórmulas e textos do conteúdo em LaTeX (Latin Modern). Sem negrito decorativo nem caixa-alta.
- Fundo `#0B1016`, não preto puro.

## Os estilos (`ESTILO` por cena)
Tudo acima vale para todos: espaçamento, área segura, cor com papel fixo, professor na lousa. Muda o visual:

| | documentario | quadro | papel | colagem | bauhaus |
|---|---|---|---|---|---|
| Fundo | `#0B1016` | branco + moldura preta grossa | caderno creme, pauta azul, margem vermelha, furos | kraft, tiras rasgadas, retícula num canto | creme, círculo amarelo, quarto de círculo vermelho, triângulo azul, barra preta |
| Texto (`text_tex`, `label`) | LaTeX | Kalam negrito, caixa-alta | Caveat negrito | Special Elite (máquina de escrever) | Josefin Sans negrito |
| Título | LaTeX | Bangers vermelho, caixa-alta, escrito pela mão | Caveat sublinhado com marca-texto | cada palavra num recorte de cor (Abril Fatface + Special Elite) | Josefin caixa-alta com quadrado vermelho |
| Caixa / painel | fundo escuro tingido | fundo claro tingido | fundo claro tingido | recorte de canto reto com sombra | canto reto, fundo claro |
| Entrada | FadeIn/Create | **a mão desenha** (Create/Write/FadeIn viram traço da caneta) | igual ao documentário | igual | igual |

**Os outros 7:**

| | Fundo | Texto / título | Particularidade |
|---|---|---|---|
| lousa | verde de giz, moldura de madeira, manchas de giz apagado | Kalam / Cabin Sketch, sublinhado ondulado | **mão desenha** (igual ao quadro); cores de giz pastel |
| blueprint | azul de planta, grade fina e grossa, borda (sem carimbo no canto: o usuário pediu para tirar) | Architects Daughter caixa-alta, sublinhado duplo | cantos retos; tudo claro sobre azul |
| darkui | quase preto, brilhos difusos azul/roxo/laranja, grade de pontos | Inter negrito, barra azul antes do título | painel e caixa translúcidos (vidro); 3D no Remotion |
| terminal | barra de janela com 3 botões ("aula.sh"), prompt `$ _` | JetBrains Mono, título com `>` e cursor | **texto entra digitado**, letra por letra |
| recorte | céu, nuvens e morros de papel em camadas com sombra | Fredoka / Luckiest Guy numa faixa laranja | caixa com sombra de papel; feito para `boneco()` |
| jornal | papel-jornal com textura, cabeçalho "EDIÇÃO EXTRA" com fios | Libre Baskerville / Playfair Display entre fios | cantos retos, cores sóbrias |
| neon | roxo-preto, chão quadriculado magenta, sol listrado (9:16) | Orbitron / Monoton (espaço largo entre palavras) | **brilho** em todos os traços e letras |

- Cores: cada estilo tem C1 azul, C2 laranja, GOLD (dourado escuro nos fundos claros, para ler bem), BAD, GOOD. O papel da cor não muda entre estilos.
- Nos estilos claros, o GOLD é mais escuro (ocre): legível em texto grande. Para destacar resultado, prefira `destacar()` (fundo amarelo-claro) a texto dourado solto.
- Os enfeites do fundo ficam no topo e no rodapé (no 9:16, embaixo da interface do Reels) e nunca na área útil.
- Misturar estilos: troque de estilo entre cenas, não no meio. Uma regra que funciona: gancho em colagem, jornal ou neon; conceito em Bauhaus ou blueprint; conta/questão no quadro, na lousa ou no documentário; resumo no papel. No máximo 3 estilos por vídeo, senão perde a identidade.
- Neon cansa: só abertura e vinhetas curtas. Terminal: só tema de TI. Jornal: gancho com dado ou história.
- Mão (quadro e lousa): só a 1ª animação de desenho de cada `play` usa a mão; as outras do mesmo `play` entram normais. Para a mão desenhar duas coisas em sequência, use dois `play`. Ela sai sozinha no `clear_section`.

## Remotion
Formatos e ferramentas que só o Remotion tem: objeto 3D girando (`Objeto3D`, Three.js), animação Lottie (`Animacao`), personagem com balão de fala (`Boneco` + `Balao`).

As cenas Remotion usam as mesmas paletas, fontes e fundos (`remotion/src/kit/estilos.ts` espelha o `estilos.py`): cortar de uma cena Manim para uma Remotion no mesmo estilo não muda o fundo. Use o Remotion para o que ele faz melhor:
- **Tipografia cinética:** palavra-chave grande que salta na palavra falada (`Cinetica` + `pop`).
- **Colagem animada:** recortes que caem e assentam com sombra e fita (`Recorte`).
- **Traço à mão:** esboço com rough.js desenhado aos poucos (`Traco` + `rascunho`), hachura no preenchimento.
- **Cartaz:** composição livre com CSS (grade, blocos de cor, texto grande).
As regras de sincronia continuam: cada elemento entra na palavra que o nomeia (`at(props, "palavra")`), nada antes da fala, nada sem fala.

## Estilo retro (colagem retrô editorial)
- **Fundo fixo:** kraft com grão, tira de jornal antigo rasgada no topo e no rodapé (moram nas áreas da interface do Reels) e faixa diagonal vermelha. Telas de anúncio trocam a faixa de lado e de cor (`<Faixa>`).
- **Paleta curta:** preto, vermelho (#C8202A), amarelo (#F2CF3B), creme e branco. Etiqueta escura com letra creme; etiqueta clara com letra preta.
- **Tipografia de bilhete recortado:** palavra-chave em etiqueta de papel rasgado com sombra dura, levemente torta (−6° a 6°). Grossa (Archivo Black) para o principal, slab (Alfa Slab One) para destaque, máquina de escrever (Special Elite) para apoio. No máximo 3 etiquetas novas por tela.
- **Imagem:** gravura ou foto em meio-tom recortada, com borda de papel; vídeo dentro de cartão com fita. Mão de gravura e setas grossas apontam para o que a fala nomeia.
- **Movimento:** entrada em "pop" curto (0,4 s) com passada, tremor leve de câmera, soco de zoom nas palavras fortes; nada fica parado mais de 2 s.
- **Uso:** gancho, contexto, comparação e anúncio. Para conta longa, troque para `envelhecido` ou `quadro` na cena da conta.
