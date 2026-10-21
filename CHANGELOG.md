# Registro por marco

## Marco 0 — 2026-10-21
- Kit extraído em `/workspace/333`; lidos README, AGENTS, prompt mestre, bíblia, contratos, roadmap, aceitação, inventário e JSON.
- Scaffold oficial `npm create playcanvas@latest bellmare-333 -- -f engine -y`, Node 24.19.0.
- PlayCanvas 2.23.1, TypeScript 6.0.3, Vite 8.3.4; versões diretas fixadas e lockfile.
- Scripts dev, typecheck, test, build e test:browser.
- PASS: typecheck, teste inicial dos dados, build, Chromium com WebGL2 e screenshot `evidence/marco0.png` (cubo real).
- Avisos de build: workers opcionais do engine externalizados; chunk inicial acima de 500 kB.

## Marco 1 — em validação
- União das seis áreas canônicas; colisão cinemática, grid de navegação, Nico e Porteiro procedurais.
- Câmera terceira pessoa, WASD, mouse por arraste, joystick Pointer Events, SHHH, corrida, interação e pausa.
- Caixa nervosa, origem espacial de som, sete estados da IA, esconderijos, entrega 301 e retorno ao elevador, derrota e reinício.
- Correções encontradas durante teste: câmera junto à fachada do elevador; waypoint coincidente com telefone (destino ajustado à célula livre próxima, sem alterar o mapa).
- PASS até agora: 11 testes de lógica, typecheck e build. Percurso de navegador em execução.
- PASS: `npx playwright test tests/browser/marco1.spec.ts --workers=1 --reporter=line`: 2 testes, 1,2 min. Uma entrega completa via WASD/E, SHHH, pausa sem tempo avançar, esconder/sair, vitória e reinício; multi-touch simultâneo via CDP.
- Otimização necessária à validação em SwiftShader: MSAA desligado e cenário agrupado com BatchManager. Pose no hall: 340 → 160 draw calls, 0/230.400 pixels diferentes (comparação após desligar MSAA em ambas).
- Screenshots: `marco1-entrega.png`, `marco1-vitoria.png`, `marco1-touch.png`.
- PASS adicional: `capture.spec.ts`, 1 teste em 50,9 s: arraste do mouse gira e retorna câmera; jogador percorre mapa, faz ruído e é capturado; reinício restaura estado. Screenshot `marco1-captura.png`.
- **Marco 1 aceito em desktop automatizado + toque emulado. Android físico permanece NOT RUN.**

## Marco 2 — implementação
- Próximo: modo completo com três identidades, retorno ao elevador entre caixas, três entregas e dificuldade selecionável; manter modo de uma entrega para regressão.

## Revisão visual solicitada pelo usuário

- Prioridade de arte antecipada após aprovação funcional do Marco 1. Usuário refinou direção para **cartoon 3D, menos realista**.
- Blender disponível: modelos originais GLB de Nico, Porteiro e caixa; inspeção offline de vértices, nomes de pivôs e dimensões em `evidence/model-inspection.json`.
- Atlas gerado com referências e depois revisado para superfícies pintadas cartoon; primeira versão mais realista substituída.
- Calibração: Nico 1,78 m a partir de mesh 1,785 m; Porteiro 2,70 m a partir de mesh 2,67 m. Yaw 0 confirmado na cena; +Z é frente dos modelos.
- Batch dinâmico dos personagens e sombras opcionais em qualidade baixa; exposição/tone mapping e luzes revistos.
- Inspeção de imagem revelou boca GLB ampliada pela animação que sobrescrevia escala de autoria. Corrigido preservando escala inicial; não foi aceito como resultado visual válido.
- PASS: 12 testes de lógica, typecheck e build após integração. Regressão de navegador e partida de três entregas ainda em execução.
- Primeiro teste de três entregas na dificuldade Normal terminou em captura após a segunda entrega, no corredor de serviço. Registro mantido como FAIL de conclusão; o NPC estava perseguindo; análise posterior confirmou que o percurso do jogador vazio encontrava a pilha de caixas. Repetição usa corrida nos retornos sem caixa, sem alterar regras/velocidades da IA.

## Aceitação final desta entrega

- **Marco 2 PASS**: rota do teste contorna os obstáculos canônicos (telefone e pilha de caixas); três encomendas entregues e vitória no elevador na dificuldade Normal. Não houve teleporte, mutação de estado nem desativação de NPC.
- Regressão completa da versão cartoon: **6 testes de navegador PASS em 4,0 min**; captura/câmera/reinício 43,5 s, WebGL2 7,0 s, uma entrega com pausa/esconder 42,8 s, multi-touch 18,6 s, três entregas 1,6 min, produção 25,2 s.
- **14 testes de lógica PASS**, tipos, build e formatação PASS.
- IA: sons sucessivos não congelam escuta; fontes coladas a obstáculo têm destino alcançável e a investigação termina. Dois testes acrescentados.
- Produção validada em servidor estático: WebGL2 real, input, pausa, zero exceções/console.error capturados e debug `snapshot` ausente.
- Direção cartoon 3D aplicada; Marco 3 continua parcial (rig/polimento/áudio final). Marco 4 tem build/QA local/empacotamento; aparelho físico e benchmarks permanecem NOT RUN.


## 2026-10-21 — revisão MEME/VIRAL com KayKit/Kenney

- Salvaguarda e branch art/meme-viral antes da troca; licença/procedência e SHA-256 registrados.
- Nico e Porteiro com rigs KayKit, skin e clipes reais, uniformes/rostos remodelados em Blender, carry IK e morph targets.
- Três GLBs de encomendas com malhas/expressões próprias; mesa/luminária/planta Kenney normalizadas.
- Câmera mais baixa com colisão, proteção da cabeça, FOV e transparência de proximidade; caixa estabilizada em corrida.
- Parede violeta/dourada e luz cartoon; regras de mapa, ruído, entregas, IA e controles preservadas.
- 15 testes puros, regressão browser de 8 testes e verificações visuais adicionais PASS; capturas reais e renders dos GLBs.
- Android físico/30 FPS e acabamento equivalente à concept art permanecem sem validação.
