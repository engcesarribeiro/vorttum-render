"""Gera os efeitos sonoros da skill (sintetizados aqui, sem licença de terceiros).

Uso (só quando quiser refazer; os WAV já ficam no repositório):
    python sfx.py

Saída em <skill>/template/remotion/public/sfx/<nome>.wav (44,1 kHz, mono). O Manim lê dali também.
    pop      etiqueta ou palavra que salta
    papel    cartão, foto ou recorte colado
    rasgo    papel rasgando (transição)
    whoosh   faixa, seta ou troca de tela
    clique   botão, cursor
    carimbo  batida seca (resultado, "MODELAR")
    risco    caneta riscando (Riscar)
    digitar  máquina de escrever (6 teclas)
    ding     acerto, final de conta
    tique    item de checklist marcado
"""
from pathlib import Path
import wave

import numpy as np

SR = 44100
DEST = Path(__file__).resolve().parents[1] / "template" / "remotion" / "public" / "sfx"
rng = np.random.default_rng(11)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, ataque=0.005, queda=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / max(queda, 1e-4))


def banda(x, f0, f1):
    """Filtro passa-banda no domínio da frequência (fino o bastante para efeito curto)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + ((f - (f0 + f1) / 2) / max(1, (f1 - f0) / 2)) ** 4)
    return np.fft.irfft(X * m, len(x))


def ruido(dur):
    return rng.standard_normal(int(dur * SR))


def norm(x, pico=0.8):
    x = x - np.mean(x)
    return x / (np.max(np.abs(x)) + 1e-9) * pico


def fade(x, ms=6):
    n = int(SR * ms / 1000)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def pop():
    t = t_(0.12)
    f = 650 * np.exp(-t * 18) + 220
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.035)
    x[:200] += banda(ruido(200 / SR), 2000, 6000) * 0.4
    return norm(x, 0.75)


def papel():
    d = 0.32
    x = banda(ruido(d), 1500, 7000)
    am = np.abs(banda(ruido(d), 20, 90))
    am = am / am.max()
    return norm(x * am * env(len(x), 0.01, 0.12), 0.6)


def rasgo():
    d = 0.5
    x = ruido(d)
    graos = (rng.random(len(x)) < 0.012).astype(float)
    graos = np.convolve(graos, np.hanning(60), "same")
    sweep = banda(x, 800, 3000) * np.linspace(0.4, 1, len(x)) + banda(x, 3000, 9000) * 0.5
    return norm(sweep * (0.35 + graos) * env(len(x), 0.04, 0.3), 0.6)


def whoosh():
    d = 0.5
    t = t_(d)
    x = ruido(d)
    lo, hi = banda(x, 300, 1200), banda(x, 1200, 5000)
    mix = lo * (1 - t / d) + hi * (t / d)
    e = np.sin(np.pi * t / d) ** 2
    return norm(mix * e, 0.55)


def clique():
    x = banda(ruido(0.025), 2500, 8000) * env(int(0.025 * SR), 0.0005, 0.004)
    return norm(x, 0.6)


def carimbo():
    t = t_(0.25)
    f = 140 * np.exp(-t * 10) + 55
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.07)
    tapa = banda(ruido(0.25), 500, 4000) * env(len(t), 0.0005, 0.015)
    return norm(corpo + 0.6 * tapa, 0.85)


def risco():
    d = 0.38
    t = t_(d)
    x = banda(ruido(d), 2500, 6500)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 16 * t) ** 2
    return norm(x * am * env(len(t), 0.01, 0.25), 0.45)


def digitar():
    out = np.zeros(int(0.8 * SR))
    for k in range(6):
        i = int((0.04 + k * 0.12 + rng.uniform(-0.02, 0.02)) * SR)
        c = clique() * 0.9 + np.pad(carimbo()[:int(0.04 * SR)] * 0.3, (0, len(clique())))[:len(clique())]
        out[i:i + len(c)] += c[:len(out) - i]
    return norm(out, 0.6)


def ding():
    t = t_(1.0)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dcy)
            for f, a, dcy in [(1320, 1, 3.5), (2640, 0.4, 6), (3960, 0.2, 9), (1980, 0.25, 5)])
    return norm(x * env(len(t), 0.002, 10), 0.5)


def tique():
    t = t_(0.09)
    x = np.sin(2 * np.pi * 1800 * t) * env(len(t), 0.001, 0.02)
    x[:300] += banda(ruido(300 / SR), 3000, 9000) * 0.5
    return norm(x, 0.55)


def salva(nome, x):
    x = fade(np.asarray(x, float).copy())
    with wave.open(str(DEST / f"{nome}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for f in (pop, papel, rasgo, whoosh, clique, carimbo, risco, digitar, ding, tique):
        salva(f.__name__, f())
    print(f"efeitos em {DEST}")


if __name__ == "__main__":
    main()
