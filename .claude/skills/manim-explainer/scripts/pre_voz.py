"""Gera as vozes de todas as falas do roteiro, uma de cada vez, antes de renderizar as cenas.

Rodar dentro da pasta do vídeo (onde estão explainer.py e roteiro.md): python pre_voz.py [A01 A02 ...]
Com ids (A01 A02...), gera só as falas dessas cenas.
O serviço de voz recusa pedidos quando várias cenas pedem ao mesmo tempo ("No audio was received").
Gerando antes, em fila e com novas tentativas, o render das cenas só lê do cache (media/tts).
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path.cwd()))
import explainer  # noqa: E402

F = explainer.falas_do_roteiro(Path("roteiro.md"))
voz, taxa = explainer.ExplainerScene.VOICE, explainer.ExplainerScene.RATE
ids = set(sys.argv[1:])
falas_alvo = {c: v for c, v in F.falas.items() if not ids or c in ids}
total = sum(len(v) for v in falas_alvo.values())
feitas, falhas = 0, []
for cena, falas in falas_alvo.items():
    for i, texto in enumerate(falas, 1):
        for tentativa in range(1, 7):
            try:
                explainer._synthesize(texto, voz, taxa)
                feitas += 1
                print(f"voz ok {cena} fala {i} ({feitas}/{total})", flush=True)
                break
            except Exception as e:  # noqa: BLE001
                print(f"voz falhou {cena} fala {i}, tentativa {tentativa}: {type(e).__name__}", flush=True)
                time.sleep(5 * tentativa)
        else:
            falhas.append(f"{cena}/{i}")
        time.sleep(0.5)
print(f"vozes: {feitas}/{total}; sem voz: {falhas or 'nenhuma'}")
sys.exit(1 if falhas else 0)
