"""Repete o experimento inteiro (1 milhão de giros, mesmas regras) com as sementes 1 a 100.
Serve para mostrar que o resultado da semente 2026 é um entre muitos possíveis.
Uso: python repeticoes.py  ->  repeticoes.json
"""
import json
import random
import statistics as st
from pathlib import Path

VERMELHAS = set(range(1, 37)) - {2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35}


def experimento(semente, giros=1_000_000, banca=10_000, aposta0=10):
    rng = random.Random(semente)
    saldo, aposta, g, apostado, resultado, sessoes = banca, aposta0, 0, 0, 0, 0
    while g < giros:
        if aposta > saldo:
            resultado += saldo - banca
            sessoes += 1
            saldo, aposta = banca, aposta0
            continue
        ganhou = rng.randrange(37) in VERMELHAS
        apostado += aposta
        saldo += aposta if ganhou else -aposta
        g += 1
        aposta = aposta0 if ganhou else aposta * 2
    resultado += saldo - banca
    return dict(semente=semente, resultado=resultado, apostado=apostado, pct=resultado / apostado, sessoes=sessoes + 1)


R = [experimento(s) for s in range(1, 101)]
p = [r["pct"] for r in R]
out = dict(media_pct=st.mean(p), min_pct=min(p), max_pct=max(p), positivos=sum(r["resultado"] > 0 for r in R),
           teorico_pct=-1 / 37, experimentos=R)
Path(__file__).with_name("repeticoes.json").write_text(json.dumps(out, indent=1), "utf-8")
print({k: v for k, v in out.items() if k != "experimentos"})
