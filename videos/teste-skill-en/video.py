"""Teste curto: skill aula-animada baixada do repositório skills (estilos VORTTUM, voz Andrew, fatias). Apagar depois."""
from pathlib import Path

from explainer import *
import vorttum  # noqa: F401  (registra os estilos VORTTUM)

F = falas_do_roteiro(Path(__file__).with_name("roteiro.md"))


class _Base(ExplainerScene):
    VOICE = vorttum.VOZ
    RATE = vorttum.RATE
    TITLE_AREA = False


class T01_Gancho(_Base):
    ESTILO = "v_colagem"
    RATE = vorttum.RATE_TENSAO

    def construct(self):
        with self.narrate(F("T01", 1)) as n:
            n.wait_until("486,539")
            num = MathTex(r"486{,}539", font_size=110, color=GOOD)
            self.play(FadeIn(num, scale=0.8))
            n.wait_until("lost")
            perda = MathTex(r"-\$2{,}000{,}000", font_size=96, color=C1).next_to(num, DOWN, buff=0.6)
            self.play(Write(perda))
        self.clear_section()


class T02_Maquina(_Base):
    ESTILO = "v_doc"

    def construct(self):
        rodas = VGroup(*[Circle(radius=0.7, color=C2).set_stroke(width=6) for _ in range(3)]).arrange(RIGHT, buff=0.8).shift(UP * 2)
        raios = VGroup(*[Line(r.get_center(), r.get_top(), color=INK, stroke_width=5) for r in rodas])
        with self.narrate(F("T02", 1)) as n:
            self.play(Create(rodas), Create(raios))
            n.wait_until("sync")
            self.play(*[Rotate(l, -TAU, about_point=r.get_center()) for l, r in zip(raios, rodas)], run_time=2)
        with self.narrate(F("T02", 2)) as n:
            n.wait_until("up")
            self.play(*[Rotate(l, -TAU, about_point=r.get_center()) for l, r in zip(raios, rodas)], run_time=1)
            n.wait_until("slow")
            self.play(*[Rotate(l, -PI, about_point=r.get_center()) for l, r in zip(raios, rodas)], run_time=2)
        with self.narrate(F("T02", 3)) as n:
            n.wait_until("frequency")
            eq = MathTex(r"\frac{df}{dt} = \frac{f_0}{2H}\,\frac{P_m - P_e}{S}", font_size=60, color=INK).next_to(rodas, DOWN, buff=0.6)
            self.play(Write(eq))
        with self.narrate(F("T02", 4)) as n:
            n.wait_until("five")
            t = MathTex(r"\approx 5\ \text{s}", font_size=80, color=GOLD).next_to(eq, DOWN, buff=0.45)
            self.play(FadeIn(t, scale=1.3))
            self.destacar(t)
        self.clear_section()


class T03_Papel(_Base):
    ESTILO = "v_papel"

    def construct(self):
        with self.narrate(F("T03", 1)) as n:
            q = text_tex("What would you do with five seconds?", size=44)
            self.play(Write(q))
        self.clear_section()
