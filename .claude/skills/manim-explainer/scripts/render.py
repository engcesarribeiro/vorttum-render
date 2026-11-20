"""Renderiza todas as cenas de um arquivo, na ordem em que aparecem, e junta num MP4 só.

Uso:
    python render.py video.py                 # prévia rápida (480p15)
    python render.py video.py --final         # 1080p30
    python render.py video.py --final --fps 60   # 1080p60 (o _celular.mp4 sai em 60 fps também)
    python render.py video.py --rascunho      # 540p30 com voz: revisar antes do final (bem mais rápido)
    python render.py video.py --jobs 3        # renderiza 3 cenas ao mesmo tempo
    python render.py video.py --vertical      # 9:16 (1080x1920 no final, 540x960 na prévia)
    python render.py video.py --only S03_Det  # uma cena só, sem juntar
    python render.py video.py --no-tts        # sem narração (tempo estimado pelo texto)
    python render.py video.py --final --vertical --concat-only   # só refaz a junção
    python render.py video.py --musica trilha.mp3 --musica-volume -22   # trilha de fundo (ou MUSICA no video.py)

Saída: <pasta do projeto>/out/<arquivo>[_vertical]_{preview|final}.mp4
Com --final também sai <...>_final_celular.mp4 (30 fps, AAC 44,1 kHz, volume em -16 LUFS):
é esse que se entrega, pois o master (48 kHz) pode tocar mudo no celular.
Cenas que falham (ex.: o serviço de voz não devolveu áudio) são refeitas até --tentativas vezes.
Avisos [layout], [espaço] e [caixa] do template e erros de cada cena são resumidos no fim.
Efeitos sonoros: self.som() no Manim e <Som> no Remotion (o áudio do Remotion é somado à voz da cena).
Música: MUSICA = "trilha.mp3" (e MUSICA_VOLUME = -20) no video.py; entra na junção, com ducking sob a voz.

Cada cena roda num processo próprio com timeout: no Windows o Manim às vezes
fica travado depois de um erro em vez de encerrar.
"""
import argparse
import os
import re
import subprocess
import sys
from pathlib import Path


def scene_names(src: Path) -> list[str]:
    """Classes de cena na ordem do arquivo (herdeiras de ExplainerScene/Scene, direta ou indiretamente).

    Classes com nome começando em "_" são bases compartilhadas e não são renderizadas.
    """
    known = {"ExplainerScene", "RemotionScene", "LousaInfinitaScene", "Scene", "ThreeDScene", "MovingCameraScene"}
    found = []
    for name, base in re.findall(r"^class\s+(\w+)\s*\(\s*(\w+)\s*\)", src.read_text("utf-8"), re.M):
        if base in known:
            known.add(name)
            if not name.startswith("_"):
                found.append(name)
    return found


def modo(args) -> str:
    return "final" if args.final else "rascunho" if args.rascunho else "preview"


def render(src: Path, scene: str, args, media: Path) -> tuple[Path | None, list[str]]:
    if args.final:
        quality = ["--resolution", "1080,1920" if args.vertical else "1920,1080", "--frame_rate", str(args.fps or 30)]
    elif args.rascunho:
        quality = ["--resolution", "540,960" if args.vertical else "960,540", "--frame_rate", "30"]
    else:
        quality = ["--resolution", "540,960" if args.vertical else "854,480", "--frame_rate", "15"]
    sub = modo(args) + ("_v" if args.vertical else "")
    inicio = __import__("time").time()
    out_dir = media / sub / scene       # pasta própria por cena: cenas em paralelo não disputam o cache do LaTeX
    cmd = [sys.executable, "-m", "manim", "render", *quality, "--media_dir", str(out_dir),
           "--disable_caching", str(src.name), scene]
    # COLUMNS largo: o log do Manim (rich) quebra linhas e cortaria os avisos [layout]
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "COLUMNS": "300"}
    if args.no_tts:
        env["EXPLAINER_TTS"] = "off"
    try:
        p = subprocess.run(cmd, cwd=src.parent, env=env, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=args.timeout)
        log = p.stdout + p.stderr
        ok = p.returncode == 0
    except subprocess.TimeoutExpired as e:
        log = (e.stdout or "") + (e.stderr or "") if isinstance(e.stdout, str) else ""
        log += f"\nTIMEOUT após {args.timeout}s (provável erro dentro da cena; rode só ela com --only)"
        ok = False
    notes = sorted(set(re.findall(r"\[(?:layout|espaço|caixa|vazio)\][^\n│]*", log)))
    # Manim grava em <media_dir>/videos/<arquivo>/<altura>p<fps>/<Cena>.mp4
    found = [p for p in (out_dir / "videos").rglob(f"{scene}.mp4") if "partial_movie_files" not in p.parts]
    video = max(found, key=lambda p: p.stat().st_mtime) if found else None
    if not ok or video is None:
        tail = "\n".join(l for l in log.splitlines() if l.strip())[-2500:]
        notes.append(f"FALHOU:\n{tail}")
        return None, notes
    tempos = src.parent / "media" / "remotion" / f"{scene}.json"
    if tempos.exists() and tempos.stat().st_mtime >= inicio:
        ok, msg = remotion(src, scene, video, tempos, args)
        notes.append(msg)
        if not ok:
            return None, notes
    return video, notes


def _chrome() -> str | None:
    """Chrome/Chromium para o Remotion (CHROME_PATH tem prioridade; senão usa o que achar)."""
    import shutil
    for c in (os.environ.get("CHROME_PATH"), shutil.which("google-chrome"), shutil.which("chromium"),
              shutil.which("chromium-browser"), "/usr/bin/google-chrome"):
        if c and Path(c).exists():
            return c
    return None


import threading
_NPM = threading.Lock()      # cenas em paralelo: só uma instala as dependências do Remotion


def remotion(src: Path, scene: str, video: Path, tempos: Path, args) -> tuple[bool, str]:
    """Renderiza a composição do Remotion com os tempos da voz e troca a imagem do MP4 da cena.

    A composição é desenhada em 1080x1920 (ou 1920x1080); prévia e rascunho saem com --scale=0.5.
    O áudio continua o do Manim (mesma voz, mesmo cache), então a junção e a sincronia não mudam.
    """
    import json
    proj = src.parent / "remotion"
    if not (proj / "package.json").exists():
        return False, f"FALHOU: {scene} é RemotionScene, mas não existe {proj} (copie <skill>/template/remotion)"
    with _NPM:
        if not (proj / "node_modules").exists():
            cmd = ["npm", "ci" if (proj / "package-lock.json").exists() else "install", "--no-audit", "--no-fund"]
            p = subprocess.run(cmd, cwd=proj, capture_output=True, text=True, shell=os.name == "nt")
            if p.returncode != 0:
                return False, f"FALHOU: npm na pasta remotion\n{(p.stdout + p.stderr)[-1500:]}"
    dados = json.loads(tempos.read_text("utf-8"))
    escala = 1.0 if args.final else 0.5
    bruto = video.with_name(f"{scene}_remotion.mp4")
    cmd = ["npx", "remotion", "render", "src/index.ts", dados["composicao"], str(bruto),
           f"--props={tempos.resolve()}", f"--scale={escala}", "--codec=h264", "--crf=18",
           "--x264-preset=veryfast", "--log=error", f"--concurrency={max(1, (os.cpu_count() or 2) // max(1, args.jobs))}"]
    chrome = _chrome()
    if chrome:
        cmd.append(f"--browser-executable={chrome}")
    try:
        p = subprocess.run(cmd, cwd=proj, capture_output=True, text=True, timeout=args.timeout, shell=os.name == "nt")
    except subprocess.TimeoutExpired:
        return False, f"FALHOU: Remotion passou de {args.timeout}s em {scene}"
    if p.returncode != 0 or not bruto.exists():
        return False, f"FALHOU: Remotion em {scene}\n{(p.stdout + p.stderr)[-2000:]}"
    # mesma resolução, fps e codificação das cenas Manim: a junção copia sem recodificar
    w, h = dados["largura"], dados["altura"]
    fps = dados["fps"]
    dur = video_duration(video)
    final = video.with_name(f"{scene}_mix.mp4")
    voz, sfx = has_audio(video), has_audio(bruto) and not silencioso(bruto)
    entradas = ["-i", str(bruto)] + (["-i", str(video)] if voz else [])
    vf = f"scale={w}:{h}:flags=lanczos,fps={fps},tpad=stop_mode=clone:stop_duration=2"
    # áudio recodificado (não copiado): mantém a marca de início do AAC, senão a voz da cena atrasa ~20 ms
    if voz and sfx:      # efeitos sonoros do Remotion (<Som>) somados à voz do Manim, sem baixar o volume da voz
        filtro = ["-filter_complex", f"[0:v]{vf}[v];[1:a]aresample=48000,apad[a1];[0:a]aresample=48000,apad[a0];"
                                     f"[a1][a0]amix=inputs=2:normalize=0:duration=first[a]",
                  "-map", "[v]", "-map", "[a]"]
    else:
        filtro = ["-vf", vf, "-map", "0:v"] + (["-map", "1:a"] if voz else ["-map", "0:a"] if sfx else [])
    cod_a = ["-c:a", "aac", "-b:a", "192k"] if (voz or sfx) else []
    subprocess.run(["ffmpeg", "-v", "error", "-y", *entradas, *filtro, *cod_a,
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-t", f"{dur:.6f}", str(final)], check=True)
    final.replace(video)
    bruto.unlink(missing_ok=True)
    return True, f"remotion: {dados['composicao']} ({dados['estilo']}) no lugar da imagem de {scene}"


def has_audio(video: Path) -> bool:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index",
                          "-of", "csv=p=0", str(video)], capture_output=True, text=True)
    return bool(out.stdout.strip())


def silencioso(video: Path) -> bool:
    """True se a trilha de áudio é só silêncio (o Remotion grava áudio mudo quando a cena não tem <Som>)."""
    out = subprocess.run(["ffmpeg", "-v", "info", "-i", str(video), "-map", "0:a", "-af", "volumedetect", "-f", "null", "-"],
                         capture_output=True, text=True)
    m = re.search(r"max_volume:\s*(-?[\d.]+|-inf) dB", out.stderr)
    return not m or m.group(1) == "-inf" or float(m.group(1)) < -70


def musica_do_video(src: Path, args) -> tuple[Path | None, float]:
    """Trilha de fundo: --musica ou MUSICA = "arquivo" no video.py (caminho relativo à pasta do vídeo).

    Volume em dB (--musica-volume ou MUSICA_VOLUME, padrão -20). --sem-musica desliga.
    """
    if args.sem_musica:
        return None, 0.0
    txt = src.read_text("utf-8")
    nome = args.musica or (m.group(1) if (m := re.search(r"^MUSICA\s*=\s*[\"'](.+?)[\"']", txt, re.M)) else None)
    if not nome:
        return None, 0.0
    vol = args.musica_volume
    if vol is None:
        m = re.search(r"^MUSICA_VOLUME\s*=\s*(-?[\d.]+)", txt, re.M)
        vol = float(m.group(1)) if m else -20.0
    arq = (src.parent / nome).resolve()
    if not arq.exists():
        print(f"AVISO: música {arq} não encontrada; vídeo sai sem trilha")
        return None, 0.0
    return arq, vol


def mistura_musica(voz: Path, musica: Path, volume_db: float, dest: Path):
    """Põe a trilha embaixo da voz: repete até o fim, baixa sozinha quando há fala (ducking), entra e sai em fade."""
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(voz)],
                               capture_output=True, text=True, check=True).stdout.strip())
    fim = max(0.0, dur - 1.5)
    filtro = (f"[1:a]aresample=48000,aformat=channel_layouts=stereo,volume={volume_db}dB,"
              f"afade=t=in:st=0:d=0.8,afade=t=out:st={fim:.3f}:d=1.5,atrim=end={dur:.3f}[m];"
              f"[0:a]asplit=2[v][k];"
              f"[m][k]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=350:makeup=1[md];"
              f"[v][md]amix=inputs=2:normalize=0:duration=first[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(voz), "-stream_loop", "-1", "-i", str(musica),
                    "-filter_complex", filtro, "-map", "[a]", "-c:a", "pcm_s16le", str(dest)], check=True)


def video_duration(video: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=duration",
                          "-of", "csv=p=0", str(video)], capture_output=True, text=True, check=True)
    # o ffprobe pode devolver campos extras ("13.8," quando o vídeo tem side data): pega o 1º número
    return float(re.split(r"[,\s]+", out.stdout.strip())[0])


def concat(videos: list[Path], dest: Path, musica: tuple[Path | None, float] = (None, 0.0)):
    """Junta as cenas num MP4 só, com o áudio de cada cena alinhado ao vídeo dela.

    O áudio de cada cena costuma acabar antes do vídeo (o fade final é mudo), então cada trilha é
    completada com silêncio até a duração exata do vídeo da cena. As trilhas são emendadas em WAV
    (amostra por amostra) e codificadas em AAC uma vez só, no fim. Codificar cada cena em AAC e emendar
    os pedaços atrasava a voz ~30 ms a cada cena (cada AAC começa com um silêncio do codificador):
    em 41 cenas, mais de 1 s no final. O vídeo é emendado sem recodificar (concat demuxer); abrir
    todas as cenas num filtro só estourou a memória do GitHub com 41 cenas em 1080p.
    """
    tmp = dest.parent / "_juncao"
    tmp.mkdir(parents=True, exist_ok=True)
    taxa = 48000
    wavs = []
    for i, v in enumerate(videos):
        amostras = int(round(video_duration(v) * taxa))
        wav = tmp / f"{i:03d}.wav"
        if has_audio(v):
            entrada = ["-i", str(v), "-map", "0:a"]
        else:
            entrada = ["-f", "lavfi", "-i", f"anullsrc=r={taxa}:cl=stereo"]
        subprocess.run(["ffmpeg", "-v", "error", "-y", *entrada,
                        "-af", f"aformat=sample_rates={taxa}:channel_layouts=stereo,apad=whole_len={amostras},"
                               f"atrim=end_sample={amostras}",
                        "-c:a", "pcm_s16le", str(wav)], check=True)
        wavs.append(wav)
    lista_a, lista_v = tmp / "audio.txt", tmp / "video.txt"
    lista_a.write_text("".join(f"file '{p.resolve()}'\n" for p in wavs), "utf-8")
    lista_v.write_text("".join(f"file '{Path(v).resolve()}'\n" for v in videos), "utf-8")
    audio = tmp / "audio.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista_a),
                    "-c", "copy", str(audio)], check=True)
    if musica[0]:
        com_musica = tmp / "audio_musica.wav"
        mistura_musica(audio, musica[0], musica[1], com_musica)
        com_musica.replace(audio)
        print(f"   música: {musica[0].name} ({musica[1]:+.0f} dB, baixa durante a fala)")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista_v), "-i", str(audio),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", str(dest)], check=True)
    for p in (*wavs, audio, lista_a, lista_v):
        p.unlink()


def celular(master: Path, fps: int = 30) -> Path:
    """Cópia para celular: 30 fps, AAC 44,1 kHz estéreo, volume normalizado."""
    dest = master.with_name(master.stem + "_celular.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(master), "-c:v", "libx264", "-preset", "veryfast",
                    "-profile:v", "high", "-level", "4.2", "-pix_fmt", "yuv420p", "-r", str(fps), "-crf", "20",
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2",
                    "-movflags", "+faststart", str(dest)], check=True)
    return dest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file", type=Path)
    ap.add_argument("--final", action="store_true")
    ap.add_argument("--fps", type=int, help="quadros por segundo do final (padrão 30; ex.: 60)")
    ap.add_argument("--vertical", action="store_true")
    ap.add_argument("--rascunho", action="store_true", help="540p30 com voz, para revisar antes do final")
    ap.add_argument("--jobs", type=int, default=1, help="cenas renderizadas ao mesmo tempo")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--no-tts", action="store_true")
    ap.add_argument("--timeout", type=int, default=900, help="segundos por cena")
    ap.add_argument("--tentativas", type=int, default=3, help="vezes que uma cena com falha é refeita")
    ap.add_argument("--musica", help="trilha de fundo (sobrepõe MUSICA do video.py)")
    ap.add_argument("--musica-volume", type=float, help="volume da trilha em dB (padrão -20)")
    ap.add_argument("--sem-musica", action="store_true", help="ignora a MUSICA do video.py")
    ap.add_argument("--concat-only", action="store_true",
                    help="só junta os MP4 de cena já renderizados (depois de re-renderizar uma cena com --only)")
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")   # console cp1252 no Windows

    src = args.file.resolve()
    media = src.parent / "media"
    scenes = args.only or scene_names(src)
    if not scenes:
        sys.exit("nenhuma cena encontrada (classes devem herdar de ExplainerScene)")

    if args.concat_only:
        sub = modo(args) + ("_v" if args.vertical else "")
        def ultimo(s):
            achados = [p for p in (media / sub).rglob(f"{s}.mp4") if "partial_movie_files" not in p.parts]
            return max(achados, key=lambda p: p.stat().st_mtime)
        vids = [ultimo(s) for s in scene_names(src)]
        out = src.parent / "out" / f"{src.stem}{'_vertical' if args.vertical else ''}_{modo(args)}.mp4"
        out.parent.mkdir(exist_ok=True)
        concat(vids, out, musica_do_video(src, args))
        print(f"VÍDEO: {out}")
        if args.final or args.rascunho:
            print(f"CELULAR: {celular(out, (args.fps or 30) if args.final else 30)}")
        return

    results, failed = {}, []
    pending = list(scenes)
    for tentativa in range(1, max(1, args.tentativas) + 1):
        failed = []
        if tentativa > 1:
            print(f"\nTentativa {tentativa} para: {', '.join(pending)}", flush=True)
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=max(1, args.jobs)) as ex:
            futs = {s: ex.submit(render, src, s, args, media) for s in pending}
            for s in pending:                       # resultados na ordem do vídeo
                video, notes = futs[s].result()
                print(f"→ {s}", flush=True)
                for n in notes:
                    print(f"   {n}")
                if video:
                    results[s] = video
                    print(f"   ok: {video}", flush=True)
                else:
                    failed.append(s)
        if not failed:
            break
        pending = failed
    rendered = [results[s] for s in scenes if s in results]

    if failed:
        print(f"\n{len(failed)} cena(s) falharam: {', '.join(failed)}")
    if args.only or failed or not rendered:
        sys.exit(1 if failed else 0)

    out = src.parent / "out" / f"{src.stem}{'_vertical' if args.vertical else ''}_{modo(args)}.mp4"
    out.parent.mkdir(exist_ok=True)
    concat(rendered, out, musica_do_video(src, args))
    print(f"\nVÍDEO: {out}")
    if args.final or args.rascunho:
        print(f"CELULAR: {celular(out, (args.fps or 30) if args.final else 30)}")


if __name__ == "__main__":
    main()
