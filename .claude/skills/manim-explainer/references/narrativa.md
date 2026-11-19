# Roteiro e narração

> Isto vale para **aula**. Anúncio, criativo ou VSL curta segue `references/anuncio.md` (gancho, CTA, ritmo rápido, marca permitida).

## Estrutura do vídeo
1. **Abertura (até 20 s):** diga direto o que o vídeo entrega ("neste vídeo, a gente faz o projeto elétrico de uma casa do zero, seguindo a NBR 5410"). Nada de gancho dramático genérico que não volta no vídeo (ex.: "um fio fino demais derrete a capa"): o usuário recusou. Gancho só se for uma afirmação que o próprio vídeo responde.
2. **Base antes do conceito:** defina cada ideia antes de usá-la. Ex.: antes de "corrente atrasada", mostre o que é ciclo, período e frequência, e o que significa chegar ao pico antes ou depois.
3. **Intuição visual:** o conceito como movimento/imagem, antes da regra.
4. **O porquê de cada regra:** nunca só "o indutor atrasa a corrente"; explique por que (a tensão depende de quão rápido a corrente muda, e a corrente muda mais rápido ao passar pelo zero). Toda convenção (ex.: X_L para cima, X_C para baixo) tem que vir justificada.
5. **Questão resolvida (quando o tema pede):** enunciado escrito, passos numerados, cada passo justificado (ver abaixo).
6. **Fecho:** resumo curto + "Salve este vídeo para estudar quando precisar."

## Dado técnico: fonte ou suposição dita
Todo número que não sai de conta do próprio vídeo vem de uma fonte nomeada na fala (tabela da norma, catálogo do fabricante, ficha técnica) ou é uma **suposição dita em voz** ("aqui vamos supor três mil ampères"). Nunca um valor solto. Se não conseguir confirmar um número de item ou tabela, não cite o número: diga "a norma exige".

## Professor na lousa: detalhista
- **Conta completa em cada caso.** Regra aplicada a vários itens (cômodos, circuitos, alternativas) tem a conta escrita e falada para cada um. Nunca "nos outros dá 160" sem a conta.
- **O quê → por quê → como → fonte.** Apresente o conceito, explique por que a regra existe, mostre como se aplica e diga de onde ela vem (item da norma, número da tabela, lei). Na tela, o cabeçalho da regra leva a fonte entre parênteses.
- **Estrutura visível:** antes de um processo longo, mostre as etapas numeradas; depois, quadros-resumo (tabela de cargas, quadro de circuitos).
- O tempo não importa: vídeo longo e completo é melhor que curto e raso.

## Siglas na voz
Siglas que a voz lê errado vão na tabela `PRONUNCIA` do template: DR → "dê érre" (lia "doutor"), DPS → "dê pê ésse" (lia "depois"). Na tela, a sigla fica normal.

## Tom: professor particular
- Frases completas, ligadas por conectores: "então", "agora", "ou seja", "por isso", "já", "mas", "pois", "note que".
- **Sem vícios de linguagem:** nada de "olha só", "tá", "né", "beleza", "repara", "sabe o que é legal?".
- **Sem perguntas retóricas** ("Por quê? Porque…", "E quando…? Quando…"). Use a afirmação direta, com "pois" quando for explicar a causa:
  - ruim: "Usamos só o resistor. Por quê? Porque só ele consome potência ativa."
  - bom: "Usamos apenas o resistor, pois só o resistor consome potência ativa."
- **Nenhum nome de marca** no vídeo (nem no fecho), a menos que o usuário peça.

## Escrita para a voz (TTS)
- Cada fala (`narrate`) tem 1–3 frases e é gerada **inteira**. O ritmo vem da pontuação: vírgula = pausa curta, ponto = pausa longa, reticências = suspense.
- Números por extenso quando a animação ancora neles ("dois vírgula setenta").
- **Emendas de vogal:** quando uma palavra termina com a mesma vogal com que a próxima começa, a voz junta as duas e a vogal some ("sessenta avos" vira "sessenta vós"). O serviço não aceita micropausa, e vírgula/travessão dão pausa longa demais. Rode `scripts/juncoes.py roteiro.md` e **reescreva** as emendas que escondem um número ou mudam o sentido:
  - "um sessenta avos de segundo" → "um segundo dividido por sessenta"
  - termo técnico que não muda ("potência ativa"): mantenha e confira na amostra de áudio.
- **Pronúncia de termos técnicos:** a voz às vezes erra a vogal. A tabela `PRONUNCIA` do template troca a grafia **só no áudio** (roteiro e tela não mudam). Já está nela: **volt/volts/volt-ampère → "vôlt", "vôlts"** (o fechado, como se tivesse circunflexo; nunca "vólts"). Escreva "volts" normalmente no roteiro. Quando o usuário apontar outra pronúncia errada, acrescente o caso na tabela (vale para todos os vídeos), não só no roteiro daquele vídeo.
- Referências visuais explícitas ajudam: "a seta azul", "esse ponto", "agora a curva inteira".

## Questões resolvidas
- **Enunciado escrito na tela** (cartão), com o pedido destacado quando a voz chega nele.
- **O desenho da questão (ex.: circuito) nunca some:** encolhe para o topo e a resolução acontece embaixo dele.
- Valores no desenho **na forma que entra na conta** (ex.: 220∠0° V, 30 Ω, j60 Ω, −j20 Ω), sem "R =", "X_L =".
- **Passos numerados** ("Passo 1: …" como título) e justificados, na ordem: identificar a situação (ex.: tipo de associação) → por que é assim → qual fórmula → substituir → resultado.
- Ao usar um elemento num passo, **acenda-o no desenho** (ex.: o resistor quando calcula P).
- Confira o resultado quando houver como (ex.: S² = P² + Q²).

## Duração
O conteúdo manda. ~150 palavras por minuto de narração; um vídeo de 9 min ≈ 1.300 palavras ≈ 20 cenas.
Não há limite de 3 min no Reels: não corte conteúdo para caber; vídeo único é o padrão.

## Formato do roteiro (fonte única do texto falado)
O `video.py` lê as falas deste arquivo (`falas_do_roteiro`); editar o roteiro muda o vídeo.

```
### A01 — "nome de referência da cena"
Tela: o que aparece (para quem revisa).

**Fala 1:** Texto falado.

**Fala 2:** Texto falado.
```
O código da cena (A01) é o prefixo da classe no `video.py` (`class A01_Gancho`).

## Equação depois do desenho
Primeiro a fala constrói o desenho com os rótulos; a equação só entra numa frase própria que a diz inteira ("Ou seja, a parcela é igual aos juros mais a amortização."). Assim ela nunca aparece em pedaços.

## Dados ditos um a um
Diga os dados na ordem em que aparecem no bloco (valor, taxa, tempo), um por trecho de frase, para cada variável entrar na sua palavra.

## Roteiro que nomeia o que aparece
O vídeo só mostra o que a voz diz. Ao escrever cada fala, liste o que precisa aparecer na tela e garanta que cada item tenha uma palavra na fala: "a linha dourada é a Price", "cada coluna é um mês", "a tabela, com os juros, a amortização e o saldo". Números que vão para a tela são lidos; números que não serão lidos não vão para a tela.
