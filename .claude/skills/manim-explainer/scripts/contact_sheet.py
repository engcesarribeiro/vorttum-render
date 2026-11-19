"""Monta uma folha de frames (grade) para cada vídeo, para revisar layout sem assistir.

Uso:
    python contact_sheet.py VIDEO.mp4 [VIDEO2.mp4 ...] [--n 12] [--cols 4] [--out DIR]

Gera <out>/<nome>_sheet.png com N frames igualmente espaçados, lidos da esquerda
para a direita, de cima para baixo. Imprime o caminho de cada PNG e os tempos dos frames.
"""
import argparse
import subprocess
from pathlib import Path


def duration(video: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout)


def sheet(video: Path, n: int, cols: int, out_dir: Path, width: int) -> Path:
    dur = duration(video)
    n = -(-n // cols) * cols            # completa a última linha da grade
    # evita o 1º e o último instante (costumam ser tela vazia do fade)
    times = [dur * (i + 0.5) / n for i in range(n)]
    out = out_dir / f"{video.stem}_sheet.png"
    inputs = []
    for t in times:
        inputs += ["-ss", f"{t:.3f}", "-i", str(video)]

    def pos(i):
        c, r = i % cols, i // cols
        return f"{'+'.join(['w0'] * c) or '0'}_{'+'.join(['h0'] * r) or '0'}"

    scaled = "".join(f"[{i}:v]scale={width}:-2,setsar=1[v{i}];" for i in range(n))
    stack = "".join(f"[v{i}]" for i in range(n))
    graph = f"{scaled}{stack}xstack=inputs={n}:layout={'|'.join(pos(i) for i in range(n))}"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-frames:v", "1", str(out)],
        check=True,
    )
    print(f"{out}  tempos: " + ", ".join(f"{t:.1f}s" for t in times))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+", type=Path)
    ap.add_argument("--n", type=int, default=12)
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--width", type=int, default=480)
    ap.add_argument("--out", type=Path, default=None)
    a = ap.parse_args()
    for v in a.videos:
        out_dir = a.out or v.parent / "sheets"
        out_dir.mkdir(parents=True, exist_ok=True)
        sheet(v, a.n, a.cols, out_dir, a.width)


if __name__ == "__main__":
    main()
