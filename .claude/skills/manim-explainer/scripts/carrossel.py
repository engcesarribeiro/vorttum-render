"""Transforma o vídeo renderizado num carrossel do Instagram (PNG 1080x1350, um slide por cena).

Uso (na pasta do projeto, depois do render):
    python carrossel.py video.py --vertical [--rascunho | --preview] [--cta "Salve para estudar depois"]

Pega o último quadro de cada cena antes da limpeza da tela (quando a explicação está completa),
recorta a área útil (no 9:16 tira o topo e o rodapé cobertos pela interface do Reels) e monta:
    01 = capa (1º quadro do vídeo, que já é a capa), 02..N = cenas, último = chamada para salvar.
Saída: out/carrossel/NN.png. Cena que não deve virar slide: --pular A01_Gancho B03_Transicao.
"""
import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render  # noqa: E402

SKILL = Path(__file__).resolve().parent.parent
W, H = 1080, 1350


def quadro(video: Path, t: float, dest: Path) -> Image.Image:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t):.3f}", "-i", str(video), "-frames:v", "1", str(dest)],
                   check=True)
    return Image.open(dest).convert("RGB")


def conteudo(img: Image.Image) -> float:
    """Quanto o quadro tem de desenho: densidade de bordas (tela vazia ou no meio de um fade dá pouco)."""
    g = img.convert("L").resize((270, 480))
    return ImageStat.Stat(g.filter(ImageFilter.FIND_EDGES)).mean[0]


def melhor_quadro(video: Path, dur: float, tmp: Path, antes: float) -> Image.Image:
    """Entre alguns instantes perto do fim da cena, o quadro mais completo (antes do fade de limpeza)."""
    cands = [dur - antes - k for k in (0.0, 0.6, 1.3, 2.2, 3.5) if dur - antes - k > 0.2]
    melhores = [(conteudo(im := quadro(video, t, tmp)), -i, im) for i, t in enumerate(cands)]
    return max(melhores, key=lambda x: (round(x[0], 1), x[1]))[2]


def cor_fundo(img: Image.Image) -> tuple:
    """Cor mais comum do quadro (o fundo do estilo), ignorando moldura e enfeites."""
    pequeno = img.resize((60, 80)).quantize(colors=8).convert("RGB")
    return max(pequeno.getcolors(4800), key=lambda c: c[0])[1]


def slide(img: Image.Image, vertical: bool) -> Image.Image:
    """Ajusta o quadro ao 4:5. No 9:16 recorta a faixa útil; no 16:9 centraliza sobre a cor do fundo."""
    if vertical:
        img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS)
        topo = round(img.height * 0.10)
        img = img.crop((0, topo, W, topo + H))
        return img
    fundo = Image.new("RGB", (W, H), cor_fundo(img))
    img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS)
    fundo.paste(img, (0, (H - img.height) // 2))
    return fundo


def numera(img: Image.Image, k: int, total: int) -> Image.Image:
    d = ImageDraw.Draw(img)
    fonte = ImageFont.truetype(str(SKILL / "fonts" / "Inter.ttf"), 30)
    txt = f"{k}/{total}"
    w = d.textlength(txt, font=fonte)
    cor = img.getpixel((W - 60, H - 50))
    claro = sum(cor) / 3 > 128
    d.rounded_rectangle((W - w - 56, H - 74, W - 24, H - 26), radius=22, fill=(30, 30, 30) if claro else (240, 240, 240))
    d.text((W - w - 40, H - 70), txt, font=fonte, fill=(240, 240, 240) if claro else (20, 20, 20))
    return img


def cta(base: Image.Image, texto: str) -> Image.Image:
    bg = cor_fundo(base)
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    claro = sum(bg) / 3 > 128
    cor = (25, 25, 25) if claro else (240, 240, 240)
    fonte = ImageFont.truetype(str(SKILL / "fonts" / "Inter.ttf"), 76)
    palavras, linhas, atual = texto.split(), [], ""
    for p in palavras:
        if d.textlength(f"{atual} {p}".strip(), font=fonte) > W - 200:
            linhas.append(atual)
            atual = p
        else:
            atual = f"{atual} {p}".strip()
    linhas.append(atual)
    y = H / 2 - len(linhas) * 50
    for l in linhas:
        d.text(((W - d.textlength(l, font=fonte)) / 2, y), l, font=fonte, fill=cor)
        y += 100
    d.rounded_rectangle((W / 2 - 90, y + 40, W / 2 + 90, y + 60), radius=10, fill=(245, 184, 46))
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file", type=Path)
    ap.add_argument("--vertical", action="store_true")
    ap.add_argument("--rascunho", action="store_true")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--cta", default="Salve este post para estudar quando precisar.")
    ap.add_argument("--pular", nargs="*", default=[])
    ap.add_argument("--antes", type=float, default=0.95, help="segundos antes do fim da cena (antes do fade de limpeza)")
    a = ap.parse_args()
    src = a.file.resolve()
    modo = "preview" if a.preview else "rascunho" if a.rascunho else "final"
    sub = modo + ("_v" if a.vertical else "")
    saida = src.parent / "out" / "carrossel"
    saida.mkdir(parents=True, exist_ok=True)
    tmp = saida / "_quadro.png"
    cenas = []
    for nome in render.scene_names(src):
        achados = [p for p in (src.parent / "media" / sub).rglob(f"{nome}.mp4") if "partial_movie_files" not in p.parts]
        if achados:
            cenas.append((nome, max(achados, key=lambda p: p.stat().st_mtime)))
    if not cenas:
        sys.exit(f"nenhuma cena renderizada em media/{sub} (rode o render.py antes)")
    capa = quadro(cenas[0][1], 0.0, tmp)
    v0 = cenas[0][1]
    ref = conteudo(melhor_quadro(v0, render.video_duration(v0), tmp, a.antes))
    tem_capa = conteudo(capa) > 0.5 * ref          # 1º quadro só com o fundo do estilo não é capa
    slides = [slide(capa, a.vertical)] if tem_capa else []    # sem capa no 1º quadro: começa nas cenas
    for nome, v in cenas:
        if nome in a.pular:
            continue
        slides.append(slide(melhor_quadro(v, render.video_duration(v), tmp, a.antes), a.vertical))
    slides.append(cta(slides[1] if len(slides) > 1 else slides[0], a.cta))
    tmp.unlink(missing_ok=True)
    for velho in saida.glob("*.png"):
        velho.unlink()
    total = len(slides)
    for k, s in enumerate(slides, 1):
        if (k > 1 or not tem_capa) and k < total:      # numera as cenas (capa e chamada final sem número)
            s = numera(s, k, total)
        s.save(saida / f"{k:02d}.png")
    print(f"{total} slides em {saida}")


if __name__ == "__main__":
    main()
