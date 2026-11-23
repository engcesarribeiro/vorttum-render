"""Identidade visual VORTTUM: variantes de marca dos estilos da skill.

Paleta: carvão, areia, marfim, cinza e terrosos. Tipografia: tudo em LaTeX
(Latin Modern), reta, nunca itálico. Sem neon, sem cor saturada.
Papel das cores neste vídeo (apagão mundial):
    GOOD oliva   = rede ligada, usinas funcionando, 60 Hz
    C1 terracota = queda, falha, frequência caindo, usina desligada
    GOLD ocre    = resultado, destaque, números-chave
    C2 ardósia   = corte de carga (gente desligada de propósito), segunda grandeza
    INK carvão   = texto e traço
Importe no video.py antes das cenas: `import vorttum`.
"""
import estilos

CLARO = {
    "BG": "#EFE8DA", "INK": "#2A2826", "MUTED": "#857E72", "FAINT": "#DCD3C2", "SHEET": "#F6F1E6",
    "C1": "#A4452F", "C2": "#4E5A63", "GOLD": "#946B2C", "BAD": "#7E2F22", "GOOD": "#5E6B43",
    "P_GOLD": "#EADCBE", "P_C1": "#EBD3C8", "P_C2": "#D9DDDF", "P_GOOD": "#DFE2D0", "P_INK": "#E6DFD0",
    "PAINEL_BG": "#F6F1E6", "PAINEL_EDGE": "#2A2826",
}
ESCURO = {
    "BG": "#1E1C1A", "INK": "#ECE5D6", "MUTED": "#9A9286", "FAINT": "#2E2B28", "SHEET": "#282522",
    "C1": "#C9694B", "C2": "#9AA6AD", "GOLD": "#D2B47E", "BAD": "#C25B43", "GOOD": "#9CA77A",
    "P_GOLD": "#3A3225", "P_C1": "#3D2620", "P_C2": "#2B3033", "P_GOOD": "#2E3226", "P_INK": "#2A2724",
    "PAINEL_BG": "#272421", "PAINEL_EDGE": "#4A443D",
}
# Tipografia: todo o texto em LaTeX (Latin Modern, reta). fonte None = LaTeX no template.
FONTES = dict(fonte_texto=None, fonte_titulo=None, peso_texto="NORMAL",
              caixa_alta=False, titulo_caixa_alta=False, titulo_cor=None)

# Manim escuro (carvão): gráficos e resultados
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
# quadro marfim com a mão desenhando (hand draw)
estilos.variante("v_quadro", "quadro", cores={**CLARO, "BG": "#F4EFE4"}, **FONTES, escala_texto=0.95, mao=True)
# cenas em Remotion (o fundo de papel fica no React; aqui só precisa existir)
estilos.variante("v_remotion", "documentario", cores=CLARO, **FONTES)
