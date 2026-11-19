"""Os formatos prontos da skill, cada um numa cena curta (modelo e teste).

    cp <skill>/template/explainer.py .
    python <skill>/scripts/render.py exemplo_formatos.py --vertical --no-tts
Arquivos de exemplo: <skill>/template/remotion/public/ (questão, foto, Lottie).
"""
from explainer import *

EX = estilos.SKILL / "template" / "remotion" / "public"


class F1_Questao(ExplainerScene):
    ESTILO = "jornal"

    def construct(self):
        self.title("Questão da banca")
        with self.narrate("Olha a questão que caiu na prova. Ela pede os juros do primeiro mês.") as n:
            n.wait_until("questão")
            q = self.questao(EX / "questao_exemplo.png", "Banca · Concurso · Ano")
        with self.narrate("Pause o vídeo e tente resolver antes de continuar."):
            pass
        self.play(q.animate.scale(0.55, about_edge=UP), run_time=0.6)
        self.pause_e_tente(5, zona="side")
        self.clear_section()


class F2_Calculadora(ExplainerScene):
    ESTILO = "darkui"
    TITLE_AREA = False

    def construct(self):
        calc = Calculadora().scale(0.95).move_to(self.zone("visual") + DOWN * 0.6)
        with self.narrate("Na calculadora: trinta mil, valor presente. Dois, taxa. Um, período.") as n:
            self.play(FadeIn(calc))
            self.teclar(calc, ["3", "0", "0", "0", "0", "PV", "2", "i", "1", "n"], n=n,
                        palavras=["trinta", None, None, None, None, "presente", "Dois", "taxa", "Um", "período"])
        with self.narrate("E os juros do mês saem seiscentos reais.") as n:
            n.wait_until("seiscentos")
            self.teclar(calc, ["="], resultados={0: "600,00"})
        self.clear_section()


class F3_Personagens(ExplainerScene):
    ESTILO = "recorte"
    TITLE_AREA = False

    def construct(self):
        aluno = boneco(C1, expressao="duvida", olhar=0.6).move_to(self.zone("visual") + LEFT * 1.3 + DOWN * 0.8)
        banco = boneco(C2, expressao="feliz", olhar=-0.6, aceno=True, cabelo="#9AA0A6").move_to(self.zone("visual") + RIGHT * 1.3 + DOWN * 0.8)
        with self.narrate("O aluno pega trinta mil emprestado. O banco fica feliz, pois vai cobrar juros todo mês.") as n:
            n.wait_until("aluno")
            self.play(FadeIn(aluno, shift=UP * 0.3))
            n.wait_until("banco")
            self.play(FadeIn(banco, shift=UP * 0.3))
            n.wait_until("juros")
            bal = text_tex("+ 2% ao mês", 44, C2).next_to(banco, UP, buff=0.3)
            self.play(FadeIn(bal))
        self.clear_section()


class F4_LegendaReels(ExplainerScene):
    ESTILO = "neon"
    CAPTIONS = "reels"
    TITLE_AREA = False

    def construct(self):
        with self.narrate("Com a legenda estilo Reels, cada palavra acende na hora em que é falada.") as n:
            t = MathTex(r"J = i \times SD", font_size=90, color=GOLD).move_to(self.zone("visual"))
            n.wait_until("legenda")
            self.play(Write(t))
        self.clear_section()


class F5_KenBurns(ExplainerScene):
    ESTILO = "documentario"
    TITLE_AREA = False

    def construct(self):
        with self.narrate("Imagine uma cidade inteira pagando juros todo mês, sem perceber quanto paga.") as n:
            img = self.ken_burns(EX / "cidade_exemplo.jpg", n.remaining, zoom=1.18)
        self.play(FadeOut(img), run_time=0.5)


class F6_LousaInfinita(LousaInfinitaScene):
    ESTILO = "lousa"

    def construct(self):
        a = text_tex("Juros simples", 60, C1).move_to(LEFT * 5 + UP * 3)
        b = text_tex("Juros compostos", 60, C2).move_to(RIGHT * 5 + UP * 3)
        c = text_tex("Amortização", 60, GOLD).move_to(DOWN * 4)
        with self.narrate("Primeiro, juros simples. Depois, juros compostos. Por fim, amortização. Esse é o mapa.") as n:
            self.ir_para(a, run_time=0.8)
            self.play(Write(a))
            n.wait_until("compostos")
            self.ir_para(b, run_time=0.8)
            self.play(Write(b))
            n.wait_until("amortização")
            self.ir_para(c, run_time=0.8)
            self.play(Write(c))
            n.wait_until("mapa")
            self.hand_away(run_time=0.3)
            setas = VGroup(Arrow(a.get_bottom(), c.get_top(), color=MUTED), Arrow(b.get_bottom(), c.get_top(), color=MUTED))
            self.visao_geral(run_time=1.2)
            self.play(Create(setas))
        self.clear_section()
