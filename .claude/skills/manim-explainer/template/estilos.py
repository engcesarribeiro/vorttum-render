"""Estilos visuais da skill manim-explainer.

Cada cena escolhe o seu estilo com o atributo de classe ESTILO (padrão "documentario"):

    class A01_Gancho(ExplainerScene):
        ESTILO = "bauhaus"

O código das cenas continua igual em qualquer estilo: escreva com as cores de sempre
(INK, MUTED, C1, C2, GOLD, BAD, GOOD...) e o estilo troca cada cor pela sua versão.
Texto que deve mudar de fonte com o estilo vai por text_tex(), label() e self.title();
MathTex continua em LaTeX em todos os estilos.

Estilos:
    documentario  fundo escuro, LaTeX, cor com significado (o padrão de sempre)
    quadro        quadro branco com moldura; uma mão com caneta desenha cada elemento
    papel         folha de caderno pautada, letra de mão, tinta azul-marinho
    envelhecido   papel antigo amarelado (manchas, bordas queimadas, pauta desbotada), letra de mão, tinta sépia
    colagem       papel kraft, recortes com sombra, fita adesiva, título em letras recortadas
    retro         colagem retrô editorial: kraft, tiras de jornal antigo, faixa diagonal vermelha,
                  título em etiquetas preto/vermelho/amarelo/creme (componentes completos no Remotion: kit/retro.tsx)
    bauhaus       creme, formas geométricas em vermelho, azul e amarelo, tipografia geométrica
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from manim import *

AQUI = Path(__file__).resolve().parent


def _skill_dir() -> Path:
    """Pasta da skill (fontes e mão). Procura subindo a partir deste arquivo e do diretório atual."""
    for base in (AQUI, Path.cwd()):
        for p in (base, *base.parents):
            cand = p / ".claude" / "skills" / "manim-explainer"
            if (cand / "fonts").is_dir():
                return cand
            if p.name == "manim-explainer" and (p / "fonts").is_dir():
                return p
    return AQUI.parent


SKILL = _skill_dir()
FONTS = SKILL / "fonts"
ASSETS = SKILL / "assets"

_fontes_ok = False


def registra_fontes():
    """Registra as fontes da skill no Pango (uma vez por processo)."""
    global _fontes_ok
    if _fontes_ok:
        return
    try:
        import manimpango
        for f in sorted(FONTS.glob("*.ttf")):
            manimpango.register_font(str(f))
    except Exception as e:  # sem fonte, o Pango cai numa substituta: avisa e segue
        logger.warning(f"[estilo] fontes não registradas: {e}")
    _fontes_ok = True


# --- paleta de referência (documentário) --------------------------------------
# O código das cenas usa estas cores; cada estilo diz por qual cor trocar cada uma.
DOC = {
    "BG": "#0B1016", "INK": "#E8E6E1", "MUTED": "#8A9099", "FAINT": "#1C2632", "SHEET": "#1A2330",
    "C1": "#29B6F6", "C2": "#FF7043", "GOLD": "#F5B82E", "BAD": "#EF5350", "GOOD": "#66BB6A",
    # fundos de caixa (destacar/caixa) e de painel
    "P_GOLD": "#2E2511", "P_C1": "#0D2433", "P_C2": "#36190E", "P_GOOD": "#12301A", "P_INK": "#1F2833",
    "PAINEL_BG": "#16202B", "PAINEL_EDGE": "#2C3A4A",
}


@dataclass
class Estilo:
    nome: str
    cores: dict                      # mesma chave de DOC -> cor deste estilo
    fonte_texto: str | None = None   # None = LaTeX (Latin Modern)
    fonte_titulo: str | None = None
    caixa_alta: bool = False         # texto de apoio em caixa-alta
    titulo_caixa_alta: bool = False
    titulo_cor: str | None = None    # None = INK do estilo
    peso_texto: str = NORMAL
    mao: bool = False                # quadro: a mão desenha Create/Write/FadeIn
    escala_texto: float = 1.0        # fontes de mão parecem menores que o LaTeX no mesmo tamanho
    caixa_sombra: bool = False       # colagem: caixa e painel viram recorte com sombra
    cantos: float = 0.14             # raio dos cantos de caixa e painel (0 = reto)
    brilho: bool = False             # neon: halo da mesma cor em volta de traços e textos
    entrada: str = "padrao"          # "digitar" (terminal): texto entra letra por letra
    painel_opacidade: float = 1.0    # dark UI: painel de vidro (translúcido)
    extra: dict = field(default_factory=dict)
    base: str | None = None          # variante de marca: usa o fundo, o título e os enfeites deste estilo

    @property
    def tipo(self) -> str:
        """Nome do estilo cujo desenho de fundo/título esta variante usa (o próprio nome, se não for variante)."""
        return self.base or self.nome

    def cor(self, chave: str) -> str:
        return self.cores.get(chave, DOC[chave])


ESTILOS: dict[str, Estilo] = {}


def _reg(e: Estilo):
    ESTILOS[e.nome] = e
    return e


_reg(Estilo("documentario", dict(DOC)))

_reg(Estilo(
    "quadro",
    {"BG": "#FFFFFF", "INK": "#1E1E1E", "MUTED": "#6B6B6B", "FAINT": "#E4E1D8", "SHEET": "#F1EEE6",
     "C1": "#1E78C8", "C2": "#E65100", "GOLD": "#B8860B", "BAD": "#C62828", "GOOD": "#2E7D32",
     "P_GOLD": "#FFF4D1", "P_C1": "#E1EFFB", "P_C2": "#FFE7D9", "P_GOOD": "#E3F3E4", "P_INK": "#F1F1F1",
     "PAINEL_BG": "#F6F5F1", "PAINEL_EDGE": "#1E1E1E"},
    fonte_texto="Kalam", fonte_titulo="Bangers", caixa_alta=True, titulo_caixa_alta=True,
    titulo_cor="#E5332A", peso_texto=BOLD, mao=True, escala_texto=1.05,
))

_reg(Estilo(
    "papel",
    {"BG": "#FBF7EE", "INK": "#1F2E4A", "MUTED": "#7A8499", "FAINT": "#DCE6F2", "SHEET": "#EFE9DB",
     "C1": "#2D6CDF", "C2": "#E0662A", "GOLD": "#B57A00", "BAD": "#C8312F", "GOOD": "#2F8A4C",
     "P_GOLD": "#FFF1B8", "P_C1": "#DDEAFF", "P_C2": "#FFE2D1", "P_GOOD": "#DDF2E2", "P_INK": "#EEEAE0",
     "PAINEL_BG": "#FFFDF7", "PAINEL_EDGE": "#1F2E4A"},
    fonte_texto="Caveat", fonte_titulo="Caveat", peso_texto=BOLD, escala_texto=1.25,
    extra={"pauta": "#B9CDE6", "margem": "#E58A8A"},
))

_reg(Estilo(
    "envelhecido",
    {"BG": "#E6D3A8", "INK": "#3A2A1A", "MUTED": "#7A664C", "FAINT": "#D8C49A", "SHEET": "#EADBB6",
     "C1": "#2A4D7A", "C2": "#A84A22", "GOLD": "#8A5A00", "BAD": "#962A22", "GOOD": "#3D6630",
     "P_GOLD": "#F0D995", "P_C1": "#D3D9DC", "P_C2": "#EBC9AE", "P_GOOD": "#D6DDB8", "P_INK": "#EFE2C2",
     "PAINEL_BG": "#F2E6C6", "PAINEL_EDGE": "#3A2A1A"},
    fonte_texto="Caveat", fonte_titulo="Caveat", peso_texto=BOLD, escala_texto=1.25,
    extra={"pauta": "#9C8160", "margem": "#A2523F"},
))


def textura_envelhecida(w: int, h: int, seed: int = 7, papel=(230, 211, 168), queimado: float = 1.0,
                        manchas: float = 1.0, anel: float = 1.0) -> str:
    """PNG de papel antigo (gerado uma vez e guardado em cache): grão, manchas e bordas queimadas."""
    import tempfile
    from PIL import Image
    chave = f"{w}x{h}_{seed}" + ("" if (tuple(papel), queimado, manchas, anel) == ((230, 211, 168), 1.0, 1.0, 1.0)
                                 else f"_{'-'.join(map(str, papel))}_{queimado}_{manchas}_{anel}")
    dest = Path(tempfile.gettempdir()) / f"explainer_envelhecido_{chave}.png"
    if dest.exists():
        return str(dest)
    rng = np.random.default_rng(seed)
    base = np.array(papel, float)

    def ruido(cel):   # ruído suave: grade pequena ampliada
        g = rng.random((max(2, h // cel), max(2, w // cel)))
        return np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), float) / 255

    lum = 1 + 0.07 * (ruido(160) - 0.5) + 0.05 * (ruido(40) - 0.5) + 0.035 * (rng.random((h, w)) - 0.5)
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    escuro = np.zeros((h, w))
    # manchas (água, café), mais fortes perto das bordas
    for _ in range(9):
        cx, cy = rng.uniform(0, w), rng.uniform(0, h)
        r = rng.uniform(0.06, 0.2) * w
        d = np.hypot(xx - cx, yy - cy) / r
        borda = min(cx, w - cx, cy, h - cy) / (0.5 * min(w, h))
        forca = manchas * rng.uniform(0.05, 0.12) * (1.4 - min(1.0, borda))
        escuro += forca * np.exp(-d ** 2) * (0.7 + 0.6 * ruido(60))
    # anel de café no canto de baixo (fica sob a interface do Reels)
    cx, cy, r = 0.78 * w, 0.88 * h, 0.11 * w
    d = np.abs(np.hypot(xx - cx, yy - cy) - r)
    escuro += anel * 0.10 * np.exp(-(d / (0.008 * w)) ** 2) * (0.5 + ruido(30))
    # bordas queimadas: escurece com a distância até a borda, com contorno irregular
    dist = np.minimum.reduce([xx, w - xx, yy, h - yy]) / min(w, h)
    dist = dist + 0.025 * (ruido(25) - 0.5)
    escuro += queimado * (0.55 * np.clip(1 - dist / 0.09, 0, 1) ** 2.2 + 0.12 * np.clip(1 - dist / 0.25, 0, 1))
    tinta = np.array([95, 55, 20], float)       # o escuro puxa para marrom, não para cinza
    k = np.clip(escuro, 0, 0.85)[..., None]
    img = (base * lum[..., None]) * (1 - k) + tinta * k
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(dest)
    return str(dest)


_reg(Estilo(
    "colagem",
    {"BG": "#E6D8BE", "INK": "#1A1A1A", "MUTED": "#6E6253", "FAINT": "#D4C3A3", "SHEET": "#F4EDE0",
     "C1": "#1F5FAF", "C2": "#D9481C", "GOLD": "#A0690A", "BAD": "#B3261E", "GOOD": "#3A7A2F",
     "P_GOLD": "#F6E3A1", "P_C1": "#CFE0F5", "P_C2": "#F6CDB8", "P_GOOD": "#D3E8C8", "P_INK": "#FBF7EF",
     "PAINEL_BG": "#FBF7EF", "PAINEL_EDGE": "#1A1A1A"},
    fonte_texto="Special Elite", fonte_titulo="Abril Fatface", escala_texto=0.95, caixa_sombra=True, cantos=0.0,
    extra={"recortes": ["#1A1A1A", "#D9481C", "#F4EDE0", "#1F5FAF", "#E9C46A"], "fita": "#EFE3B0"},
))

_reg(Estilo(
    "retro",       # colagem retrô editorial: kraft, tiras de jornal, faixa diagonal, etiquetas recortadas
    {"BG": "#B8986F", "INK": "#141414", "MUTED": "#4A3F33", "FAINT": "#A88B64", "SHEET": "#F1E9D8",
     "C1": "#A3161D", "C2": "#1D3F66", "GOLD": "#4A2F00", "BAD": "#9E1B1B", "GOOD": "#2F5A2F",
     "P_GOLD": "#F2CF3B", "P_C1": "#F3D9D5", "P_C2": "#D5DEEA", "P_GOOD": "#D6E2D2", "P_INK": "#F1E9D8",
     "PAINEL_BG": "#F1E9D8", "PAINEL_EDGE": "#141414"},
    fonte_texto="Special Elite", fonte_titulo="Archivo Black", titulo_caixa_alta=True, escala_texto=0.95,
    caixa_sombra=True, cantos=0.0,
    extra={"recortes": ["#151515", "#C8202A", "#F1E9D8", "#F2CF3B"], "fita": "#E9DFC0",
           "fontes_recorte": ["Archivo Black", "Alfa Slab One", "Special Elite", "Anton"],
           "faixa": "#C8202A", "pasta": "template/remotion/public/retro"},
))

_reg(Estilo(
    "bauhaus",
    {"BG": "#F1EADA", "INK": "#141414", "MUTED": "#6F6A60", "FAINT": "#E2D9C5", "SHEET": "#E9E1CF",
     "C1": "#1D4FA0", "C2": "#D03A2B", "GOLD": "#B07A00", "BAD": "#9E1B1B", "GOOD": "#2D6B35",
     "P_GOLD": "#F7DC7A", "P_C1": "#D3DDF0", "P_C2": "#F3CDC6", "P_GOOD": "#D5E6D4", "P_INK": "#E9E1CF",
     "PAINEL_BG": "#FAF6EC", "PAINEL_EDGE": "#141414"},
    fonte_texto="Josefin Sans", fonte_titulo="Josefin Sans", titulo_caixa_alta=True, peso_texto=BOLD,
    escala_texto=1.0, cantos=0.0,
    extra={"amarelo": "#F2B705", "vermelho": "#D03A2B", "azul": "#1D4FA0", "preto": "#141414"},
))

_reg(Estilo(
    "blueprint",
    {"BG": "#0F3D6E", "INK": "#EAF2FF", "MUTED": "#9DB9DA", "FAINT": "#2A5C91", "SHEET": "#134A82",
     "C1": "#7FD3FF", "C2": "#FFB36B", "GOLD": "#FFE08A", "BAD": "#FF8A80", "GOOD": "#A5E8A0",
     "P_GOLD": "#2D4A5E", "P_C1": "#164E80", "P_C2": "#3B4A5E", "P_GOOD": "#1E5568", "P_INK": "#134A82",
     "PAINEL_BG": "#124576", "PAINEL_EDGE": "#EAF2FF"},
    fonte_texto="Architects Daughter", fonte_titulo="Architects Daughter", caixa_alta=True, titulo_caixa_alta=True,
    escala_texto=1.0, cantos=0.0,
    extra={"grade": "#FFFFFF"},
))

_reg(Estilo(
    "lousa",
    {"BG": "#22382E", "INK": "#F2F0E6", "MUTED": "#B9C2B6", "FAINT": "#2E4A3D", "SHEET": "#2A4337",
     "C1": "#8EC9F0", "C2": "#F5A86E", "GOLD": "#F3D46B", "BAD": "#F08A8A", "GOOD": "#A6E3A1",
     "P_GOLD": "#3B4A33", "P_C1": "#2A4A4A", "P_C2": "#45422F", "P_GOOD": "#2C4A35", "P_INK": "#2A4337",
     "PAINEL_BG": "#284035", "PAINEL_EDGE": "#F2F0E6"},
    fonte_texto="Kalam", fonte_titulo="Cabin Sketch", peso_texto=BOLD, mao=True, escala_texto=1.1,
    titulo_cor="#F2F0E6",
    extra={"moldura": "#7A5230", "moldura_borda": "#4E321C"},
))

_reg(Estilo(
    "darkui",
    {"BG": "#0B0E14", "INK": "#EEF1F6", "MUTED": "#8C96A8", "FAINT": "#1A2030", "SHEET": "#161B27",
     "C1": "#5B9DFF", "C2": "#FF8A5B", "GOLD": "#FFC857", "BAD": "#FF5C7A", "GOOD": "#4ADE80",
     "P_GOLD": "#2A2416", "P_C1": "#14223D", "P_C2": "#2D1A14", "P_GOOD": "#12291C", "P_INK": "#1A2030",
     "PAINEL_BG": "#1A2132", "PAINEL_EDGE": "#3A4560"},
    fonte_texto="Inter", fonte_titulo="Inter", peso_texto=BOLD, escala_texto=0.95, cantos=0.22,
    painel_opacidade=0.72,
    extra={"brilhos": ["#5B9DFF", "#A855F7", "#FF8A5B"]},
))

_reg(Estilo(
    "terminal",
    {"BG": "#0D1117", "INK": "#E6EDF3", "MUTED": "#7D8590", "FAINT": "#161B22", "SHEET": "#161B22",
     "C1": "#79C0FF", "C2": "#FFA657", "GOLD": "#E3B341", "BAD": "#FF7B72", "GOOD": "#7EE787",
     "P_GOLD": "#2A2310", "P_C1": "#0F2338", "P_C2": "#2E1D0E", "P_GOOD": "#0F2A17", "P_INK": "#161B22",
     "PAINEL_BG": "#161B22", "PAINEL_EDGE": "#30363D"},
    fonte_texto="JetBrains Mono", fonte_titulo="JetBrains Mono", peso_texto=BOLD, escala_texto=0.85, cantos=0.06,
    entrada="digitar",
    extra={"barra": "#21262D", "botoes": ["#FF5F57", "#FEBC2E", "#28C840"]},
))

_reg(Estilo(
    "recorte",
    {"BG": "#CFE8F3", "INK": "#2B2D42", "MUTED": "#5C677D", "FAINT": "#B7DCEB", "SHEET": "#FFFFFF",
     "C1": "#2F6FDB", "C2": "#F2601C", "GOLD": "#B57A00", "BAD": "#D62828", "GOOD": "#21867A",
     "P_GOLD": "#FFF0BF", "P_C1": "#DCE8FF", "P_C2": "#FFE1D1", "P_GOOD": "#D4F1EC", "P_INK": "#FFFFFF",
     "PAINEL_BG": "#FFFFFF", "PAINEL_EDGE": "#2B2D42"},
    fonte_texto="Fredoka", fonte_titulo="Luckiest Guy", peso_texto=BOLD, escala_texto=1.0, cantos=0.3,
    caixa_sombra=True,
    extra={"camadas": ["#8BC34A", "#6FA83A", "#4E8A2E"], "nuvem": "#FFFFFF", "faixa": "#F2601C"},
))

_reg(Estilo(
    "jornal",
    {"BG": "#F3EBDD", "INK": "#1B1B1B", "MUTED": "#6B645A", "FAINT": "#E2D8C6", "SHEET": "#EAE1D0",
     "C1": "#2C4A7A", "C2": "#A63D2A", "GOLD": "#7A5A12", "BAD": "#8B1E1E", "GOOD": "#2F5A2F",
     "P_GOLD": "#EADBB4", "P_C1": "#D9DFEA", "P_C2": "#EBD3CC", "P_GOOD": "#D6E2D2", "P_INK": "#EAE1D0",
     "PAINEL_BG": "#F8F2E6", "PAINEL_EDGE": "#1B1B1B"},
    fonte_texto="Libre Baskerville", fonte_titulo="Playfair Display", peso_texto=BOLD, escala_texto=0.85,
    cantos=0.0, titulo_caixa_alta=False,
    extra={"cabecalho": "EDIÇÃO EXTRA"},
))

_reg(Estilo(
    "neon",
    {"BG": "#0A0612", "INK": "#F5E9FF", "MUTED": "#A08CB8", "FAINT": "#1C1030", "SHEET": "#160D26",
     "C1": "#29E7FF", "C2": "#FF4FD8", "GOLD": "#FFE45E", "BAD": "#FF5470", "GOOD": "#5CFF9D",
     "P_GOLD": "#2B2410", "P_C1": "#0B2630", "P_C2": "#2E0F2A", "P_GOOD": "#0F2A1C", "P_INK": "#160D26",
     "PAINEL_BG": "#140B22", "PAINEL_EDGE": "#FF4FD8"},
    fonte_texto="Orbitron", fonte_titulo="Monoton", peso_texto=BOLD, escala_texto=0.8, cantos=0.12,
    titulo_caixa_alta=True, titulo_cor="#FF4FD8", brilho=True,
    extra={"chao": "#FF4FD8", "sol": ["#FFE45E", "#FF4FD8"]},
))


def variante(nome: str, base: str, cores: dict | None = None, extra: dict | None = None, **campos) -> Estilo:
    """Registra uma variante de marca: mesmo desenho de fundo/título do estilo `base`, com outras cores e fontes.

    Ex. (no video.py, antes das cenas):
        estilos.variante("marca_papel", "envelhecido", cores={"BG": "#EFE8DA", ...}, fonte_texto="Inter")
    Cores e extra que não forem passados vêm do estilo base.
    """
    b = ESTILOS[base]
    kw = {k: getattr(b, k) for k in Estilo.__dataclass_fields__ if k not in ("nome", "cores", "extra", "base")}
    kw.update(campos)
    return _reg(Estilo(nome, {**b.cores, **(cores or {})}, extra={**b.extra, **(extra or {})}, base=b.tipo, **kw))


def estilo(nome: str) -> Estilo:
    if nome not in ESTILOS:
        raise ValueError(f"estilo '{nome}' não existe. Opções: {', '.join(ESTILOS)}")
    return ESTILOS[nome]


# --- troca de cor ---------------------------------------------------------------
def _rgb_key(rgb) -> tuple:
    return tuple(int(round(float(c) * 255)) for c in rgb[:3])


def tabela_cores(e: Estilo) -> dict:
    """(r,g,b) 0-255 da cor do documentário -> rgb 0-1 da cor do estilo."""
    tab = {}
    for k, v in DOC.items():
        novo = e.cor(k)
        if novo.lower() != v.lower():
            tab[_rgb_key(ManimColor(v).to_rgb())] = np.array(ManimColor(novo).to_rgb())
    for k, novo in e.extra.get("mapa", {}).items():   # trocas extras opcionais
        tab[_rgb_key(ManimColor(k).to_rgb())] = np.array(ManimColor(novo).to_rgb())
    return tab


def recolore(mob: Mobject, tab: dict):
    """Troca, em toda a família do objeto, as cores do documentário pelas do estilo (traço, fundo e contorno)."""
    if not tab:
        return
    for m in mob.get_family():
        for attr in ("stroke_rgbas", "fill_rgbas", "background_stroke_rgbas"):
            arr = getattr(m, attr, None)
            if arr is None or not len(arr):
                continue
            for row in arr:
                novo = tab.get(_rgb_key(row))
                if novo is not None:
                    row[:3] = novo


def brilho(mob: Mobject):
    """Neon: halo da mesma cor atrás de cada traço e de cada letra (contorno de fundo largo e fraco)."""
    for m in mob.get_family():
        if not isinstance(m, VMobject) or not m.has_points():
            continue
        if m.get_stroke_width() > 0 and m.get_stroke_opacity() > 0:
            cor, larg = m.get_stroke_color(), max(m.get_stroke_width() * 3.2, 8)
        elif m.get_fill_opacity() > 0:
            cor, larg = m.get_fill_color(), 7
        else:
            continue
        m.set_stroke(cor, width=larg, opacity=0.28, background=True)


# --- texto com fonte do estilo ---------------------------------------------------
_TEX_PARA_MARKUP = [
    (r"\\textbf\{([^{}]*)\}", r"<b>\1</b>"),
    (r"\\underline\{([^{}]*)\}", r"<u>\1</u>"),
    (r"\\textit\{([^{}]*)\}", r"<i>\1</i>"),
    (r"\\emph\{([^{}]*)\}", r"<i>\1</i>"),
]


def tex_para_markup(s: str) -> str:
    """Converte o LaTeX simples de títulos (\\textbf, \\underline...) em markup do Pango."""
    import re
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    for pat, rep in _TEX_PARA_MARKUP:
        s = re.sub(pat, rep, s)
    s = re.sub(r"\\[a-zA-Z]+\*?(\{([^{}]*)\})?", lambda m: m.group(2) or "", s)
    return s.replace("{", "").replace("}", "").replace("~", " ").replace("\\%", "%").replace("\\,", " ")


# --- decoração de fundo ------------------------------------------------------------
def _fundo(fw, fh, cor) -> Rectangle:
    return Rectangle(width=fw + 0.1, height=fh + 0.1).set_fill(cor, 1).set_stroke(width=0)


def _rasgado(w, h, seed, amp=0.06, passo=0.18) -> Polygon:
    """Tira de papel com as bordas de cima e de baixo rasgadas (centrada na origem)."""
    rng = np.random.default_rng(seed)
    xs = np.arange(-w / 2, w / 2 + passo, passo)
    top = [np.array([x, h / 2 + rng.uniform(-amp, amp), 0]) for x in xs]
    bot = [np.array([x, -h / 2 + rng.uniform(-amp, amp), 0]) for x in xs[::-1]]
    return Polygon(*top, *bot)


def _fita(w=1.1, h=0.34, cor="#EFE3B0", ang=0.0) -> Polygon:
    p = _rasgado(w, h, seed=int(w * 100) + 7, amp=0.025, passo=0.12)
    return p.set_fill(cor, 0.82).set_stroke(width=0).rotate(ang)


def decoracao(e: Estilo, fw: float, fh: float, vertical: bool, area: tuple) -> Mobject | None:
    """Fundo e enfeites fixos do estilo. `area` = (topo, base) da área útil, que fica livre."""
    topo, base = area
    if e.tipo == "documentario":
        return None

    if e.tipo == "quadro":
        borda = RoundedRectangle(width=fw - 0.2, height=fh - 0.2, corner_radius=0.25).set_stroke(e.cor("INK"), 14)
        return VGroup(borda)

    if e.tipo == "papel":
        g = VGroup()
        passo = 0.55
        y = fh / 2 - 0.9
        while y > -fh / 2 + 0.2:
            g.add(Line([-fw / 2, y, 0], [fw / 2, y, 0]).set_stroke(e.extra["pauta"], 1.6, opacity=0.75))
            y -= passo
        x_m = -fw / 2 + (0.5 if vertical else 1.0)
        g.add(Line([x_m, fh / 2, 0], [x_m, -fh / 2, 0]).set_stroke(e.extra["margem"], 2.2, opacity=0.8))
        # furos do fichário à esquerda
        for k in range(3 if vertical else 3):
            yk = fh / 2 * (0.6 - 0.6 * k)
            g.add(Circle(radius=0.11).move_to([-fw / 2 + 0.22, yk, 0])
                  .set_fill("#E8E1D0", 1).set_stroke(e.cor("MUTED"), 1, opacity=0.5))
        return g

    if e.tipo == "envelhecido":
        px_w = config.pixel_width
        px_h = config.pixel_height
        fundo = ImageMobject(textura_envelhecida(px_w, px_h, **e.extra.get("textura", {})))
        fundo.stretch_to_fit_width(fw + 0.02).stretch_to_fit_height(fh + 0.02).move_to(ORIGIN)
        g = VGroup()
        if e.extra.get("pauta"):          # variante sem pauta: pauta=None
            passo = 0.55
            y = fh / 2 - 0.9
            while y > -fh / 2 + 0.2:
                g.add(Line([-fw / 2, y, 0], [fw / 2, y, 0]).set_stroke(e.extra["pauta"], 1.4, opacity=0.35))
                y -= passo
        if e.extra.get("margem"):
            x_m = -fw / 2 + (0.5 if vertical else 1.0)
            g.add(Line([x_m, fh / 2, 0], [x_m, -fh / 2, 0]).set_stroke(e.extra["margem"], 2.0, opacity=0.45))
        return Group(fundo, g)

    if e.tipo == "colagem":
        cs = e.extra["recortes"]
        g = VGroup()
        # pontilhado de retícula num canto
        dots = VGroup()
        for i in range(9):
            for j in range(6):
                r = 0.035 + 0.012 * (i + j) / 3
                dots.add(Dot([fw / 2 - 0.3 - i * 0.2, fh / 2 - 0.3 - j * 0.2, 0], radius=min(r, 0.07)))
        dots.set_fill(cs[1], 0.35).set_stroke(width=0)
        g.add(dots)
        if vertical:
            # tiras rasgadas no topo e no rodapé (áreas cobertas pela interface do Reels)
            t1 = _rasgado(fw * 0.9, 0.55, 1).set_fill(cs[3], 1).set_stroke(width=0).rotate(-0.04)
            t1.move_to([-fw * 0.12, fh / 2 - 0.55, 0])
            t2 = _rasgado(fw * 0.75, 0.45, 2).set_fill(cs[4], 1).set_stroke(width=0).rotate(0.05)
            t2.move_to([fw * 0.2, -fh / 2 + 0.9, 0])
            t3 = _rasgado(fw * 0.6, 0.35, 3).set_fill(cs[0], 1).set_stroke(width=0).rotate(-0.06)
            t3.move_to([-fw * 0.25, -fh / 2 + 0.45, 0])
            g.add(t1, t2, t3)
        else:
            t1 = _rasgado(fw * 0.35, 0.4, 1).set_fill(cs[3], 1).set_stroke(width=0).rotate(-0.05)
            t1.move_to([-fw / 2 + 1.2, -fh / 2 + 0.15, 0])
            t2 = _rasgado(fw * 0.25, 0.32, 2).set_fill(cs[4], 1).set_stroke(width=0).rotate(0.06)
            t2.move_to([fw / 2 - 1.4, -fh / 2 + 0.12, 0])
            g.add(t1, t2)
        return g

    if e.tipo == "retro":
        pasta = SKILL / e.extra["pasta"]
        kraft = ImageMobject(str(pasta / "kraft.jpg"))
        kraft.stretch_to_fit_width(fw + 0.02).stretch_to_fit_height(fh + 0.02).move_to(ORIGIN)
        px = fh / 1920 if vertical else fh / 1080          # px do quadro de referência -> unidades do Manim
        # no Manim a faixa fica baixa (acima da legenda), para conta e gráfico não cruzarem com ela;
        # no Remotion cada cena põe as faixas onde quiser (<Palco faixas> e <Faixa>)
        faixa = Rectangle(width=fw * 1.7, height=110 * px).set_fill(e.extra["faixa"], 1).set_stroke(width=0)
        faixa.rotate(8 * DEGREES).move_to([0, fh / 2 - e.extra.get("faixa_y", 1600 if vertical else 960) * px, 0])
        sombra = faixa.copy().set_fill("#000000", 0.18).shift(DOWN * 10 * px)
        g = Group(kraft, sombra, faixa)
        larg = fw + 200 * px
        for k, (nome, topo, ang) in enumerate([("jornal_1.png", True, -1.6), ("jornal_2.png", False, 1.4)]):
            tira = ImageMobject(str(pasta / nome))
            tira.scale_to_fit_width(larg if vertical else fw * 0.75).rotate(ang * DEGREES)
            if topo:
                tira.move_to([0 if vertical else -fw * 0.15, fh / 2 + tira.height / 2 - (234 if vertical else 80) * px, 0])
            else:
                tira.move_to([0 if vertical else fw * 0.15, -fh / 2 - tira.height / 2 + (194 if vertical else 70) * px, 0])
            g.add(tira)
        return g

    if e.tipo == "bauhaus":
        x = e.extra
        g = VGroup()
        if vertical:
            sol = Circle(radius=1.35).set_fill(x["amarelo"], 1).set_stroke(width=0).move_to([fw / 2 - 0.55, fh / 2 - 0.35, 0])
            barra = Rectangle(width=fw * 0.55, height=0.22).set_fill(x["preto"], 1).set_stroke(width=0)
            barra.move_to([-fw / 2 + fw * 0.275, fh / 2 - 1.05, 0])
            quarto = AnnularSector(inner_radius=0, outer_radius=1.6, angle=PI / 2, start_angle=0)
            quarto.set_fill(x["vermelho"], 1).set_stroke(width=0).move_to([-fw / 2, -fh / 2, 0], aligned_edge=DL)
            tri = Triangle().set_fill(x["azul"], 1).set_stroke(width=0).scale(0.75).move_to([fw / 2 - 0.9, -fh / 2 + 0.95, 0])
            linha = Line([-fw / 2 + 2.0, -fh / 2 + 0.55, 0], [fw / 2 - 1.8, -fh / 2 + 0.55, 0]).set_stroke(x["preto"], 5)
            g.add(sol, barra, quarto, tri, linha)
        else:
            sol = Circle(radius=0.9).set_fill(x["amarelo"], 1).set_stroke(width=0).move_to([fw / 2 + 0.2, fh / 2 + 0.2, 0])
            quarto = AnnularSector(inner_radius=0, outer_radius=1.0, angle=PI / 2, start_angle=0)
            quarto.set_fill(x["vermelho"], 1).set_stroke(width=0).move_to([-fw / 2, -fh / 2, 0], aligned_edge=DL)
            barra = Rectangle(width=0.16, height=fh * 0.4).set_fill(x["azul"], 1).set_stroke(width=0)
            barra.move_to([fw / 2 - 0.12, -fh / 2 + fh * 0.2, 0])
            g.add(sol, quarto, barra)
        return g

    if e.tipo == "blueprint":
        gr = e.extra["grade"]
        g = VGroup()
        passo = 0.25
        x = -fw / 2
        k = 0
        while x <= fw / 2 + 1e-6:
            g.add(Line([x, -fh / 2, 0], [x, fh / 2, 0]).set_stroke(gr, 1.6 if k % 4 == 0 else 0.6,
                                                                 opacity=0.22 if k % 4 == 0 else 0.09))
            x += passo
            k += 1
        y = -fh / 2
        k = 0
        while y <= fh / 2 + 1e-6:
            g.add(Line([-fw / 2, y, 0], [fw / 2, y, 0]).set_stroke(gr, 1.6 if k % 4 == 0 else 0.6,
                                                                 opacity=0.22 if k % 4 == 0 else 0.09))
            y += passo
            k += 1
        borda = Rectangle(width=fw - 0.3, height=fh - 0.3).set_stroke(e.cor("INK"), 2.5, opacity=0.8)
        # sem carimbo no canto: o usuário pediu para tirar
        g.add(borda)
        return g

    if e.tipo == "lousa":
        x = e.extra
        g = VGroup()
        rng = np.random.default_rng(4)
        for _ in range(14):   # manchas de giz apagado
            c = Ellipse(width=rng.uniform(1.0, 2.6), height=rng.uniform(0.3, 0.8)).rotate(rng.uniform(-0.4, 0.4))
            c.move_to([rng.uniform(-fw / 2, fw / 2), rng.uniform(-fh / 2, fh / 2), 0])
            g.add(c.set_fill(e.cor("INK"), 0.035).set_stroke(width=0))
        moldura = Rectangle(width=fw, height=fh).set_stroke(x["moldura"], 26)
        filete = Rectangle(width=fw - 0.36, height=fh - 0.36).set_stroke(x["moldura_borda"], 3)
        g.add(moldura, filete)
        if not vertical:  # bandeja de giz embaixo
            g.add(Rectangle(width=fw * 0.5, height=0.12).set_fill(x["moldura_borda"], 1).set_stroke(width=0)
                  .move_to([0, -fh / 2 + 0.24, 0]))
        return g

    if e.tipo == "darkui":
        g = VGroup()
        cs = e.extra["brilhos"]
        pos = [(-fw * 0.38, fh * 0.36), (fw * 0.42, fh * 0.05), (-fw * 0.2, -fh * 0.4)]
        for c, (px, py) in zip(cs, pos):   # brilho difuso: círculos concêntricos bem fracos
            for k in range(8):
                g.add(Circle(radius=0.4 + k * 0.32).move_to([px, py, 0]).set_fill(c, 0.035).set_stroke(width=0))
        pontos = VGroup()
        for i in np.arange(-fw / 2 + 0.25, fw / 2, 0.5):
            for j in np.arange(-fh / 2 + 0.25, fh / 2, 0.5):
                pontos.add(Dot([i, j, 0], radius=0.012))
        g.add(pontos.set_fill(e.cor("INK"), 0.12).set_stroke(width=0))
        return g

    if e.tipo == "terminal":
        x = e.extra
        g = VGroup()
        bh = 0.5
        barra = Rectangle(width=fw, height=bh).set_fill(x["barra"], 1).set_stroke(width=0)
        topo_barra = fh / 2 - (1.25 if vertical else 0)   # no 9:16, abaixo do nome do perfil
        barra.move_to([0, topo_barra - bh / 2, 0])
        botoes = VGroup(*[Dot(radius=0.075).set_fill(c, 1).set_stroke(width=0)
                          .move_to([-fw / 2 + 0.35 + k * 0.26, barra.get_y(), 0]) for k, c in enumerate(x["botoes"])])
        nome = Text("aula.sh", font=e.fonte_texto, font_size=18, color=e.cor("MUTED")).move_to(barra)
        g.add(barra, botoes, nome)
        rodape = Text("$ _", font=e.fonte_texto, font_size=22, color=e.cor("GOOD")).set_opacity(0.6)
        rodape.move_to([-fw / 2 + 0.6, -fh / 2 + (2.3 if vertical else 0.3), 0])
        g.add(rodape)
        return g

    if e.tipo == "recorte":
        x = e.extra
        g = VGroup()

        def morro(larg, alt, cor, y, fase, seed):
            xs = np.linspace(-fw / 2 - 0.2, fw / 2 + 0.2, 40)
            topo = [np.array([xx, y + alt * (0.5 + 0.5 * np.sin(xx * 1.1 + fase)), 0]) for xx in xs]
            pts = topo + [np.array([fw / 2 + 0.2, -fh / 2 - 0.2, 0]), np.array([-fw / 2 - 0.2, -fh / 2 - 0.2, 0])]
            forma = Polygon(*pts).set_fill(cor, 1).set_stroke(width=0)
            return VGroup(sombra_recorte(forma).shift(UP * 0.12), forma)

        base = -fh / 2 + (2.4 if vertical else 0.7)
        for k, c in enumerate(x["camadas"]):
            g.add(morro(fw, 0.35, c, base - k * 0.45, k * 1.7, k))

        def nuvem(cx, cy, esc):
            n = VGroup(*[Circle(radius=r).move_to([cx + dx, cy + dy, 0]) for r, dx, dy in
                         ((0.32, 0, 0), (0.24, -0.38, -0.06), (0.26, 0.38, -0.05), (0.2, 0.15, 0.2))])
            n.set_fill(x["nuvem"], 1).set_stroke(width=0).scale(esc)
            return VGroup(sombra_recorte(n), n)

        topo = fh / 2 - (0.9 if vertical else 0.45)
        g.add(nuvem(-fw / 2 + 1.1, topo, 0.9), nuvem(fw / 2 - 1.3, topo - 0.25, 0.7))
        return g

    if e.tipo == "jornal":
        g = VGroup()
        topo = fh / 2 - (0.3 if vertical else 0.25)
        cab = Text(e.extra["cabecalho"], font=e.fonte_titulo, font_size=30 if vertical else 24,
                   color=e.cor("INK"), weight=BOLD)
        cab.move_to([0, topo - 0.2, 0])
        l1 = Line([-fw / 2 + 0.3, topo - 0.45, 0], [fw / 2 - 0.3, topo - 0.45, 0]).set_stroke(e.cor("INK"), 3)
        l2 = Line([-fw / 2 + 0.3, topo - 0.52, 0], [fw / 2 - 0.3, topo - 0.52, 0]).set_stroke(e.cor("INK"), 1)
        sub = Text("ANO I  ·  Nº 1  ·  CADERNO DE ESTUDOS", font=e.fonte_texto, font_size=12 if vertical else 10,
                   color=e.cor("MUTED")).move_to([0, topo - 0.68, 0])
        l3 = Line([-fw / 2 + 0.3, topo - 0.84, 0], [fw / 2 - 0.3, topo - 0.84, 0]).set_stroke(e.cor("INK"), 1)
        g.add(cab, l1, l2, sub, l3)
        rng = np.random.default_rng(9)   # textura de papel-jornal
        g.add(VGroup(*[Dot([rng.uniform(-fw / 2, fw / 2), rng.uniform(-fh / 2, fh / 2), 0], radius=0.008)
                       for _ in range(260)]).set_fill(e.cor("MUTED"), 0.25).set_stroke(width=0))
        return g

    if e.tipo == "neon":
        x = e.extra
        g = VGroup()
        chao_y = -fh / 2 + (2.2 if vertical else 1.0)
        horiz = Line([-fw / 2, chao_y, 0], [fw / 2, chao_y, 0]).set_stroke(x["chao"], 3, opacity=0.9)
        g.add(horiz)
        for k in range(1, 7):   # linhas horizontais do chão, mais juntas perto do horizonte
            yy = chao_y - (k ** 1.6) * 0.09
            if yy < -fh / 2:
                break
            g.add(Line([-fw / 2, yy, 0], [fw / 2, yy, 0]).set_stroke(x["chao"], 2, opacity=0.55))
        for k in range(-8, 9):  # linhas de fuga
            g.add(Line([k * 0.25, chao_y, 0], [k * 1.4, -fh / 2, 0]).set_stroke(x["chao"], 2, opacity=0.45))
        if vertical:
            sol = VGroup(*[AnnularSector(inner_radius=0, outer_radius=0.85, angle=PI, start_angle=0)
                         .set_fill(x["sol"][0], 1).set_stroke(width=0)])
            sol.move_to([0, chao_y + 0.43, 0])
            faixas = VGroup(*[Rectangle(width=1.9, height=0.05 + 0.02 * k).set_fill(e.cor("BG"), 1).set_stroke(width=0)
                              .move_to([0, chao_y + 0.1 + k * 0.15, 0]) for k in range(4)])
            g.add(sol, faixas)
            g.submobjects.insert(0, g.submobjects.pop())   # faixas e sol atrás das linhas
            g.submobjects.insert(0, g.submobjects.pop())
        return g
    return None


# --- título por estilo ----------------------------------------------------------------
def titulo_estilo(e: Estilo, markup: str, size: float, cor_padrao, max_w: float) -> Mobject:
    """Monta o título no visual do estilo. `markup` já vem em markup do Pango."""
    import re
    plano = re.sub(r"<[^>]+>", "", markup)
    if e.titulo_caixa_alta:
        markup = re.sub(r"(^|>)([^<]+)", lambda m: m.group(1) + m.group(2).upper(), markup)
        plano = plano.upper()
    cor = e.titulo_cor or cor_padrao

    if e.tipo in ("colagem", "retro"):
        # letras recortadas: cada palavra num pedaço de papel de cor diferente, levemente torto
        cs = e.extra["recortes"]
        fontes = e.extra.get("fontes_recorte", [e.fonte_titulo, e.fonte_texto])
        pecas = VGroup()
        for k, w in enumerate(plano.split()):
            fundo_c = cs[k % len(cs)]
            r_, g_, b_ = ManimColor(fundo_c).to_rgb()
            txt_c = "#FBF7EF" if 0.299 * r_ + 0.587 * g_ + 0.114 * b_ < 0.55 else "#1A1A1A"
            fonte = fontes[k % len(fontes)]
            t = Text(w, font=fonte, font_size=size * (0.9 if k % 2 == 0 else 0.8), color=txt_c)
            p = _rasgado(t.width + 0.28, t.height + 0.26, seed=k + 11, amp=0.03, passo=0.1)
            p.set_fill(fundo_c, 1).set_stroke(width=0)
            partes = [sombra_recorte(p)] if e.tipo == "retro" else []
            peca = VGroup(*partes, p, t.move_to(p)).rotate([-0.05, 0.04, -0.02, 0.06][k % 4])
            pecas.add(peca)
        pecas.arrange_in_grid(cols=99, buff=0.08)
        if pecas.width > max_w:
            # quebra em linhas
            linhas, atual, larg = [], VGroup(), 0
            for p in pecas:
                if larg + p.width > max_w and len(atual):
                    linhas.append(atual)
                    atual, larg = VGroup(), 0
                atual.add(p)
                larg += p.width + 0.08
            linhas.append(atual)
            pecas = VGroup(*[l.arrange(RIGHT, buff=0.08) for l in linhas]).arrange(DOWN, buff=0.1)
        return pecas

    if e.tipo == "terminal":   # prompt antes do título (na quebra, fica junto da 1ª parte)
        pr = f'<span foreground="{e.cor("GOOD")}">&gt; </span>'
        markup = pr + markup
        plano = "> " + plano
    if e.tipo == "neon":       # a Monoton tem espaço estreito: dobra os espaços entre palavras
        markup = "".join(p if p.startswith("<") else p.replace(" ", "\u2003") for p in re.split(r"(<[^>]+>)", markup))
        plano = plano.replace(" ", "\u2003")
    peso = e.peso_texto
    mk = lambda s: MarkupText(s, font=e.fonte_titulo, font_size=size, color=cor, weight=peso)
    t = mk(markup)
    spans = re.findall(r"<span[^>]*>.*?</span>", markup)
    if e.tipo == "terminal" and len(spans) > 1:
        spans = [spans[0] + spans[1]] + spans[2:]
    if t.width > max_w and len(spans) > 1:
        # quebra entre partes ("Passo 1:" em cima, o resto embaixo), mantendo as cores
        t = VGroup(mk(spans[0]), mk("".join(spans[1:]))).arrange(DOWN, buff=0.15)
    elif t.width > max_w:
        palavras = plano.split()
        melhor = None
        for corte in range(1, len(palavras)):
            a, b = " ".join(palavras[:corte]), " ".join(palavras[corte:])
            nota = max(len(a), len(b))
            if melhor is None or nota < melhor[0]:
                melhor = (nota, a, b)
        if melhor:
            t = VGroup(Text(melhor[1], font=e.fonte_titulo, font_size=size, color=cor, weight=peso),
                       Text(melhor[2], font=e.fonte_titulo, font_size=size, color=cor, weight=peso)).arrange(DOWN, buff=0.15)
    if t.width > max_w:
        t.scale_to_fit_width(max_w)

    if e.tipo in ("papel", "envelhecido"):
        risco = Line(t.get_corner(DL) + DOWN * 0.08, t.get_corner(DR) + DOWN * 0.08)
        risco.set_stroke(e.cor("GOLD"), 6, opacity=0.55)
        return VGroup(t, risco)
    if e.tipo == "bauhaus":
        bloco = Square(side_length=t.height * 0.9).set_fill(e.extra["vermelho"], 1).set_stroke(width=0)
        bloco.next_to(t, LEFT, buff=0.22)
        g = VGroup(bloco, t)
        if g.width > max_w:
            g.scale_to_fit_width(max_w)
        return g
    if e.tipo == "blueprint":
        l1 = Line(t.get_corner(DL) + DOWN * 0.1, t.get_corner(DR) + DOWN * 0.1).set_stroke(e.cor("INK"), 2.5)
        l2 = l1.copy().shift(DOWN * 0.08).set_stroke(width=1.2)
        return VGroup(t, l1, l2)
    if e.tipo == "lousa":
        a, b = t.get_corner(DL) + DOWN * 0.1, t.get_corner(DR) + DOWN * 0.1
        xs = np.linspace(a[0], b[0], 30)
        risco = VMobject().set_points_smoothly([np.array([xx, a[1] + 0.03 * np.sin(xx * 9), 0]) for xx in xs])
        return VGroup(t, risco.set_stroke(e.cor("GOLD"), 4, opacity=0.85))
    if e.tipo == "darkui":
        barra = RoundedRectangle(corner_radius=0.04, width=0.1, height=t.height * 1.05).set_fill(e.cor("C1"), 1).set_stroke(width=0)
        barra.next_to(t, LEFT, buff=0.22)
        g = VGroup(barra, t)
        if g.width > max_w:
            g.scale_to_fit_width(max_w)
        return g
    if e.tipo == "terminal":
        ult = t[-1] if isinstance(t, VGroup) and not isinstance(t, (Text, MarkupText)) else t
        cursor = Rectangle(width=size * 0.012, height=ult.height * 0.95).set_fill(e.cor("INK"), 0.85).set_stroke(width=0)
        cursor.next_to(ult, RIGHT, buff=0.08)
        return VGroup(t, cursor)
    if e.tipo == "recorte":
        faixa = RoundedRectangle(corner_radius=0.12, width=t.width + 0.6, height=t.height + 0.4)
        faixa.set_fill(e.extra["faixa"], 1).set_stroke(width=0).move_to(t)
        t.set_color("#FFFFFF")
        g = VGroup(sombra_recorte(faixa), faixa, t).rotate(-0.025)
        if g.width > max_w:
            g.scale_to_fit_width(max_w)
        return g
    if e.tipo == "jornal":
        l1 = Line(LEFT, RIGHT).set_width(max(t.width, 2) + 0.3).next_to(t, UP, buff=0.15).set_stroke(e.cor("INK"), 1.5)
        l2 = l1.copy().next_to(t, DOWN, buff=0.15)
        return VGroup(l1, t, l2)
    return t


# --- caixa e painel por estilo ---------------------------------------------------------
def sombra_recorte(forma: Mobject, cor="#000000") -> Mobject:
    """Sombra deslocada (colagem): o recorte parece colado em cima do papel."""
    s = forma.copy().set_fill(cor, 0.28).set_stroke(width=0)
    return s.shift(RIGHT * 0.07 + DOWN * 0.07)
