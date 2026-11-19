"""Acha no roteiro as emendas de vogal entre palavras que a voz engole.

Quando uma palavra termina com a mesma vogal com que a próxima começa ("sessentA Avos"),
a voz junta as duas e a vogal some: "sessenta avos" vira "sessenta vós". O serviço de voz
não aceita micropausa (<break>), e vírgula ou travessão dão pausa longa demais (~200–300 ms).
A correção é reescrever o trecho: "um sessenta avos de segundo" -> "um segundo dividido por sessenta".

Uso:
    python juncoes.py roteiro.md

Lista cena, fala e o par de palavras. Termos técnicos que não dá para trocar ("potência ativa")
aparecem também: decida caso a caso, de preferência ouvindo a amostra (amostras.py).
"""
import re
import sys
import unicodedata
from pathlib import Path

# palavras curtas de ligação: a emenda com elas é natural e não muda o sentido
LIGACAO = {"a", "o", "e", "as", "os", "um", "uma", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
           "que", "se", "ou", "é", "à", "ao", "aos", "isso", "essa", "esse", "este", "esta", "ela", "ele", "eu"}


def vogal(ch: str) -> str:
    return unicodedata.normalize("NFD", ch)[0].lower()


def juncoes(texto: str) -> list[str]:
    toks, achou = texto.split(), []
    for a_raw, b_raw in zip(toks, toks[1:]):
        if re.search(r"[,.;:!?…—]$", a_raw):          # já existe pausa
            continue
        a, b = re.sub(r"[^\wÀ-ÿ]", "", a_raw), re.sub(r"[^\wÀ-ÿ]", "", b_raw)
        if not a or not b or b.lower() in LIGACAO:
            continue
        inicio = b[1] if b[0].lower() == "h" and len(b) > 1 else b[0]   # h é mudo
        if vogal(a[-1]) in "aeiou" and vogal(a[-1]) == vogal(inicio):
            achou.append(f"{a} {b}")
    return achou


def main():
    txt = Path(sys.argv[1]).read_text("utf-8")
    total = 0
    for bloco in re.split(r"^### ", txt, flags=re.M)[1:]:
        cena = bloco.split()[0]
        for n, fala in re.findall(r"^\*\*Fala (\d+):\*\* (.*)$", bloco, flags=re.M):
            for par in juncoes(fala):
                total += 1
                print(f"{cena} fala {n}: {par}")
    print(f"\n{total} emenda(s). Reescreva as que mudam o sentido ou escondem um número.")


if __name__ == "__main__":
    main()
