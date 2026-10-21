# 3:33 — Não Faz Barulho!

Jogo 3D local single-player em **PlayCanvas + TypeScript + Vite**, com direção cartoon 3D. Marcos 0–2 verificados: uma entrega e três entregas jogáveis, vitória, captura e reinício. Arte/áudio finais e validação em Android físico continuam parciais. O kit original está no diretório pai; o JSON técnico é importado diretamente, sem cópia divergente. Concept arts não entram no bundle.

## Executar

Requer Node **22.23.2+** (ambiente usado: 24.19.0).

```bash
cd /workspace/333/bellmare-333
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador ou a porta **5173** na prévia do ambiente. Nesta entrega também ficou ativo o servidor da build compilada na porta **4173**; prefira essa porta para revisar o resultado final. O servidor escuta em `0.0.0.0`. Em uma máquina própria na mesma rede do telefone, use `http://IP-DA-MAQUINA:5173` (firewall precisa permitir). Neste ambiente remoto, o endereço de rede interno não garante acesso público pelo celular. Não foi realizada publicação externa.

```bash
npm run typecheck
npm test
npm run test:browser
npm run build
npm start
```

`npm start` serve `dist` em porta **4173**. `npm run test:browser` compila e inicia/reutiliza os servidores de desenvolvimento e de produção automaticamente para testar ambos. O teste de navegador requer Chromium em `/usr/bin/chromium` conforme `playwright.config.ts`; adapte o caminho ao instalar em outro sistema. Para usar Chromium gerenciado pelo Playwright: `npx playwright install chromium`, depois remova `executablePath` da configuração.

## Jogar

- **PC:** WASD move em relação à câmera; arraste o mouse sobre a cena para olhar; Shift corre; segure Espaço para SHHH; E interage; Esc pausa.
- **Android horizontal:** joystick à esquerda; arraste na cena à direita para olhar; segure CORRER ou SHHH; toque PEGAR/ENTREGAR/INTERAGIR. Joystick e SHHH podem ser usados simultaneamente.
- No modo padrão, entregue 301 (oeste), 302 (centro) e 303 (leste), uma caixa por vez, voltando ao hall para buscar cada próxima. Depois retorne ao elevador para vencer. No menu há também Primeira entrega, com apenas 301. Contorne o telefone no norte e a pilha de caixas no serviço; a geometria é colidível.
- Correr agita a caixa. Acima de 60 há aviso; acima de 85 por 1,5 s ela grita. SHHH acalma e reduz velocidade.
- O Porteiro ouve ruídos no local de origem e só persegue após ver Nico. Curvas e esconderijos quebram visão. Esconder-se não silencia a caixa.
- Vitória/captura permitem jogar novamente sem recarregar a página. Pausa interrompe o tempo de jogo.

## Estrutura

- `src/main.ts`: WebGL2, engine, resize e falha de inicialização.
- `src/game/scene.ts`: meshes, materiais e personagens procedurais.
- `src/game/level.ts`: união canônica, colisões, oclusão e navegação.
- `src/game/player.ts`, `input.ts`, `camera.ts`: movimento, Pointer Events e câmera.
- `packages.ts`, `sound.ts`, `perception.ts`, `porteiro.ts`: agitação, eventos acústicos e IA.
- `gameState.ts`, `interaction.ts`, `ui.ts`, `runtime.ts`: partida e integração.
- `tests/`: testes puros e testes reais no navegador via entradas de teclado/toque.
- `evidence/`, `QA_REPORT.md`, `CHANGELOG.md`: provas e limitações.

## Publicação estática opcional

Depois de `npm run build`, hospede **somente o conteúdo de `dist/`** em servidor estático HTTPS. Não publique `node_modules`, referências ou credenciais. O jogo não precisa de backend. Nenhuma conta, compra ou hospedagem externa foi criada. A build não inclui a função de debug `window.snapshot()`; ela existe só em desenvolvimento e retorna uma cópia, sem mutadores.

## Limitações

Personagens são modelos GLB originais gerados no Blender (`tools/build_models.py`), com pivôs de peças; o hotel combina geometria procedural e atlas cartoon gerado a partir das referências. Não são modelos premium finais. A fidelidade às referências premium ainda não foi alcançada. Não houve teste em Android físico, benchmark de GPU, teste em Safari/iOS ou publicação pública. Áudio inicial por síntese Web Audio; depende de gesto do jogador e dispõe de sinais visuais equivalentes. Consulte `QA_REPORT.md`, `MARCOS.md` e `ART_DIRECTION.md` para evidências, pendências e a direção cartoon solicitada. Para refazer os modelos é necessário Blender 4.3; ele não é necessário para executar o jogo.

## Evidências finais

- 14 testes de lógica, 6 testes de navegador (4,0 min), typecheck, build e formatação passaram. Detalhes e tentativas anteriores em `QA_REPORT.md`.
- `evidence/cartoon-gameplay-producao.png`: jogo real no navegador, build de produção.
- `evidence/cartoon-models-blender.png`: revisão dos GLBs em estúdio, separada do gameplay.
- `dist/`: pacote estático pronto para hospedagem; nenhuma URL pública foi criada.
