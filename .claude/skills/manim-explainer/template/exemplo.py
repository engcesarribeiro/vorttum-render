from explainer import *


class S01_Movimento(ExplainerScene):
    def construct(self):
        bg = faint_plane().move_to(self.zone("visual"))
        folha = sheet(4, 4, 0.9)
        setas = basis_arrows(0.9)
        visual = VGroup(folha, setas).move_to(self.zone("visual"))
        with self.narrate("Pense numa folha de papel quadriculado. Duas setas marcam onde cada passo leva: a azul para a direita, a laranja para cima.") as n:
            self.play(FadeIn(bg), FadeIn(folha), run_time=1)
            n.wait_until("azul")
            self.play(GrowArrow(setas[0]), run_time=0.6)
            n.wait_until("laranja")
            self.play(GrowArrow(setas[1]), run_time=0.6)

        m = colored_matrix([[1.2, 0.5], [0.3, 0.9]]).move_to(self.zone("side"))
        rot = label("a matriz").next_to(m, DOWN, buff=0.3)
        mat = [[1.2, 0.5], [0.3, 0.9]]
        with self.narrate("Agora mova a folha inteira. Quatro números bastam para dizer onde cada ponto vai parar, e 100% da folha segue as duas setas.") as n:
            self.play(Write(m), FadeIn(rot), run_time=1.2)
            center = visual.get_center()
            self.play(visual.animate.apply_matrix(mat, about_point=center), run_time=n.until("bastam"))
        self.clear_section()


class S02_Crescimento(ExplainerScene):
    def construct(self):
        reta = NumberLine(x_range=(0, 3, 1), length=5.2, include_numbers=True,
                          color=MUTED, numbers_to_exclude=[]).set_color(MUTED)
        self.fit(reta, "full").shift(DOWN * 0.4)
        t = ValueTracker(1.0)
        barra = always_redraw(lambda: Rectangle(
            width=max(0.01, reta.n2p(t.get_value())[0] - reta.n2p(0)[0]), height=0.45,
            stroke_width=0, fill_color=C1, fill_opacity=1,
        ).next_to(reta.n2p(0), UP, buff=0.3, aligned_edge=LEFT))
        valor = always_redraw(lambda: DecimalNumber(t.get_value(), num_decimal_places=2, font_size=44, color=INK)
                              .next_to(barra, UP, buff=0.25).align_to(barra, RIGHT))
        with self.narrate("Crescer um por cento, cem vezes seguidas, dá cerca de dois vírgula setenta.") as n:
            self.play(Create(reta), FadeIn(barra), FadeIn(valor), run_time=1)
            self.play(t.animate.set_value(2.70), run_time=n.until("setenta"), rate_func=linear)
        self.clear_section()
