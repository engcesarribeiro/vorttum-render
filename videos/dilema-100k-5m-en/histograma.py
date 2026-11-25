"""Histograma do tempo de espera (V05): mesma amostra Monte Carlo de simulacao.py (seed 42, 200.000 vidas, p = 1 em 1.000.000).
Saida: hist.json (contagens por ano). Rodar: python3 -I histograma.py"""
import math, random, json
p = 1e-6; R = 200_000; MIN_PER_YEAR = 365*24*60
random.seed(42)
waits = sorted(math.ceil(math.log(1 - random.random()) / math.log(1 - p)) for _ in range(R))
yrs = [w * 10 / MIN_PER_YEAR for w in waits]
bins = [0] * 101
for y in yrs:
    bins[min(100, int(y))] += 1
out = {"R": R, "bins_1y": bins, "mean_years": sum(yrs) / R, "median_years": yrs[R // 2],
       "p_within_50y": sum(y <= 50 for y in yrs) / R, "over_40y": sum(y > 40 for y in yrs) / R,
       "over_60y": sum(y > 60 for y in yrs) / R, "over_100y": sum(y > 100 for y in yrs) / R}
json.dump(out, open("hist.json", "w"), indent=1)
print({k: v for k, v in out.items() if k != "bins_1y"})
