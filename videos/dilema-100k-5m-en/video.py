"""VORTTUM 004 (EN-US): Take $100,000 Now, or a Shot at $5 Million Every 10 Minutes | FOR YOUR WHOLE LIFE.

16:9. Todas as cenas em Remotion (papel envelhecido, Latin Modern, estilo VORTTUM), uma por seção do roteiro:
    V01 gancho (dois envelopes)         V02 as regras do jogo             V03 contando as tentativas
    V04 camada 1: probabilidade         V05 camada 2: tempo de espera     V06 camada 3: valor esperado
    V07 girando o botão das chances     V08 a variável escondida: tempo   V09 por que o instinto diz "maleta"
    V10 encerramento e pergunta
Números: simulacao.py (graficos.json) e histograma.py (hist.json).
"""
from pathlib import Path

from explainer import *
import vorttum  # noqa: F401  (registra os estilos VORTTUM)

AQUI = Path(__file__).parent
F = falas_do_roteiro(AQUI / "roteiro.md")


class _Base(ExplainerScene):
    VOICE = "en-US-AndrewMultilingualNeural"
    RATE = "+5%"                 # vídeo inteiro 5% mais rápido; gancho a +8%
    TITLE_AREA = False


class V01_Gancho(RemotionScene):
    VOICE = _Base.VOICE
    RATE = '+8%'
    ESTILO = "v_remotion"
    FALAS = [F("V01", k) for k in range(1, 3)]
    CAUDA = 0.6


class V02_Regras(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V02", k) for k in range(1, 4)]
    CAUDA = 0.5


class V03_Contagem(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V03", k) for k in range(1, 4)]
    CAUDA = 0.5


class V04_Camada1(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V04", k) for k in range(1, 5)]
    CAUDA = 0.5


class V05_Camada2(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V05", k) for k in range(1, 5)]
    CAUDA = 0.5


class V06_Camada3(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V06", k) for k in range(1, 5)]
    CAUDA = 0.5


class V07_Botao(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V07", k) for k in range(1, 7)]
    CAUDA = 0.5


class V08_Tempo(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V08", k) for k in range(1, 4)]
    CAUDA = 0.5


class V09_Instinto(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V09", k) for k in range(1, 4)]
    CAUDA = 0.5


class V10_Final(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V10", k) for k in range(1, 3)]
    CAUDA = 1.5
