# Avaliação de motor para 3:33 — 21/10/2026

O requisito decisivo é entregar um jogo 3D pequeno no navegador Android e desktop. O projeto já tem controles de toque multitouch, câmera orbital, renderização WebGL2, GLBs com skins/morphs/animações, IA e progressão de entregas em **PlayCanvas 2.23.1 + TypeScript + Vite**.

| Motor | Navegador Android e PC | Consequência para este projeto | Parecer |
|---|---|---|---|
| PlayCanvas | Motor voltado à Web; WebGL2 cobre a base instalada e o engine também oferece caminho WebGPU para navegadores compatíveis. Carrega GLB/glTF diretamente. | A build atual solicita explicitamente WebGL2 (não está usando WebGPU). Câmera, colisão lógica, input, animações, IA, UI e testes já funcionam. A melhoria demonstrada foi de assets e materiais, sem reescrever o jogo. | **Manter.** Melhor custo/risco para entregar o requisito atual. |
| Babylon.js | Engine TypeScript para WebGL2 e WebGPU; boa infraestrutura de glTF, PBR, sombras e animação. | Visualmente pode alcançar a mesma faixa de qualidade. Exigiria substituir runtime, cena, animação, câmera, input, batching, UI de engine e testes; o ganho não é automático. | Alternativa técnica viável se surgir uma lacuna concreta do PlayCanvas. Não justifica migração agora. |
| Godot 4 | Bom motor para jogo nativo e exportação WebAssembly. Exportação Web usa o renderizador Compatibility/WebGL2; no navegador há restrições de threading, tamanho/memória e diferenças de plataforma que precisam ser medidas. | Migrar cena e gameplay para GDScript/C# ou redesenhar a integração TS/JS, input mobile, áudio e carregamento. Android nativo seria atraente, mas a entrega pedida é pelo browser. | Forte para app nativo; menos direto que o stack atual para esta entrega web. |
| Unreal Engine 5 | Excelente para produção 3D nativa; Pixel Streaming pode transmitir uma sessão renderizada em servidor para um browser. O UE5 não oferece exportação autônoma HTML5 oficial no fluxo principal. | Requer reescrever e operar infraestrutura de GPU/streaming; latência, dados, custo operacional e compatibilidade móvel tornam a experiência inadequada para um jogo leve que pode rodar localmente no navegador. | Não recomendado para a meta web/mobile deste projeto. |

Qualidade cartoon premium depende de modelos, expressões, composição, iluminação, materiais e limites de performance. Trocar de engine não corrige assets por si só. A captura atual comprova que o PlayCanvas renderiza os módulos GLB atualizados, mas **não** comprova desempenho em Android físico ou paridade visual com uma concept art.

## Documentação oficial

- PlayCanvas: [engine graphics](https://developer.playcanvas.com/user-manual/graphics/), [model assets](https://developer.playcanvas.com/user-manual/assets/models/), [animation](https://developer.playcanvas.com/user-manual/animation/).
- Babylon.js: [WebGPU support](https://doc.babylonjs.com/setup/support/webGPU/), [glTF loader](https://doc.babylonjs.com/features/featuresDeepDive/importers/glTF/).
- Godot: [exportação para Web](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html), [renderizadores](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html).
- Unreal: [plataformas](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-platforms), [Pixel Streaming](https://dev.epicgames.com/documentation/en-us/unreal-engine/pixel-streaming-in-unreal-engine).
