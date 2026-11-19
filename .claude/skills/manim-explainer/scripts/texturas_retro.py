"""Gera as texturas do estilo `retro` (colagem retrô editorial): papel kraft e tiras de jornal antigo.

Uso (só quando quiser refazer; os PNG já ficam no repositório):
    python texturas_retro.py

Saída em <skill>/template/remotion/public/retro/ (o Manim lê dali também):
    kraft.jpg        1080x1920, kraft com grão, fibras e manchas
    jornal_1.png     tira de jornal rasgada (fundo transparente), 1400x420
    jornal_2.png     outra tira, outro texto
O texto do jornal é inventado (sílabas aleatórias): não reproduz jornal real.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SKILL = Path(__file__).resolve().parents[1]
FONTS = SKILL / "fonts"
DEST = SKILL / "template" / "remotion" / "public" / "retro"


def ruido(rng, w, h, cel):
    g = rng.random((max(2, h // cel), max(2, w // cel)))
    return np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), float) / 255


def kraft(w=1080, h=1920, seed=3) -> Image.Image:
    rng = np.random.default_rng(seed)
    base = np.array([184, 152, 112], float)          # kraft médio
    lum = (1 + 0.09 * (ruido(rng, w, h, 220) - 0.5) + 0.06 * (ruido(rng, w, h, 50) - 0.5)
           + 0.05 * (rng.random((h, w)) - 0.5))
    img = base * lum[..., None]
    # fibras: riscos finos claros e escuros
    fib = Image.new("L", (w, h), 128)
    d = ImageDraw.Draw(fib)
    for _ in range(2600):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        ang = rng.normal(0.15, 0.5)
        L = rng.uniform(6, 26)
        tom = int(rng.choice([95, 165]))
        d.line([(x, y), (x + L * np.cos(ang), y + L * np.sin(ang))], fill=tom, width=1)
    fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.6)), float) / 128 - 1
    img *= (1 + 0.10 * fib)[..., None]
    # vinheta suave
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    r = np.hypot((xx - w / 2) / w, (yy - h / 2) / h)
    img *= (1 - 0.22 * np.clip(r - 0.25, 0, 1))[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


SIL = ["ra", "te", "mo", "li", "ca", "do", "pre", "sen", "ta", "vel", "dos", "por", "men", "con", "tra", "ga",
       "ri", "na", "bel", "co", "ver", "an", "es", "tu", "lo", "fer", "is", "mar", "que", "su"]


def palavra(rng):
    return "".join(rng.choice(SIL) for _ in range(int(rng.integers(1, 4))))


def frase(rng, n):
    return " ".join(palavra(rng) for _ in range(n))


def cabe(d, texto, fonte, largura):
    """Corta o texto (por palavra) até caber na coluna."""
    while texto and d.textlength(texto, font=fonte) > largura:
        texto = texto.rsplit(" ", 1)[0] if " " in texto else texto[:-1]
    return texto


def jornal(w=1400, h=420, seed=1) -> Image.Image:
    rng = np.random.default_rng(seed)
    papel = Image.new("RGB", (w, h), (226, 219, 201))
    arr = np.asarray(papel, float) * (1 + 0.05 * (ruido(rng, w, h, 30)[..., None] - 0.5))
    arr = arr * (1 - 0.10 * ruido(rng, w, h, 300)[..., None])      # amarelado irregular
    papel = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(papel)
    serif = str(FONTS / "LibreBaskerville.ttf")
    title = str(FONTS / "PlayfairDisplay.ttf")
    f_txt = ImageFont.truetype(serif, 12)
    f_sub = ImageFont.truetype(title, 20)
    f_man = ImageFont.truetype(title, 36)
    tinta = (40, 36, 32)
    cols, gap = 7, 18
    cw = (w - gap * (cols + 1)) // cols
    for c in range(cols):
        x0 = gap + c * (cw + gap)
        y = 18
        if c > 0:
            d.line([(x0 - gap // 2, 12), (x0 - gap // 2, h - 12)], fill=tinta, width=1)
        while y < h - 20:
            sorteio = rng.random()
            if sorteio < 0.08:                      # manchete
                t = cabe(d, frase(rng, 3).upper(), f_man, cw)
                d.text((x0, y), t, font=f_man, fill=tinta)
                y += 46
            elif sorteio < 0.2:                     # subtítulo
                d.text((x0, y), cabe(d, frase(rng, 4).upper(), f_sub, cw), font=f_sub, fill=tinta)
                y += 27
            elif sorteio < 0.26:                    # bloco de "foto" em retícula
                bh = int(rng.uniform(60, 110))
                for yy in range(y, min(h - 10, y + bh), 6):
                    for xx in range(x0, x0 + cw, 6):
                        rr = 1 + 2.2 * (0.5 + 0.5 * np.sin(xx * 0.03 + yy * 0.05 + seed))
                        d.ellipse([xx - rr, yy - rr, xx + rr, yy + rr], fill=tinta)
                y += bh + 10
            else:                                   # parágrafo
                for _ in range(int(rng.integers(3, 8))):
                    linha = ""
                    while True:
                        prox = (linha + " " + palavra(rng)).strip()
                        if d.textlength(prox, font=f_txt) > cw:
                            break
                        linha = prox
                    d.text((x0, y), linha, font=f_txt, fill=tinta)
                    y += 15
                    if y > h - 20:
                        break
                y += 6
    # leve desfoque de impressão
    papel = papel.filter(ImageFilter.GaussianBlur(0.35))
    # bordas rasgadas em cima e embaixo (transparentes) + borda branca de fibra
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    passo = 9
    top = [(x, 14 + rng.uniform(-10, 10)) for x in range(0, w + passo, passo)]
    bot = [(x, h - 14 + rng.uniform(-10, 10)) for x in range(w + passo, -passo, -passo)]
    md.polygon(top + bot, fill=255)
    fibra = Image.new("L", (w, h), 0)
    fd = ImageDraw.Draw(fibra)
    fd.polygon(top + bot, fill=255)
    fibra = fibra.filter(ImageFilter.MaxFilter(7))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    branco = Image.new("RGBA", (w, h), (238, 232, 218, 255))
    out.paste(branco, (0, 0), fibra)
    out.paste(papel.convert("RGBA"), (0, 0), mask)
    return out


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    kraft().save(DEST / "kraft.jpg", quality=88)
    jornal(seed=1).save(DEST / "jornal_1.png", optimize=True)
    jornal(seed=7).save(DEST / "jornal_2.png", optimize=True)
    print(f"texturas em {DEST}")


if __name__ == "__main__":
    main()
