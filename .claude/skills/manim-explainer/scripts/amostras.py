"""Gera 3 amostras de narração (30–40 s cada: começo, meio e fim do roteiro) para o usuário
ouvir, se quiser, antes do render. Serve para conferir voz, ritmo e pronúncia.

Uso:
    python amostras.py roteiro.md [--voz pt-BR-ThalitaMultilingualNeural] [--out amostras/]
"""
import argparse
import os
import re
import subprocess
import sys
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("roteiro", type=Path)
    ap.add_argument("--voz", default="pt-BR-ThalitaMultilingualNeural")
    ap.add_argument("--out", type=Path, default=Path("amostras"))
    ap.add_argument("--alvo", type=float, default=35.0, help="segundos por amostra")
    a = ap.parse_args()
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "template"))
    os.environ.setdefault("EXPLAINER_TTS_DIR", str(a.out / "tts"))
    import explainer as ex

    txt = a.roteiro.read_text("utf-8")
    falas = [(b.split()[0], f) for b in re.split(r"^### ", txt, flags=re.M)[1:]
             for f in re.findall(r"^\*\*Fala \d+:\*\* (.*)$", b, flags=re.M)]
    a.out.mkdir(parents=True, exist_ok=True)
    for nome, ini in (("1-comeco", 0), ("2-meio", len(falas) // 2), ("3-fim", max(0, len(falas) - 4))):
        parts, dur, cenas = [], 0.0, []
        for cena, f in falas[ini:]:
            if dur >= a.alvo - 5:
                break
            mp3, d, _ = ex._synthesize(f, a.voz, "+0%")
            parts.append(mp3); dur += d; cenas.append(cena)
        ins = sum((["-i", str(p)] for p in parts), [])
        g = "".join(f"[{i}:a]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[a]"
        dest = a.out / f"amostra-{nome}.mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", g, "-map", "[a]", "-q:a", "3", str(dest)],
                       check=True)
        print(f"{dest}  {dur:.0f}s  cenas {cenas[0]}–{cenas[-1]}")


if __name__ == "__main__":
    main()
