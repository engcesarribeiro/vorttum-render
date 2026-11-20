"""Modelo de capa (primeiro quadro do vídeo = miniatura do Reels).

Uso no video.py:
    from capa import capa_grupo
    class A01_Abertura(_Teoria):
        def construct(self):
            capa = capa_grupo(["Título linha 1", "linha 2 em dourado"], "subtítulo curto", desenho, "passo a passo completo")
            self.add(capa)                         # sem animação: o quadro 0 já é a capa
            with self.narrate(F("A01", 1)) as n:
                n.wait_until("palavra")
                self.play(FadeOut(capa), run_time=0.6)
                ...
Para mostrar opções ao usuário antes: manim -s -r 1080,1920 capas.py CapaA (uma classe por opção).
"""
from explainer import *


def capa_grupo(titulo: list[str], subtitulo: str, desenho: Mobject, selo: str, topo: float = 5.05) -> VGroup:
    """Título (2ª linha em GOLD), subtítulo, desenho do resultado final e selo dourado, dentro da área segura."""
    linhas = [Tex(r"\textbf{" + l + "}", font_size=68, color=GOLD if i == len(titulo) - 1 else INK, tex_template=TEMPLATE)
              for i, l in enumerate(titulo)]
    tit = VGroup(*linhas).arrange(DOWN, buff=0.18)
    tit.move_to([0, topo - tit.height / 2, 0])
    sub = Tex(subtitulo, font_size=40, color=INK, tex_template=TEMPLATE).next_to(tit, DOWN, buff=0.3)
    desenho.scale_to_fit_width(min(desenho.width, 6.0))
    desenho.next_to(sub, DOWN, buff=0.45)
    tx = Tex(r"\textbf{" + selo + "}", font_size=34, color=BG, tex_template=TEMPLATE)
    fundo = RoundedRectangle(corner_radius=0.18, width=tx.width + 0.5, height=tx.height + 0.32).set_fill(GOLD, 1).set_stroke(width=0)
    s = VGroup(fundo, tx.move_to(fundo)).next_to(desenho, DOWN, buff=0.4)
    return VGroup(tit, sub, desenho, s)
