# 3:33 — Não Faz Barulho!

Jogo 3D single-player em **PlayCanvas + TypeScript + Vite**, publicado em [GitHub Pages](https://sml98.github.io/333-nao-faz-barulho/). Marcos 0–2 verificados: entrega no navegador, progressão pelas três encomendas até liberar o retorno, captura e reinício; os contratos de vitória e retorno também passam nos testes de estado. Layout e colisões vêm do JSON técnico versionado `Tecnico/hotel_bellmare_layout_v1.json`; o arquivo canônico não é modificado pela direção de arte. Arte/áudio finais e validação em Android físico continuam parciais.

## Executar

Requer Node **22.23.2+** (ambiente usado: 24.19.0). Para jogar a versão publicada, abra <https://sml98.github.io/333-nao-faz-barulho/>. O link funciona no navegador Android e PC; em celular, use Chrome/Chromium com a tela na horizontal.

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
- `src/game/scene.ts`: arquitetura canônica e materiais; `assets.ts` e `characterAnimation.ts`: GLBs skinnados e estados Anim.
- `src/game/level.ts`: união canônica, colisões, oclusão e navegação.
- `src/game/player.ts`, `input.ts`, `camera.ts`: movimento, Pointer Events e câmera.
- `packages.ts`, `sound.ts`, `perception.ts`, `porteiro.ts`: agitação, eventos acústicos e IA.
- `gameState.ts`, `interaction.ts`, `ui.ts`, `runtime.ts`: partida e integração.
- `tests/`: testes puros e testes reais no navegador via entradas de teclado/toque.
- `evidence/`, `QA_REPORT.md`, `CHANGELOG.md`: provas e limitações.

## Publicação estática opcional

O GitHub Pages entrega o conteúdo estático de `dist/`; o jogo não precisa de backend. A build pública não inclui a função de debug `window.snapshot()`; ela existe só em desenvolvimento e retorna uma cópia, sem mutadores. A compatibilidade em aparelho físico não foi testada.

## Limitações

Personagens foram reconstruídos a partir de bases KayKit **CC0**, com rig e corrida reais, uniformes/rostos remodelados em Blender, morph targets e transições `Anim`. Móveis selecionados são Kenney CC0. A comparação Quaternius não entrou no produto. Fontes, licenças e SHA-256: `docs/ASSET_AUDIT.md` e `docs/ASSET_MANIFEST.csv`.

O hotel mantém seu mapa interno, com uma nova paleta de dia, pedras arredondadas, painéis 3D e portas/móveis estilizados. As imagens recentes de praça ensolarada orientam cor e formas; não foi criada uma praça externa e o resultado ainda não iguala uma concept art premium. Não houve validação em Android físico ou comprovação de 30 FPS. Chromium/SwiftShader deste ambiente renderiza por software e não representa um telefone ou PC com GPU. Áudio continua sintetizado, sem dublagem/música final.

## Pipeline de arte executado

Blender **4.3.2**, sem serviços pagos. Os GLBs prontos já estão no projeto; Blender só é necessário para refazê-los:

```bash
python scripts/fetch_art_sources.py
blender -b --python scripts/character_build.py -- all
blender -b --python scripts/prepare_kenney.py
blender -b --python scripts/build_hotel_models.py
blender -b --python scripts/render_character_qa.py
blender -b --python scripts/render_hotel_modules.py
blender -b --python scripts/audit_art_assets.py
python scripts/asset_manifest.py
```

O script de aquisição usa URLs oficiais verificadas e confere SHA-256. O pack Quaternius baixado para comparação não é necessário para reproduzir os personagens escolhidos. Os renders Blender são inspeção de assets; as capturas do gameplay estão separadas.

## Evidências desta revisão

- `evidence/nico-running.webm`: gravação real da corrida e reação SHHH; `docs/nico-recording-proof.json` registra articulações e ausência de erros.
- `evidence/art-nico-front.png`: Nico de frente no navegador.
- `evidence/art-nico-run-a.png` e `art-nico-run-b.png`: frames distintos; teste verifica duas articulações não raiz.
- `evidence/art-nico-carry.png`: caixa sustentada durante a partida.
- `evidence/art-chase.png`: perseguição real com caixa e Porteiro em CHASE.
- `evidence/art-camera-near.png`: transparência da cabeça quando a câmera é comprimida pela parede.
- `evidence/cartoon-gameplay-producao.png`: captura de gameplay da build de produção após o ajuste de luz/paleta e cenário.
- `evidence/blender/hotel-modules.png`: conferência dos GLBs de cenário no Blender.
- Testes direcionais e de projeção de tela, emulação multitouch, produção e regressões estão documentados em `docs/ANDROID_TOUCH.md` e `docs/ART_QA.md`.
- Auditoria visual em `docs/ART_SCENE_AUDIT.md`; avaliação de motores em `docs/ENGINE_ASSESSMENT.md`; inventário GLB em `docs/art-scene-audit.json`.
- `evidence/blender/`: frente, perfil, costas e rosto dos GLBs.
- `docs/ART_QA.md`: testes e limitações desta revisão. `QA_REPORT.md` registra a versão anterior.
- `dist/`: build estática; prévia local na porta 4173.
