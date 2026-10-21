> Histórico da versão anterior. A revisão atual MEME/VIRAL com rigs KayKit, novos GLBs e testes posteriores está em [docs/ART_QA.md](docs/ART_QA.md).

# QA — 3:33 — Não Faz Barulho!

Ambiente: Linux x64, Node 24.19.0, npm 11.9.0, PlayCanvas 2.23.1, Chromium `/usr/bin/chromium`, Playwright 1.58.2. Renderização de browser: WebGL2 em **SwiftShader/software**. Não representa GPU de PC nem Android físico.

| Verificação | Resultado real | Evidência |
|---|---|---|
| Marco 0: scaffold oficial, tipos, teste dos dados e build | PASS | Executados antes de implementar gameplay |
| Marco 0: geometria real em canvas WebGL2 | PASS | Teste de Chromium e `evidence/marco0.png` (cubo inicial) |
| Marco 1: uma entrega de início ao fim | PASS também na versão cartoon final | `marco1.spec.ts`, 2 testes em 1,2 min; pegar, WASD, SHHH, pausa, esconder/sair, entregar, voltar, vencer, reiniciar |
| Marco 1: mouse, captura real e reinício após derrota | PASS também na versão cartoon final | `capture.spec.ts`, 50,9 s; `marco1-captura.png` |
| Multi-touch joystick + SHHH | PASS também na versão cartoon final | CDP envia dois touch points simultâneos; movimento e SHHH sem girar câmera; viewport 844×390 |
| Lógica: 14 testes, incluindo 10.000 atualizações de agitação | PASS após novos GLBs | `npm test`; clamp, cooldown, três entregas sem duplicação, diferenças por pacote, acesso às portas e esconderijos, origem de som, oclusão, investigação e perda de visão |
| TypeScript, build e formatação | PASS após novos GLBs | `npm run typecheck`, `npm run build`, `npm run fmt` em 21/10/2026 |
| Importação GLB, materiais e animação facial | PASS com inspeção visual | Capturas intermediárias; erro de escala da boca detectado e corrigido preservando escala de autoria |
| Dimensões e pivôs dos modelos | PASS offline | `evidence/model-inspection.json`, bounds de vértices; Nico calibrado a 1,78 m, Porteiro a 2,70 m |
| Revisão cartoon dos modelos | PASS como revisão de arte | `cartoon-models-blender.png` usa os GLBs reais em iluminação de estúdio; **não é captura de gameplay** |
| Três entregas: primeira tentativa | FAIL: jogador capturado após 2 entregas | Dificuldade Normal: percurso do teste bloqueado pela pilha de caixas; NPC ouviu/viu e capturou. Não houve vitória nessa tentativa |
| Três entregas: percurso corrigido e corrida nos retornos vazios | PASS | Dificuldade Normal, três entregas e vitória no elevador, 1,6 min de teste; somente teclado, sem mutação de estado |
| Regressão dos controles após troca dos modelos | PASS | Uma entrega/pausa/esconder/reinício (42,8 s), câmera/captura (43,5 s), multi-touch (18,6 s) |
| Produção em navegador | PASS | Servidor de `dist` em 4173, WebGL2, movimento real, pausa e `snapshot` ausente, sem `console.error` ou exceção; 25,2 s |
| Android físico / metas de FPS em aparelho | NOT RUN | Sem dispositivo físico conectado |
| Safari/iOS | NOT RUN | Fora da validação disponível |
| Publicação pública | NOT RUN | Sem serviço de hospedagem utilizado |

## Correções e limites encontrados

- Instalações sobrepostas inicialmente deixaram links de binários ausentes; instalação sequencial refeita.
- Imports não usados detectados por TypeScript removidos.
- Câmera entrava na fachada do elevador: fachada recuada e probe ampliado; aproximação de câmera agora também verifica obstáculos.
- Waypoint do Porteiro coincidia com telefone: procura célula livre próxima antes de navegar, preservando coordenadas canônicas.
- Novo GLB da boca foi ampliado pela animação ao perder escala inicial: corrigido e conferido em imagem.
- Primeira execução de percurso foi interrompida por HMR durante edição; repetida sem edições. Outra execução em alta resolução foi interrompida para reduzir custo em software. Interrupções não são PASS.
- Prettier do scaffold dependia de configuração ESLint removida: configuração local independente criada; formatação passou.
- Blender deste ambiente não tem OpenImageDenoise: revisão offline renderizada sem denoiser. Não afeta o runtime do jogo.

## Renderização e performance

O Marco 1 inicial foi medido em pose estática no hall, 640×360: **340 → 160 draw calls** com batching estático; comparação RGB **0/230.400 pixels diferentes**. Arte e sombras foram alteradas depois; esse resultado pertence à versão inicial. Ver `evidence/batching.md`.

O jogo atual agrupa também peças móveis dos modelos. Qualidade baixa desliga sombras e reduz densidade de pixels; toque usa baixa por padrão. Ainda falta medição em GPU e Android reais. O contador de FPS foi corrigido para usar tempo de relógio, não o delta limitado do engine. Não se declara meta de 30/60 FPS atingida.

## Avisos de build

Vite externaliza imports opcionais de `node:worker_threads` do engine e avisa que o JS inicial supera 500 kB (cerca de 318 kB gzip, assets carregados à parte). Os caminhos gsplat/Draco não são usados. Não são exceções fatais do jogo; a produção precisa de smoke no browser antes de publicar.

## Resultado final executado

`npm run test:browser`: **6/6 PASS em 4,0 min**, após build de produção. Log completo `evidence/browser-final.log`. `npm test`: **14/14 PASS**. `npm run typecheck`, `npm run build` e `npm run fmt`: PASS.

Os testes de percurso de desktop usaram DPR 0,5 (640×360 ou 480×270 de CSS) para reduzir custo de SwiftShader; multi-touch usou 844×390 e DPR 1; produção usou 854×480 e DPR 1. São emulações, não aparelhos Android físicos.

`evidence/cartoon-gameplay-producao.png` é captura real do jogo ativo no servidor de produção. `evidence/cartoon-models-blender.png` é revisão dos modelos em estúdio Blender. A nova direção foi solicitada como cartoon 3D menos realista, sem declaração de paridade final com as pranchas.

Correções finais da IA: passos sucessivos não reiniciam indefinidamente o tempo de escuta; fontes junto a obstáculos usam o ponto livre acessível mais próximo para encerrar investigação. Ambos os casos têm testes de regressão.

Pendências materiais: rig e acabamento de personagens/expressões, transições de esconder/entregar/captura, decoração com colisões próprias onde necessário (a mesa do hall ainda é decorativa), música/mix completo, perfil e controles em Android físico, balanceamento com jogadores e publicação HTTPS. Nenhuma dessas pendências foi marcada PASS.
