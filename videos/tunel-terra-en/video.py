"""VORTTUM 002 (EN-US): What If You Jumped Into a Tunnel Through the Earth?

16:9. Estilos VORTTUM (vorttum.py) variando por cena:
    T01 Remotion papel (gancho, gravura)     T02 blueprint (o experimento)
    T03 Manim escuro (forças)                T04 papel envelhecido (cascas)
    T05 Manim escuro (simulação)             T06 colagem (subida e pêndulo)
    T07 quadro com a mão (a conta)           T08 blueprint (Terra real, PREM)
    T09 colagem (o mundo real)               T10 marfim (encerramento)
Números: simulacao.py e dados_graficos.py (graficos.json). Movimento no modelo uniforme pela
solução exata: x(t) = R cos(ωt), v(t) = √(gR) sin(ωt), ω = √(g/R).
"""
import json
from pathlib import Path

from explainer import *
import vorttum  # noqa: F401  (registra os estilos VORTTUM)

AQUI = Path(__file__).parent
F = falas_do_roteiro(AQUI / "roteiro.md")
G = json.loads((AQUI / "graficos.json").read_text("utf-8"))

# tons claros da paleta (hex do documentário; o estilo de cada cena troca pela sua versão)
P_GOLD, P_C1, P_C2, P_GOOD, P_INK = "#2E2511", "#0D2433", "#36190E", "#12301A", "#1F2833"

R_M, G0 = 6371e3, 9.81
W = np.sqrt(G0 / R_M)                 # ω (1/s)
T_TRAV = np.pi / W                    # 2.531,7 s
VMAX = np.sqrt(G0 * R_M)              # 7.906 m/s
MPH = 3600 / 1609.344

_UNI = {"−": r"\textminus{}", "×": r"$\times$", "→": r"$\rightarrow$", "≈": r"$\approx$",
        "²": r"$^2$", "°": r"$^\circ$", "≥": r"$\geq$", "Δ": r"$\Delta$"}


def T(s, size=34, color=INK, negrito=None):
    """Texto em LaTeX (Latin Modern, reto). Negrito a partir de 36 pt, para ler bem no vídeo."""
    t = tex_escape(s)
    for k, v in _UNI.items():
        t = t.replace(k, v)
    if negrito if negrito is not None else size >= 36:
        t = r"\textbf{" + t + "}"
    return Tex(t, font_size=size * 1.12, color=color, tex_template=TEMPLATE)


def M(s, size=48, color=INK):
    return MathTex(s, font_size=size, color=color)


# ---------------------------------------------------------------- desenhos
FR = {"nucleo_int": 1221.5 / 6371, "nucleo_ext": 3480 / 6371, "manto": 6346.6 / 6371}


def terra(r=3.0, real=True, contorno=INK):
    """Terra em corte. real=True: camadas (núcleo interno, externo, manto, crosta) em proporção real.
    real=False: densidade uniforme (um só tom)."""
    g = VGroup()
    if real:
        g.add(Circle(radius=r).set_fill(P_INK, 1).set_stroke(contorno, 3))                   # crosta
        g.add(Circle(radius=r * FR["manto"]).set_fill(P_C1, 1).set_stroke(MUTED, 1.2))         # manto
        g.add(Circle(radius=r * FR["nucleo_ext"]).set_fill(P_GOLD, 1).set_stroke(MUTED, 1.2))  # núcleo externo
        g.add(Circle(radius=r * FR["nucleo_int"]).set_fill(GOLD, 0.55).set_stroke(MUTED, 1.2))  # núcleo interno
    else:
        g.add(Circle(radius=r).set_fill(C2, 0.32).set_stroke(contorno, 3))
    return g


def tunel(terra_g, cor=INK, largura=6, horizontal=False):
    """Túnel como tubo: parede (cor) com o vão claro dentro."""
    c, r = terra_g.get_center(), terra_g[0].width / 2
    d = RIGHT if horizontal else UP
    parede = Line(c + d * r, c - d * r).set_stroke(cor, largura + 4)
    vao = Line(c + d * r, c - d * r).set_stroke(SHEET, max(2, largura - 2))
    return VGroup(parede, vao)


def capsula(h=0.34):
    corpo = RoundedRectangle(corner_radius=h * 0.35, width=h * 0.62, height=h).set_fill(GOLD, 1).set_stroke(INK, 2)
    return VGroup(corpo)


def seta(a, b, cor, w=6):
    return Arrow(a, b, buff=0, color=cor, stroke_width=w, max_tip_length_to_length_ratio=0.3,
                 tip_length=0.22)


def mola_massa(topo, comprimento, voltas=9, largura=0.32, m=0.42):
    """Mola vertical presa em `topo`, com o peso na ponta de baixo."""
    pts = [topo, topo + DOWN * 0.15]
    passo = (comprimento - 0.3) / (voltas * 2)
    for k in range(voltas * 2):
        pts.append(topo + DOWN * (0.15 + passo * (k + 0.5)) + RIGHT * (largura / 2) * (1 if k % 2 == 0 else -1))
    fim = topo + DOWN * comprimento
    pts += [fim + UP * 0.15, fim]
    mola = VMobject().set_points_as_corners(pts).set_stroke(INK, 3)
    peso = Square(side_length=m).set_fill(GOLD, 1).set_stroke(INK, 2).next_to(fim, DOWN, buff=0)
    return VGroup(mola, peso)


def suporte(ponto, w=1.2):
    base = Line(ponto + LEFT * w / 2, ponto + RIGHT * w / 2).set_stroke(INK, 4)
    hach = VGroup(*[Line(ponto + RIGHT * x, ponto + RIGHT * (x + 0.12) + UP * 0.14).set_stroke(INK, 2)
                    for x in np.linspace(-w / 2, w / 2 - 0.12, 7)])
    return VGroup(base, hach)


def pos_unif(terra_g, t, horizontal=False):
    """Posição da cápsula no tempo t (s) do modelo uniforme (começa no topo / à esquerda)."""
    c, r = terra_g.get_center(), terra_g[0].width / 2
    d = LEFT if horizontal else UP
    return c + d * r * np.cos(W * t)


def eixos(x0, y0, w, h, xmax, ymax, ymin=0.0):
    """Eixos simples. Devolve (VGroup dos eixos, p2s(x, y) -> ponto da tela)."""
    def p2s(x, y):
        return np.array([x0 + w * x / xmax, y0 + h * (y - ymin) / (ymax - ymin), 0])
    ex = Line(p2s(0, max(ymin, 0)), p2s(xmax, max(ymin, 0))).set_stroke(MUTED, 2.5)
    ey = Line(p2s(0, ymin), p2s(0, ymax)).set_stroke(MUTED, 2.5)
    return VGroup(ex, ey), p2s


def curva(p2s, xs, ys, cor, w=5):
    return VMobject().set_points_smoothly([p2s(x, y) for x, y in zip(xs, ys)]).set_stroke(cor, w)


def relogio(r=0.55):
    aro = Circle(radius=r).set_fill(SHEET, 1).set_stroke(INK, 3)
    marcas = VGroup(*[Line(UP * r * 0.82, UP * r * 0.95).rotate(k * TAU / 12, about_point=ORIGIN).set_stroke(INK, 2)
                      for k in range(12)])
    pont = Line(ORIGIN, UP * r * 0.65).set_stroke(INK, 3)
    return VGroup(aro, marcas, pont, Dot(radius=0.04, color=INK))


class _Base(ExplainerScene):
    VOICE = "en-US-AndrewMultilingualNeural"
    RATE = "+0%"
    TITLE_AREA = False

    def esmaece(self, op=0.15, run_time=0.5, manter=()):
        conteudo = [m for m in self.mobjects if id(m) not in self._chrome and m is not self._title
                    and m not in manter and not isinstance(m, ValueTracker) and any(len(x.points) for x in m.get_family())]
        g = Group(*conteudo)
        if conteudo:
            self.play(g.animate.set_opacity(op), run_time=run_time)
        return g


class _Quadro(_Base):
    def narrate(self, text, caption=None):
        """A mão sai da frente antes do fim de cada fala (quadro completo visível)."""
        from contextlib import contextmanager
        base = super().narrate

        @contextmanager
        def cm():
            with base(text, caption) as n:
                yield n
                if self._mao_descansa():
                    self.hand_away(run_time=0.3)
        return cm()


# ---------------------------------------------------------------- T01 gancho (Remotion)
class T01_Gancho(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("T01", k) for k in range(1, 5)]
    CAUDA = 0.5


# ---------------------------------------------------------------- T02 o experimento (blueprint)
class T02_Experimento(_Base):
    ESTILO = "v_blueprint"

    def construct(self):
        tr = terra(2.85, real=True).move_to([-3.4, -0.1, 0])
        tn = tunel(tr, INK, 5)
        c, r = tr.get_center(), 2.85
        with self.narrate(F("T02", 1)) as n:
            self.play(Create(tr[0]), run_time=1.2)
            n.wait_until("experiment")
            self.play(FadeIn(tr[1:]), run_time=0.6)
        with self.narrate(F("T02", 2)) as n:
            n.wait_until("tunnel")
            self.play(Create(tn), run_time=n.until("straight") + 0.4)
            n.wait_until("surface")
            p_sup = Dot(c + UP * r, radius=0.09, color=GOLD)
            l_sup = T("surface", 30, INK).next_to(p_sup, UP, buff=0.15)
            self.play(FadeIn(p_sup, scale=1.6), FadeIn(l_sup), run_time=0.5)
            n.wait_until("center")
            p_c = Dot(c, radius=0.09, color=GOLD)
            l_c = T("center", 30, INK).next_to(p_c, LEFT, buff=0.3)
            l_c.add_background_rectangle(color=BG, opacity=0.55, buff=0.06)
            self.play(FadeIn(p_c, scale=1.6), FadeIn(l_c), run_time=0.5)
            n.wait_until("opposite")
            p_o = Dot(c + DOWN * r, radius=0.09, color=GOLD)
            l_o = T("other side", 30, INK).next_to(p_o, DOWN, buff=0.15)
            self.play(FadeIn(p_o, scale=1.6), FadeIn(l_o), run_time=0.5)
        with self.narrate(F("T02", 3)) as n:
            n.wait_until("seven")
            xd = c[0] + r + 0.45
            cota = VGroup(Line([xd, c[1] + r, 0], [xd, c[1] - r, 0]).set_stroke(GOLD, 3),
                          Line([xd - 0.15, c[1] + r, 0], [xd + 0.15, c[1] + r, 0]).set_stroke(GOLD, 3),
                          Line([xd - 0.15, c[1] - r, 0], [xd + 0.15, c[1] - r, 0]).set_stroke(GOLD, 3))
            km = T("12,742 km", 36, GOLD)
            mi = T("(7,918 mi)", 28, MUTED)
            rot = VGroup(km, mi).arrange(DOWN, buff=0.12).next_to(cota, RIGHT, buff=0.25)
            self.play(Create(cota), FadeIn(rot), run_time=0.8)
        # hipóteses: lista com cabeçalho, um item por palavra
        x0, y0 = 2.2, 2.6
        cab = T("Assumptions:", 38, GOLD).move_to([x0, y0, 0], aligned_edge=LEFT)
        itens = [T(s, 32, INK) for s in ["empty: no air", "no friction", "walls that never break",
                                         "no spin (for now)"]]
        for k, it in enumerate(itens):
            it.move_to([x0 + 0.35, y0 - 0.75 - 0.62 * k, 0], aligned_edge=LEFT)
        marca = lambda it: Dot(radius=0.05, color=GOLD).next_to(it, LEFT, buff=0.18)
        with self.narrate(F("T02", 4)) as n:
            n.wait_until("empty")
            self.play(FadeOut(rot), FadeOut(cota), FadeIn(cab), FadeIn(itens[0]), FadeIn(marca(itens[0])), run_time=0.6)
            n.wait_until("friction")
            self.play(FadeIn(itens[1]), FadeIn(marca(itens[1])), run_time=0.45)
            n.wait_until("walls")
            self.play(FadeIn(itens[2]), FadeIn(marca(itens[2])), run_time=0.45)
        with self.narrate(F("T02", 5)) as n:
            n.wait_until("spins")
            self.play(FadeIn(itens[3]), FadeIn(marca(itens[3])), run_time=0.45)
        with self.narrate(F("T02", 6)) as n:
            n.wait_until("heat")
            calor = Circle(radius=r * FR["nucleo_ext"]).move_to(c).set_fill(C1, 0.35).set_stroke(C1, 3)
            lc = T("heat", 32, C1).move_to([0.55, c[1] + 0.45, 0], aligned_edge=LEFT)
            fc = Line(c + RIGHT * r * 0.45 + UP * 0.25, lc.get_left() + LEFT * 0.1).set_stroke(C1, 2)
            self.play(FadeIn(calor), Create(fc), FadeIn(lc), run_time=0.6)
            n.wait_until("pressure")
            lp = T("pressure", 32, C1).move_to([0.55, c[1] - 0.45, 0], aligned_edge=LEFT)
            fp = Line(c + RIGHT * r * 0.45 + DOWN * 0.25, lp.get_left() + LEFT * 0.1).set_stroke(C1, 2)
            self.play(Create(fp), FadeIn(lp), run_time=0.5)
        with self.narrate(F("T02", 7)) as n:
            n.wait_until("physics")
            self.play(FadeOut(VGroup(calor, lc, lp, fc, fp)), tn[0].animate.set_stroke(GOLD), run_time=0.7)
        cap = capsula(0.36).move_to(c + UP * (r - 0.25))
        with self.narrate(F("T02", 8)) as n:
            n.wait_until("capsule")
            self.play(FadeIn(cap, shift=DOWN * 0.3), run_time=0.6)
            n.wait_until("go")
            self.play(cap.animate.shift(DOWN * 0.55), run_time=0.6, rate_func=rate_functions.ease_in_quad)
            n.wait_until("gravity")
            gs = seta(cap.get_bottom() + DOWN * 0.08, cap.get_bottom() + DOWN * 1.05, C1)
            gl = T("gravity", 30, C1).next_to(gs, RIGHT, buff=0.2)
            self.play(GrowArrow(gs), FadeIn(gl), run_time=0.6)
        with self.narrate(F("T02", 9)) as n:
            n.wait_until("speed")
            q = VGroup(T("What happens", 40, GOLD), T("to the speed?", 40, GOLD)).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
            q.move_to([x0, -2.2, 0], aligned_edge=LEFT)
            self.play(FadeIn(q, shift=UP * 0.15), run_time=0.6)
        self.clear_section()


# ---------------------------------------------------------------- T03 a queda começa (Manim escuro)
class T03_Queda(_Base):
    ESTILO = "v_doc"

    def construct(self):
        tr = terra(3.0, real=True).move_to([-3.75, -0.05, 0])
        tn = tunel(tr, INK, 5)
        c, r = tr.get_center(), 3.0
        t = ValueTracker(0.0)
        cap = always_redraw(lambda: capsula(0.36).move_to(pos_unif(tr, t.get_value()) + DOWN * 0.22))
        with self.narrate(F("T03", 1)) as n:
            self.play(FadeIn(tr), FadeIn(tn), FadeIn(cap), run_time=0.7)
            n.wait_until("pulling")
            gs = always_redraw(lambda: seta(cap.get_bottom() + DOWN * 0.08, cap.get_bottom() + DOWN * 1.0, C1))
            self.play(FadeIn(gs), run_time=0.5)
            n.wait_until("gravity", nth=1)
            gl = always_redraw(lambda: T("gravity", 30, C1).next_to(gs, LEFT, buff=0.2))
            self.play(FadeIn(gl), run_time=0.4)
        x0 = 1.2
        with self.narrate(F("T03", 2)) as n:
            n.wait_until("nine")
            gv = M(r"g \approx 9.8\ \mathrm{m/s^2}", 56, C1).move_to([x0, 2.55, 0], aligned_edge=LEFT)
            self.play(Write(gv), run_time=0.8)
            n.wait_until("everyday")
            mph = T("+22 mph every second", 36, INK).next_to(gv, DOWN, buff=0.4).align_to(gv, LEFT)
            self.play(FadeIn(mph, shift=UP * 0.1), run_time=0.6)
        # velocímetro e distância: valores da solução exata do modelo (t de 0 a 600 s)
        vel = always_redraw(lambda: T(f"speed:  {VMAX * np.sin(W * t.get_value()) * MPH:,.0f} mph", 34, GOOD)
                            .move_to([x0, 0.55, 0], aligned_edge=LEFT))
        dist = always_redraw(lambda: T(f"depth:  {R_M * (1 - np.cos(W * t.get_value())) / 1609.344:,.1f} mi", 34, INK)
                             .move_to([x0, -0.15, 0], aligned_edge=LEFT))
        rel = always_redraw(lambda: T(f"time:  {t.get_value():.0f} s", 30, MUTED).move_to([x0, -0.85, 0], aligned_edge=LEFT))
        with self.narrate(F("T03", 3)) as n:
            n.wait_until("speed")
            self.add(vel, dist, rel)
            self.play(t.animate.set_value(600), run_time=max(1.5, n.remaining), rate_func=rate_functions.ease_in_quad)
        with self.narrate(F("T03", 4)) as n:
            n.wait_until("stronger")
            q1 = T("stronger?", 40, C1).move_to([x0, -1.9, 0], aligned_edge=LEFT)
            self.play(FadeIn(q1), run_time=0.4)
            n.wait_until("weaker")
            q2 = T("weaker?", 40, C2).next_to(q1, RIGHT, buff=0.7)
            self.play(FadeIn(q2), run_time=0.4)
        with self.narrate(F("T03", 5)) as n:
            n.wait_until("guess")
            intu = DashedLine(cap.get_bottom() + DOWN * 1.1, cap.get_bottom() + DOWN * 2.0).set_stroke(C1, 5)
            il = T("intuition: it grows", 28, INK).next_to(intu, LEFT, buff=0.2)
            il.add_background_rectangle(color=BG, opacity=0.7, buff=0.06)
            self.play(Create(intu), FadeIn(il), Indicate(q1, color=C1, scale_factor=1.08), run_time=0.8)
        with self.narrate(F("T03", 6)) as n:
            n.wait_until("detail")
            self.play(FadeOut(VGroup(intu, il, gv, mph, q1, q2)), FadeOut(vel), FadeOut(dist), FadeOut(rel),
                      FadeOut(gs), FadeOut(gl), run_time=0.5)
            n.wait_until("above")
            p = pos_unif(tr, 600) + DOWN * 0.22
            rp = np.linalg.norm(p - c)
            casca = Annulus(inner_radius=rp, outer_radius=r - 0.04).move_to(c).set_fill(C2, 0.35).set_stroke(width=0)
            self.play(FadeIn(casca), run_time=0.6)
            n.wait_until("around")
            puxoes = VGroup()
            for ang in np.linspace(0, TAU, 9)[:-1] + 0.2:
                alvo = c + (rp + 0.75) * np.array([np.cos(ang), np.sin(ang), 0])
                d = alvo - p
                puxoes.add(seta(p, p + d / np.linalg.norm(d) * 0.9, C2, 4))
            self.play(LaggedStart(*[GrowArrow(a) for a in puxoes], lag_ratio=0.12), run_time=1.0)
            n.wait_until("too")
            lr = T("that rock pulls too", 34, C2).move_to([x0, 1.6, 0], aligned_edge=LEFT)
            self.play(FadeIn(lr), run_time=0.4)
        with self.narrate(F("T03", 7)) as n:
            n.wait_until("add")
            soma = T("total pull = ?", 44, GOLD).move_to([x0, 0.4, 0], aligned_edge=LEFT)
            self.play(*[a.animate.set_opacity(0.35) for a in puxoes], FadeIn(soma, shift=UP * 0.1), run_time=0.7)
            n.wait_until("everything")
            self.play(Indicate(soma, color=GOLD, scale_factor=1.06), run_time=0.7)
        self.clear_section()


# ---------------------------------------------------------------- T04 o paradoxo da gravidade (papel)
def cone_casca(P, O, R, ang, meia):
    """Os dois pedaços da casca (raio R, centro O) vistos de P num cone de meia-abertura `meia`
    na direção `ang`: devolve (perto, longe) como polígonos P -> arco."""
    def corta(phi):
        d = np.array([np.cos(phi), np.sin(phi), 0])
        b = np.dot(P - O, d)
        cc = np.dot(P - O, P - O) - R ** 2
        s = -b + np.sqrt(b * b - cc)
        return P + s * d
    lado = []
    for base in (ang, ang + PI):
        pts = [corta(phi) for phi in np.linspace(base - meia, base + meia, 24)]
        lado.append(pts)
    return lado


class T04_Cascas(_Base):
    ESTILO = "v_papel"

    def construct(self):
        x0 = 1.3
        ctx_t = terra(2.7, real=True).move_to([-3.6, -0.2, 0])
        ctx = VGroup(ctx_t, tunel(ctx_t, INK, 4), capsula(0.32).move_to(ctx_t.get_center() + UP * 1.2))
        with self.narrate(F("T04", 1)) as n:
            self.play(FadeIn(ctx), run_time=0.8)
            n.wait_until("shell")
            tit = T("The shell theorem", 50, INK).move_to([x0, 2.75, 0], aligned_edge=LEFT)
            self.play(Write(tit), run_time=0.9)
            n.wait_until("Newton")
            sub = T("Isaac Newton, 1687", 30, MUTED).next_to(tit, DOWN, buff=0.2).align_to(tit, LEFT)
            self.play(FadeIn(sub), run_time=0.4)
        O, R = np.array([-3.6, -0.2, 0]), 2.7
        anel = Annulus(inner_radius=R - 0.09, outer_radius=R + 0.09).move_to(O).set_fill(INK, 0.85).set_stroke(width=0)
        P = O + np.array([0.95, 0.75, 0])
        with self.narrate(F("T04", 2)) as n:
            n.wait_until("hollow")
            self.play(FadeOut(ctx), FadeIn(anel), run_time=0.7)
            n.wait_until("evenly")
            grãos = VGroup(*[Dot(O + R * np.array([np.cos(a), np.sin(a), 0]), radius=0.05, color=SHEET)
                             for a in np.linspace(0, TAU, 37)[:-1]])
            self.play(LaggedStart(*[FadeIn(g) for g in grãos], lag_ratio=0.03), run_time=0.8)
            n.wait_until("floating")
            voce = VGroup(Dot(P, radius=0.11, color=GOLD), T("you", 30, GOLD).next_to(P, RIGHT, buff=0.18))
            self.play(FadeIn(voce, scale=1.4), run_time=0.5)
        ang, meia = 0.65, 0.26
        perto, longe = cone_casca(P, O, R, ang, meia)
        cone_p = Polygon(P, *perto).set_fill(C1, 0.22).set_stroke(C1, 1.5)
        cone_l = Polygon(P, *longe).set_fill(C2, 0.22).set_stroke(C2, 1.5)
        arco_p = VMobject().set_points_smoothly(perto).set_stroke(C1, 10)
        arco_l = VMobject().set_points_smoothly(longe).set_stroke(C2, 10)
        d = np.array([np.cos(ang), np.sin(ang), 0])
        with self.narrate(F("T04", 3)) as n:
            n.wait_until("close")
            sp = seta(P, P + d * 1.0, C1, 7)
            self.play(FadeIn(cone_p), Create(arco_p), GrowArrow(sp), run_time=0.7)
            lp_ = T("close: pulls harder", 32, C1).move_to([x0, 1.2, 0], aligned_edge=LEFT)
            self.play(FadeIn(lp_), run_time=0.4)
            n.wait_until("small")
            lp2 = T("but a small piece", 32, C1).next_to(lp_, DOWN, buff=0.22).align_to(lp_, LEFT)
            self.play(FadeIn(lp2), Indicate(arco_p, color=C1), run_time=0.6)
            n.wait_until("far")
            self.play(FadeIn(cone_l), Create(arco_l), run_time=0.7)
            n.wait_until("weaker")
            ll = T("far: each bit pulls weaker", 32, C2).next_to(lp2, DOWN, buff=0.45).align_to(lp_, LEFT)
            self.play(FadeIn(ll), run_time=0.4)
            n.wait_until("bigger")
            ll2 = T("but a much bigger piece", 32, C2).next_to(ll, DOWN, buff=0.22).align_to(lp_, LEFT)
            self.play(FadeIn(ll2), Indicate(arco_l, color=C2), run_time=0.6)
        with self.narrate(F("T04", 4)) as n:
            n.wait_until("cancel")
            sl = seta(P, P - d * 1.0, C2, 7)
            self.play(GrowArrow(sl), run_time=0.6)
            n.wait_until("every")
            outros = VGroup()
            for a2 in (1.9, 2.9, 4.4):
                pp, ll_ = cone_casca(P, O, R, a2, 0.2)
                outros.add(Polygon(P, *pp).set_fill(C1, 0.12).set_stroke(C1, 1),
                           Polygon(P, *ll_).set_fill(C2, 0.12).set_stroke(C2, 1))
            self.play(LaggedStart(*[FadeIn(o) for o in outros], lag_ratio=0.15), run_time=1.0)
            n.wait_until("zero")
            z = VGroup(T("inside the shell:", 34, GOLD), T("total pull = 0", 42, GOLD)).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
            z.move_to([x0, -1.75, 0], aligned_edge=LEFT)
            self.play(FadeIn(z), run_time=0.5)
            self.destacar(z, GOLD, buff=0.2)

        # a Terra como cebola de cascas (o quadro anterior sai junto da entrada das cascas)
        O2, R2 = np.array([-3.6, -0.1, 0]), 3.0
        aneis = VGroup(*[Circle(radius=R2 * k / 8).move_to(O2).set_stroke(INK, 2) for k in range(1, 9)])
        rc = R2 * 0.5
        with self.narrate(F("T04", 5)) as n:
            antes = Group(*[m for m in self.mobjects if id(m) not in self._chrome])
            self.play(antes.animate.set_opacity(0.15), run_time=0.5)
            n.wait_until("shells")
            self.play(FadeOut(antes), LaggedStart(*[Create(a) for a in aneis[::-1]], lag_ratio=0.08), run_time=1.0)
            n.wait_until("capsule")
            cap = capsula(0.32).move_to(O2 + UP * rc)
            self.play(FadeIn(cap, scale=1.3), run_time=0.4)
            n.wait_until("above")
            fora = Annulus(inner_radius=rc, outer_radius=R2).move_to(O2).set_fill(MUTED, 0.3).set_stroke(width=0)
            lf = T("these layers cancel out", 32, MUTED).move_to([x0, 1.4, 0], aligned_edge=LEFT)
            self.play(FadeIn(fora), FadeIn(lf), run_time=0.6)
        with self.narrate(F("T04", 6)) as n:
            n.wait_until("ball")
            bola = Circle(radius=rc).move_to(O2).set_fill(C1, 0.4).set_stroke(C1, 3)
            lb = T("only this ball pulls", 32, C1).next_to(lf, DOWN, buff=0.3).align_to(lf, LEFT)
            self.play(FadeIn(bola), FadeIn(lb), run_time=0.6)
            n.wait_until("closer")
            raio = DashedLine(O2, O2 + UP * rc).set_stroke(GOLD, 4)
            lr = M("r", 48, GOLD).next_to(raio, RIGHT, buff=0.15)
            lr.add_background_rectangle(color=BG, opacity=0.6, buff=0.05)
            self.play(Create(raio), FadeIn(lr), run_time=0.6)
        with self.narrate(F("T04", 7)) as n:
            n.wait_until("formula")
            form = M(r"g(r) = \frac{G\,M(r)}{r^2}", 64, INK).move_to([x0 + 2.2, -0.3, 0])
            self.play(FadeOut(VGroup(lf, lb)), Write(form), run_time=1.0)
            linhas = [(r"g", "gravity", "gravity"), (r"G", "a fixed number of nature", "fixed"),
                      (r"r", "distance to the center", "distance"), (r"M(r)", "mass inside that distance", "mass")]
            ant = form
            leg = VGroup()
            for k, (s, txt, w) in enumerate(linhas):
                n.wait_until(w)
                l = VGroup(M(s, 40, GOLD), T("= " + txt, 30, INK)).arrange(RIGHT, buff=0.18)
                l.move_to([x0, -1.55 - 0.55 * k, 0], aligned_edge=LEFT)
                if k == 0:
                    l.move_to([x0, -1.55, 0], aligned_edge=LEFT)
                leg.add(l)
                self.play(FadeIn(l), run_time=0.45)
        # densidade uniforme
        with self.narrate(F("T04", 8)) as n:
            n.wait_until("same")
            unif = Circle(radius=R2).move_to(O2).set_fill(C2, 0.32).set_stroke(INK, 3)
            unif.set_z_index(-1)
            lu = T("same material everywhere", 36, C2).move_to([x0, 2.75, 0], aligned_edge=LEFT)
            self.play(FadeOut(VGroup(leg, fora, bola, raio, lr, form)),
                      FadeIn(unif), aneis.animate.set_stroke(MUTED, 1, opacity=0.5), FadeIn(lu), run_time=0.8)
        # gráfico g x distância ao centro (modelo uniforme: reta)
        ax, p2s = eixos(x0 + 0.1, -2.6, 4.4, 3.2, 1.0, 9.81)
        lx = T("distance from the center", 26, MUTED).next_to(ax[0], DOWN, buff=0.15)
        ly = M(r"g", 36, MUTED).next_to(ax[1], UP, buff=0.1)
        reta = Line(p2s(0, 0), p2s(1, 9.81)).set_stroke(C1, 5)
        with self.narrate(F("T04", 9)) as n:
            n.wait_until("deeper")
            bola2 = Circle(radius=rc).move_to(O2).set_fill(C1, 0.4).set_stroke(C1, 3)
            self.play(FadeIn(bola2), run_time=0.4)
            self.play(cap.animate.move_to(O2 + UP * rc * 0.45), bola2.animate.scale(0.45), run_time=n.until("smaller") + 0.5)
            n.wait_until("drops")
            self.play(Create(ax), FadeIn(lx), FadeIn(ly), run_time=0.5)
            self.play(Create(reta), run_time=0.8)
            sup = VGroup(Dot(p2s(1, 9.81), radius=0.07, color=C1), T("9.8", 26, C1).next_to(p2s(1, 9.81), UP, buff=0.12))
            self.play(FadeIn(sup), run_time=0.3)
            n.wait_until("Halfway")
            meio = Dot(p2s(0.5, 4.905), radius=0.08, color=GOLD)
            gx = DashedLine(p2s(0.5, 0), p2s(0.5, 4.905)).set_stroke(GOLD, 2.5)
            gy = DashedLine(p2s(0, 4.905), p2s(0.5, 4.905)).set_stroke(GOLD, 2.5)
            t1 = T("half the distance", 24, GOLD).next_to(p2s(0.5, 0.9), RIGHT, buff=0.12)
            t2 = T("half the gravity", 24, GOLD).next_to(meio, RIGHT, buff=0.2)
            self.play(Create(gx), Create(gy), FadeIn(meio), FadeIn(t1), run_time=0.6)
            self.play(FadeIn(t2), run_time=0.4)
        with self.narrate(F("T04", 10)) as n:
            n.wait_until("center")
            self.play(cap.animate.move_to(O2), bola2.animate.scale(0.01), run_time=0.8)
            n.wait_until("zero")
            z0 = VGroup(Dot(p2s(0, 0), radius=0.09, color=GOLD), M(r"g = 0", 36, GOLD).next_to(p2s(0, 0), UL, buff=0.12))
            self.play(FadeIn(z0, scale=1.3), run_time=0.5)
        with self.narrate(F("T04", 11)) as n:
            n.wait_until("stronger")
            s1 = T("stronger and stronger", 32, MUTED).move_to([x0, 1.9, 0], aligned_edge=LEFT)
            risco = Line(s1.get_left(), s1.get_right()).set_stroke(BAD, 4)
            self.play(FadeIn(s1), run_time=0.4)
            self.play(Create(risco), run_time=0.4)
            n.wait_until("weaker")
            s2 = T("weaker and weaker", 36, C1).next_to(s1, DOWN, buff=0.25).align_to(s1, LEFT)
            self.play(FadeIn(s2), run_time=0.4)
        with self.narrate(F("T04", 12)) as n:
            n.wait_until("stop")
            q = T("Does the capsule stop?", 40, GOLD).move_to([x0, 1.65, 0], aligned_edge=LEFT)
            self.play(FadeOut(VGroup(s1, s2, risco)), FadeIn(q, shift=UP * 0.1), run_time=0.5)
        self.clear_section()


# ---------------------------------------------------------------- T05 o centro da Terra (Manim escuro)
class T05_Centro(_Base):
    ESTILO = "v_doc"

    def construct(self):
        tr = terra(3.0, real=False).move_to([-3.75, -0.05, 0])
        tn = tunel(tr, INK, 5)
        c, r = tr.get_center(), 3.0
        t = ValueTracker(0.0)
        cap = always_redraw(lambda: capsula(0.34).move_to(pos_unif(tr, t.get_value())))
        # gráficos: profundidade (0 a 6.371 km) no eixo x
        xg, wg = 0.4, 5.6
        ax1, q1 = eixos(xg, 0.75, wg, 2.0, 6371, 9.81)
        ax2, q2 = eixos(xg, -2.95, wg, 2.0, 6371, 8.0)
        l1 = T("gravity's pull (m/s²)", 26, C1).next_to(ax1[1], UP, buff=0.12).align_to(ax1[1], LEFT)
        l2 = T("speed (km/s)", 26, GOOD).next_to(ax2[1], UP, buff=0.12).align_to(ax2[1], LEFT)
        lx1 = T("depth", 24, MUTED).next_to(ax1[0], DOWN, buff=0.1)
        lx2 = T("depth", 24, MUTED).next_to(ax2[0], DOWN, buff=0.1)
        cen1 = T("center", 22, MUTED).next_to(q1(6371, 0), DOWN, buff=0.1)
        prof = lambda tt: 6371 * (1 - np.cos(W * tt))
        acel = always_redraw(lambda: VMobject().set_points_as_corners(
            [q1(prof(s), 9.81 * np.cos(W * s)) for s in np.linspace(0, max(t.get_value(), 1), 80)]).set_stroke(C1, 5))
        veloc = always_redraw(lambda: VMobject().set_points_as_corners(
            [q2(prof(s), VMAX / 1000 * np.sin(W * s)) for s in np.linspace(0, max(t.get_value(), 1), 80)]).set_stroke(GOOD, 5))
        with self.narrate(F("T05", 1)) as n:
            self.play(FadeIn(tr), FadeIn(tn), FadeIn(cap), run_time=0.7)
        with self.narrate(F("T05", 2)) as n:
            n.wait_until("reaches")
            self.play(Create(ax1), FadeIn(l1), FadeIn(lx1), run_time=0.5)
            self.add(acel)
            self.play(t.animate.set_value(T_TRAV / 2), run_time=n.until("zero") - 0.2, rate_func=linear)
            n.wait_until("zero")
            z = VGroup(Dot(q1(6371, 0), radius=0.08, color=C1), T("0", 28, C1).next_to(q1(6371, 0), UP, buff=0.12))
            self.play(FadeIn(z, scale=1.4), FadeIn(cen1), run_time=0.4)
            n.wait_until("stopped")
            nao = T("not stopped", 30, GOLD).next_to(c, RIGHT, buff=0.35)
            self.play(FadeIn(nao), run_time=0.4)
        with self.narrate(F("T05", 3)) as n:
            n.wait_until("fastest")
            self.play(FadeOut(nao), Create(ax2), FadeIn(l2), FadeIn(lx2), run_time=0.5)
            self.add(veloc)
            self.wait(0.05)
            n.wait_until("seven")
            pico = VGroup(Dot(q2(6371, 7.906), radius=0.08, color=GOOD),
                          T("7.9 km/s", 32, GOOD).move_to([xg + wg * 0.7, -1.75, 0]))
            self.play(FadeIn(pico, scale=1.3), run_time=0.5)
            n.wait_until("eighteen")
            mph = T("≈ 17,700 mph", 36, GOLD).move_to([xg + wg * 0.7, -2.4, 0])
            self.play(FadeIn(mph), run_time=0.4)
            cxm = self.destacar(mph, GOLD, buff=0.15)
        # replay da descida com as setas
        with self.narrate(F("T05", 4)) as n:
            n.wait_until("pulling")
            self.remove(acel, veloc)
            curvas = VGroup(acel.copy().clear_updaters(), veloc.copy().clear_updaters())
            self.add(curvas)
            t.set_value(0)
            def comp(v):   # seta com tamanho mínimo, no sentido certo
                return np.sign(v) * max(0.14, abs(v)) if v != 0 else 0.14
            gs = always_redraw(lambda: seta(cap.get_center() + RIGHT * 0.32,
                                            cap.get_center() + RIGHT * 0.32 + DOWN * comp(1.1 * np.cos(W * t.get_value())), C1))
            vs = always_redraw(lambda: seta(cap.get_center() + LEFT * 0.32,
                                            cap.get_center() + LEFT * 0.32 + DOWN * (0.15 + 1.1 * np.sin(W * t.get_value())), GOOD))
            gl = always_redraw(lambda: T("gravity", 26, C1).next_to(gs, RIGHT, buff=0.12))
            vl = always_redraw(lambda: T("speed", 26, GOOD).next_to(vs, LEFT, buff=0.12))
            self.add(gs, gl)
            self.play(t.animate.set_value(T_TRAV * 0.12), run_time=0.8, rate_func=linear)
            n.wait_until("weaker")
            self.play(t.animate.set_value(T_TRAV * 0.3), run_time=n.until("pointed"), rate_func=linear)
            n.wait_until("pointed")
            self.add(vs, vl)
            self.play(t.animate.set_value(T_TRAV * 0.4), run_time=max(0.8, n.remaining - 0.1), rate_func=linear)
        # o carro empurrado
        with self.narrate(F("T05", 5)) as n:
            n.wait_until("car")
            fundo = Group(curvas, ax1, ax2, l1, l2, lx1, lx2, cen1, z, pico, mph, cxm)
            self.play(FadeOut(fundo), run_time=0.4)
            carro = VGroup(RoundedRectangle(corner_radius=0.12, width=1.6, height=0.55).set_fill(C2, 1).set_stroke(INK, 2),
                           RoundedRectangle(corner_radius=0.1, width=0.9, height=0.4).set_fill(C2, 1).set_stroke(INK, 2).shift(UP * 0.42),
                           Circle(radius=0.17).set_fill(INK, 1).set_stroke(INK, 2).shift(DOWN * 0.3 + LEFT * 0.48),
                           Circle(radius=0.17).set_fill(INK, 1).set_stroke(INK, 2).shift(DOWN * 0.3 + RIGHT * 0.48))
            carro.move_to([1.4, 0.3, 0])
            self.play(FadeIn(carro), run_time=0.4)
            n.wait_until("softer")
            for k, w in enumerate([1.3, 0.85, 0.45]):
                emp = seta(carro.get_left() + LEFT * (w + 0.1), carro.get_left() + LEFT * 0.1, C1, 7)
                self.play(GrowArrow(emp), carro.animate.shift(RIGHT * (0.6 + 0.35 * k)), run_time=0.45)
                self.play(FadeOut(emp), run_time=0.15)
            n.wait_until("forward")
            ct = T("weaker push, still forward: faster", 30, INK).move_to([3.4, -0.9, 0])
            self.play(FadeIn(ct), run_time=0.4)
        with self.narrate(F("T05", 6)) as n:
            n.wait_until("growing")
            self.play(FadeOut(VGroup(carro, ct)), FadeIn(fundo), run_time=0.5)
            self.play(t.animate.set_value(T_TRAV / 2), curvas[1].animate.set_stroke(GOLD, 7), run_time=n.until("center"), rate_func=linear)
        with self.narrate(F("T05", 7)) as n:
            n.wait_until("past")
            self.play(t.animate.set_value(T_TRAV * 0.6), run_time=0.9, rate_func=linear)
            n.wait_until("other")
            vira = VGroup(T("now gravity", 28, C1), T("pulls back", 28, C1)).arrange(DOWN, buff=0.08)
            vira.move_to(c + LEFT * 0.4 + DOWN * 0.6, aligned_edge=RIGHT)
            self.play(FadeIn(vira), Indicate(gs, color=C1), run_time=0.6)
        with self.narrate(F("T05", 8)) as n:
            n.wait_until("losing")
            self.play(t.animate.set_value(T_TRAV * 0.72), run_time=max(0.8, n.remaining - 0.1), rate_func=linear)
        with self.narrate(F("T05", 9)) as n:
            n.wait_until("surface")
            alvo = VGroup(Dot(c + DOWN * r, radius=0.1, color=GOLD),
                          T("?", 44, GOLD).next_to(c + DOWN * r, RIGHT, buff=0.25))
            self.play(FadeIn(alvo, scale=1.4), run_time=0.5)
        self.clear_section()


# ---------------------------------------------------------------- T06 subindo sem motor (colagem)
class T06_Subida(_Base):
    ESTILO = "v_colagem"

    def construct(self):
        tr = terra(2.6, real=False).move_to([-2.9, 0.75, 0])
        tn = tunel(tr, INK, 6, horizontal=True)
        c, r = tr.get_center(), 2.6
        t = ValueTracker(T_TRAV * 0.55)
        cap = always_redraw(lambda: capsula(0.34).rotate(PI / 2).move_to(pos_unif(tr, t.get_value(), True)))
        with self.narrate(F("T06", 1)) as n:
            n.wait_until("second")
            br = BraceBetweenPoints(c + RIGHT * r + DOWN * 0.15, c + DOWN * 0.15, direction=DOWN, color=INK)
            bl = T("second half", 32, INK).next_to(br, DOWN, buff=0.15)
            self.play(FadeIn(tr), Create(tn), FadeIn(cap), run_time=0.7)
            self.play(FadeIn(br), FadeIn(bl), run_time=0.5)
        vs = always_redraw(lambda: seta(cap.get_center() + UP * 0.35,
                                        cap.get_center() + UP * 0.35 + RIGHT * (0.12 + 1.3 * np.sin(W * t.get_value())), GOOD))
        gs = always_redraw(lambda: seta(cap.get_center() + DOWN * 0.35,
                                        cap.get_center() + DOWN * 0.35 + LEFT * (0.12 + 1.2 * abs(np.cos(W * t.get_value()))), C1))
        vl = always_redraw(lambda: T("speed", 26, GOOD).next_to(vs, UP, buff=0.08))
        gl = always_redraw(lambda: T("gravity", 26, C1).next_to(gs, DOWN, buff=0.08))
        with self.narrate(F("T06", 2)) as n:
            n.wait_until("passed")
            self.play(FadeOut(VGroup(br, bl)), Indicate(cap, color=GOLD), run_time=0.6)
            n.wait_until("heading")
            self.add(vs, vl)
            self.play(t.animate.set_value(T_TRAV * 0.6), run_time=0.6, rate_func=linear)
            n.wait_until("back")
            self.add(gs, gl)
            self.wait(0.2)
        vel = always_redraw(lambda: T(f"speed:  {abs(VMAX * np.sin(W * t.get_value())) / 1000:.1f} km/s", 34, GOOD)
                            .move_to([c[0], -2.75, 0]))
        with self.narrate(F("T06", 3)) as n:
            n.wait_until("climbing")
            self.add(vel)
            self.play(t.animate.set_value(T_TRAV * 0.95), run_time=max(1.2, n.remaining - 0.1), rate_func=linear)
        with self.narrate(F("T06", 4)) as n:
            n.wait_until("arrives")
            self.play(t.animate.set_value(T_TRAV), run_time=n.until("zero"), rate_func=linear)
            n.wait_until("zero")
            self.remove(vs, vl)
            z = T("speed = 0", 36, GOLD).next_to(c + RIGHT * r, RIGHT, buff=0.45)
            self.play(FadeIn(z, shift=LEFT * 0.1), run_time=0.4)
            cz = self.destacar(z, GOLD, buff=0.14)
        x0 = 1.2
        with self.narrate(F("T06", 5)) as n:
            n.wait_until("wasted")
            w0 = T("nothing is wasted", 38, INK).move_to([x0, -0.55, 0], aligned_edge=LEFT)
            self.play(FadeIn(w0), run_time=0.4)
            n.wait_until("down")
            w1 = T("speed gained on the way down", 30, GOOD).next_to(w0, DOWN, buff=0.35).align_to(w0, LEFT)
            self.play(FadeIn(w1), run_time=0.4)
            n.wait_until("up", nth=2)
            w2 = T("= speed paid back on the way up", 30, C1).next_to(w1, DOWN, buff=0.22).align_to(w0, LEFT)
            self.play(FadeIn(w2), run_time=0.4)
        piv = np.array([3.5, 3.1, 0])
        L = 1.9
        th = ValueTracker(0.9)
        pend = always_redraw(lambda: VGroup(
            Line(piv, piv + L * np.array([np.sin(th.get_value()), -np.cos(th.get_value()), 0])).set_stroke(INK, 3),
            Circle(radius=0.2).set_fill(GOLD, 1).set_stroke(INK, 2).move_to(
                piv + L * np.array([np.sin(th.get_value()), -np.cos(th.get_value()), 0]))))
        alt = DashedLine(piv + L * np.array([-np.sin(0.9) - 0.2, -np.cos(0.9), 0]),
                         piv + L * np.array([np.sin(0.9) + 0.2, -np.cos(0.9), 0])).set_stroke(MUTED, 2.5)
        with self.narrate(F("T06", 6)) as n:
            n.wait_until("pendulum")
            self.play(FadeIn(suporte(piv, 1.0)), FadeIn(pend), run_time=0.5)
            n.wait_until("swings")
            self.play(th.animate.set_value(-0.9), run_time=n.until("height"), rate_func=smooth)
            n.wait_until("height")
            lh = T("same height", 26, MUTED).next_to(alt, DOWN, buff=0.1)
            self.play(Create(alt), FadeIn(lh), run_time=0.5)
        with self.narrate(F("T06", 7)) as n:
            n.wait_until("planet")
            self.play(th.animate.set_value(0.9), t.animate.set_value(0), run_time=max(1.0, n.remaining - 0.1), rate_func=smooth)
            self.play(t.animate.set_value(T_TRAV), th.animate.set_value(-0.9), run_time=1.6, rate_func=smooth)
        with self.narrate(F("T06", 8)) as n:
            n.wait_until("grabs")
            ninguem = T("nobody grabs it", 30, MUTED).next_to(c + RIGHT * r, RIGHT, buff=0.45)
            self.play(FadeOut(VGroup(z, cz)), FadeIn(ninguem), run_time=0.4)
            n.wait_until("back")
            self.add(gs, gl)
            self.play(t.animate.set_value(T_TRAV * 1.25), run_time=1.0, rate_func=rate_functions.ease_in_quad)
            n.wait_until("over")
            volta = CurvedArrow(c + RIGHT * r * 0.6 + UP * 1.05, c + LEFT * r * 0.6 + UP * 1.05, angle=PI / 3, color=GOLD)
            lv = T("the trip starts over", 32, GOLD).next_to(volta, UP, buff=0.12)
            self.play(Create(volta), FadeIn(lv), run_time=0.6)
        with self.narrate(F("T06", 9)) as n:
            n.wait_until("long")
            self.play(FadeOut(VGroup(w0, w1, w2)), run_time=0.3)
            rl = relogio(0.62).move_to([2.6, -1.4, 0])
            q = T("how long?", 40, GOLD).next_to(rl, RIGHT, buff=0.35)
            self.play(FadeIn(rl), FadeIn(q), Rotate(rl[2], -TAU, about_point=rl.get_center()), run_time=0.9)
        self.clear_section()


# ---------------------------------------------------------------- T07 a conta dos 42 minutos (quadro com a mão)
class T07_Conta(_Quadro):
    ESTILO = "v_quadro"

    def construct(self):
        tr = terra(1.35, real=False).move_to([-5.0, 1.55, 0])
        tn = tunel(tr, INK, 3)
        c, r = tr.get_center(), 1.35
        ph = ValueTracker(0.0)            # fase ωt (o mesmo vai e vem para a cápsula e para a mola)
        cap = always_redraw(lambda: capsula(0.24).move_to(c + UP * r * 0.9 * np.cos(ph.get_value())))
        with self.narrate(F("T07", 1)) as n:
            n.wait_until("long")
            self.play(Create(tr[0]), run_time=0.7)
            self.play(Create(tn), FadeIn(cap), run_time=0.5)
            n.wait_until("elegant")
            self.hand_away()
        with self.narrate(F("T07", 2)) as n:
            n.wait_until("distance")
            ph.set_value(0.6)
            px = c + UP * r * 0.9 * np.cos(0.6)
            xl = VGroup(Line(c + RIGHT * 0.25, px + RIGHT * 0.25).set_stroke(GOLD, 3),
                        M("x", 36, GOLD).next_to(Line(c, px), RIGHT, buff=0.3))
            self.play(Create(xl), run_time=0.6)
            n.wait_until("Twice")
            s1 = seta(px + LEFT * 0.3, px + LEFT * 0.3 + DOWN * 0.8, C1, 6)
            p2 = c + UP * r * 0.9 * np.cos(0.6) * 0.5
            s2 = seta(p2 + LEFT * 0.3, p2 + LEFT * 0.3 + DOWN * 0.4, C1, 6)
            lt = T("twice as far: twice the pull", 34, C1).move_to([-1.3, 1.6, 0], aligned_edge=LEFT)
            self.play(GrowArrow(s1), GrowArrow(s2), run_time=0.6)
            self.play(Write(lt), run_time=0.7)
        eq = MathTex("a", "=", "-", r"\frac{g}{R}", r"\,x", font_size=72, color=INK).move_to([2.3, 2.55, 0])
        eq[0].set_color(C1)
        with self.narrate(F("T07", 3)) as n:
            n.wait_until("equation")
            self.play(FadeOut(VGroup(s1, s2, lt, xl)), run_time=0.3)
            self.play(Write(eq), run_time=1.0)
            linhas = [("a", "acceleration", "acceleration"), ("x", "position from the center", "distance"),
                      ("g", "gravity at the surface", "gravity"), ("R", "radius of the Earth", "radius")]
            leg = VGroup()
            for k, (s, txt, w) in enumerate(linhas):
                n.wait_until(w)
                l = VGroup(M(s, 40, GOLD), T("= " + txt, 30, INK)).arrange(RIGHT, buff=0.18)
                l.move_to([-1.3, 0.95 - 0.55 * k, 0], aligned_edge=LEFT)
                leg.add(l)
                self.play(Write(l), run_time=0.6)
        with self.narrate(F("T07", 4)) as n:
            n.wait_until("minus")
            circ = Circle(radius=0.3).move_to(eq[2]).set_stroke(C1, 4)
            lm = T("always back toward the center", 28, C1).next_to(eq, DOWN, buff=0.2)
            self.play(Create(circ), run_time=0.5)
            self.play(Write(lm), run_time=0.8)
            n.wait_until("Whichever")
            self.hand_away()
            self.play(ph.animate.set_value(PI - 0.6), run_time=1.0)
        topo_m = np.array([-3.05, 3.35, 0])
        mola = always_redraw(lambda: mola_massa(topo_m, 1.55 - 0.55 * np.cos(ph.get_value())))
        with self.narrate(F("T07", 5)) as n:
            n.wait_until("Simple")
            shm = T("Simple harmonic motion", 40, GOLD).move_to([-1.3, -1.5, 0], aligned_edge=LEFT)
            self.play(Write(shm), run_time=1.0)
            n.wait_until("spring")
            self.play(Create(suporte(topo_m, 0.8)), run_time=0.4)
            self.play(FadeIn(mola), run_time=0.5)
        with self.narrate(F("T07", 6)) as n:
            n.wait_until("Pull")
            self.hand_away()
            self.play(ph.animate.set_value(0), run_time=n.until("go"))
            n.wait_until("go")
            ph.add_updater(lambda m, dt: m.increment_value(dt * 1.6))
            self.add(ph)
            n.wait_until("capsule")
            self.play(Indicate(tr[0], color=GOLD, scale_factor=1.04), run_time=0.7)
        with self.narrate(F("T07", 7)) as n:
            n.wait_until("rhythm")
            self.play(FadeOut(leg), FadeOut(VGroup(circ, lm)), shm.animate.move_to([-1.3, 1.35, 0], aligned_edge=LEFT), run_time=0.5)
            om = M(r"\omega = \sqrt{\frac{g}{R}}", 56, INK).move_to([-1.3, 0.3, 0], aligned_edge=LEFT)
            lo = T("the rhythm", 26, MUTED).next_to(om, DOWN, buff=0.15)
            self.play(Write(om), run_time=0.8)
            self.play(FadeIn(lo), run_time=0.3)
            n.wait_until("period")
            per = M(r"T = 2\pi\sqrt{\frac{R}{g}}", 56, INK).move_to([2.6, 0.3, 0], aligned_edge=LEFT)
            lpe = T("period: there and back", 26, MUTED).next_to(per, DOWN, buff=0.15)
            self.play(Write(per), run_time=0.8)
            self.play(FadeIn(lpe), run_time=0.3)
        with self.narrate(F("T07", 8)) as n:
            n.wait_until("divide")
            meia = M(r"t = \frac{T}{2} = \pi\sqrt{\frac{R}{g}}", 60, C1).move_to([-1.3, -2.0, 0], aligned_edge=LEFT)
            lme = T("one side to the other", 26, MUTED).next_to(meia, RIGHT, buff=0.35)
            self.play(Write(meia), run_time=1.0)
            self.play(FadeIn(lme), run_time=0.3)
        rr = M(r"R = 6{,}371{,}000\ \mathrm{m}", 40, INK)
        gg = M(r"g \approx 9.81\ \mathrm{m/s^2}", 40, INK)
        VGroup(rr, gg).arrange(DOWN, aligned_edge=LEFT, buff=0.28).move_to([-6.4, -2.15, 0], aligned_edge=LEFT)
        with self.narrate(F("T07", 9)) as n:
            mostra_em_painel(self, n, [rr, gg], ["six", "nine"], GOLD)
        with self.narrate(F("T07", 10)) as n:
            n.wait_until("two")
            self.play(FadeOut(VGroup(om, lo, per, lpe, lme)), meia.animate.scale(0.85).move_to([-1.3, 0.9, 0], aligned_edge=LEFT),
                      FadeOut(shm), run_time=0.5)
            sub = M(r"t = \pi\sqrt{\frac{6{,}371{,}000}{9.81}} \approx 2{,}532\ \mathrm{s}", 58, INK).move_to([-1.3, -0.8, 0], aligned_edge=LEFT)
            self.play(Write(sub), run_time=1.4)
            n.wait_until("Roughly")
            res = M(r"t \approx 42.2\ \mathrm{min}", 72, GOLD).move_to([1.9, -2.3, 0])
            self.play(Write(res), run_time=0.8)
            self.hand_away()
            self.destacar(res, GOLD, buff=0.22)
        with self.narrate(F("T07", 11)) as n:
            n.wait_until("gravity")
            jg = T("no engine, just gravity", 32, MUTED).next_to(res, DOWN, buff=0.35)
            self.play(Write(jg), run_time=0.8)
        with self.narrate(F("T07", 12)) as n:
            n.wait_until("everywhere")
            lu = T("uniform Earth", 28, C2).next_to(tr, DOWN, buff=0.25)
            self.play(Write(lu), run_time=0.6)
            n.wait_until("real")
            q = T("the real Earth?", 30, C1).next_to(lu, DOWN, buff=0.15)
            self.play(Write(q), run_time=0.6)
            self.hand_away()
        ph.clear_updaters()
        self.clear_section()


# ---------------------------------------------------------------- T08 a Terra real: PREM (blueprint)
class T08_TerraReal(_Base):
    ESTILO = "v_blueprint"

    def construct(self):
        P = G["prem"]
        ra = 1.25
        A = terra(ra, real=False).move_to([-5.45, 1.75, 0])
        B = terra(ra, real=True).move_to([-5.45, -1.75, 0])
        tA, tB = tunel(A, INK, 4), tunel(B, INK, 4)
        lA = T("A: uniform", 30, C2).next_to(A, RIGHT, buff=0.3).shift(UP * 0.55)
        lB = T("B: real Earth", 30, C1).next_to(B, RIGHT, buff=0.3).shift(UP * 0.55)
        with self.narrate(F("T08", 1)) as n:
            s0 = T("same material everywhere", 40, INK).move_to([0, 0.3, 0])
            self.play(FadeIn(s0), run_time=0.6)
            n.wait_until("simplifications")
            self.play(Create(Line(s0.get_left(), s0.get_right()).set_stroke(C1, 5)), run_time=0.5)
        with self.narrate(F("T08", 2)) as n:
            n.wait_until("real")
            self.play(FadeOut(Group(*[m for m in self.mobjects if id(m) not in self._chrome])),
                      FadeIn(A), FadeIn(tA), FadeIn(lA), FadeIn(B), FadeIn(tB), FadeIn(lB), run_time=0.7)
            n.wait_until("iron")
            li = T("core: iron and nickel", 26, GOLD).next_to(lB, DOWN, buff=0.15).align_to(lB, LEFT)
            self.play(B[3].animate.set_fill(GOLD, 0.9), B[2].animate.set_fill(GOLD, 0.45), FadeIn(li), run_time=0.6)
            n.wait_until("rock")
            lr = T("near the surface: rock", 26, INK).next_to(li, DOWN, buff=0.12).align_to(lB, LEFT)
            self.play(FadeIn(lr), run_time=0.4)
        # gráfico: gravidade x profundidade
        ax, p2s = eixos(0.6, -2.7, 5.7, 4.6, 6371, 11.5)
        ly = M(r"g\ (\mathrm{m/s^2})", 32, INK).next_to(ax[1], UP, buff=0.12).align_to(ax[1], LEFT)
        lx = T("depth (km)", 26, INK).next_to(ax[0], DOWN, buff=0.12).align_to(ax[0], RIGHT)
        marcas = VGroup(*[VGroup(Line(p2s(0, v), p2s(0, v) + LEFT * 0.1).set_stroke(MUTED, 2),
                                 T(f"{v}", 22, MUTED).next_to(p2s(0, v), LEFT, buff=0.15)) for v in (5, 10)])
        unif = DashedLine(p2s(0, 9.81), p2s(6371, 0)).set_stroke(C2, 4)
        lu = T("A", 28, C2).next_to(p2s(3500, 9.81 * (1 - 3500 / 6371)), DL, buff=0.08)
        xs, ys = P["prof_km"], P["g"]
        ip = int(np.argmax(ys))
        prem1 = curva(p2s, xs[:ip + 1], ys[:ip + 1], C1, 6)
        prem2 = curva(p2s, xs[ip:], ys[ip:], C1, 6)
        with self.narrate(F("T08", 3)) as n:
            n.wait_until("gravity")
            self.play(Create(ax), FadeIn(ly), FadeIn(lx), FadeIn(marcas), run_time=0.6)
            self.play(Create(unif), FadeIn(lu), run_time=0.7)
            n.wait_until("stronger")
            self.play(Create(prem1), run_time=1.2, rate_func=linear)
        with self.narrate(F("T08", 4)) as n:
            n.wait_until("eighteen")
            pk = p2s(P["pico_prof_km"], P["pico_g"])
            pico = VGroup(Dot(pk, radius=0.08, color=GOLD),
                          T(f"{P['pico_g']:.1f} m/s² at {P['pico_prof_km']:,} km deep", 28, GOLD).next_to(pk, UP, buff=0.18).align_to(pk + LEFT * 0.4, LEFT))
            self.play(FadeIn(pico, scale=1.3), run_time=0.5)
            n.wait_until("core")
            borda = Circle(radius=ra * FR["nucleo_ext"]).move_to(B).set_stroke(GOLD, 5)
            lc = DashedLine(p2s(2891, 0), pk).set_stroke(GOLD, 2)
            ln = T("edge of the core", 24, GOLD).next_to(p2s(2891, 0.7), RIGHT, buff=0.12)
            self.play(Create(borda), Create(lc), FadeIn(ln), run_time=0.6)
            n.wait_until("dropping")
            self.play(Create(prem2), run_time=1.3, rate_func=linear)
            lb = T("B (PREM)", 28, C1).next_to(p2s(4600, float(np.interp(4600, xs, ys))), UR, buff=0.08)
            self.play(FadeIn(lb), run_time=0.3)
        with self.narrate(F("T08", 5)) as n:
            n.wait_until("equation")
            ea = M(r"a = -\frac{g}{R}\,x", 36, C2).next_to(lA, DOWN, buff=0.15).align_to(lA, LEFT)
            self.play(FadeIn(ea), run_time=0.4)
            risco_ea = Line(ea.get_left(), ea.get_right()).set_stroke(C1, 4)
            self.play(Create(risco_ea), run_time=0.4)
            n.wait_until("map")
            self.play(Indicate(B, color=GOLD, scale_factor=1.05), run_time=0.7)
        with self.narrate(F("T08", 6)) as n:
            n.wait_until("PREM")
            fonte = T("PREM: Dziewonski & Anderson, 1981", 26, INK).move_to([3.45, 3.45, 0])
            self.play(FadeIn(fonte), run_time=0.5)
            n.wait_until("earthquake")
            cb, rb = B.get_center(), ra
            raios = VGroup()
            for a0, a1 in [(2.4, -0.2), (2.6, 0.55), (2.9, -0.9)]:
                p0 = cb + rb * np.array([np.cos(a0), np.sin(a0), 0])
                p1 = cb + rb * np.array([np.cos(a1), np.sin(a1), 0])
                raios.add(ArcBetweenPoints(p0, p1, angle=-0.9).set_stroke(GOLD, 3))
            self.play(LaggedStart(*[Create(x) for x in raios], lag_ratio=0.25), run_time=1.2)
            self.play(FadeOut(raios), run_time=0.3)
        with self.narrate(F("T08", 7)) as n:
            n.wait_until("every")
            pts = VGroup(*[Dot(B.get_center() + UP * ra * k / 6, radius=0.035, color=GOLD) for k in range(-6, 7)])
            self.play(LaggedStart(*[FadeIn(p) for p in pts], lag_ratio=0.05), run_time=0.8)
            n.wait_until("simulate")
            self.play(FadeOut(pts), run_time=0.3)
        # corrida das duas cápsulas, com os tempos das duas simulações (42,2 x 38,2 min)
        tU, xU = np.array(G["uniforme"]["t_min"]), np.array(G["uniforme"]["x_km"])
        tP, xP = np.array(P["t_min"]), np.array(P["x_km"])
        tm = ValueTracker(0.0)
        posA = lambda: A.get_center() + UP * ra * float(np.interp(tm.get_value(), tU, xU)) / 6371
        posB = lambda: B.get_center() + UP * ra * float(np.interp(tm.get_value(), tP, xP)) / 6371
        cA = always_redraw(lambda: capsula(0.22).set_fill(C2, 1).move_to(posA()))
        cB = always_redraw(lambda: capsula(0.22).set_fill(C1, 1).move_to(posB()))
        relA = always_redraw(lambda: T(f"{min(tm.get_value(), tU[-1]):.1f} min", 34, C2)
                             .move_to(A.get_center() + RIGHT * 1.75 + DOWN * 0.1, aligned_edge=LEFT))
        relB = always_redraw(lambda: T(f"{min(tm.get_value(), tP[-1]):.1f} min", 34, C1)
                             .move_to(B.get_center() + RIGHT * 1.75 + DOWN * 0.1, aligned_edge=LEFT))
        with self.narrate(F("T08", 8)) as n:
            n.wait_until("Running")
            self.play(FadeOut(VGroup(lr, li, ea, risco_ea)), run_time=0.3)
            self.add(cA, cB, relA, relB)
            self.play(tm.animate.set_value(tU[-1]), run_time=max(2.0, n.until("minutes") - 0.1), rate_func=linear)
            n.wait_until("minutes")
            self.destacar(relB, C1, buff=0.12)
            n.wait_until("Four")
            q4 = T("4 minutes faster", 26, C1).next_to(relB, DOWN, buff=0.25).align_to(relB, LEFT)
            self.play(FadeIn(q4), run_time=0.4)
            n.wait_until("ten")
            vB = T("top speed 9.9 km/s", 26, C1).next_to(q4, DOWN, buff=0.12).align_to(relB, LEFT)
            self.play(FadeIn(vB), run_time=0.4)
            n.wait_until("thousand")
            mB = T("≈ 22,200 mph", 26, C1).next_to(vB, DOWN, buff=0.12).align_to(relB, LEFT)
            self.play(FadeIn(mB), run_time=0.4)
        with self.narrate(F("T08", 9)) as n:
            n.wait_until("strong")
            area = Polygon(*[p2s(x, y) for x, y in zip(xs, ys)],
                           *[p2s(x, 9.81 * (1 - x / 6371)) for x in np.linspace(6371, 0, 40)])
            area.set_fill(C1, 0.25).set_stroke(width=0)
            self.play(FadeIn(area), run_time=0.7)
            n.wait_until("nine")
            const = DashedLine(p2s(0, 9.81), p2s(6371, 9.81)).set_stroke(GOLD, 3)
            lk = T("constant 9.81", 24, GOLD).next_to(p2s(6371, 9.81), UP, buff=0.12).shift(LEFT * 0.75)
            self.play(Create(const), FadeIn(lk), run_time=0.7)
            n.wait_until("minutes")
            lk2 = T("constant 9.81: 38.0 min", 30, GOLD).move_to([3.45, -3.35, 0])
            self.play(FadeIn(lk2), run_time=0.4)
        with self.narrate(F("T08", 10)) as n:
            n.wait_until("assumptions")
            self.play(Indicate(relA, color=C2), Indicate(relB, color=C1), run_time=0.8)
            n.wait_until("change")
            hip = T("new assumptions, new answer", 30, INK).move_to([3.45, -3.35, 0])
            self.play(FadeOut(lk2), FadeIn(hip), run_time=0.5)
        with self.narrate(F("T08", 11)) as n:
            n.wait_until("problems")
            self.esmaece(0.15)
        self.clear_section()


# ---------------------------------------------------------------- T09 o que aconteceria de verdade (colagem)
class T09_Realidade(_Base):
    ESTILO = "v_colagem"

    def construct(self):
        tr = terra(2.3, real=True).move_to([-4.3, 0.55, 0])
        c, r = tr.get_center(), 2.3
        x0 = 0.0
        with self.narrate(F("T09", 1)) as n:
            n.wait_until("perfect")
            self.play(FadeIn(tr, scale=0.95), run_time=0.6)
            n.wait_until("problems")
            cab = T("Real-world problems:", 40, INK).move_to([x0, 2.95, 0], aligned_edge=LEFT)
            self.play(FadeIn(cab), run_time=0.4)
        itens = {}

        def item(k, texto, cor=INK):
            it = T(texto, 30, cor).move_to([x0 + 0.35, 2.2 - 0.56 * k, 0], aligned_edge=LEFT)
            dot = Square(side_length=0.14).set_fill(C1, 1).set_stroke(width=0).next_to(it, LEFT, buff=0.2)
            return VGroup(dot, it)
        with self.narrate(F("T09", 2)) as n:
            n.wait_until("heat")
            calor = Circle(radius=r * FR["nucleo_ext"]).move_to(c).set_fill(C1, 0.5).set_stroke(C1, 3)
            itens[0] = item(0, "heat: over 5,000 °C at the center")
            self.play(FadeIn(calor), FadeIn(itens[0]), run_time=0.5)
        with self.narrate(F("T09", 3)) as n:
            n.wait_until("pressure")
            itens[1] = item(1, "pressure: over 3 million × the surface")
            self.play(FadeIn(itens[1]), run_time=0.4)
            n.wait_until("open")
            itens[2] = item(2, "keeping the tunnel open")
            self.play(FadeIn(itens[2]), FadeOut(calor), run_time=0.4)
        # vista de cima do polo norte: túnel no equador, a cápsula sai de lado e bate na parede
        cima = VGroup(Circle(radius=r).set_fill(P_C2, 1).set_stroke(INK, 3), Dot(radius=0.07, color=INK)).move_to(c)
        tq = VGroup(Line(c + LEFT * r + UP * 0.16, c + RIGHT * r + UP * 0.16).set_stroke(INK, 4),
                    Line(c + LEFT * r + DOWN * 0.16, c + RIGHT * r + DOWN * 0.16).set_stroke(INK, 4),
                    Rectangle(width=2 * r, height=0.32).move_to(c).set_fill(SHEET, 1).set_stroke(width=0)).set_z_index(1)
        tq[0].set_z_index(2); tq[1].set_z_index(2)
        with self.narrate(F("T09", 4)) as n:
            n.wait_until("spin")
            itens[3] = item(3, "the Earth's spin")
            gira = Arc(radius=r + 0.35, start_angle=0.6, angle=1.5, arc_center=c).add_tip(tip_length=0.2).set_stroke(GOLD, 4)
            vc = T("seen from above the North Pole", 24, MUTED).next_to(cima, DOWN, buff=0.2)
            self.play(FadeOut(tr), FadeIn(cima), Create(tq), FadeIn(itens[3]), run_time=0.6)
            self.play(Create(gira), FadeIn(vc), run_time=0.6)
            n.wait_until("sideways")
            p0 = c + LEFT * r
            cap = capsula(0.2).rotate(PI / 2).move_to(p0 + RIGHT * 0.25).set_z_index(3)
            lado = seta(p0 + RIGHT * 0.2 + DOWN * 0.25, p0 + RIGHT * 0.2 + DOWN * 1.0, GOOD, 5)
            ll = T("already moving sideways", 24, GOOD).next_to(lado, LEFT, buff=0.1).shift(DOWN * 0.15)
            ll.next_to(lado, DOWN, buff=0.1)
            self.play(FadeIn(cap), GrowArrow(lado), FadeIn(ll), run_time=0.6)
            n.wait_until("course")
            caminho = VMobject().set_points_smoothly([p0 + RIGHT * 0.25, p0 + RIGHT * 0.8 + DOWN * 0.03,
                                                       p0 + RIGHT * 1.3 + DOWN * 0.1]).set_stroke(GOLD, 3).set_z_index(3)
            self.play(Create(caminho), MoveAlongPath(cap, caminho), FadeOut(lado), FadeOut(ll), run_time=1.0)
            n.wait_until("walls")
            bate = Star(n=8, outer_radius=0.25, inner_radius=0.1).set_fill(C1, 1).set_stroke(width=0).move_to(cap.get_center() + DOWN * 0.1).set_z_index(4)
            lw = T("it hits the wall", 26, C1).next_to(c + RIGHT * 0.2 + DOWN * 0.5, DOWN, buff=0.1)
            self.play(FadeIn(bate, scale=1.6), FadeIn(lw), run_time=0.4)
        with self.narrate(F("T09", 5)) as n:
            n.wait_until("North")
            lado_v = VGroup(Circle(radius=r).set_fill(P_C2, 1).set_stroke(INK, 3)).move_to(c)
            eixo = DashedLine(c + UP * (r + 0.4), c + DOWN * (r + 0.4)).set_stroke(MUTED, 2.5)
            tp = Line(c + UP * r, c + DOWN * r).set_stroke(GOLD, 7)
            ln = T("N", 30, INK).next_to(c + UP * (r + 0.4), RIGHT, buff=0.1)
            ls = T("S", 30, INK).next_to(c + DOWN * (r + 0.4), RIGHT, buff=0.1)
            self.play(FadeOut(VGroup(cima, tq, gira, vc, cap, caminho, bate, lw)), FadeIn(lado_v), FadeIn(ln), FadeIn(ls), run_time=0.6)
            self.play(Create(tp), run_time=0.7)
            n.wait_until("axis")
            le = T("pole to pole: along the spin axis", 26, GOLD).next_to(lado_v, DOWN, buff=0.45)
            self.play(Create(eixo), FadeIn(le), run_time=0.6)
        # ar: vai e vem cada vez menor (desenho de conceito com amortecimento ilustrativo)
        ax, p2s = eixos(x0 + 0.4, -3.15, 5.8, 1.75, 10, 1, -1)
        lxx = T("time", 24, MUTED).next_to(ax[0], DOWN, buff=0.1).align_to(ax[0], RIGHT)
        lyy = T("position", 24, MUTED).next_to(ax[1], UP, buff=0.1).align_to(ax[1], LEFT)
        ts = np.linspace(0, 10, 300)
        amort = curva(p2s, ts, np.exp(-0.32 * ts) * np.cos(2 * np.pi * ts / 1.6), C2, 4)
        with self.narrate(F("T09", 6)) as n:
            n.wait_until("air")
            itens[4] = item(4, "air resistance")
            self.play(FadeIn(itens[4]), run_time=0.4)
            n.wait_until("steal")
            self.play(Create(ax), FadeIn(lxx), FadeIn(lyy), run_time=0.5)
        with self.narrate(F("T09", 7)) as n:
            n.wait_until("never")
            self.play(Create(amort), run_time=max(1.5, n.until("shorter") + 0.4), rate_func=linear)
        with self.narrate(F("T09", 8)) as n:
            n.wait_until("rest")
            lr_ = T("at rest at the center", 24, C2).next_to(p2s(10, 0), UP, buff=0.15).shift(LEFT * 1.1)
            self.play(FadeIn(lr_), run_time=0.4)
        with self.narrate(F("T09", 9)) as n:
            n.wait_until("idealized")
            ideal = T("42 min: idealized model", 36, GOLD).move_to([-4.3, -2.75, 0])
            self.play(FadeOut(le), FadeIn(ideal), run_time=0.5)
            self.destacar(ideal, GOLD, buff=0.14)
        with self.narrate(F("T09", 10)) as n:
            n.wait_until("math")
            self.play(Indicate(tp, color=GOLD), run_time=0.8)
        self.clear_section()


# ---------------------------------------------------------------- T10 encerramento (marfim)
class T10_Encerramento(_Base):
    ESTILO = "v_marfim"

    def construct(self):
        tr = terra(2.85, real=False).move_to([-3.9, 0.0, 0])
        tn = tunel(tr, INK, 6)
        c, r = tr.get_center(), 2.85
        t = ValueTracker(0.0)
        cap = always_redraw(lambda: capsula(0.34).move_to(pos_unif(tr, t.get_value())))
        with self.narrate(F("T10", 1)) as n:
            self.play(FadeIn(tr), Create(tn), FadeIn(cap), run_time=0.8)
        xl = -0.6
        with self.narrate(F("T10", 2)) as n:
            n.wait_until("speed")
            l0 = T("start: speed 0", 30, INK).move_to([xl, c[1] + r - 0.1, 0], aligned_edge=LEFT)
            self.play(FadeIn(l0), run_time=0.4)
            self.play(t.animate.set_value(T_TRAV / 2), run_time=n.until("pass"), rate_func=linear)
            n.wait_until("top")
            l1 = T("center: top speed, 7.9 km/s", 30, GOOD).move_to([xl, c[1], 0], aligned_edge=LEFT)
            self.play(FadeIn(l1), run_time=0.4)
            n.wait_until("keep")
            self.play(t.animate.set_value(T_TRAV), run_time=max(1.0, n.remaining - 0.1), rate_func=linear)
        with self.narrate(F("T10", 3)) as n:
            n.wait_until("minutes")
            l2 = T("other side: about 42 min", 30, INK).move_to([xl, c[1] - r + 0.35, 0], aligned_edge=LEFT)
            self.play(FadeIn(l2), run_time=0.4)
            n.wait_until("zero")
            l3 = T("speed 0", 30, GOLD).next_to(l2, DOWN, buff=0.12).align_to(l2, LEFT)
            self.play(FadeIn(l3), run_time=0.4)
        with self.narrate(F("T10", 4)) as n:
            n.wait_until("falling")
            t.add_updater(lambda m, dt: m.increment_value(dt * T_TRAV / 2.6))
            self.add(t)
            n.wait_until("forever")
            lf = T("forever, if nothing is lost", 30, MUTED).move_to([4.0, 3.3, 0])
            self.play(FadeIn(lf), run_time=0.5)
        with self.narrate(F("T10", 5)) as n:
            n.wait_until("started")
            g1 = seta(c + UP * r + LEFT * 0.35 + DOWN * 0.1, c + UP * r + LEFT * 0.35 + DOWN * 1.1, C1, 6)
            self.play(GrowArrow(g1), run_time=0.5)
            n.wait_until("stops")
            g2 = seta(c + DOWN * r + LEFT * 0.35 + UP * 0.1, c + DOWN * r + LEFT * 0.35 + UP * 1.1, C1, 6)
            self.play(GrowArrow(g2), run_time=0.5)
            n.wait_until("force")
            lg = T("the same gravity", 34, C1).move_to([4.0, 2.55, 0])
            self.play(FadeIn(lg), run_time=0.4)
        topo_m = np.array([5.4, 1.6, 0])
        mola = always_redraw(lambda: mola_massa(topo_m, 1.75 - 0.6 * np.cos(W * t.get_value())))
        with self.narrate(F("T10", 6)) as n:
            n.wait_until("equation")
            eq = M(r"a = -\frac{g}{R}\,x", 60, INK).move_to([2.6, -1.2, 0])
            self.play(Write(eq), run_time=0.8)
            n.wait_until("spring")
            self.play(FadeIn(suporte(topo_m, 0.9)), FadeIn(mola), run_time=0.6)
        with self.narrate(F("T10", 7)) as n:
            n.wait_until("connection")
            liga = VGroup(DashedLine(eq.get_left() + LEFT * 0.15, c + r * np.array([0.93, -0.37, 0])).set_stroke(GOLD, 3),
                          DashedLine(eq.get_right() + RIGHT * 0.15, topo_m + DOWN * 1.9 + LEFT * 0.45).set_stroke(GOLD, 3))
            self.play(Create(liga), run_time=0.8)
            self.wait(max(0.0, n.remaining - 0.2))
        t.clear_updaters()
        preto = Rectangle(width=config.frame_width + 1, height=config.frame_height + 1).set_fill("#000000", 1).set_stroke(width=0)
        self.play(FadeIn(preto), run_time=0.6)
        self.wait(0.4)
