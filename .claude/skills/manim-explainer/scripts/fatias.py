"""Render em fatias: divide as cenas longas em pedaços para renderizar em várias máquinas ao mesmo tempo.

Uso (na pasta do vídeo, depois do pre_voz.py, com as vozes em media/tts):
    python fatias.py plano video.py --fps 60 --alvo 35 --out planos      # imprime a matriz (JSON) das tarefas
    python fatias.py juntar video.py --sub final --planos planos           # monta cada cena fatiada em media/<sub>/

Como funciona:
- plano: roda cada cena Manim pulando todas as animações (-n 999999, só a lógica, sem desenhar), com
  EXPLAINER_PLANO ligado. O template grava a duração de cada play e onde começa cada fala. As cenas são
  cortadas em fatias de ~alvo segundos (cada fatia = plays a..b). Cenas Remotion e cenas curtas ficam inteiras.
- cada máquina renderiza uma fatia: render.py ... --only Cena --fatia a,b  (manim -n a,b).
- juntar: emenda as fatias de cada cena (sem recodificar) e monta o áudio da cena a partir das falas do plano
  (mesmo mp3 da voz, no instante em que a fala começa). A cena montada fica como media/<sub>/<Cena>.mp4,
  onde o render.py --concat-only a encontra.
Cada corte entre fatias pode perder 1 quadro (o Manim conta o tempo pulado sem arredondar para quadros).
"""
import argparse
import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render  # noqa: E402


def classes_remotion(src: Path) -> set[str]:
    """Nomes das cenas RemotionScene (herança direta ou indireta), lendo o video.py como texto."""
    import re
    rem = {"RemotionScene"}
    for nome, base in re.findall(r"^class\s+(\w+)\s*\(\s*(\w+)\s*\)", src.read_text("utf-8"), re.M):
        if base in rem:
            rem.add(nome)
    return rem - {"RemotionScene"}


def plano(args):
    src = args.file.resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    rem = classes_remotion(src)
    tarefas = []
    for cena in render.scene_names(src):
        if cena in rem:
            tarefas.append({"cena": cena, "fatia": "", "id": cena})
            continue
        env = {**os.environ, "EXPLAINER_PLANO": str(out), "PYTHONIOENCODING": "utf-8"}
        cmd = [sys.executable, "-m", "manim", "render", "-r", "36,64" if args.vertical else "64,36", "--frame_rate", str(args.fps),
               "--disable_caching", "--media_dir", str(out / "_m"), "-n", "999999", src.name, cena]
        p = subprocess.run(cmd, cwd=src.parent, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
        arq = out / f"{cena}.json"
        if p.returncode != 0 or not arq.exists():
            print((p.stdout + p.stderr)[-2000:], file=sys.stderr)
            sys.exit(f"plano falhou em {cena}")
        d = json.loads(arq.read_text("utf-8"))
        plays, total = d["plays"], d["duracao"]
        if total <= args.alvo * 1.4:
            tarefas.append({"cena": cena, "fatia": "", "id": cena})
            continue
        n = max(2, round(total / args.alvo))
        alvo = total / n
        cortes, acum, ini = [], 0.0, 0
        for k, dur in enumerate(plays):
            acum += dur
            if acum >= alvo * (len(cortes) + 1) and k < len(plays) - 1 and len(cortes) < n - 1:
                cortes.append((ini, k))
                ini = k + 1
        cortes.append((ini, len(plays) - 1))
        d["fatias"] = [f"{a},{b}" for a, b in cortes]
        arq.write_text(json.dumps(d, ensure_ascii=False), "utf-8")
        for a, b in cortes:
            tarefas.append({"cena": cena, "fatia": f"{a},{b}", "id": f"{cena}__{a:04d}"})
        print(f"{cena}: {total:.1f}s em {len(cortes)} fatias {d['fatias']}", file=sys.stderr)
    print(json.dumps(tarefas))


def dur(v: Path) -> float:
    return render.video_duration(v)


def juntar(args):
    src = args.file.resolve()
    media = src.parent / "media" / args.sub
    planos = Path(args.planos).resolve()
    for arq in sorted(planos.glob("*.json")):
        d = json.loads(arq.read_text("utf-8"))
        if not d.get("fatias"):
            continue
        cena = d["cena"]
        partes = []
        for f in d["fatias"]:
            a = int(f.split(",")[0])
            achados = list(media.rglob(f"{cena}__{a:04d}.mp4"))
            if not achados:
                sys.exit(f"falta a fatia {cena} {f}")
            partes.append(achados[0])
        tmp = media / f"_{cena}"
        tmp.mkdir(parents=True, exist_ok=True)
        # cada fatia sai do Manim com o áudio das falas que começam nela, e esse áudio passa do fim do vídeo:
        # emendando com áudio, a imagem congela até o áudio acabar. Tira o áudio de cada fatia antes.
        mudas = []
        for k, p in enumerate(partes):
            m = tmp / f"p{k:03d}.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(p), "-an", "-c:v", "copy", str(m)], check=True)
            mudas.append(m)
        lista = tmp / "lista.txt"
        lista.write_text("".join(f"file '{p.resolve()}'\n" for p in mudas), "utf-8")
        mudo = tmp / "video.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista),
                        "-an", "-c:v", "copy", str(mudo)], check=True)
        D = dur(mudo)
        # áudio da cena: cada fala no instante em que começa (do plano), somadas e completadas até D
        falas = [f for f in d["falas"] if f[1]]
        dest = media / f"{cena}.mp4"
        if not falas:
            mudo.replace(dest)
            continue
        entradas, filtros = [], []
        for i, (ini, mp3, _) in enumerate(falas):
            entradas += ["-i", str((src.parent / mp3).resolve())]
            ms = max(0, round(ini * 1000))
            filtros.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[a{i}]")
        mix = "".join(f"[a{i}]" for i in range(len(falas)))
        filtros.append(f"{mix}amix=inputs={len(falas)}:normalize=0:duration=longest,apad,atrim=end={D:.6f}[voz]")
        audio = tmp / "voz.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", *entradas, "-filter_complex", ";".join(filtros),
                        "-map", "[voz]", "-c:a", "pcm_s16le", str(audio)], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(audio), "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{D:.6f}", str(dest)], check=True)
        print(f"{cena}: {len(partes)} fatias, {D:.2f}s (plano {d['duracao']:.2f}s) -> {dest}")


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    p1 = sp.add_parser("plano")
    p1.add_argument("file", type=Path)
    p1.add_argument("--fps", type=int, default=60)
    p1.add_argument("--alvo", type=float, default=35.0, help="segundos de vídeo por fatia")
    p1.add_argument("--out", default="planos")
    p1.add_argument("--vertical", action="store_true")
    p2 = sp.add_parser("juntar")
    p2.add_argument("file", type=Path)
    p2.add_argument("--sub", required=True, help="subpasta de media (ex.: final, rascunho, final_v)")
    p2.add_argument("--planos", default="planos")
    a = ap.parse_args()
    plano(a) if a.cmd == "plano" else juntar(a)


if __name__ == "__main__":
    main()
