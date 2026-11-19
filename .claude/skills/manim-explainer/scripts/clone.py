"""Põe o vídeo do seu clone de IA (HeyGen ou outro) num círculo no canto do vídeo final.

Uso:
    python clone.py out/video_vertical_final_celular.mp4 clone.mp4 [--pos baixo-esq|baixo-dir|cima-esq|cima-dir]
                    [--tamanho 0.34] [--inicio 0] [--audio video|clone] [--borda "#F5B82E"]

--tamanho: diâmetro como fração da largura do vídeo. --inicio: segundo em que o clone aparece.
--audio video (padrão): mantém a narração do vídeo; "clone": usa a fala do clone no lugar.
No 9:16 o círculo fica acima da faixa do rodapé coberta pela interface do Reels.
Saída: <video>_clone.mp4 ao lado do original.
"""
import argparse
import subprocess
from pathlib import Path


def dims(v: Path) -> tuple[int, int]:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0:s=x", str(v)], capture_output=True, text=True, check=True)
    w, h = out.stdout.strip().split("\n")[0].split("x")[:2]
    return int(w), int(h)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("clone", type=Path)
    ap.add_argument("--pos", default="baixo-esq", choices=["baixo-esq", "baixo-dir", "cima-esq", "cima-dir"])
    ap.add_argument("--tamanho", type=float, default=0.34)
    ap.add_argument("--inicio", type=float, default=0.0)
    ap.add_argument("--audio", default="video", choices=["video", "clone"])
    ap.add_argument("--borda", default="#F5B82E")
    a = ap.parse_args()
    W, H = dims(a.video)
    vertical = H > W
    d = int(round(W * a.tamanho / 2)) * 2
    b = max(4, d // 40)                    # espessura da borda
    m = int(W * 0.06)
    baixo = int(H * (0.20 if vertical else 0.04)) + m // 2     # acima da interface do Reels no 9:16
    cima = int(H * (0.13 if vertical else 0.04))
    x = m if a.pos.endswith("esq") else W - d - m
    y = (H - d - baixo) if a.pos.startswith("baixo") else cima
    r = d / 2
    borda = a.borda.lstrip("#")
    filtro = (
        f"[1:v]setpts=PTS-STARTPTS+{a.inicio}/TB,scale={d}:{d}:force_original_aspect_ratio=increase,crop={d}:{d},"
        f"format=yuva420p,geq=lum='p(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':"
        f"a='if(lte((X-{r})*(X-{r})+(Y-{r})*(Y-{r}),{(r - b) ** 2}),255,0)'[cl];"
        f"color=c=0x{borda}:s={d}x{d},format=yuva420p,geq=lum='p(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':"
        f"a='if(lte((X-{r})*(X-{r})+(Y-{r})*(Y-{r}),{r * r}),255,0)'[anel];"
        f"[0:v][anel]overlay={x}:{y}:enable='gte(t,{a.inicio})':shortest=1[v1];"
        f"[v1][cl]overlay={x}:{y}:eof_action=pass[v]"
    )
    dest = a.video.with_name(a.video.stem + "_clone.mp4")
    mapa_audio = ["-map", "0:a?"] if a.audio == "video" else ["-map", "1:a?"]
    adelay = [] if a.audio == "video" or a.inicio == 0 else ["-af", f"adelay={int(a.inicio * 1000)}:all=1"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(a.video), "-i", str(a.clone), "-filter_complex", filtro,
                    "-map", "[v]", *mapa_audio, *adelay, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(dest)], check=True)
    print(f"VÍDEO COM CLONE: {dest}")


if __name__ == "__main__":
    main()
