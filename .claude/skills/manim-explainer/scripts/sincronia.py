"""Confere se a voz do vídeo final está alinhada com a de cada cena (sem cortes nem atraso).

Uso (na pasta do projeto, depois do render final):
    python sincronia.py video.py [--vertical] [--rascunho]

Compara, cena a cena, onde há voz no MP4 da cena e no trecho correspondente do vídeo final.
Abaixo de ~99% numa cena, algo cortou ou deslocou o áudio: não entregue.
"""
import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render  # noqa: E402


def pcm(f) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def voz(x: np.ndarray) -> np.ndarray:
    n = len(x) // 320
    return np.sqrt((x[:n * 320].reshape(n, 320) ** 2).mean(1)) > 0.01


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file", type=Path)
    ap.add_argument("--vertical", action="store_true")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--rascunho", action="store_true")
    a = ap.parse_args()
    src = a.file.resolve()
    modo = "preview" if a.preview else "rascunho" if a.rascunho else "final"
    sub = modo + ("_v" if a.vertical else "")
    final = src.parent / "out" / f"{src.stem}{'_vertical' if a.vertical else ''}_{modo}.mp4"
    x, off, pior = pcm(final), 0.0, 100.0
    for nome in render.scene_names(src):
        # render.py grava cada cena em media/<modo>/<Cena>/videos/...
        achados = [p for p in (src.parent / "media" / sub).rglob(f"{nome}.mp4") if "partial_movie_files" not in p.parts]
        cena = max(achados, key=lambda p: p.stat().st_mtime)
        d = render.video_duration(cena)
        va, vb = voz(pcm(cena)), voz(x[int(round(off * 16000)):int(round((off + d) * 16000))])
        m = min(len(va), len(vb))
        pct = (va[:m] == vb[:m]).mean() * 100
        pior = min(pior, pct)
        print(f"{nome:28s} {pct:5.1f}%")
        off += d
    print(f"\npior cena: {pior:.1f}%  ->  {'OK' if pior >= 99 else 'PROBLEMA: confira a junção'}")


if __name__ == "__main__":
    main()
