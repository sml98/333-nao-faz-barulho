# Auditoria anterior à substituição — 21/10/2026

Baseline preservada no primeiro commit; branch `art/meme-viral`. Stack existente PlayCanvas 2.23.1 / TypeScript 6.0.3 / Vite 8.3.4. Mapa canônico importado de `../Tecnico/hotel_bellmare_layout_v1.json`. Não haverá troca de engine nem reconstrução das mecânicas.

Os GLBs anteriores usam peças/pivôs e não possuem skin nem clipes esqueléticos. `scene.animate` aplica seno às pernas e braços; isso não representa corrida humana articulada. O rosto, máscara e caixa são compostos simplificados. Materiais do hotel são atlas pintado. Referência nova está em `docs/reference/cartoon-meme-viral.jpg`, coluna 3.

Controladores: `player.ts`/`input.ts`; câmera `camera.ts`; IA/percepção `porteiro.ts`/`perception.ts`; progressão `gameState.ts`/`interaction.ts`; integração `runtime.ts`. Scripts existentes: dev/build/typecheck/test/test:browser/fmt. A regressão deve manter entrega, ruído, SHHH, esconder, captura, pausa, reinício e multi-touch.

Problemas visuais auditados: câmera pode aproximar até 0,25 m e apontar para dentro da cabeça; mochila/caixa podem dominar o enquadramento; falta distância mínima ligada ao volume real do personagem. Prioridade: órbita com limite seguro, fallback acima do personagem em corredores e ocultação do visual apenas se câmera ficar dentro do volume de exclusão. Modelos novos deverão ter escala e orientação medidas, sem sobrescrever escala dos nós animados.

Plano: importar bases reais autorizadas, conservar rig e clipes, adaptar proporções/roupa/face em Blender e usar o componente Anim. Primeiro verificar Nico e Run no browser; depois Porteiro e caixas separadas. Apenas as peças realmente utilizadas serão levadas para public/assets/characters e environment.
