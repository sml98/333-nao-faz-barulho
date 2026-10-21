# Direção visual vigente — MEME / VIRAL, referência 3

A ordem anexada `docs/COMANDO_CODEX_ASSETS_CARTOON_333.md` substitui a direção anterior: Nico tem boné vermelho/branco, moletom vinho, mochila e olhos grandes; o Porteiro é vermelho, alto, com máscara escura, olhos amarelos e língua. A prancha recebida está em `docs/reference/cartoon-meme-viral.jpg`.

O runtime usa cinco GLBs em `public/assets/characters`. Nico e Porteiro têm skin, rig humanoide real KayKit e clipes compatíveis, modificados no Blender por `scripts/character_build.py`. Rosto, cabelo, bonés, uniformes e caixas foram remodelados em 3D; os uniformes recebem pesos transferidos da base. Não se usa a prancha como cenário/plano ou personagem 2D. O hotel preserva o JSON canônico, com paredes violetas/douradas, carpete vermelho e iluminação quente com preenchimento roxo. Mesa, luminária e planta CC0 Kenney foram normalizadas e integradas; uma cadeira também foi preparada para uso futuro.

O sistema `Anim` faz blends de 130 ms. Morph targets controlam piscar, olhar e pânico; as caixas usam também pivô de tampa e tremor proporcional à agitação. Detalhes rígidos do mesmo osso foram unidos no Blender para reduzir chamadas, preservando as malhas com morph e skin.

As capturas `evidence/art-*.png` são do jogo em Chromium; `evidence/blender/` contém renders separados de QA dos GLBs exportados. Não há promessa de equivalência exata à concept art nem de acabamento cinematográfico final. Consulte `docs/ART_QA.md` para critérios, medições e limitações.
