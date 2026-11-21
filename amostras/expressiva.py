"""Amostra da voz: as mesmas falas do roteiro com a voz expressiva (pausas e ênfase) e com a voz de antes.

Uso (na raiz do repo): python amostras/expressiva.py videos/<video> A00:1 A07:13 A07:14 ...
Gera /tmp/out/<video>_nova.mp3 e /tmp/out/<video>_antes.mp3 (0,6 s de respiro entre as falas).
"""
import importlib
import os
import subprocess
import sys
from pathlib import Path

pasta = Path(sys.argv[1]).resolve()
alvos = [a.split(":") for a in sys.argv[2:]]
os.chdir(pasta)
sys.path.insert(0, str(pasta))
Path("/tmp/out").mkdir(exist_ok=True)
nome = pasta.name
for modo in ("nova", "antes"):
    os.environ["EXPLAINER_VOZ_EXPRESSIVA"] = "on" if modo == "nova" else "off"
    os.environ["EXPLAINER_TTS_DIR"] = f"/tmp/tts_{modo}"
    import explainer
    importlib.reload(explainer)
    explainer.TTS_DIR = Path(f"/tmp/tts_{modo}")
    F = explainer.falas_do_roteiro(pasta / "roteiro.md")
    spec = importlib.util.spec_from_file_location("video_amostra", pasta / "video.py")
    voz, taxa = explainer.ExplainerScene.VOICE, "+5%"
    arquivos = []
    for cena, k in alvos:
        txt = F(cena, int(k))
        taxa_c = "+0%" if cena == "A00" else ("+10%" if cena in ("A01", "A09") else "+5%")
        mp3, dur, _ = explainer._synthesize(txt, voz, taxa_c)
        arquivos.append(mp3)
        print(modo, cena, k, f"{dur:.2f}s", flush=True)
    lista = Path(f"/tmp/lista_{modo}.txt")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", "0.6", "-i", "anullsrc=r=24000:cl=mono",
                    "-c:a", "libmp3lame", "/tmp/pausa.mp3"], check=True)
    lista.write_text("".join(f"file '{a}'\nfile '/tmp/pausa.mp3'\n" for a in arquivos))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista),
                    "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", f"/tmp/out/{nome}_{modo}.mp3"], check=True)
print("ok")
