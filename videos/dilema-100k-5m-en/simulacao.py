"""Pauta 02 - $100k now vs a shot at $5M every 10 minutes, for life.
Every number in roteiro.md comes from this file. Run: python3 -I simulacao.py
Hypotheses (declared in the script):
  H1 one try every 10 min, 24/7, 365-day years (no leap days)
  H2 every try independent, same chance p
  H3 first try 10 minutes after you choose
  H4 it does NOT stop when you win (each win pays $5M); 'stop at first win' variant also computed
  H5 horizon: 50 more years (round example, not a life-expectancy figure)
  H6 example chance: p = 1 in 1,000,000; taxes ignored; no inflation unless stated
"""
import math, json, random
from math import comb

PRIZE, SURE = 5_000_000, 100_000
TRIES_DAY = 24*6
TRIES_YEAR = TRIES_DAY*365
YEARS = 50
N = TRIES_YEAR*YEARS
MIN_PER_YEAR = 365*24*60
POWERBALL = comb(69,5)*26

def stats(p, n=N):
    return dict(
        odds_1_in=round(1/p),
        expected_wins=n*p,
        ev_keep_going=n*p*PRIZE,
        p_at_least_one=1-(1-p)**n,
        p_zero=(1-p)**n,
        ev_stop_first=PRIZE*(1-(1-p)**n),
        mean_wait_years=(1/p)*10/MIN_PER_YEAR,              # first try at 10 min (H3)
        median_tries=math.ceil(math.log(0.5)/math.log(1-p)),
    )

out = {"tries_per_day":TRIES_DAY, "tries_per_year":TRIES_YEAR, "N_50y":N, "powerball":POWERBALL}
for name,p in [("1in52560",1/52_560),("1in100k",1e-5),("1in1M",1e-6),("1in10M",1e-7),("1in100M",1e-8),("powerball",1/POWERBALL)]:
    s = stats(p); s["median_wait_years"]=s["median_tries"]*10/MIN_PER_YEAR
    out[name]=s

p=1e-6
out["1in1M_cumulative"]={f"{y}y":1-(1-p)**(TRIES_YEAR*y) for y in (1,5,10,20,30,50)}
out["1in1M_cumulative_day"]=1-(1-p)**TRIES_DAY
out["1in1M_first_win_in_any_given_year_if_not_yet"]=1-(1-p)**TRIES_YEAR
# break-even chances
out["breakeven_keep_going_1_in"]=N*PRIZE/SURE
out["breakeven_stop_first_1_in"]=1/(1-(1-SURE/PRIZE)**(1/N))
# years needed for 50% / 90% chance of a win at 1 in 1M
out["years_for_50pct"]=math.log(0.5)/math.log(1-p)/TRIES_YEAR
out["years_for_90pct"]=math.log(0.1)/math.log(1-p)/TRIES_YEAR
# time value: money growing 5%/yr (hypothesis). PV of the stream, per-try discounting
r=0.05; v=(1+r)**(-1/TRIES_YEAR)
pv = p*PRIZE*v*(1-v**N)/(1-v)
out["pv_stream_1in1M_5pct"]=pv
out["sure_100k_after_50y_5pct"]=SURE*(1+r)**YEARS
# a 1 in 1M stream started at age 80 vs same: shorter horizon 10y
out["1in1M_10y"]=stats(p, TRIES_YEAR*10)
# Monte Carlo check of 1 in 1M (seed fixed)
random.seed(42); R=200_000
waits=sorted(math.ceil(math.log(1-random.random())/math.log(1-p)) for _ in range(R))
out["mc_mean_wait_years"]=sum(waits)/R*10/MIN_PER_YEAR
out["mc_median_wait_years"]=waits[R//2]*10/MIN_PER_YEAR
out["mc_p_win_50y"]=sum(w<=N for w in waits)/R

# win-count distribution at 1 in 1M over 50y (exact binomial)
from math import comb as C
def pk(k,n=N,p=1e-6): return C(n,k)*p**k*(1-p)**(n-k)
out["1in1M_P_exactly"]={k:pk(k) for k in range(0,7)}
out["1in1M_P_2plus"]=1-pk(0)-pk(1)
out["1in1M_P_3plus"]=1-pk(0)-pk(1)-pk(2)
out["1in1M_one_day_1_in"]=1/out["1in1M_cumulative_day"]
out["breakeven_10y_1_in"]=TRIES_YEAR*10*PRIZE/SURE
out["1in1M_next30y_after_20y_dry"]=1-(1-p)**(TRIES_YEAR*30)
out["breakeven_pv_5pct_1_in"]=(pv/p)/SURE   # PV is linear in p
out["powerball_p_at_least_one_1_in"]=1/out["powerball"]["p_at_least_one"]
out["ev_ratio_1in1M"]=out["1in1M"]["ev_keep_going"]/SURE
json.dump(out, open("graficos.json","w"), indent=2)
print(json.dumps(out, indent=2))
