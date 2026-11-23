"""VORTTUM 003 (EN-US): How One Tree Turned Off 50 Million People.

16:9. Estilos VORTTUM (vorttum.py) variando por cena:
    V01 colagem (gancho)                 V02 papel envelhecido (2003)
    V03 Manim escuro (a máquina)         V04 Manim escuro (a cascata simulada)
    V05 colagem (por um triz)            V06 Bauhaus (existe um botão?)
    V07 papel envelhecido (o Sol)        V08 Manim escuro (hora a hora)
    V09 quadro com a mão (transformador) V10 marfim (encerramento)
Números: simulacao.py (graficos.json).
"""
import json
from pathlib import Path

from explainer import *
import vorttum  # noqa: F401  (registra os estilos VORTTUM)

AQUI = Path(__file__).parent
F = falas_do_roteiro(AQUI / "roteiro.md")
G = json.loads((AQUI / "graficos.json").read_text("utf-8"))
CASOS = G["casos"]

_UNI = {"−": r"\textminus{}", "×": r"$\times$", "→": r"$\rightarrow$", "≈": r"$\approx$", "÷": r"$\div$",
        "²": r"$^2$", "°": r"$^\circ$", "≥": r"$\geq$", "≤": r"$\leq$", "Δ": r"$\Delta$", "<": r"$<$"}


def T(s, size=34, color=INK, negrito=None):
    """Texto em LaTeX (Latin Modern, reto). Negrito a partir de 36 pt."""
    t = tex_escape(s)
    for k, v in _UNI.items():
        t = t.replace(k, v)
    if negrito if negrito is not None else size >= 36:
        t = r"\textbf{" + t + "}"
    return Tex(t, font_size=size * 1.12, color=color, tex_template=TEMPLATE)


def M(s, size=48, color=INK):
    return MathTex(s, font_size=size, color=color)


def linhas(*txts, size=32, color=INK, buff=0.14):
    return VGroup(*[T(x, size, color) for x in txts]).arrange(DOWN, aligned_edge=LEFT, buff=buff)


def seta(a, b, cor, w=6):
    return Arrow(a, b, buff=0, color=cor, stroke_width=w, max_tip_length_to_length_ratio=0.3, tip_length=0.22)


def cartao(txts, cor=GOLD, size=32, titulo=None):
    """Cartão com fundo (cresce com o texto). txts: lista de linhas."""
    corpo = linhas(*txts, size=size)
    if titulo:
        corpo = VGroup(T(titulo, 38, cor), corpo).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
    fundo = RoundedRectangle(corner_radius=0.12, width=corpo.width + 0.6, height=corpo.height + 0.5)
    fundo.set_fill(SHEET, 1).set_stroke(cor, 3).move_to(corpo)
    return VGroup(fundo, corpo)


# ---------------------------------------------------------------- desenhos
def arvore(h=2.2):
    tronco = Rectangle(width=h * 0.13, height=h * 0.42).set_fill(INK, 1).set_stroke(width=0)
    copa = VGroup(*[Circle(radius=h * r).set_fill(GOOD, 1).set_stroke(INK, 2).shift(UP * h * y + RIGHT * h * x)
                    for x, y, r in [(-0.17, 0.38, 0.2), (0.17, 0.4, 0.2), (0, 0.6, 0.24)]])
    tronco.move_to(UP * h * 0.02)
    return VGroup(tronco, copa)


def torre(h=2.6):
    b = h * 0.32
    pts = [LEFT * b / 2, UP * h, RIGHT * b / 2]
    corpo = VMobject().set_points_as_corners([pts[0], UP * h * 0.98 + LEFT * 0.06, UP * h * 0.98 + RIGHT * 0.06, pts[2]])
    corpo.set_stroke(INK, 4)
    braco = Line(UP * h * 0.8 + LEFT * b * 0.9, UP * h * 0.8 + RIGHT * b * 0.9).set_stroke(INK, 4)
    trav = VGroup(*[Line(LEFT * b * (0.5 - k * 0.1) + UP * h * (k * 0.2), RIGHT * b * (0.5 - (k + 1) * 0.1) + UP * h * ((k + 1) * 0.2))
                    .set_stroke(INK, 2) for k in range(4)])
    return VGroup(corpo, braco, trav)


def cabo(a, b, flecha=0.25, cor=INK, w=4):
    meio = (a + b) / 2 + DOWN * flecha
    return VMobject().set_points_smoothly([a, (a + meio) / 2 + DOWN * flecha * 0.25, meio,
                                           (meio + b) / 2 + DOWN * flecha * 0.25, b]).set_stroke(cor, w)


def cidades(n=70, w=4.6, h=2.8, seed=4, r=0.055, cor=GOLD):
    rng = np.random.default_rng(seed)
    pts = []
    while len(pts) < n:
        x, y = rng.uniform(-w / 2, w / 2), rng.uniform(-h / 2, h / 2)
        if (x / (w / 2)) ** 2 + (y / (h / 2)) ** 2 < 1 - 0.25 * rng.random():
            pts.append([x, y, 0])
    pts.sort(key=lambda p: p[0])                   # a onda de apagão vai da esquerda (Ohio) para a direita
    return VGroup(*[Dot(p, radius=r * rng.uniform(0.7, 1.4), color=cor) for p in pts])


def globo(r=2.2, n=60, seed=8):
    disco = Circle(radius=r).set_fill(SHEET, 1).set_stroke(INK, 3)
    lat = VGroup(*[Ellipse(width=2 * r * np.cos(a), height=0.22 * r * np.cos(a)).shift(UP * r * np.sin(a)).set_stroke(MUTED, 1.2)
                   for a in np.linspace(-1.1, 1.1, 5)])
    lon = VGroup(*[Ellipse(width=2 * r * k, height=2 * r).set_stroke(MUTED, 1.2) for k in (0.35, 0.75)])
    rng = np.random.default_rng(seed)
    luzes = VGroup()
    while len(luzes) < n:
        x, y = rng.uniform(-r, r, 2)
        if x * x + y * y < (0.9 * r) ** 2 and y > -0.55 * r:
            luzes.add(Dot([x, y, 0], radius=0.05, color=GOLD))
    return VGroup(disco, lat, lon, luzes)


def medidor(f0=60.0, fmin=57.0, fmax=61.0, r=1.8):
    """Mostrador de frequência (arco de 180°). Devolve (grupo, tracker, ponteiro)."""
    ang = lambda f: PI - (f - fmin) / (fmax - fmin) * PI
    arco = Arc(radius=r, start_angle=0, angle=PI).set_stroke(INK, 4)
    verde = Arc(radius=r * 0.9, start_angle=ang(60.5), angle=ang(59.5) - ang(60.5)).set_stroke(GOOD, 10)
    vermelho = Arc(radius=r * 0.9, start_angle=ang(59.0), angle=ang(fmin) - ang(59.0)).set_stroke(C1, 10)
    marcas = VGroup()
    for f in range(int(fmin), int(fmax) + 1):
        a = ang(f)
        marcas.add(Line(r * np.array([np.cos(a), np.sin(a), 0]) * 0.82, r * np.array([np.cos(a), np.sin(a), 0])).set_stroke(INK, 3))
        marcas.add(T(str(f), 24, MUTED).move_to(r * 1.18 * np.array([np.cos(a), np.sin(a), 0])))
    unid = T("Hz", 26, MUTED).move_to(DOWN * 0.35)
    tr = ValueTracker(f0)
    eixo = Dot(radius=0.08, color=INK)
    pont = always_redraw(lambda: Line(eixo.get_center(), eixo.get_center() + r * 0.78 * np.array(
        [np.cos(ang(tr.get_value())), np.sin(ang(tr.get_value())), 0])).set_stroke(GOLD, 6))
    return VGroup(arco, verde, vermelho, marcas, unid, eixo), tr, pont


def gerador(r=0.75, cor=GOOD):
    aro = Circle(radius=r).set_fill(SHEET, 1).set_stroke(cor, 5)
    raios = VGroup(*[Line(ORIGIN, UP * r * 0.85).rotate(k * TAU / 6, about_point=ORIGIN).set_stroke(INK, 4) for k in range(6)])
    marca = Dot(UP * r * 0.85, radius=0.07, color=GOLD)
    return VGroup(aro, raios, marca, Dot(radius=0.06, color=INK))


def gira(mob, vel):
    """Gira sozinho (updater com dt). vel: ValueTracker em rad/s."""
    mob.add_updater(lambda m, dt: m.rotate(-vel.get_value() * dt, about_point=m[0].get_center()))
    return mob


def interruptor(on=True, h=1.1):
    base = RoundedRectangle(corner_radius=0.1, width=h * 0.62, height=h).set_fill(SHEET, 1).set_stroke(INK, 3)
    alav = RoundedRectangle(corner_radius=0.06, width=h * 0.3, height=h * 0.42).set_fill(GOOD if on else C2, 1).set_stroke(INK, 2)
    alav.move_to(base.get_center() + (UP if on else DOWN) * h * 0.18)
    return VGroup(base, alav)


def eixos(x0, y0, w, h, xmin, xmax, ymin, ymax):
    def p2s(x, y):
        return np.array([x0 + w * (x - xmin) / (xmax - xmin), y0 + h * (y - ymin) / (ymax - ymin), 0])
    ex = Line(p2s(xmin, ymin), p2s(xmax, ymin)).set_stroke(MUTED, 2.5)
    ey = Line(p2s(xmin, ymin), p2s(xmin, ymax)).set_stroke(MUTED, 2.5)
    return VGroup(ex, ey), p2s


def curva_pts(p2s, xs, ys, cor, w=5, ymin=None):
    pts = [p2s(x, max(y, ymin) if ymin is not None else y) for x, y in zip(xs, ys)]
    return VMobject().set_points_as_corners(pts).set_stroke(cor, w)


def tracejada(a, b, cor=MUTED, w=2.5):
    return DashedLine(a, b, dash_length=0.12).set_stroke(cor, w)


def casa(s=0.42, cor=GOLD):
    corpo = Square(side_length=s).set_fill(cor, 1).set_stroke(INK, 2)
    teto = Polygon(corpo.get_corner(UL) + LEFT * 0.05, corpo.get_corner(UR) + RIGHT * 0.05, corpo.get_top() + UP * s * 0.5)
    teto.set_fill(INK, 1).set_stroke(INK, 2)
    return VGroup(corpo, teto)


class _Base(ExplainerScene):
    VOICE = "en-US-AndrewMultilingualNeural"
    RATE = "+0%"
    TITLE_AREA = False


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


# ---------------------------------------------------------------- V01 gancho (colagem)
class V01_Gancho(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V01", k) for k in range(1, 4)]
    CAUDA = 1.1


# ---------------------------------------------------------------- V02 uma árvore (papel envelhecido)
class V02_Arvore(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V02", k) for k in range(1, 10)]
    CAUDA = 0.5


# ---------------------------------------------------------------- V03 a máquina de 5 segundos (Manim escuro)
class V03_Maquina(_Base):
    ESTILO = "v_doc"

    def construct(self):
        vel = ValueTracker(2.2)
        self.add(vel)
        gens = VGroup(*[gerador(1.0) for _ in range(3)]).arrange(RIGHT, buff=0.9).move_to([-2.2, 1.5, 0])
        with self.narrate(F("V03", 1)) as n:
            self.play(FadeIn(gens[0]), run_time=0.5)
            gira(gens[0], vel)
            n.wait_until("generator")
            rg = T("generator", 30, MUTED).next_to(gens[0], DOWN, buff=0.2)
            self.play(FadeIn(rg), run_time=0.3)
            n.wait_until("sync")
            for g in gens[1:]:
                gira(g, vel)
            self.play(FadeIn(gens[1:]), run_time=0.6)
        with self.narrate(F("V03", 2)) as n:
            n.wait_until("sixty")
            hz = T("60 times per second = 60 Hz", 38, GOLD).next_to(gens, DOWN, buff=0.75)
            self.play(FadeOut(rg), FadeIn(hz), run_time=0.5)
            n.wait_until("charger")
            ch = cartao(["INPUT: 100-240 V", "50/60 Hz"], MUTED, 28).move_to([4.6, 1.5, 0])
            self.play(FadeIn(ch, shift=LEFT * 0.2), run_time=0.5)
        with self.narrate(F("V03", 3)) as n:
            n.wait_until("rule")
            self.play(FadeOut(ch), run_time=0.3)
            entra = cartao(["power made"], GOOD, 34).move_to([-2.2, -2.3, 0])
            sai = cartao(["power used"], C1, 34).move_to([2.2, -2.3, 0])
            n.wait_until("in")
            self.play(FadeIn(entra), run_time=0.4)
            n.wait_until("out")
            igual = T("=", 54, INK).move_to((entra.get_right() + sai.get_left()) / 2)
            self.play(FadeIn(sai), FadeIn(igual), run_time=0.4)
        with self.narrate(F("V03", 4)) as n:
            n.wait_until("up")
            self.play(vel.animate.set_value(3.6), run_time=0.6)
            n.wait_until("down")
            self.play(vel.animate.set_value(1.2), run_time=0.6)
            n.wait_until("meter")
            self.play(vel.animate.set_value(2.2), hz.animate.set_color(GOOD), run_time=0.6)
        with self.narrate(F("V03", 5)) as n:
            n.wait_until("turbines")
            tag = T("tuned to one exact speed", 32, INK).move_to([4.6, 1.5, 0])
            self.play(FadeIn(tag), run_time=0.4)
            n.wait_until("vibrate")
            self.play(Wiggle(gens, scale_value=1.04, rotation_angle=0.03 * TAU, n_wiggles=8), run_time=1.0)
            n.wait_until("watches")
            self.play(Circumscribe(hz, color=GOLD), run_time=0.8)
        for g in gens:
            g.clear_updaters()
        self.clear_section(run_time=0.5)
        eq = MathTex(r"\frac{2H}{f_0}", r"\,\frac{df}{dt}", r"\;=\;", r"\frac{P_{\text{made}} - P_{\text{used}}}{S}",
                     font_size=64, color=INK).move_to([0, 1.8, 0])
        eq.sem_caixa = True
        with self.narrate(F("V03", 6)) as n:
            n.wait_until("engineers")
            self.play(Write(eq), run_time=1.4)
            n.wait_until("left")
            c1 = SurroundingRectangle(eq[1], color=C1, buff=0.08)
            l1 = T("how fast the frequency changes", 30, C1).next_to(eq, DOWN, buff=0.5).to_edge(LEFT, buff=1.0)
            self.play(Create(c1), FadeIn(l1), run_time=0.5)
            n.wait_until("right")
            c2 = SurroundingRectangle(eq[3], color=GOOD, buff=0.08)
            l2 = T("the gap: made minus used", 30, GOOD).next_to(eq, DOWN, buff=0.5).to_edge(RIGHT, buff=1.0)
            self.play(Create(c2), FadeIn(l2), run_time=0.5)
        with self.narrate(F("V03", 7)) as n:
            n.wait_until("inertia")
            c3 = SurroundingRectangle(eq[0], color=GOLD, buff=0.08)
            l3 = T("H = inertia: energy stored in the spinning metal", 32, GOLD).move_to([0, -0.4, 0])
            self.play(FadeOut(c1), FadeOut(c2), Create(c3), FadeIn(l3), run_time=0.6)
        self.clear_section(run_time=0.5)
        with self.narrate(F("V03", 8)) as n:
            cab = T("The US grid, 2025:", 40, GOLD).move_to([-6.2, 2.7, 0], aligned_edge=LEFT)
            self.play(FadeIn(cab), run_time=0.4)
            n.wait_until("four")
            a1 = T("4,430 TWh in a year", 36, INK).next_to(cab, DOWN, aligned_edge=LEFT, buff=0.45)
            self.play(FadeIn(a1), run_time=0.4)
            n.wait_until("average")
            a2 = M(r"\frac{4{,}430\ \text{TWh}}{8{,}760\ \text{h}} \approx 506\ \text{GW}", 50).next_to(a1, DOWN, aligned_edge=LEFT, buff=0.45)
            self.play(Write(a2), run_time=1.0)
        with self.narrate(F("V03", 9)) as n:
            n.wait_until("typical")
            a3 = M(r"H \approx 4\ \text{s}", 50, GOLD).next_to(a2, DOWN, aligned_edge=LEFT, buff=0.5)
            self.play(Write(a3), run_time=0.5)
            n.wait_until("five")
            res = T("about 5 seconds", 64, GOLD).move_to([2.9, -0.5, 0])
            sub = T("of the whole country, on spinning metal alone", 26, MUTED).next_to(res, DOWN, buff=0.65)
            self.destacar(res, buff=0.35)
            self.play(FadeIn(res), FadeIn(sub), run_time=0.5)
        with self.narrate(F("V03", 10)) as n:
            barra = Rectangle(width=6.0, height=0.36).set_fill(GOLD, 1).set_stroke(width=0).move_to([0, -3.0, 0])
            rot = T("5 s", 30, INK).next_to(barra, LEFT, buff=0.2)
            n.wait_until("cushion")
            self.play(FadeIn(barra), FadeIn(rot), run_time=0.4)
            n.wait_until("everything")
            jan = T("everything must react inside this window", 30, INK).next_to(barra, UP, buff=0.25)
            self.play(FadeIn(jan), run_time=0.5)
        self.clear_section(run_time=0.5)


# ---------------------------------------------------------------- V04 a cascata (Manim escuro, simulação)
class V04_Cascata(_Base):
    ESTILO = "v_doc"

    def grade(self):
        pts = [[-6.5 + 0.13 * (k % 40), 2.5 - 0.2 * (k // 40), 0] for k in range(1000)]
        return VGroup(*[Dot(p, radius=0.045, color=GOOD) for p in pts])

    @staticmethod
    def apaga(usinas, desliga, tr):
        """Pinta de C1 as usinas cujo relé já disparou (um updater só, em ordem de disparo)."""
        desl = np.array([np.inf if x is None else x for x in desliga])
        ordem = np.argsort(desl)
        estado = {"k": 0}

        def up(g):
            t = tr.get_value()
            while estado["k"] < len(ordem) and desl[ordem[estado["k"]]] <= t:
                g[int(ordem[estado["k"]])].set_color(C1)
                estado["k"] += 1
        usinas.add_updater(up)

    def construct(self):
        usinas = self.grade()
        ax, p2s = eixos(0.6, -2.4, 6.0, 4.6, 0, 6, 56.5, 60.3)
        marcas_y = VGroup(*[T(f"{v:g}", 22, MUTED).next_to(p2s(0, v), LEFT, buff=0.12) for v in (57, 58, 59, 60)])
        tick_x = VGroup(*[T(str(v), 22, MUTED).next_to(p2s(v, 56.5), DOWN, buff=0.1) for v in range(0, 7)])
        rot_x = T("seconds", 24, MUTED).next_to(tick_x, DOWN, buff=0.12)
        with self.narrate(F("V04", 1)) as n:
            self.play(FadeIn(usinas, lag_ratio=0.01), run_time=1.4)
            n.wait_until("thousand")
            rot = T("1,000 power plants", 30, MUTED).next_to(usinas, DOWN, buff=0.25)
            self.play(FadeIn(rot), run_time=0.3)
        with self.narrate(F("V04", 2)) as n:
            n.wait_until("frequency")
            self.play(Create(ax), FadeIn(marcas_y), FadeIn(tick_x), FadeIn(rot_x), run_time=0.8)
            sessenta = tracejada(p2s(0, 60), p2s(6, 60), GOOD)
            self.play(Create(sessenta), run_time=0.4)
            n.wait_until("half")
            faixa = Rectangle(width=6.0, height=p2s(0, 58.9)[1] - p2s(0, 57.5)[1]).set_fill(C1, 0.18).set_stroke(width=0)
            faixa.move_to((p2s(0, 57.5) + p2s(6, 58.9)) / 2)
            lf = T("relays trip here", 26, C1).move_to(p2s(1.1, 58.2))
            self.play(FadeIn(faixa), FadeIn(lf), run_time=0.5)

        def corre(caso, cor, n, ate=None, dur=3.0, com_usinas=True):
            c = CASOS[caso]
            ts, fs = np.array(c["t"]), np.array(c["f"])
            fim = ts[-1] if ate is None else ate
            tr = ValueTracker(0.0)

            def desenha():
                k = max(2, int(np.searchsorted(ts, tr.get_value())))
                return curva_pts(p2s, ts[:k], fs[:k], cor, 5, ymin=56.5)
            linha = always_redraw(desenha)
            self.add(linha)
            if com_usinas:
                self.apaga(usinas, c["desliga"], tr)
            self.play(tr.animate.set_value(min(fim, 6.0)), run_time=dur, rate_func=linear)
            usinas.clear_updaters()
            linha.clear_updaters()
            return linha

        with self.narrate(F("V04", 3)) as n:
            n.wait_until("five")
            l5 = corre("p5", GOLD, n, dur=2.2)
            n.wait_until("holds")
            r5 = T("5%: holds at 59.43 Hz", 28, GOLD).move_to([0.7, 3.45, 0], aligned_edge=LEFT)
            self.play(FadeIn(r5), run_time=0.4)
        with self.narrate(F("V04", 4)) as n:
            n.wait_until("eight")
            self.play(l5.animate.set_stroke(opacity=0.3), r5.animate.set_opacity(0.4), run_time=0.3)
            l8 = corre("p8", C1, n, ate=2.6, dur=n.remaining + 0.2)
        with self.narrate(F("V04", 5)) as n:
            c8 = CASOS["p8"]
            ts8, fs8 = np.array(c8["t"]), np.array(c8["f"])
            tr2 = ValueTracker(2.6)
            self.apaga(usinas, c8["desliga"], tr2)
            l8b = always_redraw(lambda: curva_pts(p2s, ts8[:max(2, int(np.searchsorted(ts8, tr2.get_value())))],
                                                  fs8[:max(2, int(np.searchsorted(ts8, tr2.get_value())))], C1, 5, ymin=56.5))
            self.remove(l8)
            self.add(l8b)
            n.wait_until("inertia")
            self.play(tr2.animate.set_value(4.0), run_time=n.remaining + 0.2, rate_func=linear)
            usinas.clear_updaters()
            l8b.clear_updaters()
        with self.narrate(F("V04", 6)) as n:
            n.wait_until("gone")
            r8 = T("8%: total collapse in 3.9 s", 28, C1).move_to([0.85, 2.8, 0], aligned_edge=LEFT)
            self.destacar(r8, C1, buff=0.15)
            self.play(FadeIn(r8), run_time=0.4)
            n.wait_until("ten")
            l10 = corre("p10", C1, n, dur=1.0, com_usinas=False)
            r10 = T("10%: 2.5 s", 28, C1).next_to(r8, RIGHT, buff=0.55)
            self.play(FadeIn(r10), run_time=0.3)
        with self.narrate(F("V04", 7)) as n:
            n.wait_until("paradox")
            par = cartao(["The safety relay that", "protects each plant", "is what spreads", "the blackout."], GOLD, 34).move_to(usinas)
            self.play(FadeIn(par, shift=UP * 0.2), FadeOut(rot), run_time=0.6)
        self.clear_section(run_time=0.5)
        # segunda rodada: 10% com corte de carga
        usinas = self.grade()
        with self.narrate(F("V04", 8)) as n:
            n.wait_until("ten")
            self.play(Create(ax), FadeIn(marcas_y), FadeIn(tick_x), FadeIn(rot_x), run_time=0.8)
            n.wait_until("point")
            corte = tracejada(p2s(0, 59.3), p2s(6, 59.3), C2, 3)
            lc = T("59.3 Hz: cut 5% of customers", 26, C2).next_to(corte, UP, buff=0.08).align_to(corte, RIGHT)
            self.play(Create(corte), FadeIn(lc), run_time=0.6)
        casas = VGroup(*[casa(0.5) for _ in range(20)]).arrange_in_grid(4, 5, buff=0.3).move_to([-3.6, 0.2, 0])
        with self.narrate(F("V04", 9)) as n:
            n.wait_until("relays")
            self.play(FadeIn(casas), run_time=0.5)
            n.wait_until("shedding")
            ufls = T("under-frequency load shedding", 30, C2).next_to(casas, DOWN, buff=0.3)
            self.play(FadeIn(ufls), run_time=0.4)
        with self.narrate(F("V04", 10)) as n:
            n.wait_until("time")
            lc10 = corre("p10_corte", GOLD, n, dur=2.4)
            self.play(casas[-1][0].animate.set_fill(C2, 1), run_time=0.3)
            lcasa = T("1 in 20 homes: cut", 28, C2).next_to(casas, UP, buff=0.3)
            self.play(FadeIn(lcasa), run_time=0.3)
            n.wait_until("survives")
            rs = T("10% + cut: lowest 59.19 Hz, grid survives", 28, GOLD).move_to([3.6, 2.85, 0])
            self.destacar(rs, GOLD, buff=0.15)
            self.play(FadeIn(rs), run_time=0.4)
            n.wait_until("dark")
            self.play(casas[-1].animate.set_opacity(0.45), run_time=0.4)
        with self.narrate(F("V04", 11)) as n:
            n.wait_until("only")
            fr = cartao(["Turn people off", "before the machines", "turn themselves off."], C2, 34).move_to([-3.6, 0.2, 0])
            self.play(FadeOut(VGroup(casas, lcasa, ufls)), FadeIn(fr), run_time=0.6)
        self.clear_section(run_time=0.5)


# ---------------------------------------------------------------- V05 por um triz (colagem)
class V05_PorUmTriz(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V05", k) for k in range(1, 10)]
    CAUDA = 0.5


# ---------------------------------------------------------------- V06 existe um botão? (Bauhaus)
class V06_Botao(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V06", k) for k in range(1, 8)]
    CAUDA = 0.5


# ---------------------------------------------------------------- V07 o Sol (papel envelhecido)
class V07_Sol(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V07", k) for k in range(1, 12)]
    CAUDA = 0.5


# ---------------------------------------------------------------- V08 hora a hora (Manim escuro)
class V08_HoraHora(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V08", k) for k in range(1, 10)]
    CAUDA = 0.5


# ---------------------------------------------------------------- V09 por que não voltaria (quadro com a mão)
class V09_Transformador(_Quadro):
    ESTILO = "v_quadro"

    def construct(self):
        dx = 1.2
        nucleo = Rectangle(width=2.6, height=2.6).set_stroke(INK, 10).move_to([-4.0 + dx, 0.6, 0])
        bob1 = VGroup(*[Line([-5.55 + dx, 1.2 - 0.18 * k, 0], [-4.95 + dx, 1.2 - 0.18 * k, 0]).set_stroke(C2, 4) for k in range(7)])
        bob2 = VGroup(*[Line([-3.05 + dx, 1.2 - 0.18 * k, 0], [-2.45 + dx, 1.2 - 0.18 * k, 0]).set_stroke(GOLD, 4) for k in range(7)])
        with self.narrate(F("V09", 1)) as n:
            n.wait_until("transformer")
            self.play(Create(nucleo), run_time=0.8)
            self.play(Create(bob1), Create(bob2), run_time=0.8)
            n.wait_until("voltage")
            l = T("steps the voltage up and down", 30, INK).next_to(nucleo, DOWN, buff=0.35)
            self.play(Write(l), run_time=0.8)
        with self.narrate(F("V09", 2)) as n:
            n.wait_until("current")
            dc = seta([-6.6, 0.0, 0], [bob1.get_left()[0] - 0.15, 0.0, 0], C1, 6)
            ldc = T("storm current", 28, C1).next_to(dc, DOWN, buff=0.25)
            self.play(GrowArrow(dc), FadeIn(ldc), run_time=0.6)
            n.wait_until("saturates")
            s1 = T("core saturates", 32, C1).move_to([1.4, 1.6, 0], aligned_edge=LEFT)
            self.play(Write(s1), nucleo.animate.set_stroke(C1, 10), run_time=0.6)
            n.wait_until("overheat")
            s2 = T("windings overheat", 32, C1).next_to(s1, DOWN, aligned_edge=LEFT, buff=0.3)
            self.play(Write(s2), run_time=0.6)
            n.wait_until("cook")
            s3 = T("it cooks from the inside", 32, C1).next_to(s2, DOWN, aligned_edge=LEFT, buff=0.3)
            self.play(Write(s3), run_time=0.6)
        with self.narrate(F("V09", 3)) as n:
            n.wait_until("three")
            num = T("350+ transformers", 52, GOLD).move_to([3.6, -1.7, 0])
            sub = T("one moderately severe storm, US (report)", 26, MUTED).next_to(num, DOWN, buff=0.25)
            self.play(Write(num), FadeIn(sub), run_time=0.8)
        self.clear_section(run_time=0.5)
        cab = T("Wait for a large transformer:", 40, INK).move_to([-6.2, 2.6, 0], aligned_edge=LEFT)
        with self.narrate(F("V09", 4)) as n:
            n.wait_until("buy")
            self.play(Write(cab), run_time=0.7)
            n.wait_until("ten")
            b1 = Rectangle(width=6.0 * 16 / 30, height=0.55).set_fill(C2, 0.6).set_stroke(INK, 3).move_to([-6.2, 1.4, 0], aligned_edge=LEFT)
            l1 = T("2010: 5 to 16 months", 30, INK).next_to(b1, RIGHT, buff=0.2)
            self.play(Create(b1), Write(l1), run_time=0.7)
            n.wait_until("today")
            b2 = Rectangle(width=6.0 * 29.5 / 30, height=0.55).set_fill(C1, 0.6).set_stroke(INK, 3).move_to([-6.2, 0.4, 0], aligned_edge=LEFT)
            l2 = T("today: 128 weeks", 30, INK).next_to(b2, RIGHT, buff=0.2)
            self.play(Create(b2), Write(l2), run_time=0.8)
        with self.narrate(F("V09", 5)) as n:
            n.wait_until("half")
            conta = M(r"\frac{128\ \text{weeks}}{52} \approx 2.5\ \text{years}", 56).move_to([-1.6, -1.4, 0])
            self.play(Write(conta), run_time=1.0)
            n.wait_until("hundreds")
            h = T("x hundreds, ordered the same week", 34, C1).next_to(conta, DOWN, buff=0.4)
            self.play(Write(h), run_time=0.8)
        self.clear_section(run_time=0.5)


# ---------------------------------------------------------------- V10 encerramento (marfim)
class V10_Fim(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V10", k) for k in range(1, 5)]
    CAUDA = 1.2
