"""VORTTUM 001 (EN-US): I Tried to Beat a Casino With Math. Did It Work?

16:9. Estilos VORTTUM (vorttum.py) variando por cena:
    A01 Remotion papel (gancho, roleta)      A02 colagem (mecanismo)
    A03 Remotion recorte (37 casas)          A04 papel envelhecido (progressão geométrica)
    A05 Bauhaus (bancas)                     A06 Remotion papel (primeiros giros)
    A07 Manim escuro (um milhão de giros)    A08 quadro com a mão (valor esperado)
    A09 papel envelhecido (consequência)     A10 marfim (encerramento)
Todos os números vêm de simulacao.py / repeticoes.py / dados_graficos.py (semente 2026).
"""
import json
from pathlib import Path

from explainer import *
import vorttum  # noqa: F401  (registra os estilos VORTTUM)

AQUI = Path(__file__).parent
F = falas_do_roteiro(AQUI / "roteiro.md")
G = json.loads((AQUI / "graficos.json").read_text("utf-8"))
REP = json.loads((AQUI / "repeticoes.json").read_text("utf-8"))

ORDEM = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
         20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
VERMELHAS = {1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36}


_UNI = {"\u2212": r"\textminus{}", "\u00d7": r"$\times$", "\u2192": r"$\rightarrow$", "\u2260": r"$\neq$",
        "\u2248": r"$\approx$", "\u22ef": r"$\cdots$"}


def T(s, size=34, color=INK, negrito=None):
    """Texto em LaTeX (Latin Modern, reto). Negrito a partir de 36 pt, para ler bem no vídeo."""
    t = tex_escape(s)
    for k, v in _UNI.items():
        t = t.replace(k, v)
    if negrito if negrito is not None else size >= 36:
        t = r"\textbf{" + t + "}"
    return Tex(t, font_size=size * 1.12, color=color, tex_template=TEMPLATE)


def usd(v, sinal=False):
    s = f"${abs(v):,}" if float(v).is_integer() else f"${abs(v):,.2f}"
    if v < 0:
        return "−" + s
    return ("+" + s) if sinal else s


def roleta(r=1.2):
    """Roleta europeia vista de cima: 37 casas na ordem real (vermelho, preto e o zero verde)."""
    casas = VGroup()
    for k, num in enumerate(ORDEM):
        cor = GOOD if num == 0 else (C1 if num in VERMELHAS else INK)
        a = AnnularSector(inner_radius=r * 0.66, outer_radius=r, angle=TAU / 37,
                          start_angle=PI / 2 - (k + 0.5) * TAU / 37)
        casas.add(a.set_fill(cor, 1).set_stroke(SHEET, 1.2))
    aro = Circle(radius=r).set_stroke(INK, 2.5)
    miolo = Circle(radius=r * 0.66).set_fill(SHEET, 1).set_stroke(INK, 1.5)
    cubo = VGroup(Circle(radius=r * 0.16).set_fill(MUTED, 1).set_stroke(width=0),
                  *[Line(ORIGIN, r * 0.45 * np.array([np.cos(t), np.sin(t), 0])).set_stroke(MUTED, 3)
                    for t in np.arange(4) * PI / 2 + PI / 4])
    return VGroup(casas, aro, miolo, cubo)


def ficha(valor, r=0.42):
    c = Circle(radius=r).set_fill(GOLD, 1).set_stroke(INK, 2)
    anel = Circle(radius=r * 0.78).set_stroke(SHEET, 2.5).set_fill(opacity=0)
    t = T(usd(valor), 22 if valor < 1000 else 18, SHEET)
    return VGroup(c, anel, t.move_to(c))


def escada(n=30, passo=0.09, queda=3.6, largura=8.0):
    """Muitos ganhos pequenos e uma queda grande (desenho de conceito, não é dado)."""
    pts = [np.array([0, 0, 0])]
    dx = largura / (n + 2)
    for k in range(n):
        p = pts[-1]
        pts += [p + RIGHT * dx, p + RIGHT * dx + UP * passo]
    sobe = VMobject().set_points_as_corners(pts).set_stroke(GOLD, 4)
    fim = pts[-1]
    cai = VMobject().set_points_as_corners([fim, fim + RIGHT * dx * 0.6 + DOWN * queda]).set_stroke(BAD, 5)
    base = DashedLine(pts[0] + LEFT * 0.2, pts[0] + RIGHT * (largura + 0.2)).set_stroke(MUTED, 2)
    return VGroup(base, sobe, cai)


class _Base(ExplainerScene):
    VOICE = "en-US-AndrewMultilingualNeural"
    RATE = "+5%"                 # vídeo inteiro 5% mais rápido; gancho (A01) e investidor (A09) a +10%
    TITLE_AREA = False

    def esmaece(self, op=0.15, run_time=0.5):
        """Em vez de limpar a tela entre ideias: o quadro atual fica apagado até a ideia nova entrar
        (aí sai com FadeOut junto da entrada do novo). Evita tela vazia só com voz."""
        conteudo = [m for m in self.mobjects if id(m) not in self._chrome and m is not self._title
                    and not isinstance(m, ValueTracker) and any(len(x.points) for x in m.get_family())]
        g = Group(*conteudo)
        if conteudo:
            self.play(g.animate.set_opacity(op), run_time=run_time)
        return g


# ---------------------------------------------------------------- A01 gancho (Remotion)
class A01_Gancho(RemotionScene):
    VOICE = _Base.VOICE
    RATE = "+10%"
    ESTILO = "v_remotion"
    FALAS = [F("A01", k) for k in range(1, 7)]
    CAUDA = 0.5


# ---------------------------------------------------------------- A02 mecanismo (colagem)
class A02_Estrategia(_Base):
    ESTILO = "v_colagem"

    def construct(self):
        # mesa: casas vermelha e preta de papel recortado
        verm = Rectangle(width=2.6, height=1.7).set_fill(C1, 1).set_stroke(width=0)
        pret = Rectangle(width=2.6, height=1.7).set_fill(INK, 1).set_stroke(width=0)
        mesa = VGroup(verm, pret).arrange(RIGHT, buff=0.25).move_to([-4.1, 0.45, 0])
        rv = T("RED", 32, SHEET).move_to(verm.get_bottom() + UP * 0.3)
        rp = T("BLACK", 32, SHEET).move_to(pret.get_bottom() + UP * 0.3)
        mesa_g = VGroup(estilos.sombra_recorte(verm), estilos.sombra_recorte(pret), mesa, rv, rp)
        banca = T("Bankroll: $1,000", 40, INK).move_to([-4.1, 2.35, 0])
        roda = roleta(0.9).move_to([-4.1, -1.85, 0])

        xs = [0.55, 2.45, 4.25, 5.95]
        ys = [2.1, 1.3, 0.5, -0.3]

        def linha(k, aposta, cor_nome, saldo):
            cel = [T(f"Round {k}", 32, MUTED), T(f"bet {usd(aposta)}", 32, INK),
                   T(cor_nome, 32, C1 if cor_nome == "red" else INK), T(usd(saldo), 32, GOLD if saldo > 1000 else INK)]
            for c, x in zip(cel, xs):
                c.move_to([x, ys[k - 1], 0])
            return VGroup(*cel)

        def gira(n, ate):
            return Rotate(roda, -TAU * 1.5, run_time=max(0.6, n.until(ate)), rate_func=smooth)

        with self.narrate(F("A02", 1)) as n:
            n.wait_until("strategy")
            self.play(FadeIn(mesa_g), run_time=0.6)
            n.wait_until("thousand")
            self.play(FadeIn(banca, shift=DOWN * 0.1))
        with self.narrate(F("A02", 2)) as n:
            n.wait_until("ten")
            ch = ficha(10).move_to(verm.get_center() + UP * 0.25)
            self.play(FadeIn(ch, shift=DOWN * 0.3), run_time=0.5)
            n.wait_until("spins")
            self.play(FadeIn(roda), run_time=0.3)
            self.play(gira(n, "black"))
            self.play(Indicate(pret, color=INK, scale_factor=1.05), run_time=0.5)
            n.wait_until("lost")
            l1 = linha(1, 10, "black", 990)
            self.play(FadeIn(l1, shift=LEFT * 0.2), FadeOut(ch), run_time=0.6)
        with self.narrate(F("A02", 3)) as n:
            n.wait_until("twenty")
            ch = ficha(20).move_to(verm.get_center() + UP * 0.25)
            self.play(FadeIn(ch, shift=DOWN * 0.3), run_time=0.5)
            n.wait_until("spins")
            self.play(gira(n, "black"))
            n.wait_until("loss")
            l2 = linha(2, 20, "black", 970)
            self.play(FadeIn(l2, shift=LEFT * 0.2), FadeOut(ch), run_time=0.6)
        baixa = T("down: −$30", 38, BAD).move_to([3.25, -1.5, 0])
        with self.narrate(F("A02", 4)) as n:
            n.wait_until("thirty")
            self.play(FadeIn(baixa), run_time=0.5)
            n.wait_until("forty")
            ch = ficha(40).move_to(verm.get_center() + UP * 0.25)
            self.play(FadeIn(ch, shift=DOWN * 0.3), self.gira_curta(roda), run_time=0.8)
            n.wait_until("lose")
            l3 = linha(3, 40, "black", 930)
            self.play(FadeIn(l3, shift=LEFT * 0.2), FadeOut(ch), run_time=0.6)
        with self.narrate(F("A02", 5)) as n:
            n.wait_until("seventy")
            self.play(Transform(baixa, T("down: −$70", 38, BAD).move_to(baixa)), run_time=0.5)
            n.wait_until("eighty")
            ch = ficha(80).move_to(verm.get_center() + UP * 0.25)
            self.play(FadeIn(ch, shift=DOWN * 0.3), run_time=0.5)
            self.play(gira(n, "win"))
            n.wait_until("win")
            l4 = linha(4, 80, "red", 1010)
            self.play(Indicate(verm, color=C1, scale_factor=1.05), FadeIn(l4, shift=LEFT * 0.2), run_time=0.7)
        conta = T("+$80 − $70 = +$10", 44, INK).move_to([3.25, -1.5, 0])
        with self.narrate(F("A02", 6)) as n:
            n.wait_until("profit")
            ganho = T("+$80", 44, GOLD).move_to([3.25, -1.5, 0])
            self.play(FadeOut(baixa), FadeIn(ganho), run_time=0.5)
            n.wait_until("seventy")
            self.play(FadeTransform(ganho, conta), run_time=0.6)
            n.wait_until("exactly")
            cx = self.destacar(conta, GOLD, buff=0.25)
        with self.narrate(F("A02", 7)) as n:
            n.wait_until("three")
            r3 = SurroundingRectangle(VGroup(l1, l2, l3), color=BAD, buff=0.15)
            self.play(Create(r3), run_time=0.6)
            n.wait_until("single")
            r4 = SurroundingRectangle(l4, color=GOLD, buff=0.15)
            self.play(Create(r4), run_time=0.6)
            n.wait_until("profit")
            self.play(VGroup(cx, conta).animate(rate_func=there_and_back).scale(1.08), run_time=0.6)
        dim = self.esmaece()

        with self.narrate(F("A02", 8)) as n:
            n.wait_until("Martingale")
            nome = T("The Martingale", 72, INK).move_to([0, 2.0, 0])
            sub = T("around for centuries", 34, MUTED).next_to(nome, DOWN, buff=0.3)
            self.play(FadeOut(dim), FadeIn(nome, shift=DOWN * 0.15), run_time=0.7)
            n.wait_until("centuries")
            self.play(FadeIn(sub), run_time=0.6)

        def seq(rs):
            bolas = VGroup(*[VGroup(Circle(radius=0.27).set_fill(GOLD if r == "W" else BAD, 1).set_stroke(width=0),
                                    T(r, 24, SHEET)) for r in rs]).arrange(RIGHT, buff=0.15)
            for b in bolas:
                b[1].move_to(b[0])
            return VGroup(bolas, T("→  +$10", 32, GOLD)).arrange(RIGHT, buff=0.4)

        seqs = VGroup(seq("LLLW"), seq("W"), seq("LW"), seq("LLLLLW")).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        seqs.move_to([0, -1.25, 0])
        with self.narrate(F("A02", 9)) as n:
            n.wait_until("sequences")
            self.play(LaggedStart(*[FadeIn(s, shift=RIGHT * 0.2) for s in seqs], lag_ratio=0.25), run_time=1.6)
            n.wait_until("once")
            ws = VGroup(*[s[0][-1] for s in seqs])
            self.play(*[Circumscribe(w, Circle, color=GOLD) for w in ws], run_time=0.9)
        dim = self.esmaece()
        with self.narrate(F("A02", 10)) as n:
            n.wait_until("single")
            q1 = T("One win recovers every loss before it.", 40, INK).move_to([0, 0.8, 0])
            self.play(FadeOut(dim), FadeIn(q1), run_time=0.6)
            n.wait_until("casinos")
            q2 = T("So why didn't casinos go broke?", 48, C1).next_to(q1, DOWN, buff=0.5)
            self.play(FadeIn(q2, shift=UP * 0.1), run_time=0.7)
        self.clear_section()

    def gira_curta(self, roda):
        return Rotate(roda, -TAU * 1.2, rate_func=smooth)


# ---------------------------------------------------------------- A03 37 casas (Remotion)
class A03_Detalhe(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("A03", k) for k in range(1, 8)]
    CAUDA = 0.5


# ---------------------------------------------------------------- A04 progressão (papel)
class A04_Sequencia(_Base):
    ESTILO = "v_papel"

    def construct(self):
        apostas = [10 * 2 ** k for k in range(11)]
        xs = np.linspace(-6.25, 6.25, 11)
        base_y, hmax = -1.95, 4.15

        def barra(k, maximo, cor=C1):
            h = max(0.025, hmax * apostas[k] / maximo)
            return Rectangle(width=0.72, height=h).set_fill(cor, 1).set_stroke(width=0).move_to(
                [xs[k], base_y + h / 2, 0])

        rot = [T(usd(a), 24, INK).move_to([xs[k], base_y - 0.32, 0]) for k, a in enumerate(apostas)]
        vezes = [T("×2", 21, MUTED).move_to([(xs[k] + xs[k + 1]) / 2, base_y - 0.72, 0]) for k in range(10)]
        barras = [barra(k, 2560) for k in range(9)]

        def entra(k):
            anim = [GrowFromEdge(barras[k], DOWN), FadeIn(rot[k], shift=UP * 0.1)]
            if k:
                anim.append(FadeIn(vezes[k - 1]))
            self.play(*anim, run_time=0.45)

        with self.narrate(F("A04", 1)) as n:
            for k, w in enumerate(["betting", "twenty", "forty", "eighty"]):
                n.wait_until(w)
                entra(k)
        with self.narrate(F("A04", 2)) as n:
            for k, w in zip(range(4, 9), ["sixty", "twenty", "forty", "eighty", "twentyfive"]):
                n.wait_until(w)
                entra(k)
        with self.narrate(F("A04", 3)) as n:
            n.wait_until("last")
            self.play(barras[8].animate.set_fill(BAD), run_time=0.5)
            n.wait_until("ten")
            c10 = Circle(radius=0.42).set_stroke(GOLD, 4).move_to(rot[0])
            self.play(Create(c10), run_time=0.6)
        alvo = T("to win $10", 30, GOLD).move_to([xs[0] + 0.9, 0.9, 0])
        risco = T("risk: $2,560", 32, BAD).next_to(barras[8], LEFT, buff=0.3).align_to(barras[8], UP)
        with self.narrate(F("A04", 4)) as n:
            n.wait_until("risk")
            self.play(FadeIn(risco), run_time=0.5)
            n.wait_until("same")
            self.play(FadeIn(alvo), FadeOut(c10), run_time=0.5)
        with self.narrate(F("A04", 5)) as n:
            n.wait_until("eight")
            ch = Brace(VGroup(*[rot[k] for k in range(8)]), DOWN, buff=0.55, color=C2)
            self.play(FadeOut(risco), FadeOut(alvo), FadeIn(ch), run_time=0.5)
            n.wait_until("fifty")
            perda = T("8 losses: $2,550 lost", 30, C2).move_to([-2.0, 0.9, 0])
            self.play(FadeIn(perda), run_time=0.5)
            n.wait_until("sixty")
            prox = T("next bet: $2,560", 30, BAD).next_to(barras[8], LEFT, buff=0.3).align_to(barras[8], UP)
            self.play(FadeIn(prox), run_time=0.5)
        with self.narrate(F("A04", 6)) as n:
            n.wait_until("again")
            novas = [barra(k, 10240, BAD if k == 8 else C1) for k in range(9)]
            self.play(FadeOut(VGroup(perda, prox, ch)),
                      *[Transform(barras[k], novas[k]) for k in range(9)], run_time=0.9)
            barras += [barra(9, 10240), barra(10, 10240)]
            n.wait_until("fiftyone")
            entra(9)
            n.wait_until("forty")
            entra(10)
        with self.narrate(F("A04", 7)) as n:
            n.wait_until("geometric")
            tit = T("Geometric progression", 44, INK).move_to([-2.6, 2.55, 0])
            self.play(FadeIn(tit, shift=DOWN * 0.1), run_time=0.6)
            n.wait_until("doubles")
            sub = T("×2 with every loss", 34, C1).next_to(tit, DOWN, buff=0.25).align_to(tit, LEFT)
            self.play(FadeIn(sub), *[Indicate(v, color=C1, scale_factor=1.3) for v in vezes], run_time=0.9)
        with self.narrate(F("A04", 8)) as n:
            n.wait_until("limited")
            yv = base_y + hmax * 6000 / 10240
            teto = DashedLine([-6.7, yv, 0], [6.7, yv, 0]).set_stroke(GOLD, 3)
            tt = T("your money", 28, GOLD).next_to(teto, UP, buff=0.12).align_to(teto, RIGHT).shift(LEFT * 1.6)
            self.play(Create(teto), FadeIn(tt), run_time=0.8)
            n.wait_until("quickly")
            self.play(barras[10].animate.set_fill(BAD), Indicate(barras[10], color=BAD, scale_factor=1.04), run_time=0.8)
        dim = self.esmaece()
        es = escada().move_to([-0.6, 0.1, 0])
        with self.narrate(F("A04", 9)) as n:
            n.wait_until("win")
            self.play(FadeOut(dim), Create(es[0]), run_time=0.4)
            self.play(Create(es[1]), run_time=n.until("times"), rate_func=linear)
            l1 = T("+$10, dozens of times", 30, GOLD).next_to(es[1], UP, buff=0.3).align_to(es[1], LEFT)
            self.play(FadeIn(l1), run_time=0.4)
            n.wait_until("single")
            self.play(Create(es[2]), run_time=0.6)
            l2 = T("one bad streak", 30, BAD).next_to(es[2], RIGHT, buff=0.3)
            self.play(FadeIn(l2), run_time=0.4)
        with self.narrate(F("A04", 10)) as n:
            n.wait_until("money")
            antes = Group(*[m for m in self.mobjects if id(m) not in self._chrome])
            muito = Rectangle(width=1.2, height=4.8).set_fill(C2, 1).set_stroke(width=0).move_to([5.6, -0.3, 0])
            tm = T("a lot of money", 30, C2).next_to(muito, LEFT, buff=0.3).align_to(muito, UP)
            self.play(FadeOut(antes), GrowFromEdge(muito, DOWN), FadeIn(tm), run_time=0.9)
            n.wait_until("bankroll")
            q = VGroup(T("Would a big enough bankroll", 44, INK), T("solve this problem?", 44, INK)).arrange(DOWN, buff=0.3)
            q.move_to([-1.6, -0.2, 0])
            self.play(FadeIn(q, shift=UP * 0.1), run_time=0.7)
        self.clear_section()


# ---------------------------------------------------------------- A05 bancas (Bauhaus)
class A05_Banca(_Base):
    ESTILO = "v_bauhaus"

    def construct(self):
        ys = [2.2, 0.35, -1.5]
        x0, L = -4.3, 10.3
        bancas, derrotas = [1000, 10000, 100000], [6, 9, 13]

        def linha(k):
            nome = T(usd(bancas[k]), 40, INK).move_to([-5.7, ys[k], 0])
            w = max(0.06, L * bancas[k] / 100000)
            bar = Rectangle(width=w, height=0.5).set_fill(C2, 1).set_stroke(width=0)
            bar.move_to([x0 + w / 2, ys[k], 0])
            return nome, bar

        def quadros(k, n_):
            return VGroup(*[Square(0.4).set_fill(C1, 1).set_stroke(width=0).move_to([x0 + 0.2 + j * 0.5, ys[k] - 0.72, 0])
                            for j in range(n_)])

        def conta(k):
            q = quadros(k, derrotas[k])
            return T(f"{derrotas[k]} losses", 34, C1).next_to(q, RIGHT, buff=0.3)

        with self.narrate(F("A05", 1)) as n:
            n.wait_until("First")
            n1, b1 = linha(0)
            self.play(FadeIn(n1), GrowFromEdge(b1, LEFT), run_time=0.6)
        q1 = quadros(0, 6)
        with self.narrate(F("A05", 2)) as n:
            n.wait_until("six")
            self.play(LaggedStart(*[GrowFromCenter(s) for s in q1], lag_ratio=0.2), run_time=1.2)
            c1 = conta(0)
            self.play(FadeIn(c1), run_time=0.4)
            n.wait_until("next")
            vazio = DashedVMobject(Square(0.4).set_stroke(BAD, 3)).move_to(q1[-1].get_center() + RIGHT * 0.5)
            x = VGroup(Line(UL, DR), Line(UR, DL)).scale(0.12).set_stroke(BAD, 4).move_to(vazio)
            self.play(c1.animate.shift(RIGHT * 0.5), Create(vazio), Create(x), run_time=0.6)
        with self.narrate(F("A05", 3)) as n:
            n.wait_until("thousand")
            n2, b2 = linha(1)
            self.play(FadeIn(n2), GrowFromEdge(b2, LEFT), run_time=0.7)
            n.wait_until("Ten", nth=2)
            x10a = T("×10", 26, MUTED).move_to([-5.75, (ys[0] + ys[1]) / 2 - 0.25, 0])
            self.play(FadeIn(x10a), run_time=0.4)
        q2 = quadros(1, 9)
        with self.narrate(F("A05", 4)) as n:
            n.wait_until("Nine")
            self.play(LaggedStart(*[GrowFromCenter(s) for s in q2], lag_ratio=0.12), run_time=1.0)
            c2 = conta(1)
            self.play(FadeIn(c2), run_time=0.4)
            n.wait_until("three")
            r3 = SurroundingRectangle(VGroup(*q2[6:]), color=GOLD, buff=0.08)
            m3 = T("+3", 30, GOLD).next_to(r3, UP, buff=0.12)
            self.play(Create(r3), FadeIn(m3), run_time=0.6)
        with self.narrate(F("A05", 5)) as n:
            n.wait_until("thousand")
            n3, b3 = linha(2)
            self.play(FadeIn(n3), GrowFromEdge(b3, LEFT), run_time=1.0)
            n.wait_until("Ten")
            x10b = T("×10", 26, MUTED).move_to([-5.75, (ys[1] + ys[2]) / 2 - 0.25, 0])
            self.play(FadeIn(x10b), run_time=0.4)
            n.wait_until("thirteen")
            q3 = quadros(2, 13)
            self.play(LaggedStart(*[GrowFromCenter(s) for s in q3], lag_ratio=0.1), run_time=1.2)
            c3 = conta(2)
            self.play(FadeIn(c3), run_time=0.4)
        with self.narrate(F("A05", 6)) as n:
            n.wait_until("money")
            a = T("money: ×100", 32, C2).move_to([2.7, 1.0, 0], aligned_edge=LEFT)
            self.play(FadeIn(a), Indicate(b3, color=C2, scale_factor=1.02), run_time=0.7)
            n.wait_until("losses")
            b = VGroup(T("losses survived:", 32, C1), T("6 → 13", 32, C1)).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
            b.next_to(a, DOWN, buff=0.3).align_to(a, LEFT)
            self.play(FadeIn(b), run_time=0.6)
        dim = self.esmaece()
        with self.narrate(F("A05", 7)) as n:
            n.wait_until("limit")
            placa = caixa_texto("TABLE LIMIT: maximum bet per spin", INK, size=38, largura_max=7)
            placa.move_to([-2.2, 0.4, 0])
            self.play(FadeOut(dim), FadeIn(placa, shift=DOWN * 0.15), run_time=0.7)
        with self.narrate(F("A05", 8)) as n:
            n.wait_until("doubling")
            teto = Line([1.6, 1.6, 0], [6.6, 1.6, 0]).set_stroke(BAD, 4)
            bars = VGroup(*[Rectangle(width=0.55, height=0.2 * 2 ** k).set_fill(C1, 1).set_stroke(width=0)
                            for k in range(4)]).arrange(RIGHT, buff=0.25, aligned_edge=DOWN)
            bars.move_to([4.1, -2.0, 0], aligned_edge=DOWN)
            stop = T("limit", 28, BAD).next_to(teto, UP, buff=0.1).align_to(teto, RIGHT)
            self.play(Create(teto), FadeIn(stop), run_time=0.5)
            self.play(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.3), run_time=1.2)
            n.wait_until("aside")
            self.play(FadeOut(VGroup(placa, teto, stop, bars), shift=LEFT * 0.4), run_time=0.7)
        with self.narrate(F("A05", 9)) as n:
            n.wait_until("virtual")
            roda = roleta(1.6).move_to([-3.6, 0.2, 0])
            self.play(FadeIn(roda), run_time=0.5)
            self.play(Rotate(roda, -PI, rate_func=smooth), run_time=1.0)
            n.wait_until("maximum")
            sl = T("no table limit", 38, INK).move_to([2.6, 0.2, 0])
            self.play(FadeIn(sl), run_time=0.5)
        with self.narrate(F("A05", 10)) as n:
            n.wait_until("ten")
            d1 = T("10", 44, MUTED).move_to([1.2, -1.6, 0])
            self.play(FadeOut(sl), FadeIn(d1), run_time=0.4)
            n.wait_until("hundred")
            d2 = T("100", 44, MUTED).next_to(d1, RIGHT, buff=0.6)
            risco1 = Line(d1.get_left(), d1.get_right()).set_stroke(BAD, 4)
            self.play(Create(risco1), FadeIn(d2), run_time=0.4)
            n.wait_until("million")
            risco2 = Line(d2.get_left(), d2.get_right()).set_stroke(BAD, 4)
            d3 = T("1,000,000 spins", 52, INK).move_to([2.6, 0.4, 0])
            self.play(Create(risco2), FadeIn(d3, shift=UP * 0.1), run_time=0.6)
            self.destacar(d3, GOLD, buff=0.25)
        self.clear_section()


# ---------------------------------------------------------------- A06 primeiros giros (Remotion)
class A06_Experimento(RemotionScene):
    VOICE = _Base.VOICE
    RATE = _Base.RATE
    ESTILO = "v_remotion"
    FALAS = [F("A06", k) for k in range(1, 9)]
    CAUDA = 0.5


# ---------------------------------------------------------------- A07 um milhão de giros (Manim escuro)
def grafico(pontos, xmax, ymax, ymin=0, w=7.9, h=4.9, origem=(-5.55, -2.5)):
    """Eixos simples e a linha do saldo. Devolve (eixos, linha, p2s)."""
    ox, oy = origem

    def p2s(x, y):
        return np.array([ox + w * x / xmax, oy + h * (y - ymin) / (ymax - ymin), 0])

    eixos = VGroup(Line(p2s(0, ymin), p2s(xmax, ymin)), Line(p2s(0, ymin), p2s(0, ymax))).set_stroke(MUTED, 2)
    linha = VMobject().set_points_as_corners([p2s(x, y) for x, y in pontos]).set_stroke(GOLD, 2.6)
    return eixos, linha, p2s


class A07_Milhao(_Base):
    ESTILO = "v_doc"

    def coluna(self, itens, x=2.85, topo=2.5, buff=0.3):
        g = VGroup(*itens).arrange(DOWN, aligned_edge=LEFT, buff=buff)
        return g.move_to([x, topo - g.height / 2, 0], aligned_edge=LEFT).align_to([x, 0, 0], LEFT)

    def construct(self):
        ini = G["s1_inicio"]
        e0, l0, p0 = grafico(ini, 60, 10250, 9400)
        ylab = T("balance", 26, MUTED).next_to(e0[1], UP, buff=0.12).align_to(e0[1], LEFT)
        ref = DashedLine(p0(0, 10000), p0(60, 10000)).set_stroke(MUTED, 1.5, opacity=0.6)
        r10 = T("$10,000", 22, MUTED).next_to(ref, LEFT, buff=0.1)
        with self.narrate(F("A07", 1)) as n:
            n.wait_until("balance")
            self.play(Create(e0), FadeIn(ylab), Create(ref), FadeIn(r10), run_time=0.7)
            n.wait_until("small")
            self.play(Create(l0), run_time=max(1.0, n.remaining - 0.2), rate_func=linear)
        with self.narrate(F("A07", 2)) as n:
            n.wait_until("loss")
            dip = Circle(radius=0.35).set_stroke(BAD, 3).move_to(p0(13, 9740))
            dip2 = Circle(radius=0.35).set_stroke(BAD, 3).move_to(p0(22, 9450))
            self.play(Create(dip), Create(dip2), run_time=0.6)
            n.wait_until("recovers")
            s1 = Arrow(p0(13, 9740) + DOWN * 0.05, p0(15, 10060), buff=0.1, color=GOLD, stroke_width=4)
            s2 = Arrow(p0(22, 9450), p0(23, 10090), buff=0.1, color=GOLD, stroke_width=4)
            self.play(GrowArrow(s1), GrowArrow(s2), run_time=0.6)
        # sessão 1 inteira
        e1, l1, p1 = grafico(G["s1"], 6200, 42000)
        ref1 = DashedLine(p1(0, 10000), p1(6200, 10000)).set_stroke(MUTED, 1.5, opacity=0.6)
        r10b = T("$10,000", 22, MUTED).next_to(ref1, LEFT, buff=0.1)
        xlab = T("spins", 24, MUTED).next_to(e1[0], DOWN, buff=0.12).align_to(e1[0], RIGHT)
        with self.narrate(F("A07", 3)) as n:
            n.wait_until("speed")
            self.play(FadeOut(VGroup(l0, dip, dip2, s1, s2, ref, r10)), Transform(e0, e1), FadeIn(ref1), FadeIn(r10b),
                      run_time=0.6)
            self.play(FadeIn(xlab), Create(l1), run_time=max(1.0, n.until("climbed")), rate_func=linear)
            n.wait_until("forty")
            pico_i = max(range(len(G["s1"])), key=lambda i: G["s1"][i][1])
            pico = Dot(p1(*G["s1"][pico_i]), color=GOLD, radius=0.07)
            tp = T("$39,960", 26, GOLD).next_to(pico, LEFT, buff=0.2)
            self.play(FadeIn(pico), FadeIn(tp), run_time=0.5)
        with self.narrate(F("A07", 4)) as n:
            n.wait_until("long")
            sub = [p for p in G["s1"] if 3400 <= p[0] <= 5000]
            trecho = VMobject().set_points_as_corners([p1(x, y) for x, y in sub]).set_stroke(GOOD, 5)
            self.play(Create(trecho), run_time=0.8)
            n.wait_until("streak")
            # vales grandes antes do fim (quedas de mais de 5 mil)
            vales = []
            for (xa, ya), (xb, yb) in zip(G["s1"], G["s1"][1:]):
                if ya - yb > 4500 and xb < 6100:
                    vales.append(Circle(radius=0.22).set_stroke(BAD, 3).move_to(p1(xb, yb)))
            self.play(*[Create(v) for v in vales[:4]], FadeOut(trecho), run_time=0.7)
            n.wait_until("explode")
            self.play(*[Indicate(v, color=BAD) for v in vales[:4]], run_time=0.7)
        fim = p1(6181, 19490)
        with self.narrate(F("A07", 5)) as n:
            n.wait_until("eleven")
            queda = Circle(radius=0.3).set_stroke(BAD, 4).move_to(fim)
            a = T("11 losses in a row", 32, BAD)
            col = self.coluna([a])
            self.play(FadeOut(VGroup(*vales)), Create(queda), FadeIn(a), run_time=0.6)
            n.wait_until("forty")
            b = T("bets: $10 → $10,240", 30, INK)
            col = self.coluna([a, b])
            self.play(FadeIn(b), run_time=0.5)
        with self.narrate(F("A07", 6)) as n:
            n.wait_until("seventy")
            c = T("lost: $20,470", 30, BAD)
            col = self.coluna([a, b, c])
            self.play(FadeIn(c), run_time=0.5)
            n.wait_until("ninety")
            d = T("left: $19,490", 30, INK)
            col = self.coluna([a, b, c, d])
            self.play(FadeIn(d), run_time=0.5)
            n.wait_until("eighty")
            e = T("next bet: $20,480", 30, INK)
            col = self.coluna([a, b, c, d, e])
            self.play(FadeIn(e), run_time=0.5)
            n.wait_until("ended")
            fimtxt = T("session over", 24, MUTED).next_to(queda, LEFT, buff=0.15)
            self.play(FadeIn(fimtxt), run_time=0.4)
        with self.narrate(F("A07", 7)) as n:
            n.wait_until("profit")
            f = T("result: +$9,490", 32, GOOD)
            col = self.coluna([a, b, c, d, e, f])
            self.play(FadeIn(f), run_time=0.4)
            cx = self.destacar(f, GOOD, buff=0.12)
        self.clear_section()

        # sessão 323
        e3, l3, p3 = grafico(G["s323"], 40000, 210000)
        ref3 = DashedLine(p3(0, 10000), p3(40000, 10000)).set_stroke(MUTED, 1.5, opacity=0.6)
        ylab3 = T("balance", 26, MUTED).next_to(e3[1], UP, buff=0.12).align_to(e3[1], LEFT)
        xlab3 = T("spins", 24, MUTED).next_to(e3[0], DOWN, buff=0.12).align_to(e3[0], RIGHT)
        with self.narrate(F("A07", 8)) as n:
            n.wait_until("session")
            s = T("session 323", 34, INK)
            col = self.coluna([s])
            self.play(Create(e3), FadeIn(ylab3), FadeIn(xlab3), Create(ref3), FadeIn(s), run_time=0.7)
            self.play(Create(l3), run_time=max(1.0, n.until("reached")), rate_func=linear)
            n.wait_until("reached")
            tp3 = T("$203,440", 26, GOLD).next_to(p3(39795, 203440), LEFT, buff=0.2)
            self.play(FadeIn(tp3), run_time=0.5)
        with self.narrate(F("A07", 9)) as n:
            n.wait_until("fourteen")
            cliff = Line(p3(39786, 203440), p3(39800, 39610)).set_stroke(BAD, 5)
            a = T("14 losses in a row", 32, BAD)
            col = self.coluna([s, a])
            self.play(Create(cliff), FadeIn(a), run_time=0.6)
            n.wait_until("eightyone")
            b = T("last bet: $81,920", 30, INK)
            col = self.coluna([s, a, b])
            self.play(FadeIn(b), run_time=0.5)
            n.wait_until("vanished")
            c = T("−$163,830 at once", 30, BAD)
            col = self.coluna([s, a, b, c])
            self.play(FadeIn(c), run_time=0.5)
        with self.narrate(F("A07", 10)) as n:
            n.wait_until("ten")
            d = T("goal: +$10", 32, GOLD)
            col = self.coluna([s, a, b, c, d], buff=0.32)
            self.play(FadeIn(d), run_time=0.5)
            n.wait_until("thousands")
            self.play(Indicate(b, color=BAD, scale_factor=1.06), run_time=0.7)
        with self.narrate(F("A07", 11)) as n:
            n.wait_until("often")
            g1 = T("winning often", 32, GOLD)
            g2 = T("≠ a profitable strategy", 28, INK)
            col = self.coluna([s, a, b, c, d, g1, g2], buff=0.26)
            self.play(FadeIn(g1), run_time=0.5)
            n.wait_until("profitable")
            self.play(FadeIn(g2), run_time=0.5)
        self.clear_section()

        # placar agregado
        with self.narrate(F("A07", 12)) as n:
            n.wait_until("million")
            m = T("1,000,000 spins", 56, INK).move_to([0, 2.1, 0])
            self.play(FadeIn(m, shift=DOWN * 0.1), run_time=0.6)
            n.wait_until("eightyeight")
            s = T("488 sessions", 40, INK).next_to(m, DOWN, buff=0.45)
            self.play(FadeIn(s), run_time=0.5)
        with self.narrate(F("A07", 13)) as n:
            n.wait_until("eightyseven")
            a = T("487 ran out of money", 34, BAD).next_to(s, DOWN, buff=0.4)
            self.play(FadeIn(a), run_time=0.5)
            n.wait_until("millionth")
            b = T("1 cut off at spin 1,000,000 (+$2,280)", 30, MUTED).next_to(a, DOWN, buff=0.3)
            self.play(FadeIn(b), run_time=0.5)
        with self.narrate(F("A07", 14)) as n:
            n.wait_until("loss")
            tot = T("Total result: −$2,164,630", 48, BAD).next_to(b, DOWN, buff=0.55)
            self.play(FadeIn(tot), run_time=0.5)
            self.destacar(tot, BAD, buff=0.22)

        # distribuição
        with self.narrate(F("A07", 15)) as n:
            n.wait_until("distribution")
            antes = Group(*[m for m in self.mobjects if id(m) not in self._chrome])
            tit = T("Distribution of the results", 44, INK).move_to([0, 2.55, 0])
            self.play(FadeOut(antes), FadeIn(tit, shift=DOWN * 0.1), run_time=0.6)
        x0, Lmax = -6.6, 5.6
        with self.narrate(F("A07", 16)) as n:
            n.wait_until("times")
            v1 = T("won $10 × 486,539 times", 32, GOLD).move_to([x0, 1.6, 0], aligned_edge=LEFT)
            self.play(FadeIn(v1), run_time=0.5)
            n.wait_until("percent")
            v2 = T("99.9% of all sequences", 30, INK).next_to(v1, DOWN, buff=0.25).align_to(v1, LEFT)
            self.play(FadeIn(v2), run_time=0.5)
        with self.narrate(F("A07", 17)) as n:
            n.wait_until("four")
            w = Lmax * 4865390 / 7030010
            bg = Rectangle(width=w, height=0.45).set_fill(GOLD, 1).set_stroke(width=0).move_to([x0 + w / 2, -0.2, 0])
            tg = T("+$4,865,390", 30, GOLD).next_to(bg, UP, buff=0.12).align_to(bg, LEFT)
            self.play(GrowFromEdge(bg, LEFT), FadeIn(tg), run_time=0.8)
        with self.narrate(F("A07", 18)) as n:
            n.wait_until("seven")
            bl = Rectangle(width=Lmax, height=0.45).set_fill(BAD, 1).set_stroke(width=0).move_to([x0 + Lmax / 2, -1.5, 0])
            tl = T("−$7,030,010 in 487 busts", 30, BAD).next_to(bl, UP, buff=0.12).align_to(bl, LEFT)
            self.play(GrowFromEdge(bl, LEFT), FadeIn(tl), run_time=0.9)
            n.wait_until("average")
            tm = T("≈ $14,435 per bust", 28, INK).next_to(bl, DOWN, buff=0.2).align_to(bl, LEFT)
            self.play(FadeIn(tm), run_time=0.5)
        # histograma dos resultados das sessões encerradas
        res = G["resultados"]
        bins = list(range(-10000, 40000, 5000))
        cont = [sum(1 for r in res if b <= r < b + 5000) for b in bins]
        hx0, hy0, hw, hh = 0.7, -2.2, 5.9, 3.2
        bw = hw / len(bins)
        barras = VGroup()
        for k, c_ in enumerate(cont):
            h = max(0.03, hh * c_ / max(cont))
            barras.add(Rectangle(width=bw * 0.8, height=h).set_fill(MUTED, 1).set_stroke(width=0)
                       .move_to([hx0 + bw * (k + 0.5), hy0 + h / 2, 0]))
        eixo = Line([hx0, hy0, 0], [hx0 + hw, hy0, 0]).set_stroke(MUTED, 2)
        zero = DashedLine([hx0 + bw * 2, hy0, 0], [hx0 + bw * 2, hy0 + hh + 0.1, 0]).set_stroke(INK, 1.5)
        z0 = T("$0", 22, MUTED).next_to(zero, DOWN, buff=0.1)
        hl = T("sessions, by result", 24, MUTED).next_to(eixo, DOWN, buff=0.12).align_to(eixo, RIGHT)
        with self.narrate(F("A07", 19)) as n:
            n.wait_until("sessions")
            self.play(Create(eixo), FadeIn(barras), Create(zero), FadeIn(z0), FadeIn(hl), run_time=0.8)
            n.wait_until("fiftytwo")
            pos = VGroup(*barras[2:])
            tpos = T("52 with a profit", 28, GOLD).move_to([hx0 + bw * 5.5, hy0 + 1.2, 0])
            self.play(pos.animate.set_fill(GOLD), FadeIn(tpos), run_time=0.6)
            n.wait_until("loss")
            neg = VGroup(*barras[:2])
            tneg = T("435 with a loss", 28, BAD).next_to(barras[0], RIGHT, buff=0.25).align_to(barras[0], UP).shift(RIGHT * bw * 0.9)
            self.play(neg.animate.set_fill(BAD), FadeIn(tneg), run_time=0.6)
        with self.narrate(F("A07", 20)) as n:
            n.wait_until("small")
            self.play(Indicate(bg, color=GOLD, scale_factor=1.03), run_time=0.6)
            n.wait_until("big")
            self.play(Indicate(bl, color=BAD, scale_factor=1.03), run_time=0.6)
        with self.narrate(F("A07", 21)) as n:
            pass
        self.clear_section()


# ---------------------------------------------------------------- A08 valor esperado (quadro com mão)
class A08_Matematica(_Base):
    ESTILO = "v_quadro"

    def narrate(self, text, caption=None):
        """Como o narrate normal, mas a mão sai da frente antes do fim de cada fala (quadro completo visível)."""
        from contextlib import contextmanager

        base = super().narrate

        @contextmanager
        def cm():
            with base(text, caption) as n:
                yield n
                if self._mao_descansa():
                    self.hand_away(run_time=0.3)
        return cm()

    def construct(self):
        roda = roleta(1.25).move_to([-5.2, 1.4, 0])
        with self.narrate(F("A08", 1)) as n:
            n.wait_until("understand")
            self.play(FadeIn(roda), run_time=0.6)
            n.wait_until("red")
            b = T("$10 on red", 34, C1).next_to(roda, DOWN, buff=0.3)
            self.play(Write(b), run_time=0.7)
        with self.narrate(F("A08", 2)) as n:
            n.wait_until("eighteen")
            g = T("18 outcomes:  win $10", 34, C1).move_to([-1.9, 2.3, 0], aligned_edge=LEFT)
            self.play(Write(g), run_time=0.8)
            n.wait_until("nineteen")
            p = T("19 outcomes:  lose $10", 34, INK).next_to(g, DOWN, buff=0.35).align_to(g, LEFT)
            self.play(Write(p), run_time=0.8)
        with self.narrate(F("A08", 3)) as n:
            n.wait_until("multiply")
            t1 = MathTex(r"\tfrac{18}{37}\times 10", font_size=56, color=C1).move_to([-1.3, 0.35, 0])
            l1 = T("chance of winning × profit", 26, MUTED).next_to(t1, DOWN, buff=0.2)
            self.play(Write(t1), run_time=0.8)
            self.play(FadeIn(l1), run_time=0.3)
            n.wait_until("subtract")
            t2 = MathTex(r"-\ \tfrac{19}{37}\times 10", font_size=56, color=INK).move_to([3.9, 0.35, 0])
            l2 = T("chance of losing × loss", 26, MUTED).next_to(t2, DOWN, buff=0.2)
            self.play(Write(t2), run_time=0.8)
            self.play(FadeIn(l2), run_time=0.3)
        eq = MathTex(r"\mathrm{E}", "=", r"\tfrac{18}{37}\times 10", r"-\tfrac{19}{37}\times 10", "=",
                     r"-\tfrac{10}{37}", r"\approx", r"-\$0.27", font_size=58, color=INK)
        eq[2].set_color(C1)
        eq[7].set_color(GOLD)
        eq.move_to([0, 0.2, 0])
        with self.narrate(F("A08", 4)) as n:
            n.wait_until("result")
            self.play(FadeOut(VGroup(l1, l2, roda, b)), ReplacementTransform(VGroup(t1, t2), VGroup(eq[2], eq[3])), run_time=0.7)
            self.play(Write(VGroup(eq[0], eq[1], eq[4], eq[5], eq[6], eq[7])), run_time=1.2)
            n.wait_until("every")
            cx = self.destacar(eq[7], GOLD, buff=0.15)
            per = T("for every $10 bet: about 27 cents lost", 30, INK).next_to(eq, DOWN, buff=0.5)
            self.play(Write(per), run_time=0.9)
        with self.narrate(F("A08", 5)) as n:
            n.wait_until("either")
            ou = T("one spin:  +$10  or  −$10", 32, MUTED).next_to(per, DOWN, buff=0.4)
            self.play(Write(ou), run_time=0.8)
        with self.narrate(F("A08", 6)) as n:
            n.wait_until("percent")
            pc = T("≈ 2.70% of everything bet", 36, GOLD).move_to(ou)
            self.play(FadeOut(ou), Write(pc), run_time=0.8)
        self.clear_section()

        # previsto x real
        with self.narrate(F("A08", 7)) as n:
            n.wait_until("sixty")
            a = T("wagered in 1,000,000 spins:  $59,924,790", 34, INK).move_to([-6.4, 2.4, 0], aligned_edge=LEFT)
            self.play(Write(a), run_time=1.0)
            n.wait_until("predicted")
            b = T("expected (2.70%):  −$1,619,589", 34, C2).next_to(a, DOWN, buff=0.35).align_to(a, LEFT)
            self.play(Write(b), run_time=1.0)
        with self.narrate(F("A08", 8)) as n:
            n.wait_until("actual")
            c = T("actual (3.61%):  −$2,164,630", 34, BAD).next_to(b, DOWN, buff=0.35).align_to(a, LEFT)
            self.play(Write(c), run_time=1.0)
            n.wait_until("busts")
            self.hand_away()
        # 100 repetições
        pcs = [r["pct"] * 100 for r in REP["experimentos"]]
        ex0, ex1, ey = -5.6, 5.6, -2.2

        def px(v):
            return ex0 + (v + 5) / 10 * (ex1 - ex0)

        eixo = Line([ex0, ey, 0], [ex1, ey, 0]).set_stroke(INK, 2)
        ticks = VGroup(*[VGroup(Line([px(v), ey - 0.08, 0], [px(v), ey + 0.08, 0]).set_stroke(INK, 2),
                                T(("+" if v > 0 else "−" if v < 0 else "") + f"{abs(v)}%", 22, MUTED)
                                .move_to([px(v), ey - 0.33, 0])) for v in (-4, -2, 0, 2, 4)])
        pilhas, pontos = {}, VGroup()
        for v in sorted(pcs):
            k = round(v / 0.25)
            pilhas[k] = pilhas.get(k, 0) + 1
            pontos.add(Dot([px(k * 0.25), ey + 0.13 + 0.15 * (pilhas[k] - 1), 0], radius=0.065,
                           color=GOOD if v > 0 else C2))
        with self.narrate(F("A08", 9)) as n:
            n.wait_until("hundred")
            self.play(Create(eixo), FadeIn(ticks), run_time=0.6)
            self.play(LaggedStart(*[FadeIn(p) for p in pontos], lag_ratio=0.02), run_time=1.6)
            n.wait_until("average")
            topo_p = max(d.get_top()[1] for d in pontos)
            med = DashedLine([px(-2.722), ey, 0], [px(-2.722), topo_p + 0.25, 0]).set_stroke(GOLD, 3)
            tm = T("average −2.72%  (math: −2.70%)", 28, GOLD).next_to(med, RIGHT, buff=0.25).align_to(med, UP)
            self.play(Create(med), Write(tm), run_time=0.8)
        with self.narrate(F("A08", 10)) as n:
            n.wait_until("worst")
            pior = min(pontos, key=lambda d: d.get_x())
            c1_ = Circle(radius=0.2).set_stroke(BAD, 3).move_to(pior)
            tw = T("worst −4.11%", 26, BAD).next_to(c1_, DOWN, buff=0.55).shift(LEFT * 0.4)
            self.play(Create(c1_), Write(tw), run_time=0.7)
            n.wait_until("profit")
            melhor = max(pontos, key=lambda d: d.get_x())
            c2_ = Circle(radius=0.2).set_stroke(GOOD, 3).move_to(melhor)
            tb = T("1 of 100 ended with a profit", 26, GOOD).next_to(c2_, UP, buff=0.25).align_to(c2_, RIGHT)
            self.play(Create(c2_), Write(tb), run_time=0.7)
        dim = self.esmaece()

        # a probabilidade não muda
        roda = roleta(1.5).move_to([-4.6, 0.5, 0])
        with self.narrate(F("A08", 11)) as n:
            n.wait_until("double")
            self.play(FadeOut(dim), FadeIn(roda), run_time=0.5)
            n.wait_until("probability")
            pr = MathTex(r"\mathrm{P(red)} = \tfrac{18}{37}", font_size=60, color=C1).move_to([1.2, 1.9, 0])
            self.play(Write(pr), run_time=0.9)
        with self.narrate(F("A08", 12)) as n:
            n.wait_until("five")
            ls = VGroup(*[VGroup(Circle(radius=0.27).set_fill(BAD, 1).set_stroke(width=0), T("L", 22, SHEET))
                          for _ in range(5)]).arrange(RIGHT, buff=0.15)
            for l in ls:
                l[1].move_to(l[0])
            prox = T("next spin: still 18/37", 32, C1)
            fila = VGroup(ls, prox).arrange(RIGHT, buff=0.4).move_to([1.6, 0.35, 0])
            self.play(LaggedStart(*[FadeIn(l) for l in ls], lag_ratio=0.2), run_time=0.9)
            self.play(Write(prox), run_time=0.7)
            n.wait_until("balancing")
            nb = T("no balancing out", 32, INK).move_to([1.6, -0.75, 0])
            self.play(Write(nb), run_time=0.7)
        with self.narrate(F("A08", 13)) as n:
            n.wait_until("raise")
            bars = VGroup()
            for k in range(5):
                h = 0.22 * 2 ** k * 0.9
                r = Rectangle(width=0.6, height=h).set_fill(C2, 1).set_stroke(width=0)
                fatia = Rectangle(width=0.6, height=max(0.03, h * 0.12)).set_fill(BAD, 1).set_stroke(width=0)
                bars.add(VGroup(r, fatia.move_to(r.get_top(), aligned_edge=UP)))
            bars.arrange(RIGHT, buff=0.3, aligned_edge=DOWN).move_to([4.2, -2.7, 0], aligned_edge=DOWN)
            self.hand_away()
            self.play(FadeOut(nb), LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.25), run_time=1.2)
            n.wait_until("exposed")
            te = T("bigger bet, bigger exposure to the edge", 26, BAD).next_to(bars, LEFT, buff=0.35).align_to(bars, DOWN)
            self.play(Write(te), run_time=0.8)
        self.clear_section()
        with self.narrate(F("A08", 14)) as n:
            n.wait_until("eliminate")
            m1 = T("The Martingale does not remove the house edge.", 38, INK).move_to([0, 1.9, 0])
            self.play(Write(m1), run_time=1.2)
            n.wait_until("changes")
            m2 = T("It only changes how wins and losses show up.", 34, MUTED).next_to(m1, DOWN, buff=0.35)
            self.play(Write(m2), run_time=1.0)
        es = escada(n=24, passo=0.06, queda=2.0, largura=6.0).move_to([-1.5, -1.4, 0])
        with self.narrate(F("A08", 15)) as n:
            n.wait_until("small")
            self.play(Create(es[0]), run_time=0.3)
            self.play(Create(es[1]), run_time=1.0, rate_func=linear)
            n.wait_until("occasional")
            self.play(Create(es[2]), run_time=0.6)
        with self.narrate(F("A08", 16)) as n:
            n.wait_until("negative")
            neg = MathTex(r"\mathrm{E} < 0", font_size=64, color=BAD).move_to([4.4, -1.3, 0])
            self.play(Write(neg), run_time=0.8)
        dim = self.esmaece()
        with self.narrate(F("A08", 17)) as n:
            n.wait_until("walk")
            h1 = T("Walking out a winner: it happens.", 38, INK).move_to([0, 1.3, 0])
            self.play(FadeOut(dim), run_time=0.3)
            self.play(Write(h1), run_time=1.0)
            n.wait_until("doubling")
            h2 = T("unfavorable game + doubling", 38, INK).next_to(h1, DOWN, buff=0.6)
            self.play(Write(h2), run_time=1.0)
            n.wait_until("favorable")
            h3 = T("= still an unfavorable game", 38, BAD).next_to(h2, DOWN, buff=0.35)
            self.play(Write(h3), run_time=1.0)
        self.clear_section()


# ---------------------------------------------------------------- A09 consequência (papel)
class A09_Consequencia(_Base):
    ESTILO = "v_papel"
    RATE = "+10%"

    def construct(self):
        with self.narrate(F("A09", 1)) as n:
            n.wait_until("know")
            roda = roleta(1.6).move_to([0, -0.2, 0])
            self.play(FadeIn(roda), run_time=0.6)
            n.wait_until("outside")
            t = T("The same flaw, outside casinos", 44, INK).move_to([0, 2.5, 0])
            self.play(FadeIn(t, shift=DOWN * 0.1), roda.animate.scale(0.4).move_to([5.6, 2.5, 0]).set_opacity(0.35),
                      run_time=0.8)
        semanas = [0.18, 0.25, 0.12, 0.3, 0.22, 0.15, 0.27, 0.2, 0.1, 0.24, 0.29, 0.16, 0.21,
                   0.26, 0.14, 0.23, 0.19, 0.28, 0.13, 0.25, 0.2, 0.17, 0.3, 0.22, 0.15, 0.24]
        bx0, by = -6.2, -0.2
        bars = VGroup(*[Rectangle(width=0.34, height=h * 4).set_fill(GOLD, 1).set_stroke(width=0)
                        .move_to([bx0 + 0.46 * k, by + h * 2, 0]) for k, h in enumerate(semanas)])
        eixo = Line([bx0 - 0.3, by, 0], [bx0 + 0.46 * 27 + 0.2, by, 0]).set_stroke(MUTED, 2)
        with self.narrate(F("A09", 2)) as n:
            n.wait_until("investment")
            self.play(Create(eixo), FadeOut(roda), run_time=0.4)
            n.wait_until("six")
            self.play(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.08), run_time=n.until("week"))
            lw = T("26 weeks of gains (illustration)", 26, MUTED).next_to(eixo, DOWN, buff=0.2).align_to(eixo, LEFT)
            self.play(FadeIn(lw), run_time=0.4)
        with self.narrate(F("A09", 3)) as n:
            n.wait_until("safe")
            ls = T("looks safe", 30, GOLD).next_to(bars, UP, buff=0.3).align_to(bars, LEFT)
            self.play(FadeIn(ls), run_time=0.5)
            n.wait_until("wrong")
            big = Rectangle(width=0.32, height=2.4).set_fill(BAD, 1).set_stroke(width=0)
            big.move_to([bx0 + 0.46 * 26, by - 1.2, 0])
            tq = T("?", 40, BAD).next_to(big, RIGHT, buff=0.2)
            self.play(GrowFromEdge(big, UP), FadeIn(tq), run_time=0.7)
        self.clear_section()

        # risco x retorno
        ox, oy, w, h = -5.6, -2.5, 7.2, 4.2
        ex = Arrow([ox, oy, 0], [ox + w, oy, 0], buff=0, color=MUTED, stroke_width=3, tip_length=0.2)
        ey = Arrow([ox, oy, 0], [ox, oy + h, 0], buff=0, color=MUTED, stroke_width=3, tip_length=0.2)
        lx = T("how often it wins", 26, MUTED).next_to(ex, DOWN, buff=0.15).align_to(ex, RIGHT)
        ly = T("how much it loses when it fails", 26, MUTED).next_to(ey, UP, buff=0.12).align_to(ey, LEFT)
        with self.narrate(F("A09", 4)) as n:
            n.wait_until("good")
            g1 = T("good results ≠ good strategy", 38, INK).move_to([0, 2.6, 0])
            self.play(FadeIn(g1), run_time=0.5)
            n.wait_until("big")
            self.play(Create(ey), FadeIn(ly), run_time=0.6)
            n.wait_until("likely")
            self.play(Create(ex), FadeIn(lx), run_time=0.6)
        with self.narrate(F("A09", 5)) as n:
            n.wait_until("Martingale")
            pt = Dot([ox + w * 0.97, oy + h * 0.85, 0], radius=0.11, color=BAD)
            tp = VGroup(T("Martingale", 30, BAD), T("wins 99.9% of sequences", 24, INK),
                        T("loses $14,435 per bust (average)", 24, INK)).arrange(DOWN, aligned_edge=RIGHT, buff=0.1)
            tp.next_to(pt, LEFT, buff=0.3).shift(DOWN * 0.15)
            self.play(FadeIn(pt, scale=1.5), FadeIn(tp[0]), run_time=0.6)
            n.wait_until("winning")
            self.play(FadeIn(tp[1]), run_time=0.5)
            n.wait_until("large")
            self.play(FadeIn(tp[2]), Flash(pt, color=BAD), run_time=0.7)
        with self.narrate(F("A09", 6)) as n:
            n.wait_until("often")
            d1 = T("winning often", 32, GOLD).move_to([4.0, -0.9, 0])
            self.play(FadeIn(d1), run_time=0.5)
            n.wait_until("consistently")
            d2 = T("≠ making money consistently", 28, INK).next_to(d1, DOWN, buff=0.25)
            self.play(FadeIn(d2), run_time=0.5)
        dim = self.esmaece()
        with self.narrate(F("A09", 7)) as n:
            n.wait_until("question")
            q = T("Can math beat the casino?", 46, INK).move_to([0, 1.6, 0])
            self.play(FadeOut(dim), FadeIn(q, shift=DOWN * 0.1), run_time=0.6)
            n.wait_until("eliminate")
            r = T("This strategy can't remove the edge.", 40, BAD).next_to(q, DOWN, buff=0.5)
            self.play(FadeIn(r), run_time=0.6)
        es = escada(n=26, passo=0.05, queda=1.6, largura=6.0).move_to([0, -1.7, 0])
        with self.narrate(F("A09", 8)) as n:
            n.wait_until("seems")
            self.play(FadeOut(VGroup(q, r)), Create(es[0]), Create(es[1]), run_time=1.2)
            s1 = T("seems to work", 30, GOLD).next_to(es[1], UP, buff=0.3).align_to(es[1], LEFT)
            self.play(FadeIn(s1), run_time=0.4)
            n.wait_until("misleading")
            self.play(Create(es[2]), run_time=0.6)
            s2 = T("misleading", 30, BAD).next_to(es[2], RIGHT, buff=0.3)
            self.play(FadeIn(s2), run_time=0.4)
        with self.narrate(F("A09", 9)) as n:
            n.wait_until("seems")
            self.play(Indicate(s1, color=GOLD, scale_factor=1.1), run_time=0.8)
            n.wait_until("often")
            antes = Group(*[m for m in self.mobjects if id(m) not in self._chrome])
            q1 = T("How often does it win?", 42, MUTED).move_to([0, 1.2, 0])
            self.play(FadeOut(antes), FadeIn(q1), run_time=0.6)
        with self.narrate(F("A09", 10)) as n:
            n.wait_until("loses")
            q2 = T("How much does it lose when it goes wrong?", 44, INK).next_to(q1, DOWN, buff=0.7)
            self.play(FadeIn(q2, shift=UP * 0.1), run_time=0.7)
            self.destacar(q2, C1, buff=0.25)
        self.clear_section()


# ---------------------------------------------------------------- A10 encerramento (marfim)
class A10_Encerramento(_Base):
    ESTILO = "v_marfim"

    def construct(self):
        # sem nome de marca: a frase final escrita em duas partes, cada uma na sua palavra
        a = T("looking only at the results", 46, MUTED, negrito=False)
        b = T("understanding the math behind them", 54, INK)
        VGroup(a, b).arrange(DOWN, buff=0.55).move_to(UP * 0.2)
        risco = Line(LEFT, RIGHT).set_width(b.width * 0.35).set_stroke(GOLD, 5).next_to(b, DOWN, buff=0.3)
        with self.narrate(F("A10", 1)) as n:
            n.wait_until("looking")
            self.play(FadeIn(a, shift=UP * 0.1), run_time=0.6)
            n.wait_until("understanding")
            self.play(FadeIn(b, shift=UP * 0.1), run_time=0.6)
            self.play(Create(risco), run_time=0.5)
        preto = Rectangle(width=config.frame_width + 1, height=config.frame_height + 1).set_fill("#000000", 1).set_stroke(width=0)
        self.play(FadeIn(preto), run_time=0.6)
        self.wait(0.4)
