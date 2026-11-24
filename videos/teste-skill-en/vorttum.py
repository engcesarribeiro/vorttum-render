"""Identidade visual VORTTUM: variantes de marca dos estilos da skill (paleta do VORTTUM 003).

Paleta: carvão, areia, marfim, cinza e terrosos, um pouco de cor sem ficar extravagante.
Sem neon, sem cor saturada, sem cara infantil. Tipografia: todo texto em LaTeX (Latin Modern), reto, nunca itálico.

Uso: copie para a pasta do vídeo e importe no video.py depois do explainer:
    from explainer import *
    import vorttum                      # registra v_doc, v_papel, v_marfim, v_colagem, v_bauhaus, v_quadro, v_blueprint, v_remotion
    class _Base(ExplainerScene):
        VOICE = vorttum.VOZ
        RATE = vorttum.RATE             # vídeo inteiro 5% mais rápido; gancho e tensão: vorttum.RATE_TENSAO

Escreva no docstring da cópia do vídeo o papel de cada cor NAQUELE vídeo (cor = significado, o vídeo inteiro). Ex. (apagão):
    GOOD oliva   = rede ligada          C1 terracota = queda, falha
    GOLD ocre    = resultado, destaque  C2 ardósia   = segunda grandeza
    INK carvão   = texto e traço
"""
import estilos

# voz (references/voz-expressiva.md): Andrew em inglês americano; Thalita fica para português
VOZ = "en-US-AndrewMultilingualNeural"
RATE = "+5%"            # o vídeo todo
RATE_TENSAO = "+10%"    # gancho e trechos de tensão
# frases de impacto: <prosody rate="-10%">...</prosody> no roteiro (8 a 12% mais lentas)

CLARO = {
    "BG": "#EFE8DA", "INK": "#2A2826", "MUTED": "#857E72", "FAINT": "#DCD3C2", "SHEET": "#F6F1E6",
    "C1": "#B5472C", "C2": "#3F6178", "GOLD": "#B07F25", "BAD": "#8E2F1E", "GOOD": "#5F7A3A",
    "P_GOLD": "#EADCBE", "P_C1": "#EBD3C8", "P_C2": "#D9DDDF", "P_GOOD": "#DFE2D0", "P_INK": "#E6DFD0",
    "PAINEL_BG": "#F6F1E6", "PAINEL_EDGE": "#2A2826",
}
ESCURO = {
    "BG": "#1C1D22", "INK": "#ECE5D6", "MUTED": "#9A9286", "FAINT": "#2E2B28", "SHEET": "#282522",
    "C1": "#DB7350", "C2": "#8FB0C4", "GOLD": "#E3B865", "BAD": "#D0583D", "GOOD": "#A6BA72",
    "P_GOLD": "#3A3225", "P_C1": "#3D2620", "P_C2": "#2B3033", "P_GOOD": "#2E3226", "P_INK": "#2A2724",
    "PAINEL_BG": "#272421", "PAINEL_EDGE": "#4A443D",
}
# Tipografia: todo o texto em LaTeX (Latin Modern, reta). fonte None = LaTeX no template.
FONTES = dict(fonte_texto=None, fonte_titulo=None, peso_texto="NORMAL",
              caixa_alta=False, titulo_caixa_alta=False, titulo_cor=None)

# Manim escuro (carvão): gráficos e resultados. Nunca o estilo dominante nem sozinho por muito tempo.
estilos.variante("v_doc", "documentario", cores=ESCURO, **FONTES, escala_texto=0.95, cantos=0.06)
# papel envelhecido (marfim e areia), sem pauta e sem margem de caderno
estilos.variante("v_papel", "envelhecido", cores={**CLARO, "BG": "#E9DFCB"}, **FONTES, escala_texto=0.95, cantos=0.04,
                 extra={"pauta": None, "margem": None,
                        "textura": {"papel": (233, 223, 203), "queimado": 0.55, "manchas": 0.5, "anel": 0.0, "seed": 11}})
# marfim quase liso (encerramento)
estilos.variante("v_marfim", "envelhecido", cores=CLARO, **FONTES, escala_texto=0.95, cantos=0.04,
                 extra={"pauta": None, "margem": None,
                        "textura": {"papel": (239, 232, 218), "queimado": 0.12, "manchas": 0.2, "anel": 0.0, "seed": 5}})
# colagem em kraft-areia, recortes em carvão, terracota, marfim, ardósia e areia
estilos.variante("v_colagem", "colagem", cores={**CLARO, "BG": "#D8C9AC", "SHEET": "#F3EDE1"},
                 **FONTES, escala_texto=1.0,
                 extra={"recortes": ["#2A2826", "#A4452F", "#F3EDE1", "#4E5A63", "#C9B48F"], "fita": "#E6D9B8",
                        "fontes_recorte": ["Archivo Black", "Playfair Display", "Inter"]})
# Bauhaus em terrosos
estilos.variante("v_bauhaus", "bauhaus", cores=CLARO, **FONTES,
                 extra={"amarelo": "#C9A86A", "vermelho": "#A4452F", "azul": "#4E5A63", "preto": "#2A2826"})
# quadro marfim com a mão desenhando (escrita à mão)
estilos.variante("v_quadro", "quadro", cores={**CLARO, "BG": "#F4EFE4"}, **FONTES, escala_texto=0.95, mao=True)
# blueprint VORTTUM (VORTTUM 002): ardósia escura com grade marfim, sem azul vivo e sem carimbo
estilos.variante("v_blueprint", "blueprint", cores={
    "BG": "#2B3236", "INK": "#ECE5D6", "MUTED": "#A39B8E", "FAINT": "#3A4246", "SHEET": "#323A3E",
    "C1": "#C9694B", "C2": "#9AA6AD", "GOLD": "#D2B47E", "BAD": "#C25B43", "GOOD": "#9CA77A",
    "P_GOLD": "#3E3A2E", "P_C1": "#43302A", "P_C2": "#363F44", "P_GOOD": "#353B30", "P_INK": "#323A3E",
    "PAINEL_BG": "#30383C", "PAINEL_EDGE": "#ECE5D6"}, **FONTES, escala_texto=0.95, cantos=0.0,
    extra={"grade": "#ECE5D6"})
# cenas em Remotion (o fundo de papel fica no React, kit/vorttum.tsx; aqui só precisa existir)
estilos.variante("v_remotion", "documentario", cores=CLARO, **FONTES)
