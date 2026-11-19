"""Foto -> recorte em gravura (meio-tom ou traço), pronto para colar no estilo retro.

Uso:
    python gravura.py foto.jpg                         # sai foto_gravura.png ao lado (pontos de meio-tom)
    python gravura.py foto.jpg --estilo linhas         # traço de gravura (linhas que engrossam no escuro)
    python gravura.py foto.jpg --sem-fundo             # tira o fundo (precisa de: pip install rembg onnxruntime)
    python gravura.py foto.jpg --saida remotion/public/retrato.png --largura 900 --borda 14

O resultado é PNG com fundo transparente e borda de papel creme (cara de recortado da revista).
Use foto própria, do usuário ou de domínio público (ex.: gravuras antigas do Wikimedia Commons ou da
Biblioteca do Congresso, marcadas como "public domain"). Não use foto de pessoa real sem autorização.
Para o RetratoFalante, anote onde fica a boca (frações da imagem) e passe em `boca={{y, y1, x0, x1}}`.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

TINTA = (22, 22, 22, 255)
PAPEL = (241, 233, 216, 255)


def tira_fundo(img: Image.Image) -> Image.Image:
    try:
        from rembg import remove
    except ImportError:
        raise SystemExit("--sem-fundo precisa do rembg: pip install rembg onnxruntime")
    return remove(img.convert("RGBA"))


def tons(img: Image.Image, contraste: float) -> np.ndarray:
    g = ImageOps.autocontrast(img.convert("L"), cutoff=1)
    a = np.asarray(g, float) / 255
    return np.clip((a - 0.5) * contraste + 0.5, 0, 1)     # 0 = preto, 1 = branco


def meio_tom(lum: np.ndarray, passo: int, angulo: float = 45) -> Image.Image:
    h, w = lum.shape
    # gira a grade de pontos (como retícula de jornal), desenha e volta
    big = Image.fromarray((lum * 255).astype(np.uint8)).rotate(angulo, expand=True, fillcolor=255)
    B = np.asarray(big, float) / 255
    out = Image.new("L", big.size, 255)
    d = ImageDraw.Draw(out)
    for y in range(0, big.size[1], passo):
        for x in range(0, big.size[0], passo):
            v = 1 - B[y:y + passo, x:x + passo].mean()
            if v > 0.04:
                r = passo * 0.72 * np.sqrt(v)
                c = (x + passo / 2, y + passo / 2)
                d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=0)
    out = out.rotate(-angulo, expand=True, fillcolor=255)
    ox, oy = (out.size[0] - w) // 2, (out.size[1] - h) // 2
    return out.crop((ox, oy, ox + w, oy + h))


def linhas(lum: np.ndarray, passo: int) -> Image.Image:
    h, w = lum.shape
    out = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(out)
    for y0 in range(0, h, passo):
        pts_top, pts_bot = [], []
        for x in range(0, w, 2):
            yy = min(h - 1, int(y0 + passo / 2 + 1.5 * np.sin(x / 23)))
            esp = (1 - lum[yy, x]) * passo * 0.9
            pts_top.append((x, yy - esp / 2))
            pts_bot.append((x, yy + esp / 2))
        d.polygon(pts_top + pts_bot[::-1], fill=0)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("foto", type=Path)
    ap.add_argument("--saida", type=Path)
    ap.add_argument("--estilo", choices=["pontos", "linhas"], default="pontos")
    ap.add_argument("--largura", type=int, default=900, help="largura final (px)")
    ap.add_argument("--passo", type=int, default=0, help="tamanho da retícula (0 = automático)")
    ap.add_argument("--contraste", type=float, default=1.35)
    ap.add_argument("--sem-fundo", action="store_true", help="remove o fundo com rembg")
    ap.add_argument("--borda", type=int, default=12, help="borda de papel creme em volta do recorte (px); 0 tira")
    a = ap.parse_args()

    img = Image.open(a.foto).convert("RGBA")
    img = img.resize((a.largura, round(img.height * a.largura / img.width)), Image.LANCZOS)
    alfa = tira_fundo(img).getchannel("A") if a.sem_fundo else Image.new("L", img.size, 255)
    lum = tons(img, a.contraste)
    lum[np.asarray(alfa) < 128] = 1
    passo = a.passo or max(5, a.largura // 120)
    tinta = meio_tom(lum, passo) if a.estilo == "pontos" else linhas(lum, passo)

    w, h = img.size
    m = a.borda + 6
    out = Image.new("RGBA", (w + 2 * m, h + 2 * m), (0, 0, 0, 0))
    alfa_m = Image.new("L", out.size, 0)
    alfa_m.paste(alfa, (m, m))
    if a.borda:
        borda = alfa_m.filter(ImageFilter.MaxFilter(2 * (a.borda // 2) + 1))
        out.paste(Image.new("RGBA", out.size, PAPEL), (0, 0), borda)
    papel = Image.new("RGBA", (w, h), PAPEL)
    papel.paste(Image.new("RGBA", (w, h), TINTA), (0, 0), ImageOps.invert(tinta))
    out.paste(papel, (m, m), alfa)
    dest = a.saida or a.foto.with_name(a.foto.stem + "_gravura.png")
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    print(f"gravura: {dest} ({out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
