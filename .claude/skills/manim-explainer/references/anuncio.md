# Modo anúncio (vídeo curto de venda, story ou Reels)

Use quando o pedido for anúncio, criativo, VSL curta, vídeo de captação ou "vídeo igual a esse anúncio".
As regras de aula (sem gancho, fecho "Salve este vídeo...", sem nome de marca, sem legenda) valem para **aula**.
No anúncio, valem as regras abaixo. Todo o resto continua: cada elemento entra na palavra que o nomeia,
nada passa da borda, área segura, quadros completos aprovados antes do render com voz.

Modelo pronto: `template/exemplo_anuncio.py` + `template/remotion/src/cenas/Anuncio.tsx` (estilo `retro`).

## Antes do roteiro (briefing de oferta)
Responda em uma linha cada, e marque `[PREENCHER]` o que faltar (nunca invente):
- **Para quem é** (quem para de rolar o feed ao ver isso).
- **Problema urgente**, nas palavras do cliente ("vi um vídeo que bombou e queria fazer um desses").
- **Resultado desejado** e **mecanismo** (como o produto entrega, em uma frase).
- **Promessa sem exagero** (o que dá para cumprir; nada de número de resultado que não tenha prova).
- **Ação**: o que a pessoa faz no fim (clicar em "Saiba mais", comentar uma palavra, mandar direct).

## Estrutura (30 a 60 s)
1. **Gancho (0–3 s):** pergunta ou afirmação que o público reconhece como dele ("Viu um vídeo que bombou e pensou: queria fazer um desses?"). Tem que voltar no vídeo; gancho solto é proibido também aqui.
2. **Virada (3–5 s):** "agora dá" / a novidade, em 2 a 4 palavras.
3. **Como funciona (3 passos no máximo):** cola o link → ela estuda → cria. Cada passo é uma tela.
4. **Prova por lista:** checklist do que faz (pesquisa, roteiro, narração...), um item por palavra dita.
5. **Quebra de objeção:** riscar a palavra que o público teme e trocar pela certa (`<Riscar>`: COPIAR → MODELAR).
6. **Exemplo concreto:** um antes/depois real (ex.: vídeo de pontes vira vídeo de vulcões). Use material real do usuário; sem exemplo, `[PREENCHER]`.
7. **Benefício final:** "sem aparecer, sem gravar, sem editar" (o que a pessoa deixa de ter que fazer).
8. **CTA:** diga a ação e aponte para onde ela está ("Clica no botão aqui embaixo"), com setas e mão apontando para o botão.

## Fala
- Frases de 3 a 10 palavras; uma ideia por frase. Conversa, segunda pessoa ("você"), palavras do cliente.
- Pode citar o nome do produto ou da marca do cliente (no anúncio é permitido).
- Voz Thalita com `RATE = "+8%"` (ou até `+12%`); a aula fica em `+0%`.
- Nada de promessa de ganho, de "garantido" ou de prazo que o cliente não pode cumprir. Isso também derruba anúncio nas plataformas.

## Ritmo e tela
- **Troca visual a cada 1 a 2 s.** Cada fala é uma tela; tudo da tela sai junto com o começo da próxima fala (`ate = inicioFala(proxima) - 0,25`), sem tela vazia no meio.
- 1 a 4 elementos por tela. Etiqueta com a palavra-chave entra na palavra; seta liga a etiqueta ao que ela nomeia.
- `<Camera batidas=[...]>`: soco de zoom nas palavras fortes (gancho, virada, CTA), tremor leve sempre.
- `<Faixa>` diagonal trocando de lado e de cor entre telas dá a sensação de corte.
- **Legenda em recortes ligada** (`<LegendaRecortes>` ou `CAPTIONS = "recortes"`): anúncio roda sem som.
- **Música** (`MUSICA` no `video.py`, −18 a −22 dB, baixa sozinha na fala) e **efeitos** em toda entrada (os componentes do kit retro já tocam o seu).

## Área segura do anúncio de story (1080x1920)
- Topo: ~250 px (perfil, "Patrocinado", barra de progresso).
- Rodapé: ~420 px (botão "Saiba mais", "Enviar mensagem"). A legenda fica logo acima, em y ≈ 1430–1450.
- Laterais: ~60 px.

## Revisão antes de entregar
- Cada tela: dá para entender sem som? (etiqueta + legenda contam a história).
- O gancho aparece no primeiro quadro (o primeiro quadro é a miniatura).
- O CTA fica pelo menos 2 s na tela, com seta e mão para o botão.
- Nenhuma imagem de pessoa real sem autorização; retrato em gravura vem do usuário, de domínio público ou é o cavalheiro da skill.
