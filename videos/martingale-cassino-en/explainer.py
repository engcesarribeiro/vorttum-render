"""Base para vídeos explicativos no estilo "documentário matemático" (Manim CE 0.20+).

Copie este arquivo para a pasta do projeto e faça cada cena herdar de ExplainerScene.

Layout fixo (16:9):
    topo     -> título curto (uma afirmação)
    esquerda -> o visual (folha, gráfico, reta)
    direita  -> a matriz/fórmula + rótulo pequeno
    rodapé   -> legenda da narração
Em 9:16 as zonas viram uma pilha: título, visual, fórmula, legenda, e respeitam
a área segura do Reels/Shorts (a interface cobre topo, rodapé e a lateral direita).
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import subprocess
from contextlib import contextmanager
from pathlib import Path

from manim import *


def _importa_estilos():
    """estilos.py vem da skill (fonte única, atualiza com git pull); cópia local só se a skill não for achada."""
    import importlib.util
    import sys
    aqui = Path(__file__).resolve().parent
    for base in (aqui, Path.cwd()):
        for p in (base, *base.parents):
            cand = p / ".claude" / "skills" / "manim-explainer" / "template" / "estilos.py"
            if cand.exists():
                break
        else:
            continue
        break
    else:
        cand = aqui / "estilos.py"
    spec = importlib.util.spec_from_file_location("estilos", cand)
    mod = importlib.util.module_from_spec(spec)
    sys.modules["estilos"] = mod
    spec.loader.exec_module(mod)
    return mod


estilos = _importa_estilos()
_E = estilos.ESTILOS["documentario"]    # estilo da cena em renderização (ExplainerScene.setup troca)
_TAB: dict = {}                         # tabela de troca de cores do estilo atual

# --- formato ---------------------------------------------------------------
# Com -r 1080,1920 o Manim manteria a altura 8 e espremeria a largura para 4.5.
# Fixar a largura em 8 deixa textos e objetos com o mesmo tamanho dos vídeos 16:9.
VERTICAL = config.pixel_height > config.pixel_width
if VERTICAL:
    config.frame_width = 8
    config.frame_height = 8 * config.pixel_height / config.pixel_width

# --- paleta ----------------------------------------------------------------
# Cor = significado. Use sempre o mesmo papel para a mesma cor no vídeo inteiro.
BG = "#0B1016"          # azul quase preto, mais suave que #000
INK = "#E8E6E1"         # texto principal
MUTED = "#8A9099"       # legenda, eixos
FAINT = "#1C2632"       # grade de fundo (quase invisível)
SHEET = "#1A2330"       # preenchimento da folha
C1 = "#29B6F6"          # azul: 1ª seta / 1ª coluna / 1º termo
C2 = "#FF7043"          # laranja: 2ª seta / 2ª coluna / 2º termo
GOLD = "#F5B82E"        # destaque, rótulos, pontos
BAD = "#EF5350"         # impossível, erro, "fora"
GOOD = "#66BB6A"        # certo, solução

config.background_color = BG

# --- texto -----------------------------------------------------------------
TITLE_SIZE = 46 if VERTICAL else 40      # no celular o texto precisa ser maior
CAPTION_SIZE = 32 if VERTICAL else 26
CAPTION_COLOR = "#B8BEC6" if VERTICAL else MUTED   # legenda mais clara no celular
CAPTION_FONT = "Inter"          # sem serifa, para não se confundir com o conteúdo (LaTeX)
CAPTION_BG, CAPTION_EDGE = "#05080C", "#3A4552"
CAPTION_DONE, CAPTION_NEXT = "#E9EDF2", "#6F7884"
LABEL_SIZE = 20
SANS = "Arial"          # só para rótulos auxiliares; título/legenda/matemática vão em LaTeX

_TEX_SPECIALS = {
    "\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
    "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
}
_TEX_RE = re.compile("|".join(re.escape(k) for k in _TEX_SPECIALS))


def tex_escape(text: str) -> str:
    """Deixa texto comum seguro para Tex (% e & quebram a compilação)."""
    return _TEX_RE.sub(lambda m: _TEX_SPECIALS[m.group()], text)


_tpl = TexTemplate()
_tpl.add_to_preamble(r"\usepackage[T1]{fontenc}\usepackage{lmodern}")
TEMPLATE = _tpl


def text_tex(text: str, size: float, color=INK) -> Mobject:
    """Texto comum. No documentário sai em LaTeX; nos outros estilos, na fonte do estilo."""
    if _E.fonte_texto:
        t = text.upper() if _E.caixa_alta else text
        return Text(t, font=_E.fonte_texto, font_size=size * _E.escala_texto, color=color, weight=_E.peso_texto)
    return Tex(tex_escape(text), font_size=size, color=color, tex_template=TEMPLATE)


def label(text: str, color=GOLD, size: float = LABEL_SIZE) -> Text:
    """Rótulo auxiliar pequeno em sans ("a matriz", "inclinação"); nos outros estilos, na fonte do estilo."""
    if _E.fonte_texto:
        t = text.upper() if _E.caixa_alta else text
        return Text(t, font=_E.fonte_texto, font_size=size * _E.escala_texto * 1.1, color=color, weight=_E.peso_texto)
    return Text(text, font=SANS, font_size=size, color=color)


def colored_matrix(rows, colors=(C1, C2), size: float = 48) -> Matrix:
    """Matriz com cada coluna na cor da seta correspondente."""
    m = Matrix(rows, element_to_mobject_config={"font_size": size}, bracket_config={"color": INK})
    m.get_brackets().set_color(INK)
    for col, color in zip(m.get_columns(), colors):
        col.set_color(color)
    return m


def sheet(cols: int = 4, rows: int = 4, cell: float = 1.0) -> VGroup:
    """Folha finita: preenchimento claro, linhas internas finas, borda branca.

    Mais legível que um NumberPlane infinito, que briga com título e legenda.
    Centro da folha na origem: use .shift() depois de transformar.
    """
    w, h = cols * cell, rows * cell
    fill = Rectangle(width=w, height=h, stroke_width=0, fill_color=SHEET, fill_opacity=0.9)
    lines = VGroup(
        *[Line([-w / 2 + i * cell, -h / 2, 0], [-w / 2 + i * cell, h / 2, 0]) for i in range(1, cols)],
        *[Line([-w / 2, -h / 2 + j * cell, 0], [w / 2, -h / 2 + j * cell, 0]) for j in range(1, rows)],
    ).set_stroke(INK, width=1, opacity=0.35)
    border = Rectangle(width=w, height=h).set_stroke(INK, width=2, opacity=0.9)
    return VGroup(fill, lines, border)


def faint_plane(x=(-8, 8), y=(-5, 5)) -> NumberPlane:
    """Grade de referência quase invisível, para ficar atrás da folha."""
    return NumberPlane(
        x_range=(*x, 1), y_range=(*y, 1),
        background_line_style={"stroke_color": INK, "stroke_width": 1, "stroke_opacity": 0.08},
        axis_config={"stroke_color": INK, "stroke_opacity": 0.15, "stroke_width": 1},
    )


def basis_arrows(cell: float = 1.0) -> VGroup:
    """î azul e ĵ laranja saindo da origem."""
    i = Arrow(ORIGIN, RIGHT * cell, buff=0, color=C1, stroke_width=5, max_tip_length_to_length_ratio=0.2)
    j = Arrow(ORIGIN, UP * cell, buff=0, color=C2, stroke_width=5, max_tip_length_to_length_ratio=0.2)
    return VGroup(i, j)


# --- destaque e utilidades ------------------------------------------------------
# Fundo escuro tingido para caixas de destaque: o texto da cor fica legível em cima.
PANEL = {GOLD: "#2E2511", C1: "#0D2433", C2: "#36190E", GOOD: "#12301A", INK: "#1F2833"}


def caixa(mob: Mobject, color=GOLD, buff: float = 0.2) -> SurroundingRectangle:
    """Caixa de destaque com fundo próprio, sempre atrás do conteúdo (resultado, fórmula-chave)."""
    box = SurroundingRectangle(mob, buff=buff, corner_radius=min(0.12, _E.cantos))
    box.set_stroke(color, 3).set_fill(PANEL.get(color, PANEL[INK]), _E.painel_opacidade).set_z_index(-1)
    if _E.caixa_sombra:     # colagem: recorte colado com sombra
        return VGroup(estilos.sombra_recorte(box).set_z_index(-2), box).set_z_index(-1)
    return box


def spin(tracker: ValueTracker, speed: float = TAU / 5) -> ValueTracker:
    """Faz um ângulo girar sozinho (setas de fasor). Adicione o tracker à cena e pare com clear_updaters()."""
    tracker.add_updater(lambda m, dt: m.increment_value(speed * dt))
    return tracker


def empilhar(*mobs, buff: float = 0.5, w: float = 6.0, h: float | None = None) -> VGroup:
    """Empilha linhas com espaço fixo. Só a linha larga demais encolhe (nunca o bloco todo).

    Se ainda assim não couber em h, NÃO esprema: mostre as linhas em etapas (uma sai, outra entra).
    """
    for m in mobs:
        if m.width > w:
            m.scale_to_fit_width(w)
    g = VGroup(*mobs).arrange(DOWN, buff=buff)
    if h is not None and g.height > h:
        logger.warning(f"[espaço] bloco de {g.height:.1f} não cabe em {h:.1f}: divida em etapas")
    return g


# --- narração --------------------------------------------------------------
TTS_DIR = Path(os.environ.get("EXPLAINER_TTS_DIR", "media/tts"))
WORDS_PER_SEC = 2.6     # ritmo usado quando a narração está desligada


# Voz: cada fala é gerada INTEIRA numa chamada só. Picar a fala em trechos (para dar ênfase)
# faz a voz multilíngue perder o contexto e pronunciar palavras em outro idioma. O ritmo e a
# entonação vêm da pontuação do roteiro (vírgula, ponto, reticências).


def clean_text(text: str) -> str:
    """Texto falado normalizado (espaços simples)."""
    return re.sub(r"\s+", " ", text).strip()


def _tts(text: str, voice: str, rate: str, mp3: Path):
    import edge_tts
    import edge_tts.communicate as etc

    # A biblioteca declara xml:lang='en-US' em toda fala; numa voz multilíngue isso puxa
    # palavras para a pronúncia em inglês. Declara o idioma da própria voz (ex.: pt-BR).
    # (O serviço recusa tags extras como <lang> e <break>: só o atributo do <speak> passa.)
    lang = "-".join(voice.split("-")[:2])

    def mkssml(tc, escaped_text):
        if isinstance(escaped_text, bytes):
            escaped_text = escaped_text.decode("utf-8")
        return (f"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{lang}'>"
                f"<voice name='{tc.voice}'><prosody pitch='{tc.pitch}' rate='{tc.rate}' volume='{tc.volume}'>"
                f"{escaped_text}</prosody></voice></speak>")

    etc.mkssml = mkssml

    async def run():
        words = []
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or None
        com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary", proxy=proxy)
        with open(mp3, "wb") as f:
            async for chunk in com.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append((chunk["text"], chunk["offset"] / 1e7))
        return words

    return asyncio.run(run())


def _probe(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True)
    return float(out.stdout)


# Pronúncia: grafia enviada à voz quando a leitura padrão sai errada. Vale só para o áudio:
# roteiro, legenda e tela continuam com a grafia normal. Acrescente casos aqui (vale para todos os vídeos).
PRONUNCIA = {
    r"\bvolts\b": "vôlts",       # unidade: o fechado ("vôlts"), nunca "vólts"
    r"\bvolt\b": "vôlt",         # inclusive em "volt-ampère"
    r"\bVolts\b": "Vôlts",
    r"\bVolt\b": "Vôlt",
    r"\bDR\b": "dê érre",        # sigla: a voz lia "doutor"
    r"\bDPS\b": "dê pê ésse",    # sigla: a voz lia "depois"
    r"\bTN-C-S\b": "tê éne cê ésse",
    r"\bTN\b": "tê éne",
    r"\bTT\b": "tê tê",
    r"\bIT\b": "i tê",
    r"\bPEN\b": "pê ê éne",
    r"\bBEP\b": "bê ê pê",
    r"\bEPSO\b": "é pê ésse ó",   # PSO evolutivo
    r"\bPSO\b": "pê ésse ó",      # otimização por enxame de partículas
    r"\bPID\b": "pê i dê",
    r"\bITAE\b": "i tê a é",
    r"\bKp\b": "ca pê",
    r"\bKi\b": "ca i",
    r"\bKd\b": "ca dê",
}


def para_voz(text: str) -> str:
    """Aplica a tabela PRONUNCIA ao texto que vai para a voz."""
    for pat, rep in PRONUNCIA.items():
        text = re.sub(pat, rep, text)
    return text


def _sem_acento(w: str) -> str:
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn")


def _synthesize(text: str, voice: str, rate: str) -> tuple[Path | None, float, list[tuple[str, float]]]:
    """Gera (ou lê do cache) o mp3 da fala inteira e o tempo de cada palavra."""
    plain = clean_text(text)
    if os.environ.get("EXPLAINER_TTS", "on").lower() in ("off", "0", "false") or not voice:
        words = plain.split()
        return None, max(1.0, len(words) / WORDS_PER_SEC), [(w, i / WORDS_PER_SEC) for i, w in enumerate(words)]
    TTS_DIR.mkdir(parents=True, exist_ok=True)
    plain = para_voz(plain)
    key = hashlib.sha1(f"v3|{voice}|{rate}|{plain}".encode()).hexdigest()[:16]
    mp3, meta = TTS_DIR / f"{key}.mp3", TTS_DIR / f"{key}.json"
    if not (mp3.exists() and meta.exists()):
        words = _tts(plain, voice, rate, mp3)
        meta.write_text(json.dumps({"duration": _probe(mp3), "words": words}, ensure_ascii=False), "utf-8")
    data = json.loads(meta.read_text("utf-8"))
    return mp3, data["duration"], [tuple(w) for w in data["words"]]


# --- legenda central -------------------------------------------------------
# Quando a voz fala e a tela não tem nada escrito, a frase falada aparece no centro
# (fade in). Ela some com fade quando o primeiro desenho/texto entra.
CENTRAL_SIZE = 40 if VERTICAL else 36
CENTRAL_COLOR = "#C9CED6"
CENTRAL_CHARS = 28 if VERTICAL else 46
FADE_LEG = 0.45
LEG_MIN = 3.0           # só mostra a legenda se a tela vai ficar vazia por pelo menos isso (s)


def _frases(text: str) -> list[str]:
    return [f for f in re.split(r"(?<=[.!?…])\s+", clean_text(text)) if f]


def _quebra(frase: str, n: int) -> list[str]:
    linhas, atual = [], ""
    for w in frase.split():
        if atual and len(atual) + 1 + len(w) > n:
            linhas.append(atual)
            atual = w
        else:
            atual = f"{atual} {w}".strip()
    return linhas + ([atual] if atual else [])


PAINEL_BG = "#16202B"


def painel(mob: Mobject, cor=GOLD, buff: float = 0.26) -> VGroup:
    """Fundo sólido com faixa de cor à esquerda, para blocos de dados. Fica atrás do conteúdo (z<0)."""
    w, h = mob.width + 2 * buff + 0.16, mob.height + 2 * buff
    bg = RoundedRectangle(corner_radius=max(_E.cantos, 1e-3), width=w, height=h).set_fill(PAINEL_BG, _E.painel_opacidade).set_stroke("#2C3A4A", 1.5)
    bg.move_to(mob).shift(LEFT * 0.08)
    faixa = RoundedRectangle(corner_radius=0.04, width=0.09, height=h - 0.22).set_fill(cor, 1).set_stroke(width=0)
    faixa.move_to(bg.get_left() + RIGHT * 0.14)
    if _E.caixa_sombra:
        return VGroup(estilos.sombra_recorte(bg), bg, faixa).set_z_index(-1)
    return VGroup(bg, faixa).set_z_index(-1)


def mostra_em_painel(scene, n, linhas, palavras, cor=GOLD):
    """Mostra cada linha na sua palavra da fala; o painel aparece com a 1ª linha e cresce junto (nunca vazio).

    Ex.: mostra_em_painel(self, n, [pv, taxa, tempo], ["trezentos", "cento", "trinta"])
    Devolve o painel (para transformar depois, ex.: virar a faixa de dados da questão).
    """
    linhas = list(linhas)
    topo = painel(VGroup(*linhas), cor)
    pn = None
    for k, (l, w) in enumerate(zip(linhas, palavras)):
        n.wait_until(w)
        alvo = painel(VGroup(*linhas[:k + 1]), cor).align_to(topo, UP)
        if pn is None:
            pn = alvo
            scene.play(FadeIn(pn), FadeIn(l, shift=DOWN * 0.08), run_time=0.45)
        else:
            scene.play(Transform(pn, alvo), FadeIn(l, shift=DOWN * 0.08), run_time=0.45)
    return pn


def quebra_linhas(texto: str, size: float = 36, largura_max: float = 6.0, color=INK, buff: float = 0.1) -> Mobject:
    """Texto na fonte do estilo; se passar de largura_max, quebra em mais linhas (nunca encolhe a fonte).

    As fontes dos estilos (caixa-alta do blueprint, máquina de escrever da colagem) são mais largas
    que o LaTeX do documentário: meça sempre no estilo da cena.
    """
    linhas, atual = [], []
    for p in texto.split():
        cand = " ".join(atual + [p])
        if atual and text_tex(cand, size, color).width > largura_max:
            linhas.append(" ".join(atual))
            atual = [p]
        else:
            atual.append(p)
    if atual:
        linhas.append(" ".join(atual))
    if len(linhas) == 1:
        return text_tex(linhas[0], size, color)
    return VGroup(*[text_tex(l, size, color) for l in linhas]).arrange(DOWN, aligned_edge=LEFT, buff=buff)


def caixa_texto(texto, cor=C1, size: float = 36, w: float = 0.0, h: float = 0.0,
                largura_max: float = 5.6, folga: float = 0.3, texto_cor=INK) -> VGroup:
    """Caixa com texto (bloco de diagrama, cartão): cresce até o texto caber com folga em volta.

    `texto` pode ser str (quebra sozinho em linhas se passar de largura_max) ou um Mobject pronto.
    w/h são o tamanho mínimo; a caixa nunca fica menor que o texto + folga.
    Devolve VGroup(caixa, texto). Fios do diagrama: ligue em g[0].get_left()/get_right()/get_top()/get_bottom().
    """
    t = quebra_linhas(texto, size, largura_max, texto_cor) if isinstance(texto, str) else texto
    w, h = max(w, t.width + 2 * folga), max(h, t.height + 2 * folga * 0.8)
    r = RoundedRectangle(corner_radius=max(min(_E.cantos, h / 2 - 0.01), 1e-3), width=w, height=h)
    r.set_fill(SHEET, 1).set_stroke(cor, 3)
    return VGroup(r, t.move_to(r))


def falas_do_roteiro(path) -> callable:
    """Lê as falas do roteiro (fonte única do texto falado) e devolve F(cena, n).

    Formato do roteiro: um bloco "### A01 ..." por cena e linhas "**Fala 1:** texto".
    No video.py:  F = falas_do_roteiro(Path(__file__).with_name("roteiro.md"))
                  with self.narrate(F("A01", 1)) as n: ...
    """
    txt = Path(path).read_text("utf-8")
    falas = {}
    for bloco in re.split(r"^### ", txt, flags=re.M)[1:]:
        falas[bloco.split()[0]] = re.findall(r"^\*\*Fala \d+:\*\* (.*)$", bloco, flags=re.M)

    def F(cena: str, n: int) -> str:
        return falas[cena][n - 1]

    F.falas = falas
    return F


def _align_words(flat: list[str], words, duration: float) -> list[float]:
    """Tempo de início de cada palavra da legenda, alinhando com as palavras que a voz falou.

    A voz às vezes divide ou junta palavras de outro jeito (números, hífens). O alinhamento
    casa as iguais, distribui as trocadas e interpola o que sobrar, sempre em ordem crescente.
    """
    from difflib import SequenceMatcher
    norm = lambda w: _sem_acento(re.sub(r"[^\w]", "", w.lower()))
    a, b = [norm(w) for w in flat], [norm(w[0]) for w in words]
    times = [None] * len(a)
    for tag, i1, i2, j1, j2 in SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = words[j1 + k][1]
        elif tag == "replace":
            for k in range(i2 - i1):
                j = j1 + min(k * (j2 - j1) // max(1, i2 - i1), j2 - j1 - 1)
                times[i1 + k] = words[j][1]
    known = [(i, t) for i, t in enumerate(times) if t is not None]
    if not known:
        return [duration * 0.92 * i / max(1, len(a)) for i in range(len(a))]
    for i in range(len(a)):
        if times[i] is None:
            prev = max((k for k in known if k[0] < i), default=(-1, 0.0), key=lambda k: k[0])
            nxt = min((k for k in known if k[0] > i), default=(len(a), duration * 0.95), key=lambda k: k[0])
            times[i] = prev[1] + (nxt[1] - prev[1]) * (i - prev[0]) / max(1, nxt[0] - prev[0])
    for i in range(1, len(times)):
        times[i] = max(times[i], times[i - 1])
    return times


def _caption_chunks(text: str, max_chars: int) -> list[str]:
    """Quebra a fala em linhas de legenda, preferindo cortar em pontuação."""
    chunks, cur = [], ""
    for word in text.split():
        cand = f"{cur} {word}".strip()
        if len(cand) > max_chars and cur:
            chunks.append(cur)
            cur = word
        else:
            cur = cand
        if cur.endswith((".", "?", "!", ":", ";")) and len(cur) > max_chars * 0.45:
            chunks.append(cur)
            cur = ""
    if cur:
        chunks.append(cur)
    # uma palavra sozinha na tela parece erro: cola a sobra curta na linha anterior
    if len(chunks) > 1 and len(chunks[-1]) < max_chars * 0.3:
        chunks[-2:] = [f"{chunks[-2]} {chunks[-1]}"]
    return chunks


# --- personagem de papel recortado ---------------------------------------------
def boneco(roupa=C1, pele="#F2C29B", cabelo="#3B2A20", expressao="feliz", olhar=0.0, altura=2.4,
           aceno=False) -> VGroup:
    """Boneco simples de papel recortado (o aluno, o banco, a banca). Pé na origem: use .move_to/.next_to depois.

    expressao: "feliz", "serio", "duvida" ou "surpreso". olhar: -1 (esquerda) a 1 (direita). aceno: braço levantado.
    Nos estilos com recorte (colagem, recorte) ganha sombra de papel colado.
    """
    k = altura / 4.2
    corpo = Polygon([-0.95, 0, 0], [-0.8, 1.7, 0], [0, 2.1, 0], [0.8, 1.7, 0], [0.95, 0, 0]).set_fill(roupa, 1).set_stroke(width=0)
    corpo = VGroup(corpo, Arc(radius=0.82, start_angle=PI * 0.1, angle=PI * 0.8).move_to([0, 1.85, 0])
                   .set_fill(roupa, 1).set_stroke(width=0))
    braco_e = Line([-0.8, 1.65, 0], [-1.28, 0.6, 0]).set_stroke(roupa, 22)
    mao_e = Circle(radius=0.2).move_to([-1.28, 0.58, 0]).set_fill(pele, 1).set_stroke(width=0)
    fim_d = np.array([1.48, 3.3, 0]) if aceno else np.array([1.28, 0.6, 0])
    braco_d = Line([0.8, 1.65, 0], fim_d).set_stroke(roupa, 22)
    mao_d = Circle(radius=0.2).move_to(fim_d + (UP * 0.05 if aceno else DOWN * 0.02)).set_fill(pele, 1).set_stroke(width=0)
    cabeca = Circle(radius=0.95).move_to([0, 2.8, 0]).set_fill(pele, 1).set_stroke(width=0)
    topo = ArcBetweenPoints([-0.95, 2.9, 0], [0.95, 2.9, 0], angle=-PI * 0.95).set_fill(cabelo, 1).set_stroke(width=0)
    olhos = VGroup(*[Dot([dx + olhar * 0.12, 2.82, 0], radius=0.11, color="#2B2D42") for dx in (-0.32, 0.32)])
    if expressao == "surpreso":
        boca = Ellipse(width=0.28, height=0.36).move_to([olhar * 0.08, 2.32, 0]).set_fill("#2B2D42", 1).set_stroke(width=0)
    elif expressao == "serio":
        boca = Line([-0.22, 2.36, 0], [0.22, 2.36, 0]).set_stroke("#2B2D42", 6)
    elif expressao == "duvida":
        boca = VGroup(ArcBetweenPoints([-0.22, 2.34, 0], [0.22, 2.3, 0], angle=-0.6).set_stroke("#2B2D42", 6),
                      Line([0.18, 3.12, 0], [0.5, 3.22, 0]).set_stroke("#2B2D42", 6))
    else:
        boca = ArcBetweenPoints([-0.26, 2.44, 0], [0.26, 2.44, 0], angle=PI * 0.6).set_stroke("#2B2D42", 6)
    g = VGroup(corpo, braco_e, braco_d, mao_e, mao_d, cabeca, topo, olhos, boca)
    if _E.caixa_sombra:
        sombra = g.copy()
        for m in sombra.family_members_with_points():
            if m.get_fill_opacity() > 0:
                m.set_fill("#000000", 0.22)
            if m.get_stroke_width() > 0:
                m.set_stroke("#000000", opacity=0.22)
        g = VGroup(sombra.shift(RIGHT * 0.08 + DOWN * 0.08).set_z_index(-1), g)
    return g.scale(k, about_point=ORIGIN)


# --- mão com caneta (estilo quadro) -------------------------------------------
def make_hand(px: float = 0.0052) -> Group:
    """Foto da mão segurando o marcador (fundo removido). Submobject 0 = ponta do marcador."""
    tx, ty, w, h = map(float, (estilos.ASSETS / "mao_tip.txt").read_text().split())
    img = ImageMobject(str(estilos.ASSETS / "mao_final.png"))
    img.height = h * px
    tip = img.get_corner(UL) + RIGHT * tx * px + DOWN * ty * px
    hand = Group(Dot(tip, radius=0.001, fill_opacity=0), img)
    hand.set_z_index(100)
    return hand


def _tip_point(anim, alpha, write=False):
    """Ponto que está sendo desenhado agora (a ponta da caneta vai para lá)."""
    fams = list(anim.get_all_families_zipped())
    n = len(fams)
    tip = None
    for i, fam in enumerate(fams):
        sa = anim.get_sub_alpha(alpha, i, n)
        if sa <= 0:
            continue
        start = fam[1]
        if not start.has_points():
            continue
        prop = min(1.0, sa * 2) if write else sa
        tip = start.point_from_proportion(float(np.clip(prop, 0, 1)))
    return tip


class HandCreate(Create):
    def __init__(self, mob, hand, **kw):
        self._hand = hand
        super().__init__(mob, **kw)

    def interpolate_mobject(self, alpha):
        super().interpolate_mobject(alpha)
        t = _tip_point(self, alpha)
        if t is not None:
            self._hand.shift(t - self._hand[0].get_center())


class HandWrite(Write):
    def __init__(self, mob, hand, **kw):
        self._hand = hand
        super().__init__(mob, **kw)

    def interpolate_mobject(self, alpha):
        super().interpolate_mobject(alpha)
        t = _tip_point(self, alpha, write=True)
        if t is not None:
            self._hand.shift(t - self._hand[0].get_center())


def _tem_texto_ou_fundo(m: Mobject) -> bool:
    return isinstance(m, (Text, MarkupText, SingleStringMathTex)) or any(
        isinstance(x, (Text, MarkupText, SingleStringMathTex)) or x.get_fill_opacity() > 0.05
        for x in m.family_members_with_points())


def _reels_chunks(text: str, max_words: int = 3, max_chars: int = 16) -> list[list[str]]:
    """Fala em blocos curtos (até 3 palavras), cortando também na pontuação."""
    chunks, cur = [], []
    for w in text.split():
        if cur and (len(cur) >= max_words or len(" ".join(cur + [w])) > max_chars):
            chunks.append(cur)
            cur = []
        cur.append(w)
        if w.endswith((".", ",", "?", "!", ":", ";")):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


class Narration:
    """Devolvido por `with self.narrate(...) as n:`. Dá tempos relativos ao início da fala."""

    def __init__(self, scene: "ExplainerScene", duration: float, words, start: float):
        self.scene, self.duration, self.words, self.start = scene, duration, words, start

    @property
    def elapsed(self) -> float:
        return self.scene.renderer.time - self.start

    @property
    def remaining(self) -> float:
        return max(0.0, self.duration - self.elapsed)

    def word_time(self, word: str, nth: int = 1) -> float:
        """Momento (desde o início da fala) da n-ésima ocorrência de `word`."""
        norm = lambda s: _sem_acento(re.sub(r"[^\w]", "", s.lower()))
        hits = [t for w, t in self.words if norm(w) == norm(word)]
        if len(hits) < nth:
            raise ValueError(f"palavra '{word}' (#{nth}) não está na narração")
        return hits[nth - 1]

    def wait_until(self, word: str, nth: int = 1):
        """Espera até a palavra ser dita, para a próxima animação começar junto com ela."""
        gap = self.word_time(word, nth) - self.elapsed
        if gap > 1 / config.frame_rate:
            self.scene.wait(gap)

    def until(self, word: str, nth: int = 1, minimum: float = 0.3) -> float:
        """run_time que faz uma animação terminar quando a palavra é dita."""
        return max(minimum, self.word_time(word, nth) - self.elapsed)


class ExplainerScene(Scene):
    VOICE = "en-US-AndrewMultilingualNeural"    # VORTTUM EN-US (o pre_voz.py usa esta voz)
    RATE = "+0%"
    SAFE = 0.35                     # margem interna da tela (16:9)
    # 9:16: área coberta pela interface do Reels/Shorts (unidades do Manim; a tela tem 8 de largura)
    REELS_TOP = 1.75                # ~12% do topo: nome do perfil, áudio
    REELS_BOTTOM = 3.0              # ~20% do rodapé: descrição, botões
    REELS_SIDE = 0.7                # margem lateral (ícones à direita)
    TITLE_LINES = 2                 # 9:16: título quebra em até 2 linhas
    TITLE_AREA = True               # False: cena sem título, o conteúdo usa o espaço do topo
    CAPTIONS = False                # sem legenda queimada (aula). True = karaokê; "reels"; "recortes" (anúncio retro)
    LEGENDA_CENTRAL = False         # True: frase falada no centro em espera longa com tela vazia (usuário pediu para tirar)
    MIN_GAP = 0.15                  # distância mínima entre dois elementos (aviso [espaço])
    VAZIO_MAX = 2.0                 # tela sem conteúdo com voz tocando por mais que isso: aviso [vazio]
    ESTILO = "documentario"         # documentario | quadro | papel | colagem | bauhaus (ver estilos.py)
    MAO = None                      # None = o estilo decide (só o quadro usa); True/False força

    # ---------------------------------------------------------------- zonas
    def setup(self):
        global _E, _TAB
        _E = estilos.estilo(self.ESTILO)
        _TAB = estilos.tabela_cores(_E)
        estilos.registra_fontes()     # fontes dos estilos, da calculadora e da legenda reels
        self.camera.background_color = ManimColor(_E.cor("BG"))
        if hasattr(self.camera, "init_background"):
            self.camera.init_background()
        self._setup_zonas()
        self._v0, self._vazios, self._falas_t = 0.0, [], []   # auditoria [vazio]
        self._decor = []
        top, bottom = self.content_box
        dec = estilos.decoracao(_E, config.frame_width, config.frame_height, VERTICAL, (top, bottom))
        if dec is not None:
            if _E.brilho:
                estilos.brilho(dec)
            dec.set_z_index(-50)
            dec.is_background = True
            self._chrome.add(id(dec))
            self._decor.append(dec)
            Scene.add(self, dec)
        usa_mao = _E.mao if self.MAO is None else self.MAO
        self.hand = None
        if usa_mao:
            self.hand = make_hand()
            self.hand.add_updater(lambda m, dt: None)   # dt: a mão é redesenhada nas esperas
            fw, fh = config.frame_width, config.frame_height
            self._rest = np.array([fw / 2 + 0.3, -fh / 2 - 0.3, 0])
            self.hand.shift(self._rest - self.hand[0].get_center())
            self._chrome.add(id(self.hand))
            self._decor.append(self.hand)

    # ------------------------------------------------------- estilo: cores
    def add(self, *mobjects):
        if _TAB:
            for m in mobjects:
                if isinstance(m, Mobject) and id(m) not in self._chrome_ids():
                    estilos.recolore(m, _TAB)
                    if _E.brilho:
                        estilos.brilho(m)
        r = super().add(*mobjects)
        self._marca_vazio()
        return r

    def _chrome_ids(self):
        return {id(d) for d in getattr(self, "_decor", [])}

    def begin_animations(self):
        super().begin_animations()
        if _TAB:   # alvo e início das animações também no estilo (senão a cor volta ao documentário no meio)
            for a in self.animations:
                for attr in ("mobject", "target_mobject", "target_copy", "starting_mobject"):
                    m = getattr(a, attr, None)
                    if isinstance(m, Mobject):
                        estilos.recolore(m, _TAB)
                        if _E.brilho:
                            estilos.brilho(m)

    def update_mobjects(self, dt):
        super().update_mobjects(dt)
        if _TAB:   # always_redraw recria o objeto a cada quadro com as cores do documentário
            for m in self.mobjects:
                if m.get_family_updaters() and id(m) not in self._chrome_ids():
                    estilos.recolore(m, _TAB)
                    if _E.brilho:
                        estilos.brilho(m)

    def _setup_zonas(self):
        fw, fh = config.frame_width, config.frame_height
        if VERTICAL:
            self.SAFE = self.REELS_SIDE
            self.title_top = fh / 2 - self.REELS_TOP
            self.title_y = self.title_top - 0.35
            self.caption_y = -fh / 2 + self.REELS_BOTTOM
            top = self.title_top - 0.75 * self.TITLE_LINES if self.TITLE_AREA else self.title_top - 0.1
            bottom = (self.caption_y + 1.25 if self.CAPTIONS in ("reels", "recortes") else
                      self.caption_y + 0.75 if self.CAPTIONS else self.caption_y + 0.15)
        else:
            self.title_y = fh / 2 - 0.55
            self.title_top = self.title_y + 0.3
            self.caption_y = -fh / 2 + 0.5
            top, bottom = self.title_y - 0.45, self.caption_y + 0.6
        self.content_box = (top, bottom)
        if VERTICAL:
            mid = bottom + (top - bottom) * 0.38
            self.zones = {
                "visual": (np.array([0, (top + mid) / 2, 0]), fw - 2 * self.SAFE, top - mid),
                "side": (np.array([0, (mid + bottom) / 2, 0]), fw - 2 * self.SAFE, mid - bottom),
            }
        else:
            split = -fw / 2 + fw * 0.6
            self.zones = {
                "visual": (np.array([(-fw / 2 + split) / 2, (top + bottom) / 2, 0]), split + fw / 2 - 2 * self.SAFE, top - bottom),
                "side": (np.array([(split + fw / 2) / 2, (top + bottom) / 2, 0]), fw / 2 - split - self.SAFE, top - bottom),
            }
        self.zones["full"] = (np.array([0, (top + bottom) / 2, 0]), fw - 2 * self.SAFE, top - bottom)
        self._title: Mobject | None = None
        self._caption = VMobject()
        self._chrome: set[int] = set()
        self._leg = None            # legenda central visível
        self._leg_seq = []          # [(instante absoluto, texto da frase)] das frases seguintes

    def zone(self, name: str = "visual") -> np.ndarray:
        """Centro da zona: 'visual' (esquerda/cima), 'side' (direita/baixo) ou 'full'."""
        return self.zones[name][0].copy()

    def fit(self, mob: Mobject, zone: str = "visual", scale_up: bool = False) -> Mobject:
        """Encaixa o objeto na zona (reduz se for grande) e centraliza."""
        _, w, h = self.zones[zone]
        factor = min(w / max(mob.width, 1e-6), h / max(mob.height, 1e-6))
        if factor < 1 or scale_up:
            mob.scale(factor * 0.95)
        return mob.move_to(self.zone(zone))

    # ------------------------------------------------------- título/legenda
    def title(self, text: str, run_time: float = 0.8):
        """Troca o título do topo. Escreva uma afirmação curta, não um rótulo."""
        max_w = config.frame_width - 2 * self.SAFE
        if _E.fonte_titulo:
            new = estilos.titulo_estilo(_E, estilos.tex_para_markup(tex_escape(text)), TITLE_SIZE * 1.15, INK, max_w)
            return self._troca_titulo(new, run_time)
        new = text_tex(text, TITLE_SIZE)
        if VERTICAL and new.width > max_w:
            # quebra em linhas equilibradas em vez de encolher o texto
            words, best = text.split(), None
            for cut in range(1, len(words)):
                a, b = " ".join(words[:cut]), " ".join(words[cut:])
                score = max(len(a), len(b))
                if best is None or score < best[0]:
                    best = (score, a, b)
            new = VGroup(text_tex(best[1], TITLE_SIZE), text_tex(best[2], TITLE_SIZE)).arrange(DOWN, buff=0.18)
        if new.width > max_w:
            new.scale_to_fit_width(max_w)
        return self._troca_titulo(new, run_time)

    def _troca_titulo(self, new: Mobject, run_time: float = 0.8):
        """Põe o título no topo (com a mão, no estilo quadro) e tira o anterior."""
        max_w = config.frame_width - 2 * self.SAFE
        if new.width > max_w:
            new.scale_to_fit_width(max_w)
        new.move_to([0, self.title_top - new.height / 2, 0])
        self._chrome.add(id(new))
        if self.hand is not None:
            if self._title is not None:
                self.play(FadeOut(self._title), run_time=0.3)
            self._title = new
            self.play(Write(new), run_time=max(run_time, 1.0))   # play troca Write pela mão
            return new
        anims = [FadeIn(new, shift=DOWN * 0.15)]
        if self._title is not None:
            anims.append(FadeOut(self._title))
        self.play(*anims, run_time=run_time)
        self._title = new
        return new

    def _legenda_reels(self, words: list[str]) -> list[VGroup]:
        """Legenda estilo Reels: 1 a 3 palavras grandes no centro-baixo, a palavra falada em destaque."""
        esc = lambda w: w.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").upper()
        fonte = _E.fonte_titulo if _E.fonte_titulo and _E.tipo not in ("neon", "colagem") else "Inter"
        tam = 60 if VERTICAL else 46
        out = []
        for k in range(len(words)):
            markup = " ".join(f'<span foreground="{GOLD}">{esc(w)}</span>' if i == k else esc(w)
                              for i, w in enumerate(words))
            t = MarkupText(markup, font=fonte, font_size=tam, color=INK, weight=BOLD)
            if t.width > config.frame_width - 2 * self.SAFE:
                t.scale_to_fit_width(config.frame_width - 2 * self.SAFE)
            t.set_stroke("#000000", 9, opacity=0.85, background=True)
            out.append(VGroup(t.move_to([0, self.caption_y + 0.6, 0])))
        return out

    def _legenda_recortes(self, words: list[str]) -> list[VGroup]:
        """Legenda em recortes (estilo retro): cada palavra num papel; entram quando são ditas e a falada fica no vermelho."""
        cores = [("#F1E9D8", "#151515"), ("#FAF7F0", "#151515"), ("#151515", "#F4EEE2")]
        fontes = ["Alfa Slab One", "Special Elite"]
        tam = 46 if VERTICAL else 36
        pecas = []
        for i, w in enumerate(words):
            t = Text(w.rstrip(".,;:").upper(), font=fontes[i % 2], font_size=tam * (1 if i % 2 == 0 else 0.92))
            pecas.append(t)
        out = []
        for k in range(len(words)):
            g = VGroup()
            for i in range(k + 1):
                bg, fg = ("#C8202A", "#FAF7F0") if i == k else cores[(i + len(words)) % 3]
                t = pecas[i].copy().set_color(fg)
                papel = estilos._rasgado(t.width + 0.34, t.height + 0.26, seed=i + 31, amp=0.03, passo=0.1)
                papel.set_fill(bg, 1).set_stroke(width=0).move_to(t)
                peca = VGroup(estilos.sombra_recorte(papel), papel, t).rotate([-0.04, 0.03, -0.02, 0.045][i % 4])
                g.add(peca)
            g.arrange(RIGHT, buff=0.12)
            if g.width > config.frame_width - 2 * self.SAFE:
                g.scale_to_fit_width(config.frame_width - 2 * self.SAFE)
            out.append(VGroup(g.move_to([0, self.caption_y + 0.6, 0])))
        return out

    def _caption_states(self, words: list[str]) -> list[VGroup]:
        """Uma linha de legenda em todos os estados do karaokê (palavra k acesa).

        A legenda não pode se confundir com o texto do conteúdo: fonte sem serifa (o conteúdo é
        LaTeX com serifa), faixa com fundo próprio numa área que o conteúdo não usa, e a palavra
        falada acesa em negrito.
        """
        esc = lambda w: w.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        full = Text(" ".join(words), font=CAPTION_FONT, font_size=CAPTION_SIZE, weight=MEDIUM)
        max_w = config.frame_width - 2 * self.SAFE - 0.7
        scale = min(1.0, max_w / max(full.width, 1e-6))
        pill = RoundedRectangle(corner_radius=0.24, width=full.width * scale + 0.7, height=0.86)
        pill.set_fill(CAPTION_BG, 0.9).set_stroke(CAPTION_EDGE, 1.5).move_to([0, self.caption_y, 0])
        states = []
        for k in range(len(words)):
            done, cur, rest = " ".join(words[:k]), words[k], " ".join(words[k + 1:])
            markup = ((f'<span foreground="{CAPTION_DONE}">{esc(done)} </span>' if done else "")
                      + f'<span foreground="#FFFFFF" weight="bold">{esc(cur)}</span>'
                      + (f'<span foreground="{CAPTION_NEXT}"> {esc(rest)}</span>' if rest else ""))
            line = MarkupText(markup, font=CAPTION_FONT, font_size=CAPTION_SIZE, weight=MEDIUM).scale(scale)
            states.append(VGroup(pill.copy(), line.move_to(pill)))
        return states

    @contextmanager
    def narrate(self, text: str, caption: bool | None = None):
        """Fala `text` enquanto o bloco roda; legenda acompanha a fala.

        O bloco termina só quando a fala acaba (se as animações forem mais curtas,
        o resto vira espera). Se forem mais longas, a próxima fala começa depois.
        """
        if caption is None:
            caption = self.CAPTIONS
        mp3, duration, words = _synthesize(text, self.VOICE, self.RATE)
        plain = clean_text(text)
        if mp3:
            # A voz recebe a grafia de PRONUNCIA ("DR" -> "dê érre"); as âncoras usam a palavra do roteiro.
            orig = plain.split()
            words = list(zip(orig, _align_words(orig, words, duration)))
        start = self.renderer.time
        if hasattr(self, "_falas_t"):
            self._falas_t.append((start, start + duration, plain))
        if mp3:
            self.add_sound(str(mp3))

        if caption:
            if caption in ("reels", "recortes"):
                chunks = _reels_chunks(plain)
                faz = self._legenda_reels if caption == "reels" else self._legenda_recortes
                states = [st for c in chunks for st in faz(c)]
            else:
                max_chars = 25 if VERTICAL else 60
                chunks = [c.split() for c in _caption_chunks(plain, max_chars)]
                states = [st for c in chunks for st in self._caption_states(c)]
            flat = [w for c in chunks for w in c]
            wstart = _align_words(flat, words, duration)
            holder = self._caption
            holder.become(states[0])
            self._chrome.add(id(holder))
            state = {"idx": 0}

            def follow(m, dt):   # dt: marca como dependente do tempo, senão o Manim congela o quadro nas esperas
                t = self.renderer.time - start
                idx = max((k for k, s0 in enumerate(wstart) if s0 <= t + 1e-3), default=0)
                if idx != state["idx"]:
                    state["idx"] = idx
                    m.become(states[idx])

            if holder not in self.mobjects:
                self.add(holder)
            holder.add_updater(follow)

        if self.LEGENDA_CENTRAL:
            self._prepara_legenda(plain, words, duration, start)
        n = Narration(self, duration, words, start)
        try:
            yield n
            if n.remaining > 1 / config.frame_rate:
                self.wait(n.remaining)
            self._salva_quadro()
        finally:
            if caption:
                self._caption.clear_updaters()

    def titulo_rico(self, partes: list[str], cores: list):
        """Título com partes de estilo diferente: titulo_rico([r"\\textbf{Passo 1:}", " a parcela"], [GOLD, INK]).

        Se não couber numa linha, a 1ª parte fica em cima e o resto embaixo (quebra, não encolhe).
        """
        max_w = config.frame_width - 2 * self.SAFE
        if _E.fonte_titulo:
            hexa = lambda c: ManimColor(c).to_hex()
            markup = "".join(f'<span foreground="{hexa(c)}">{estilos.tex_para_markup(p)}</span>'
                             for p, c in zip(partes, cores))
            new = estilos.titulo_estilo(_E, markup, TITLE_SIZE * 1.15, INK, max_w)
            return self._troca_titulo(new)
        new = Tex(*partes, font_size=TITLE_SIZE, tex_template=TEMPLATE)
        for sub, c in zip(new, cores):
            sub.set_color(c)
        if new.width > max_w and len(partes) > 1:
            a = Tex(partes[0], font_size=TITLE_SIZE, tex_template=TEMPLATE).set_color(cores[0])
            b = Tex(*partes[1:], font_size=TITLE_SIZE, tex_template=TEMPLATE).set_color(cores[1])
            new = VGroup(a, b).arrange(DOWN, buff=0.18)
        return self._troca_titulo(new)

    def topo(self, mob: Mobject, gap: float = 0.2) -> Mobject:
        """Encosta o topo do grupo no topo da área útil (logo abaixo do título, se houver).

        Use em vez de coordenada fixa: com título a área útil começa mais embaixo, e um desenho
        posicionado à mão invade o título.
        """
        mob.shift(UP * ((self.content_box[0] - gap) - mob.get_top()[1]))
        return mob

    def _salva_quadro(self):
        """Com QUADROS=<pasta>, salva a tela no fim de cada fala (quadro completo, para aprovação)."""
        pasta = os.environ.get("QUADROS")
        if not pasta:
            return
        from PIL import Image
        self._qn = getattr(self, "_qn", 0) + 1
        Path(pasta).mkdir(parents=True, exist_ok=True)
        Image.fromarray(self.renderer.get_frame()).save(Path(pasta) / f"{type(self).__name__}_{self._qn:02d}.png")

    def destacar(self, mob: Mobject, color=GOLD, buff: float = 0.2, run_time: float = 0.5):
        """Põe o resultado numa caixa com fundo próprio (FadeIn). Devolve a caixa."""
        box = caixa(mob, color, buff)
        self.play(FadeIn(box, scale=1.06), run_time=run_time)
        return box

    def clear_except(self, *keep: Mobject, run_time: float = 0.8):
        """clear_section que mantém alguns objetos (ex.: o circuito fixo durante uma questão)."""
        self._tira_legenda()
        fixos = self._decor
        alvo = [m for m in self.mobjects if m not in keep and m not in fixos]
        anims = [FadeOut(m) for m in alvo] + self._mao_descansa()
        if anims:
            self.play(*anims, run_time=run_time)
        self._caption = VMobject()
        self._title = None

    def _mao_descansa(self) -> list:
        """Animação da mão voltando para fora da tela (estilo quadro)."""
        if self.hand is None or self.hand not in self.mobjects:
            return []
        return [self.hand.animate.shift(self._rest - self.hand[0].get_center())]

    def hand_away(self, run_time: float = 0.5):
        """Tira a mão da frente (ex.: antes de uma pausa olhando o desenho)."""
        anims = self._mao_descansa()
        if anims:
            self.play(*anims, run_time=run_time)

    def point_at(self, point, run_time: float = 0.5):
        """Leva a ponta da caneta até um ponto (apontar para algo sem desenhar)."""
        if self.hand is None:
            return
        if self.hand not in self.mobjects:
            Scene.add(self, self.hand)
        self.play(self.hand.animate.shift(np.array(point) - self.hand[0].get_center()), run_time=run_time)

    # ------------------------------------------------------------ efeitos sonoros
    def som(self, nome: str, volume_db: float = -8.0, atraso: float = 0.0):
        """Toca um efeito agora (ou `atraso` s depois): pop, papel, rasgo, whoosh, clique, carimbo, risco,
        digitar, ding, tique. Os WAV ficam em <skill>/template/remotion/public/sfx/ (scripts/sfx.py).
        Use junto da animação que o efeito acompanha: n.wait_until("gancho"); self.som("pop"); self.play(...).
        """
        arq = estilos.SKILL / "template" / "remotion" / "public" / "sfx" / f"{nome}.wav"
        if not arq.exists():
            raise ValueError(f"efeito '{nome}' não existe em {arq.parent}")
        self.add_sound(str(arq), time_offset=atraso, gain=volume_db)

    # --------------------------------------------------------------- seções
    def clear_section(self, keep_title: bool = False, run_time: float = 0.8):
        """Esvazia a tela entre ideias. Evita objetos antigos acumulando."""
        self._tira_legenda()
        targets = [m for m in self.mobjects if not (keep_title and m is self._title) and m not in self._decor]
        anims = [FadeOut(m) for m in targets] + self._mao_descansa()
        if anims:
            self.play(*anims, run_time=run_time)
        self._caption = VMobject()
        if not keep_title:
            self._title = None

    # ------------------------------------------------------ legenda central
    def _tela_vazia(self) -> bool:
        for m in self.mobjects:
            if id(m) in self._chrome or m is self._title or m is self._caption or m is self._leg:
                continue
            if isinstance(m, ValueTracker):
                continue
            if any(len(x.points) for x in m.get_family()):
                return False
        return True

    def _mob_legenda(self, frase: str) -> VGroup:
        linhas = VGroup(*[text_tex(l, CENTRAL_SIZE, CENTRAL_COLOR) for l in _quebra(frase, CENTRAL_CHARS)])
        linhas.arrange(DOWN, buff=0.22)
        top, bottom = self.content_box
        linhas.move_to([0, (top + bottom) / 2, 0])
        self._chrome.add(id(linhas))
        return linhas

    def _prepara_legenda(self, plain, words, duration, start):
        """Guarda o início de cada frase da fala; a legenda só aparece nas esperas longas (ver wait)."""
        frases = _frases(plain)
        flat = [w for f in frases for w in f.split()]
        wstart = _align_words(flat, words, duration)
        seq, k = [], 0
        for f in frases:
            seq.append((start + wstart[k], f))
            k += len(f.split())
        self._leg_seq = seq

    def _tira_legenda(self):
        leg, self._leg, self._leg_seq = self._leg, None, []
        return leg

    def wait(self, duration=DEFAULT_WAIT_TIME, *args, **kwargs):
        """Espera. Com a tela vazia por pelo menos LEG_MIN s, mostra no centro a frase falada (fade),
        troca de frase no tempo da fala e sai com fade quando algo é desenhado."""
        if not self.LEGENDA_CENTRAL or (not self._leg_seq and self._leg is None) or not self._tela_vazia():
            return super().wait(duration, *args, **kwargs)
        fps = 1 / config.frame_rate
        fim = self.renderer.time + duration
        while True:
            agora = self.renderer.time
            atual = None
            while self._leg_seq and self._leg_seq[0][0] <= agora + 0.05:
                atual = self._leg_seq.pop(0)
            if atual is not None:
                if self._leg is None and fim - agora >= LEG_MIN:
                    novo = self._mob_legenda(atual[1])
                    Scene.play(self, FadeIn(novo), run_time=FADE_LEG)
                    self._leg = novo
                elif self._leg is not None and fim - agora >= 2 * FADE_LEG:
                    novo = self._mob_legenda(atual[1])
                    Scene.play(self, FadeOut(self._leg), FadeIn(novo), run_time=FADE_LEG)
                    self._leg = novo
            prox = self._leg_seq[0][0] if self._leg_seq else None
            if prox is None or prox >= fim - FADE_LEG:
                break
            if prox - self.renderer.time > fps:
                super().wait(prox - self.renderer.time)
        resto = fim - self.renderer.time
        if resto > fps:
            super().wait(resto, *args, **kwargs)

    # ------------------------------------------------------------- auditoria
    def _com_mao(self, args):
        """Estilo quadro: a 1ª animação que desenha algo (Create, Write, FadeIn...) vira desenho com a mão."""
        if self.hand is None:
            return args
        out, usou = [], False
        for a in args:
            if not usou and isinstance(a, Animation) and not isinstance(a, (HandCreate, HandWrite)):
                m = a.mobject
                tipo = type(a).__name__
                if isinstance(m, VMobject) and m.has_points() or (isinstance(m, VMobject) and m.family_members_with_points()):
                    if tipo in ("Write", "AddTextLetterByLetter", "DrawBorderThenFill") or (
                            tipo in ("Create", "FadeIn", "GrowFromCenter", "GrowFromPoint", "GrowArrow", "SpinInFromNothing")
                            and _tem_texto_ou_fundo(m)):
                        a = HandWrite(m, self.hand, run_time=a.run_time)
                        usou = True
                    elif tipo in ("Create", "FadeIn", "GrowArrow", "GrowFromCenter", "GrowFromPoint", "ShowCreation"):
                        a = HandCreate(m, self.hand, run_time=a.run_time)
                        usou = True
            out.append(a)
        if usou:
            if self.hand not in self.mobjects:
                Scene.add(self, self.hand)
            self.bring_to_front(self.hand)
        return tuple(out)

    def _digitar(self, args):
        """Estilo terminal: texto e fórmula entram letra por letra (na ordem de leitura)."""
        if _E.entrada != "digitar":
            return args, []
        out, trocas = [], []
        for a in args:
            m = getattr(a, "mobject", None)
            if (isinstance(a, Animation) and type(a).__name__ in ("Write", "FadeIn", "Create", "AddTextLetterByLetter")
                    and isinstance(m, VMobject) and _tem_texto_ou_fundo(m)
                    and any(isinstance(x, (Text, MarkupText, SingleStringMathTex)) for x in m.get_family())):
                folhas = [x for x in m.family_members_with_points()]
                folhas.sort(key=lambda x: (-round(x.get_center()[1] / 0.35), x.get_center()[0]))
                g = VGroup(*folhas)
                out.append(ShowIncreasingSubsets(g, run_time=a.run_time, rate_func=linear))
                trocas.append((g, m))
            else:
                out.append(a)
        return tuple(out), trocas

    def _marca_vazio(self):
        """Auditoria [vazio]: guarda os intervalos em que a tela fica sem conteúdo (só fundo)."""
        if not hasattr(self, "_vazios"):
            return
        agora = self.renderer.time
        vazia = self._tela_vazia()
        if vazia and self._v0 is None:
            self._v0 = agora
        elif not vazia and self._v0 is not None:
            if agora > self._v0:
                self._vazios.append((self._v0, agora))
            self._v0 = None

    def _audit_vazio(self):
        """No fim da cena: avisa cada trecho de fala com a tela vazia por mais de VAZIO_MAX s."""
        if self._v0 is not None:
            self._vazios.append((self._v0, self.renderer.time))
            self._v0 = None
        for a, b in self._vazios:
            for s0, s1, txt in self._falas_t:
                ini, fim = max(a, s0), min(b, s1)
                if fim - ini >= self.VAZIO_MAX:
                    trecho = " ".join(txt.split()[:8])
                    logger.warning(f"[vazio] {fim - ini:.1f}s só com voz em t={ini:.1f}s: \"{trecho}...\"")

    def tear_down(self):
        if hasattr(self, "_vazios") and not isinstance(self, RemotionScene):
            self._audit_vazio()
        super().tear_down()

    def play(self, *args, **kwargs):
        if hasattr(self, "_vazios") and self._v0 is not None and args:
            # o que a animação desenha começa a aparecer agora
            self._vazios.append((self._v0, self.renderer.time)) if self.renderer.time > self._v0 else None
            self._v0 = None
        args = self._com_mao(args)
        args, trocas = self._digitar(args)
        if self._leg is not None and self._leg in self.mobjects:
            args = (*args, FadeOut(self._tira_legenda()))   # o desenho entra e a legenda sai junto (fade)
        else:
            self._tira_legenda()
        super().play(*args, **kwargs)
        for g, m in trocas:     # o grupo de letras volta a ser o objeto original (para Transform, FadeOut...)
            self.remove(g)
            Scene.add(self, m)
        self._audit()
        self._marca_vazio()

    def _audit(self):
        """Avisa no log ([layout]) quando algo sai da tela ou invade título/legenda."""
        fw, fh = config.frame_width / 2, config.frame_height / 2
        title_floor = (self._title.get_bottom()[1] - 0.1) if self._title is not None else self.title_y - 0.3
        content_top, content_bottom = self.content_box
        caption_ceiling = self.caption_y + 0.3
        for m in self.get_top_level_mobjects():
            if id(m) in self._chrome or m is self._title or m is self._caption:
                continue
            if m.width == 0 and m.height == 0:
                continue
            if isinstance(m, NumberPlane) or getattr(m, "is_background", False):
                continue
            l, r = m.get_left()[0], m.get_right()[0]
            b, t = m.get_bottom()[1], m.get_top()[1]
            name = type(m).__name__
            if l < -fw or r > fw or b < -fh or t > fh:
                logger.warning(f"[layout] {name} sai da tela em t={self.renderer.time:.1f}s")
            elif VERTICAL and (l < -fw + self.SAFE - 0.05 or r > fw - self.SAFE + 0.05
                               or t > content_top + 0.6 or b < content_bottom - 0.3):
                logger.warning(f"[layout] {name} sai da margem segura do Reels em t={self.renderer.time:.1f}s")
            elif self._title is not None and t > title_floor:
                logger.warning(f"[layout] {name} invade o título em t={self.renderer.time:.1f}s")
            elif len(self._caption.points) and b < caption_ceiling:
                logger.warning(f"[layout] {name} invade a legenda em t={self.renderer.time:.1f}s")
        self._audit_gaps()
        self._audit_caixas()

    def _audit_caixas(self):
        """Avisa ([caixa]) quando um texto que está dentro de uma caixa passa da borda dela."""
        if not hasattr(self, "_caixa_seen"):
            self._caixa_seen = set()
        tops = [m for m in self.get_top_level_mobjects()
                if id(m) not in self._chrome and m is not self._title and m is not self._caption
                and not getattr(m, "is_background", False)]
        rects, texts = [], []
        for m in tops:
            for x in m.get_family():
                if isinstance(x, (Rectangle, RoundedRectangle)) and x.width > 0.3 and x.height > 0.25:
                    rects.append(x)
                elif isinstance(x, (Text, MathTex)) and not getattr(x, "sem_caixa", False):
                    texts.append(x)
        for t in texts:
            if t.width == 0:
                continue
            c = t.get_center()
            for r in rects:
                l, rt, b, tp = r.get_left()[0], r.get_right()[0], r.get_bottom()[1], r.get_top()[1]
                if not (l < c[0] < rt and b < c[1] < tp):
                    continue
                if t.height > r.height * 1.3:
                    continue        # texto mais alto que o retângulo: não é a caixa dele (ex.: rótulo sobre barra)
                folga = 0.02
                if (t.get_left()[0] < l + folga or t.get_right()[0] > rt - folga
                        or t.get_bottom()[1] < b + folga or t.get_top()[1] > tp - folga):
                    key = (id(t), id(r))
                    if key not in self._caixa_seen:
                        self._caixa_seen.add(key)
                        nome = getattr(t, "text", None) or getattr(t, "tex_string", "") or type(t).__name__
                        logger.warning(f"[caixa] texto '{str(nome)[:28]}' passa da borda da caixa "
                                       f"em t={self.renderer.time:.1f}s (use caixa_texto ou quebre a linha)")

    def _audit_gaps(self):
        """Avisa ([espaço]) quando dois elementos se tocam ou ficam colados (< MIN_GAP).

        Um elemento dentro do outro (curva dentro dos eixos, texto dentro da caixa) é camada
        intencional e não conta.
        """
        if not hasattr(self, "_gap_seen"):
            self._gap_seen = set()
        ms = [m for m in self.get_top_level_mobjects()
              if id(m) not in self._chrome and m is not self._title and m is not self._caption
              and not isinstance(m, (NumberPlane, ValueTracker)) and (m.width > 0 or m.height > 0)
              and not getattr(m, "is_background", False)]
        box = lambda m: (m.get_left()[0], m.get_right()[0], m.get_bottom()[1], m.get_top()[1])
        name = lambda m: getattr(m, "tex_string", None) or getattr(m, "text", None) or type(m).__name__
        is_text = lambda m: isinstance(m, (SingleStringMathTex, Text, MarkupText)) or \
            any(isinstance(x, (SingleStringMathTex, Text, MarkupText)) for x in m.get_family())
        ms = [m for m in ms if m.z_index >= 0]          # painéis/fundos (z<0) são camada de fundo
        for i in range(len(ms)):
            a = box(ms[i])
            for j in range(i + 1, len(ms)):
                b = box(ms[j])
                inside = (a[0] >= b[0] and a[1] <= b[1] and a[2] >= b[2] and a[3] <= b[3]) or \
                         (b[0] >= a[0] and b[1] <= a[1] and b[2] >= a[2] and b[3] <= a[3])
                if inside:
                    continue
                ta, tb = is_text(ms[i]), is_text(ms[j])
                if not ta and not tb:       # duas formas de gráfico (linha, barra, ponto, eixo): desenho, não texto
                    continue
                if ta and tb and abs((a[2] + a[3]) / 2 - (b[2] + b[3]) / 2) < 0.06 and \
                        abs((a[3] - a[2]) - (b[3] - b[2])) < 0.08:
                    continue                # pedaços da mesma linha de texto (mesma altura e base)
                dx = max(b[0] - a[1], a[0] - b[1], 0)
                dy = max(b[2] - a[3], a[2] - b[3], 0)
                gap = (dx ** 2 + dy ** 2) ** 0.5
                if gap < self.MIN_GAP:
                    key = (id(ms[i]), id(ms[j]))
                    if key not in self._gap_seen:
                        self._gap_seen.add(key)
                        kind = "sobrepostos" if gap == 0 else f"a {gap:.2f}"
                        logger.warning(f"[espaço] '{str(name(ms[i]))[:28]}' e '{str(name(ms[j]))[:28]}' "
                                       f"{kind} em t={self.renderer.time:.1f}s")


# --- cena feita no Remotion ----------------------------------------------------------
class RemotionScene(ExplainerScene):
    """Cena desenhada no Remotion (React), com a mesma voz e no mesmo MP4 das cenas Manim.

    No video.py, a cena só diz o que é falado; o desenho fica em remotion/src/cenas/<Composicao>.tsx:

        class A03_Colagem(RemotionScene):
            ESTILO = "colagem"                     # vai para o Remotion em props.estilo
            FALAS = [F("A03", 1), 5, F("A03", 2)]  # número = segundos de silêncio (pause e tente)
            COMPOSICAO = "A03_Colagem"             # opcional: padrão = nome da classe

    O Manim gera a voz e o tempo de cada palavra e grava media/remotion/<Cena>.json.
    O render.py vê esse arquivo, renderiza a composição no Remotion com esses tempos
    e troca a imagem da cena pela do Remotion, mantendo o áudio. A junção segue igual.
    """
    FALAS: list = []
    COMPOSICAO: str | None = None
    CAUDA = 0.4                      # segundos depois da última fala (respiro antes da próxima cena)
    VOLUME_FPS = 30                  # amostras de volume da voz por segundo (boca do RetratoFalante)

    def _volume_falas(self, falas: list, duracao: float) -> list[float] | None:
        """Volume da voz (0 a 1) ao longo da cena, para a boca do RetratoFalante mexer junto com a fala.

        Lê o mp3 de cada fala (cache do TTS) com o ffmpeg. Sem voz (--no-tts), devolve None e o
        Remotion mexe a boca pelas sílabas de cada palavra.
        """
        textos = [t for t in self.FALAS if not isinstance(t, (int, float))]
        n = int(duracao * self.VOLUME_FPS) + 1
        vol = np.zeros(n)
        achou = False
        for texto, f in zip(textos, falas):
            mp3, _, _ = _synthesize(texto, self.VOICE, self.RATE)
            if not mp3:
                continue
            try:
                raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp3), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                                     capture_output=True, check=True).stdout
            except Exception as e:
                logger.warning(f"[remotion] volume da fala não lido: {e}")
                continue
            a = np.frombuffer(raw, np.int16).astype(float) / 32768
            passo = 8000 // self.VOLUME_FPS
            rms = np.array([np.sqrt(np.mean(a[i:i + passo] ** 2)) for i in range(0, len(a) - passo + 1, passo)])
            if not len(rms):
                continue
            i0 = int(round(f["inicio"] * self.VOLUME_FPS))
            i1 = min(n, i0 + len(rms))
            vol[i0:i1] = np.maximum(vol[i0:i1], rms[:i1 - i0])
            achou = True
        if not achou:
            return None
        topo = np.percentile(vol[vol > 0], 95) if (vol > 0).any() else 1.0
        return [round(float(v), 3) for v in np.clip(vol / max(topo, 1e-6), 0, 1)]

    def construct(self):
        t0 = self.renderer.time
        falas = []
        for texto in self.FALAS:
            if isinstance(texto, (int, float)):      # número = segundos de silêncio (ex.: pause e tente)
                self.wait(float(texto))
                continue
            with self.narrate(texto) as n:
                inicio = n.start - t0
                falas.append({
                    "texto": clean_text(texto), "inicio": round(inicio, 4), "duracao": round(n.duration, 4),
                    "palavras": [[w, round(inicio + t, 4)] for w, t in n.words],
                })
        if self.CAUDA > 0:
            self.wait(self.CAUDA)
        nome = type(self).__name__
        duracao = self.renderer.time - t0
        dados = {
            "cena": nome, "composicao": (self.COMPOSICAO or nome).replace("_", "-"), "estilo": self.ESTILO,   # Remotion não aceita "_" no id
            "duracao": round(duracao, 4), "fps": config.frame_rate,
            "largura": config.pixel_width, "altura": config.pixel_height, "vertical": VERTICAL,
            "falas": falas,
        }
        volume = self._volume_falas(falas, duracao)
        if volume:
            dados["volume"], dados["volume_fps"] = volume, self.VOLUME_FPS
        destino = Path("media") / "remotion" / f"{nome}.json"
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(json.dumps(dados, ensure_ascii=False, indent=1), "utf-8")
        logger.info(f"[remotion] tempos gravados em {destino}")


# =====================================================================================
# Formatos prontos (servem em qualquer estilo)
# =====================================================================================

# --- questão real da banca ------------------------------------------------------------
def _questao(self, imagem, fonte: str | None = None, largura: float | None = None, buff: float = 0.35,
             run_time: float = 0.8) -> Group:
    """Mostra o print da questão (PNG/JPG) no topo da área útil, com moldura e a fonte embaixo ("FGV · SEFAZ-CE 2025").

    Use no começo da resolução, na palavra que fala da questão. Devolve o grupo (para tirar ou encolher depois):
        n.wait_until("questão"); q = self.questao("questao.png", "FGV · 2024")
    """
    top, bottom = self.content_box
    w_max = largura or (config.frame_width - 2 * self.SAFE - 0.2)
    img = ImageMobject(str(imagem))
    img.scale_to_fit_width(w_max)
    altura_max = (top - bottom) * 0.55
    if img.height > altura_max:
        img.scale_to_fit_height(altura_max)
    topo = (self._title.get_bottom()[1] - buff) if self._title is not None else top - 0.1
    img.move_to([0, topo - img.height / 2, 0])
    moldura = SurroundingRectangle(img, buff=0.08, corner_radius=min(0.08, _E.cantos)).set_stroke(MUTED, 2)
    grupo = Group(img, moldura)
    if fonte:
        rot = label(fonte, MUTED, 22 if VERTICAL else 18).next_to(moldura, DOWN, buff=0.15)
        grupo.add(rot)
    self.play(FadeIn(img, shift=DOWN * 0.1), Create(moldura), *( [FadeIn(grupo[2])] if fonte else []), run_time=run_time)
    return grupo


# --- pause e tente ----------------------------------------------------------------------
def _pause_e_tente(self, segundos: int = 5, texto: str = "Pause e tente", zona: str = "full"):
    """Contagem regressiva para o aluno tentar antes da resolução (no silêncio, depois da fala que convida).

        with self.narrate(F("C02", 1)) as n:   # "Pause o vídeo e tente resolver antes de continuar."
            ...
        self.pause_e_tente(5)
    """
    centro, _, zona_h = self.zones[zona]
    centro = centro.copy()
    teto = 1.0 if VERTICAL else 0.9
    raio = min(teto, (0.92 * zona_h - 1.9) / 2)          # cabe na zona com texto em cima e embaixo
    com_sub = raio >= 0.75
    if not com_sub:                                     # zona curta: tira a frase de baixo e usa o espaço no anel
        raio = max(0.5, min(teto, (0.92 * zona_h - 1.0) / 2))
        centro = centro + DOWN * 0.25
    fundo = Circle(radius=raio).set_stroke(FAINT, 14).move_to(centro)
    t = ValueTracker(0)
    arco = always_redraw(lambda: Arc(radius=raio, start_angle=PI / 2, angle=-TAU * (1 - t.get_value()),
                                     arc_center=centro).set_stroke(GOLD, 14))
    num = always_redraw(lambda: text_tex(str(max(1, segundos - int(t.get_value() * segundos))), 96, INK).move_to(centro))
    txt = text_tex(texto, 48, INK).next_to(fundo, UP, buff=0.5)
    sub = label("(a resolução vem logo depois)", MUTED, 24).next_to(fundo, DOWN, buff=0.45) if com_sub else VGroup()
    self.play(FadeIn(txt), FadeIn(fundo), FadeIn(sub), run_time=0.5)
    self.add(arco, num)
    self.play(t.animate.set_value(1), run_time=segundos, rate_func=linear)
    self.play(FadeOut(VGroup(txt, fundo, sub)), FadeOut(arco), FadeOut(num), run_time=0.4)
    self.remove(arco, num)


# --- imagem com movimento lento (Ken Burns) -------------------------------------------------
def _ken_burns(self, imagem, duracao: float, zoom: float = 1.15, deslocar=None, fundo: bool = True) -> ImageMobject:
    """Foto/ilustração com zoom e deslocamento lentos.

    fundo=True: a imagem cobre a tela inteira (cortada pelas bordas) e fica atrás do conteúdo.
    Chame dentro de um narrate; dura `duracao` segundos (ex.: n.remaining). Devolve a imagem (tire com FadeOut).
    """
    img = ImageMobject(str(imagem))
    fw, fh = config.frame_width, config.frame_height
    if fundo:
        esc = max(fw / img.width, fh / img.height) * 1.02
        img.scale(esc).move_to(ORIGIN).set_z_index(-40)
        img.is_background = True      # cobre a tela de propósito: fora da auditoria de layout
    else:
        self.fit(img, "visual")
    deslocar = np.array(deslocar if deslocar is not None else [0.35, 0.15, 0])
    self.play(FadeIn(img), run_time=0.6)
    self.play(img.animate.scale(zoom).shift(deslocar), run_time=max(0.1, duracao - 0.6), rate_func=linear)
    return img


ExplainerScene.questao = _questao
ExplainerScene.pause_e_tente = _pause_e_tente
ExplainerScene.ken_burns = _ken_burns


# --- calculadora financeira animada ----------------------------------------------------------
class Calculadora(VGroup):
    """Calculadora financeira genérica (n, i, PV, PMT, FV...). As teclas acendem no tempo da fala.

        calc = Calculadora().scale(0.9).move_to(self.zone("visual")); self.play(FadeIn(calc))
        self.teclar(calc, ["3", "0", "0", "0", "0", "0", "PV"], n=n, palavras=[..., "presente"])
    """
    LINHAS = [["n", "i", "PV", "PMT", "FV"],
              ["7", "8", "9", "÷", "CHS"],
              ["4", "5", "6", "×", "CLX"],
              ["1", "2", "3", "−", "ENTER"],
              ["0", ".", "%", "+", "="]]
    FINANCEIRAS = {"n", "i", "PV", "PMT", "FV"}

    def __init__(self, largura: float = 4.2, **kw):
        super().__init__(**kw)
        cols, gap = 5, 0.12
        tw = (largura - 0.5 - gap * (cols - 1)) / cols
        th = tw * 0.62
        corpo_h = 0.25 + 1.1 + 0.25 + len(self.LINHAS) * (th + gap) + 0.15
        self.corpo = RoundedRectangle(corner_radius=0.22, width=largura, height=corpo_h).set_fill("#2B2F36", 1).set_stroke("#14161A", 3)
        self.visor = RoundedRectangle(corner_radius=0.08, width=largura - 0.5, height=1.0).set_fill("#B9C7A5", 1).set_stroke("#14161A", 2)
        self.visor.move_to(self.corpo.get_top() + DOWN * (0.25 + 0.5))
        self.valor = Text("0", font="JetBrains Mono", font_size=44, color="#1D2416")
        self._posiciona_valor()
        self.teclas = {}
        y0 = self.visor.get_bottom()[1] - 0.3 - th / 2
        for r, linha in enumerate(self.LINHAS):
            for c, nome in enumerate(linha):
                x = self.corpo.get_left()[0] + 0.25 + tw / 2 + c * (tw + gap)
                cor = "#C9852B" if nome in self.FINANCEIRAS else ("#3E4450" if nome.isdigit() or nome == "." else "#515866")
                tecla = RoundedRectangle(corner_radius=0.06, width=tw, height=th).set_fill(cor, 1).set_stroke("#14161A", 1.5)
                tecla.move_to([x, y0 - r * (th + gap), 0])
                rot = Text(nome, font="Inter", font_size=22 if len(nome) <= 3 else 16, color="#F4F4F4", weight=BOLD).move_to(tecla)
                self.teclas[nome] = VGroup(tecla, rot)
        self.add(self.corpo, self.visor, self.valor, *self.teclas.values())
        self.is_background = False

    def _posiciona_valor(self):
        self.valor.move_to(self.visor).align_to(self.visor.get_right() + LEFT * 0.2, RIGHT)

    def novo_valor(self, texto: str) -> Text:
        t = Text(texto, font="JetBrains Mono", font_size=44, color="#1D2416")
        if t.width > self.visor.width - 0.4:
            t.scale_to_fit_width(self.visor.width - 0.4)
        return t.move_to(self.visor).align_to(self.visor.get_right() + LEFT * 0.2, RIGHT)


def _teclar(self, calc: Calculadora, teclas: list[str], n: Narration | None = None, palavras: list[str] | None = None,
            por_tecla: float = 0.35, resultados: dict | None = None):
    """Aperta as teclas em sequência: cada uma acende (dourado) e o visor mostra o que foi digitado.

    Com n e palavras, a tecla k espera a palavra k (None na lista = segue sem esperar).
    resultados: {índice da tecla: "texto no visor"} para mostrar a resposta (ex.: {6: "-2.881,46"}).
    """
    digitado = ""
    for k, nome in enumerate(teclas):
        if n is not None and palavras and k < len(palavras) and palavras[k]:
            n.wait_until(palavras[k])
        tecla = calc.teclas[nome][0]
        cor0 = tecla.get_fill_color()
        if nome in Calculadora.FINANCEIRAS or nome in ("ENTER", "=", "CHS", "CLX", "%"):
            visor = f"{nome} {digitado}".strip() if digitado else nome
            digitado = ""
        else:
            digitado = (digitado + nome.replace(".", ",")) if digitado != "0" else nome
            visor = digitado
        if resultados and k in resultados:
            visor = resultados[k]
        novo = calc.novo_valor(visor)
        self.play(tecla.animate.set_fill(GOLD), Transform(calc.valor, novo), run_time=por_tecla * 0.5)
        self.play(tecla.animate.set_fill(cor0), run_time=por_tecla * 0.5)


ExplainerScene.teclar = _teclar


# --- lousa infinita (câmera que passeia) ----------------------------------------------------
class LousaInfinitaScene(ExplainerScene, MovingCameraScene):
    """Um quadro grande; a câmera vai até cada parte e no fim mostra tudo de longe (mapa da matéria).

        class R01_Mapa(LousaInfinitaScene):
            def construct(self):
                a = text_tex("Juros simples", 48).move_to(LEFT * 8)
                ...
                self.ir_para(a)            # zoom na parte que vai ser explicada
                self.visao_geral()         # zoom-out mostrando tudo
    O fundo do estilo acompanha a câmera. Sem título fixo (TITLE_AREA = False) e sem aviso de layout.
    """
    TITLE_AREA = False

    def setup(self):
        ExplainerScene.setup(self)
        f = self.camera.frame
        self._f0 = (f.get_center().copy(), f.width)
        for d in self._decor:
            if d is self.hand:
                continue
            w0 = d.width

            def segue(m, w0=w0):
                m.set_width(w0 * f.width / self._f0[1]).move_to(f.get_center())
            d.add_updater(segue)
        if self.hand is not None:
            self.hand.add_updater(lambda m, dt: m.set_height(m.height))   # redesenho nas esperas

    def ir_para(self, *mobs, margem: float = 1.3, run_time: float = 1.2):
        """Leva a câmera até os objetos (enquadra com folga)."""
        g = Group(*mobs)
        f = self.camera.frame
        largura = max(g.width * margem, g.height * margem * config.frame_width / config.frame_height, 2.0)
        self.play(f.animate.move_to(g.get_center()).set_width(largura), run_time=run_time)

    def visao_geral(self, margem: float = 1.1, run_time: float = 1.6):
        """Zoom-out até caber tudo o que está na lousa."""
        alvo = [m for m in self.mobjects if m not in self._decor and m is not self.hand
                and not isinstance(m, ValueTracker) and (m.width > 0 or m.height > 0)]
        if alvo:
            self.ir_para(*alvo, margem=margem, run_time=run_time)

    def volta(self, run_time: float = 1.0):
        f = self.camera.frame
        self.play(f.animate.move_to(self._f0[0]).set_width(self._f0[1]), run_time=run_time)

    def _audit(self):
        pass   # a câmera anda: posição fora do quadro inicial é normal


# --- kit de circuitos ------------------------------------------------------------------
# Símbolos deitados no eixo x, centrados na origem: gire com .rotate(PI / 2) e posicione com .move_to().
# Desenhe o fio inteiro passando pelo ponto e ponha o símbolo por cima: a máscara (cor do fundo do
# estilo) esconde o fio embaixo dele. Para mudar a cor de um símbolo use tinge() (só o traço);
# set_color pinta também o fundo e o símbolo vira um bloco de cor.
# Rótulos de componentes: fora do circuito ou embaixo do fio, nunca entre dois componentes.

def fio(*pts, color=INK, largura: float = 3) -> VMobject:
    """Fio com cantos retos passando pelos pontos (aceita [x, y] ou [x, y, 0])."""
    return VMobject().set_points_as_corners([np.array([*p, 0][:3]) if len(p) == 2 else np.array(p) for p in pts]) \
        .set_stroke(color, largura)


def _mascara(w: float, h: float) -> Rectangle:
    return Rectangle(width=w, height=h).set_stroke(width=0).set_fill(BG, 1)


def diodo(s: float = 0.5, color=INK) -> VGroup:
    tri = Polygon([-s / 2, s / 2, 0], [-s / 2, -s / 2, 0], [s / 2, 0, 0]).set_stroke(color, 4).set_fill(BG, 1)
    barra = Line([s / 2, s / 2, 0], [s / 2, -s / 2, 0]).set_stroke(color, 4)
    return VGroup(_mascara(s, s), tri, barra)


def zener(s: float = 0.5, color=INK) -> VGroup:
    tri = Polygon([-s / 2, s / 2, 0], [-s / 2, -s / 2, 0], [s / 2, 0, 0]).set_stroke(color, 4).set_fill(BG, 1)
    barra = VMobject().set_points_as_corners([[s / 2 - 0.14, s / 2 + 0.06, 0], [s / 2, s / 2, 0],
                                              [s / 2, -s / 2, 0], [s / 2 + 0.14, -s / 2 - 0.06, 0]]).set_stroke(color, 4)
    return VGroup(_mascara(s, s), tri, barra)


def resistor(L: float = 1.0, a: float = 0.16, color=INK) -> VGroup:
    xs = np.linspace(-L / 2, L / 2, 13)
    pts = [[x, 0 if i in (0, 12) else (a if i % 2 else -a), 0] for i, x in enumerate(xs)]
    return VGroup(_mascara(L, 2 * a + 0.1), VMobject().set_points_as_corners(pts).set_stroke(color, 4))


def capacitor(gap: float = 0.2, placa: float = 0.75, color=INK) -> VGroup:
    p1 = Line([-gap / 2, placa / 2, 0], [-gap / 2, -placa / 2, 0]).set_stroke(color, 5)
    p2 = Line([gap / 2, placa / 2, 0], [gap / 2, -placa / 2, 0]).set_stroke(color, 5)
    return VGroup(_mascara(gap, placa), p1, p2)


def indutor(L: float = 1.2, color=INK) -> VGroup:
    arcos = VGroup(*[Arc(radius=L / 8, start_angle=PI, angle=-PI).shift(RIGHT * (-L / 2 + L / 8 + i * L / 4))
                     for i in range(4)]).set_stroke(color, 4)
    return VGroup(_mascara(L, 0.4).shift(UP * 0.1), arcos)


def fonte_ac(r: float = 0.42, color=INK) -> VGroup:
    c = Circle(radius=r).set_stroke(color, 3).set_fill(BG, 1)
    ts = np.linspace(-1, 1, 40)
    onda = VMobject().set_points_as_corners([[t * r * 0.6, 0.18 * np.sin(np.pi * t), 0] for t in ts]).set_stroke(C1, 3)
    return VGroup(c, onda)


def terra(w: float = 0.5, color=INK) -> VGroup:
    return VGroup(*[Line([-w / 2 * f, -i * 0.12, 0], [w / 2 * f, -i * 0.12, 0])
                    for i, f in enumerate([1, 0.65, 0.3])]).set_stroke(color, 3)


def ponte_diodos(s: float = 1.4, ds: float = 0.36, color=INK):
    """Ponte retificadora em losango. Devolve (losango, diodos[4], (esq, topo, dir, baixo)).

    diodos[1] (topo→dir) e diodos[2] (esq→baixo) conduzem juntos num semiciclo; [0] e [3] no outro.
    Em tamanho pequeno (ícone), use s >= 0.6 e ds <= 0.4·s, senão os diodos se encostam.
    """
    L, T_, R_, B = np.array([-s, 0, 0]), np.array([0, s, 0]), np.array([s, 0, 0]), np.array([0, -s, 0])
    arestas = [(L, T_), (T_, R_), (L, B), (B, R_)]
    losango = Polygon(L, T_, R_, B).set_stroke(color, 3)
    ds_ = VGroup(*[diodo(ds, color).rotate(np.arctan2(*(b - a)[[1, 0]])).move_to((a + b) / 2) for a, b in arestas])
    return losango, ds_, (L, T_, R_, B)


def tinge(simbolo: VGroup, color):
    """Animação que muda a cor do traço de um símbolo do kit sem pintar a máscara.

    Ex.: self.play(tinge(d, GOLD))  (o diodo acende quando conduz)
    """
    return VGroup(*simbolo[1:]).animate.set_stroke(color)
