"""Mesma cena em todos os estilos, para comparar (e testar o template).

    cp <skill>/template/explainer.py .   (na pasta do teste)
    python <skill>/scripts/render.py exemplo_estilos.py --vertical --no-tts
"""
from explainer import *

FALA_1 = ("Uma dívida de trinta mil reais, com juros de dois por cento ao mês. "
          "Os juros de cada mês são a taxa vezes o saldo devedor.")
FALA_2 = "Então, no primeiro mês, os juros são seiscentos reais."


class _Demo(ExplainerScene):
    def construct(self):
        self.titulo_rico([r"\textbf{Passo 1:}", " os juros do mês"], [GOLD, INK])
        with self.narrate(FALA_1) as n:
            pv = MathTex(r"PV = \text{R\$ } 30.000", font_size=52, color=INK)
            taxa = MathTex(r"i = 2\%", font_size=52, color=C2)
            linhas = VGroup(pv, taxa).arrange(DOWN, aligned_edge=LEFT, buff=0.35)
            linhas.next_to(self._title, DOWN, buff=0.75)
            mostra_em_painel(self, n, [pv, taxa], ["trinta", "dois"])
            n.wait_until("juros", nth=2)
            regra = text_tex("juros = taxa × saldo", 42, INK)
            regra.next_to(linhas, DOWN, buff=0.75)
            self.play(Write(regra))
            eixo = Line(LEFT * 2.6, RIGHT * 2.6).set_stroke(MUTED, 3).next_to(regra, DOWN, buff=1.9)
            barra = Rectangle(width=4.2, height=0.5).set_fill(C1, 0.85).set_stroke(C1, 2)
            barra.next_to(eixo, UP, buff=0.12, aligned_edge=LEFT)
            juros = Rectangle(width=0.9, height=0.5).set_fill(C2, 0.85).set_stroke(C2, 2)
            juros.next_to(barra, UP, buff=0.1, aligned_edge=LEFT)
            n.wait_until("saldo")
            self.play(Create(eixo), FadeIn(barra))
            rot = label("saldo", C1).next_to(barra, RIGHT, buff=0.2)
            self.play(FadeIn(rot))
        with self.narrate(FALA_2) as n:
            n.wait_until("seiscentos")
            self.play(GrowFromEdge(juros, LEFT))
            res = MathTex(r"J_1 = 0{,}02 \times 30.000 = 600", font_size=48, color=GOLD)
            res.next_to(eixo, DOWN, buff=0.7)
            self.play(Write(res))
            self.destacar(res, GOLD)
            self.wait(1.0)
        self.clear_section()


class E1_Documentario(_Demo):
    ESTILO = "documentario"


class E2_Quadro(_Demo):
    ESTILO = "quadro"


class E3_Papel(_Demo):
    ESTILO = "papel"


class E4_Colagem(_Demo):
    ESTILO = "colagem"


class E5_Bauhaus(_Demo):
    ESTILO = "bauhaus"


class E6_Blueprint(_Demo):
    ESTILO = "blueprint"


class E7_Lousa(_Demo):
    ESTILO = "lousa"


class E8_DarkUI(_Demo):
    ESTILO = "darkui"


class E9_Terminal(_Demo):
    ESTILO = "terminal"


class E10_Recorte(_Demo):
    ESTILO = "recorte"


class E11_Jornal(_Demo):
    ESTILO = "jornal"


class E12_Neon(_Demo):
    ESTILO = "neon"


class E13_Retro(_Demo):
    ESTILO = "retro"
