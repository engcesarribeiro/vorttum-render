"""Extrai da simulação (mesma semente) as séries usadas nos gráficos: saldo das sessões 1 e 323
e os resultados de todas as sessões. Uso: python dados_graficos.py -> graficos.json"""
import json
import random
from pathlib import Path

VERMELHAS = set(range(1, 37)) - {2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35}
rng = random.Random(2026)
saldo, aposta, g = 10_000, 10, 0
sessoes, atual = [], [10_000]
while g < 1_000_000:
    if aposta > saldo:
        sessoes.append(atual)
        saldo, aposta, atual = 10_000, 10, [10_000]
        continue
    ganhou = rng.randrange(37) in VERMELHAS
    saldo += aposta if ganhou else -aposta
    g += 1
    aposta = 10 if ganhou else aposta * 2
    atual.append(saldo)
sessoes.append(atual)


def reduz(s, n=600):
    """Até n pontos, guardando o mínimo e o máximo de cada trecho (os vales não somem)."""
    if len(s) <= n:
        return [[i, v] for i, v in enumerate(s)]
    passo = len(s) / (n / 2)
    out = []
    for k in range(int(n / 2)):
        a, b = int(k * passo), min(len(s), int((k + 1) * passo))
        trecho = s[a:b]
        i_min, i_max = a + trecho.index(min(trecho)), a + trecho.index(max(trecho))
        out += sorted([[i_min, min(trecho)], [i_max, max(trecho)]])
    out.append([len(s) - 1, s[-1]])
    return out


out = dict(
    s1_inicio=[[i, v] for i, v in enumerate(sessoes[0][:61])],
    s1=reduz(sessoes[0]), s1_len=len(sessoes[0]) - 1,
    s323=reduz(sessoes[322]), s323_len=len(sessoes[322]) - 1,
    resultados=[s[-1] - 10_000 for s in sessoes[:-1]],
)
Path(__file__).with_name("graficos.json").write_text(json.dumps(out), "utf-8")
print(len(sessoes), out["s1_len"], out["s323_len"], max(sessoes[322]), sessoes[0][-1], len(out["s1"]))
