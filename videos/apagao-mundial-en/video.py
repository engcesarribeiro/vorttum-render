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
class V03_Maquina(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V03", k) for k in range(1, 11)]
    CAUDA = 0.5


class V04_Cascata(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V04", k) for k in range(1, 12)]
    CAUDA = 0.5


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
class V09_Transformador(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V09", k) for k in range(1, 6)]
    CAUDA = 0.5


class V10_Fim(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("V10", k) for k in range(1, 5)]
    CAUDA = 1.2
