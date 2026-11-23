"""VORTTUM 003: números do apagão, calculados em código. Gera graficos.json para o video.py.

Modelo da cascata (uma rede só, 1.000 usinas iguais), equação de balanço agregada (swing equation):
    df/dt = f0 / (2H) * (Pm - Pc) / S_on
    f0 = 60 Hz, H = 4 s (inércia típica), S_on = fração de usinas ainda ligadas (a inércia cai junto).
    Pm = geração das usinas ligadas + resposta do regulador (sobe em ~3 s, limitada a 5% do que está ligado).
    Pc = carga * (1 + D * (f - f0) / f0), D = 1,5 (a carga cai um pouco quando a frequência cai).
Cada usina tem um relé de subfrequência sorteado entre 57,5 e 58,9 Hz: abaixo dele, ela se desliga.
Corte automático de carga (quando ligado): degraus de 5% da carga em 59,3 / 59,0 / 58,7 Hz.
"""
import json

import numpy as np

F0, H, D = 60.0, 4.0, 1.5
N = 1000
DT = 0.005
rng = np.random.default_rng(3)
RELE = np.sort(rng.uniform(57.5, 58.9, N))
rng.shuffle(RELE)
DEGRAUS = [59.3, 59.0, 58.7]


def simula(perda, corte=False, T=12.0):
    on = np.ones(N, bool)
    f, gov, carga, cortado = F0, 0.0, 1.0, 0.0
    feitos = set()
    t_desliga = np.full(N, np.nan)
    ts, fs = [], []
    t = 0.0
    while t <= T:
        frac = on.sum() / N
        if frac == 0:
            ts.append(round(t, 3)); fs.append(0.0)
            break
        alvo = min(0.05 * frac, max(0.0, (F0 - f) / F0 / 0.05) * frac)
        gov += (alvo - gov) * DT / 3.0
        pm = frac * (1 - perda) + gov
        pc = carga * (1 + D * (f - F0) / F0)
        f += F0 / (2 * H) * (pm - pc) / frac * DT
        if corte:
            for k, d in enumerate(DEGRAUS):
                if f < d and k not in feitos:
                    feitos.add(k); carga -= 0.05; cortado += 0.05
        caem = on & (f < RELE)
        t_desliga[caem] = t
        on[caem] = False
        if round(t / DT) % 4 == 0:
            ts.append(round(t, 3)); fs.append(round(f, 4))
        t += DT
    colapso = None if on.any() else float(np.nanmax(t_desliga))
    return dict(t=ts, f=fs, colapso=colapso, f_min=round(min(fs), 3), cortado=round(cortado, 2),
                desliga=[None if np.isnan(x) else round(float(x), 3) for x in t_desliga])


casos = {"p5": simula(0.05), "p8": simula(0.08), "p10": simula(0.10), "p10_corte": simula(0.10, corte=True)}

# energia girando na rede dos EUA
GER_TWH = 4430                      # EIA, geração 2025
carga_gw = GER_TWH * 1e12 / 8760 / 1e9
segundos = {h: round(h * 1.3 * carga_gw / carga_gw, 1) for h in (3, 4, 5)}   # S_on ~ 1,3 x carga média
rocof10 = F0 * 0.10 / (2 * H)

# tempestade nível Carrington
def em_anos(p_decada, anos):
    return 1 - (1 - p_decada) ** (anos / 10)

prob = {"alta_30": em_anos(0.12, 30), "baixa_30": em_anos(0.007, 30),
        "curva_alta": [round(em_anos(0.12, a), 4) for a in range(0, 61)],
        "curva_baixa": [round(em_anos(0.007, a), 4) for a in range(0, 61)]}

dados = dict(casos=casos, carga_gw=round(carga_gw), segundos=segundos, rocof10=rocof10, prob=prob,
             transformador_anos=round(128 / 52, 2))
open("graficos.json", "w").write(json.dumps(dados))

print(f"carga média EUA: {carga_gw:.0f} GW; energia girando segura a carga por {segundos} s (H = 3, 4, 5)")
print(f"perder 10%: {rocof10:.2f} Hz/s; 59,4 Hz em {0.6 / rocof10:.2f} s")
for k, c in casos.items():
    print(f"{k}: colapso {c['colapso']} s, f mín {c['f_min']} Hz, carga cortada {c['cortado']*100:.0f}%")
print(f"Carrington 30 anos: alta {prob['alta_30']*100:.1f}% (1 em {1/prob['alta_30']:.1f}), "
      f"baixa {prob['baixa_30']*100:.1f}% (1 em {1/prob['baixa_30']:.0f})")
print(f"transformador: 128 semanas = {128/52:.2f} anos")
