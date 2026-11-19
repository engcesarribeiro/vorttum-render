# vorttum-render

Render dos vídeos da VORTTUM (Manim + Remotion, voz edge-tts) no GitHub Actions.

- `videos/<tema>/`: roteiro, simulações e cenas de cada vídeo.
- `.claude/skills/manim-explainer/`: a skill de vídeo (cópia do repositório principal).
- Render: edite `.github/render-pedido.txt` (`pasta=`, `qualidade=rascunho|final|previa`, `vertical=true|false`) e dê push em `main`. O MP4 sai no ramo `renders`.
- Amostra de voz: edite `amostras/pedido.txt` (1ª linha `voz=...`, depois uma fala por linha). O MP3 sai no ramo `amostras`.
