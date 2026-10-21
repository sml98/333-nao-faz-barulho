# Medida de batching estático — Marco 1

Chromium + SwiftShader; viewport 640×360, mesmo menu (tempo de simulação 0, personagens imóveis), câmera `(0.22, 1.98479863710218, -14.57)`. UI ocultada somente pelo harness de captura. Comparação realizada depois de desabilitar MSAA nos dois casos.

- Sem batching: **340 draw calls** (`app.stats.drawCallCount`).
- Com BatchManager estático e células de AABB de até 12 m: **160 draw calls**.
- Capturas: `batch-0.png`, `batch-1.png`.
- Comparação RGB com Pillow: **0 de 230.400 pixels diferentes**.

Uma pose medida; ainda não é garantia de FPS nem verificação de todas as superfícies. O contador interno de FPS usa dt do engine com clamp; não é medição de tempo real no servidor quando frames levam >100 ms.
