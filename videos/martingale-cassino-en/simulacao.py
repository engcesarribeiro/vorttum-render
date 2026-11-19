"""Simulação Martingale na roleta europeia (reproduzível).

Regras (roteiro VORTTUM 001):
- 37 casas: 18 vermelhas, 18 pretas, 1 zero. Aposta no vermelho paga 1:1.
- Banca inicial R$ 10.000, aposta inicial R$ 10. Perdeu: dobra. Ganhou: volta a R$ 10.
- Sessão termina quando o saldo não cobre a próxima aposta. Nova sessão com as mesmas condições.
- 1.000.000 de giros no total. Sem limite de mesa.
Uso: python simulacao.py  ->  resultados.json
"""
import json
import random
from collections import Counter
from pathlib import Path

SEMENTE = 2026
GIROS = 1_000_000
BANCA = 10_000
APOSTA0 = 10
VERMELHAS = set(range(1, 37)) - {2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35}  # 18 casas

rng = random.Random(SEMENTE)
sessoes = []                 # uma por sessão
giros_log = []               # primeiros giros (para a tela)
saldo, aposta, giro = BANCA, APOSTA0, 0
s = dict(inicio=0, giros=0, ciclos=0, maior_saldo=BANCA, maior_aposta=APOSTA0)
sequencia = []               # giros do ciclo atual
quebras = []                 # sequências de perda que encerraram sessões
total_apostado = 0
max_derrotas = 0
derrotas_seguidas = 0
hist_derrotas = Counter()    # tamanho da sequência de derrotas que terminou em vitória

while giro < GIROS:
    if aposta > saldo:       # não cobre a próxima aposta: sessão termina
        s.update(fim="sem saldo", saldo_final=saldo, resultado=saldo - BANCA)
        quebras.append(dict(sessao=len(sessoes) + 1, giro=giro, apostas=[g["aposta"] for g in sequencia],
                            numeros=[g["numero"] for g in sequencia], saldo_restante=saldo, aposta_necessaria=aposta))
        sessoes.append(s)
        saldo, aposta = BANCA, APOSTA0
        s = dict(inicio=giro, giros=0, ciclos=0, maior_saldo=BANCA, maior_aposta=APOSTA0)
        sequencia, derrotas_seguidas = [], 0
        continue
    n = rng.randrange(37)
    ganhou = n in VERMELHAS
    total_apostado += aposta
    s["maior_aposta"] = max(s["maior_aposta"], aposta)
    saldo += aposta if ganhou else -aposta
    reg = dict(giro=giro + 1, numero=n, aposta=aposta, ganhou=ganhou, saldo=saldo)
    if giro < 400:
        giros_log.append(reg)
    sequencia.append(reg)
    giro += 1
    s["giros"] += 1
    s["maior_saldo"] = max(s["maior_saldo"], saldo)
    if ganhou:
        hist_derrotas[derrotas_seguidas] += 1
        derrotas_seguidas = 0
        aposta = APOSTA0
        s["ciclos"] += 1
        sequencia = []
    else:
        derrotas_seguidas += 1
        max_derrotas = max(max_derrotas, derrotas_seguidas)
        aposta *= 2

# sessão em andamento quando o milionésimo giro acabou
s.update(fim="interrompida no giro 1.000.000", saldo_final=saldo, resultado=saldo - BANCA)
sessoes.append(s)

completas = [x for x in sessoes if x["fim"] == "sem saldo"]
res = [x["resultado"] for x in sessoes]
ganhos_ciclo = sum(hist_derrotas.values()) * APOSTA0
perdas_quebra = sum(sum(q["apostas"]) for q in quebras)
out = dict(
    parametros=dict(semente=SEMENTE, giros=GIROS, banca=BANCA, aposta_inicial=APOSTA0, roleta="europeia 37 casas"),
    sessoes_total=len(sessoes),
    sessoes_sem_saldo=len(completas),
    sessao_interrompida=sessoes[-1],
    resultado_agregado=sum(res),
    total_apostado=total_apostado,
    esperado_teorico=-total_apostado / 37,
    ciclos_vencidos=sum(hist_derrotas.values()),
    lucro_dos_ciclos=ganhos_ciclo,
    perda_nas_quebras=perdas_quebra,
    maior_sequencia_derrotas=max_derrotas,
    hist_derrotas_antes_da_vitoria=dict(sorted(hist_derrotas.items())),
    sessoes=sessoes,
    quebras=quebras,
    primeiros_giros=giros_log,
)
Path(__file__).with_name("resultados.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), "utf-8")
print({k: v for k, v in out.items() if k not in ("sessoes", "quebras", "primeiros_giros")})
