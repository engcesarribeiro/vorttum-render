"""Curvas do vídeo (tudo calculado aqui; nada desenhado à mão).
Gera graficos.json: g(r) no PREM e no modelo uniforme, x(t) e v(t) nos dois modelos."""
import json
import numpy as np
from scipy.integrate import solve_ivp, cumulative_trapezoid

G = 6.67430e-11; a = 6371e3; g0 = 9.81
camadas = [(0, 1221.5, lambda x: 13.0885 - 8.8381 * x**2),
           (1221.5, 3480, lambda x: 12.5815 - 1.2638 * x - 3.6426 * x**2 - 5.5281 * x**3),
           (3480, 5701, lambda x: 7.9565 - 6.4761 * x + 5.5283 * x**2 - 3.0807 * x**3),
           (5701, 5771, lambda x: 5.3197 - 1.4836 * x),
           (5771, 5971, lambda x: 11.2494 - 8.0298 * x),
           (5971, 6151, lambda x: 7.1089 - 3.8045 * x),
           (6151, 6346.6, lambda x: 2.6910 + 0.6924 * x),
           (6346.6, 6356, lambda x: 2.900 + 0 * x),
           (6356, 6368, lambda x: 2.600 + 0 * x),
           (6368, 6371, lambda x: 1.020 + 0 * x)]
r = np.linspace(0, a, 200001)
rho = np.zeros_like(r)
for r0, r1, f in camadas:
    m = (r >= r0 * 1e3) & (r <= r1 * 1e3)
    rho[m] = f(r[m] / a) * 1000
M = cumulative_trapezoid(4 * np.pi * r**2 * rho, r, initial=0)
g = np.where(r > 0, G * M / np.maximum(r, 1)**2, 0)
gi = lambda x: np.interp(abs(x), r, g)


def queda(acel):
    ev = lambda t, y: y[0] + a - 1.0   # chega ao outro lado (x = -a)
    ev.terminal = True
    s = solve_ivp(lambda t, y: [y[1], acel(y[0])], [0, 1e4], [a, 0], events=ev, max_step=1,
                  rtol=1e-10, atol=1e-6, dense_output=True)
    T = s.t_events[0][0]
    ts = np.linspace(0, T, 301)
    y = s.sol(ts)
    return T, ts, y


Tp, tp, yp = queda(lambda x: -np.sign(x) * gi(x))
Tu, tu, yu = queda(lambda x: -g0 * x / a)
prof = np.linspace(0, 6371, 321)
out = {
    "R_km": 6371, "g0": g0,
    "prem": {"prof_km": prof.round(1).tolist(), "g": [round(float(gi(a - p * 1e3)), 4) for p in prof],
             "pico_g": round(float(g.max()), 2), "pico_prof_km": round(float((a - r[g.argmax()]) / 1e3)),
             "massa": float(M[-1]), "g_sup": round(float(g[-1]), 3),
             "T_s": round(float(Tp), 1), "T_min": round(float(Tp / 60), 1),
             "vmax": round(float(np.abs(yp[1]).max())), "t_min": (tp / 60).round(3).tolist(),
             "x_km": (yp[0] / 1e3).round(1).tolist(), "v_kms": (yp[1] / 1e3).round(4).tolist()},
    "uniforme": {"T_s": round(float(Tu), 1), "T_min": round(float(Tu / 60), 1),
                 "vmax": round(float(np.abs(yu[1]).max())), "t_min": (tu / 60).round(3).tolist(),
                 "x_km": (yu[0] / 1e3).round(1).tolist(), "v_kms": (yu[1] / 1e3).round(4).tolist()},
    "constante_T_min": round(2 * np.sqrt(2 * a / g0) / 60, 1),
}
print({k: v for k, v in out["prem"].items() if not isinstance(v, list)}, out["uniforme"]["T_min"],
      out["uniforme"]["vmax"], out["constante_T_min"])
open("graficos.json", "w").write(json.dumps(out))
