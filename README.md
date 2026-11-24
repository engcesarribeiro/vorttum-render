# vorttum-render

Render dos vídeos da VORTTUM (Manim + Remotion, voz edge-tts) no GitHub Actions.

- `videos/<tema>/`: roteiro, simulações e cenas de cada vídeo.
- A skill de vídeo **não mora aqui**: os workflows baixam `aula-animada/` do repositório privado `engcesarribeiro/skills` na hora do render (deploy key só de leitura no secret `SKILLS_DEPLOY_KEY`) e copiam o `explainer.py` dela para a pasta do vídeo. `skill_ref=` no pedido fixa um ramo, tag ou commit (padrão `main`).
- Voz padrão nos workflows: `en-US-AndrewMultilingualNeural` (`EXPLAINER_VOZ`).
- Render: edite `.github/render-pedido.txt` (`pasta=`, `qualidade=rascunho|final|previa`, `vertical=true|false`, opcionais `fps=`, `alvo=`, `skill_ref=`) e dê push em `main`. O MP4 sai no ramo `renders`.
- Amostra de voz: edite `amostras/pedido.txt` (1ª linha `voz=...`, depois uma fala por linha). O MP3 sai no ramo `amostras`.
