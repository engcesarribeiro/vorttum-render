import numpy as np
from scipy.integrate import solve_ivp, cumulative_trapezoid
G=6.67430e-11; a=6371e3
# PREM densidade (g/cm3), x=r/a, limites em km
camadas=[(0,1221.5,lambda x:13.0885-8.8381*x**2),
(1221.5,3480,lambda x:12.5815-1.2638*x-3.6426*x**2-5.5281*x**3),
(3480,5701,lambda x:7.9565-6.4761*x+5.5283*x**2-3.0807*x**3),
(5701,5771,lambda x:5.3197-1.4836*x),
(5771,5971,lambda x:11.2494-8.0298*x),
(5971,6151,lambda x:7.1089-3.8045*x),
(6151,6346.6,lambda x:2.6910+0.6924*x),
(6346.6,6356,lambda x:2.900+0*x),
(6356,6368,lambda x:2.600+0*x),
(6368,6371,lambda x:1.020+0*x)]
r=np.linspace(0,a,200001)
rho=np.zeros_like(r)
for r0,r1,f in camadas:
    m=(r>=r0*1e3)&(r<=r1*1e3); rho[m]=f(r[m]/a)*1000
M=cumulative_trapezoid(4*np.pi*r**2*rho,r,initial=0)
g=np.where(r>0,G*M/np.maximum(r,1)**2,0)
print("Massa total %.4e kg  g sup %.3f  g max %.2f em r=%.0f km (prof %.0f km)"%(M[-1],g[-1],g.max(),r[g.argmax()]/1e3,(a-r[g.argmax()])/1e3))
gi=lambda x: np.interp(abs(x),r,g)
def f(t,y): return [y[1], -np.sign(y[0])*gi(y[0])]
ev=lambda t,y:y[0]; ev.terminal=True; ev.direction=-1
s=solve_ivp(f,[0,1e4],[a,0],events=ev,max_step=1,rtol=1e-10,atol=1e-6)
tc=s.t_events[0][0]; vc=abs(s.y_events[0][0][1])
print("PREM: centro em %.1f s (%.2f min), v max %.0f m/s; travessia %.1f s = %.2f min"%(tc,tc/60,vc,2*tc,2*tc/60))
gs=9.81
for gg,lab in [(9.81,'g=9,81'),(G*M[-1]/a**2,'g da massa PREM')]:
    t=np.pi*np.sqrt(a/gg); print("Uniforme %s: travessia %.1f s = %.2f min, vmax %.0f m/s = %.0f km/h"%(lab,t,t/60,np.sqrt(gg*a),np.sqrt(gg*a)*3.6))
# gravidade constante (sem cascas)
tconst=2*np.sqrt(2*a/9.81)*2/2  # descida ate centro com g const: sqrt(2R/g), travessia = 2x
print("g constante: travessia %.1f min"%(2*np.sqrt(2*a/9.81)/60))
for prof in [0,670,2891,5150,6371]:
    print("prof %4d km: g PREM %.2f, g uniforme %.2f"%(prof,gi(a-prof*1e3),9.81*(a-prof*1e3)/a))
