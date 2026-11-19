"""Modelo de anúncio curto (story/Reels 9:16) no estilo retro. Regras em references/anuncio.md.

O desenho está em remotion/src/cenas/Anuncio.tsx (kit/retro.tsx). Para testar:
    cp <skill>/template/exemplo_anuncio.py videos/<slug>/video.py
    cp <skill>/template/explainer.py videos/<slug>/ && cp -r <skill>/template/remotion videos/<slug>/
    python <skill>/scripts/render.py video.py --vertical --no-tts
"""
from explainer import *

# Trilha de fundo (opcional): o arquivo fica na pasta do vídeo; baixa sozinha quando a voz fala.
# MUSICA = "trilha.mp3"
# MUSICA_VOLUME = -20


class A01_Anuncio(RemotionScene):
    ESTILO = "retro"
    RATE = "+8%"                 # anúncio pede fala um pouco mais rápida que a aula
    COMPOSICAO = "Anuncio"
    CAUDA = 0.8
    FALAS = [
        "Viu uma aula animada que prendeu você até o fim e pensou: queria fazer uma dessas?",
        "Ela tem gancho, ritmo e desenho no tempo da fala.",
        "Copiar não adianta. Você modela a estrutura.",
        "E faz tudo sozinho: roteiro, narração, música e legenda.",
        "Sem aparecer, sem gravar e sem editar.",
        "Clica no botão aqui embaixo.",
    ]
