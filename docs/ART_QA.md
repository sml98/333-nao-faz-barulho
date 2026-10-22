# QA artístico e técnico — revisão MEME / VIRAL, 21/10/2026

## Resultado e escopo

Vertical slice integrada ao jogo PlayCanvas + TypeScript + Vite existente. Nico e Porteiro agora têm rig/skin e animações reais KayKit; os uniformes, rostos, cabelo/bonés, mochila, mãos de monstro e caixas foram remodelados em Blender. O tronco novo recebe pesos transferidos da base; braços/pernas e o rig preservam a origem KayKit. A planta canônica, velocidade, ruído, agitação, regras de entrega, percepção, navegação, captura e controles foram preservados.

Direção anterior: terceira coluna de `reference/cartoon-meme-viral.jpg`. Nas imagens novas, o usuário pediu a qualidade de um cartoon 3D ensolarado, colorido e suave. A alteração de cenário desta revisão troca a paleta roxa/escura por creme, água-marinha, coral e pedra azulada, preservando os personagens e o mapa interno do hotel. **O hotel ainda não equivale ao acabamento de nenhuma das concept arts nem foi convertido em praça externa.** Tecidos, cabelo, luvas, expressões e iluminação continuam simplificados. Não houve aprovação artística humana nem alegação de arte final premium.

## Capturas reais e QA dos modelos

| Evidência | Origem / o que comprova |
|---|---|
| `../evidence/art-nico-front.png` | Chromium executando o jogo: rosto frontal, corpo e escala no hotel |
| `../evidence/art-nico-run-a.png`, `art-nico-run-b.png` | Frames distintos de corrida, com duas articulações não raiz verificadas pelo teste |
| `../evidence/art-nico-carry.png` | Caixa 3D na posição de carregamento, sem escala ampliada por skin |
| `../evidence/art-chase.png` | Partida real, primeira caixa segurada, Nico fugindo e Porteiro atrás em CHASE |
| `../evidence/marco2-vitoria.png` | Captura real de uma execução isolada no modo Tranquila que completou as três entregas e voltou ao elevador; o teste final da suíte foi reduzido para terminar no desbloqueio do retorno devido à perseguição variável em SwiftShader |
| `../evidence/blender/nico-{front,profile,back,face}.png` | Renders do GLB exportado em estúdio Blender, separados das capturas do jogo |
| `../evidence/blender/porteiro-{front,profile,back,face}.png` | Mesma conferência para Porteiro |
| `../evidence/blender/nico-run.png`, `nico-carryrun.png`, `porteiro-chase.png` | Inspeção de poses de ação dos clipes exportados |
| `../evidence/blender/three-parcels.png` | Três malhas separadas; proporção, paleta e rosto distintos |

Nenhuma captura de gameplay foi produzida por geração de imagens. Os renders Blender são explicitamente inspeção de assets; não substituem a prova de execução.

## Animações e integração

- Sistema `Anim` registrado no AppBase, componente acima da hierarquia skinnada, estados derivados dos nomes **dos AnimTrack**, blends de 130 ms. Exportador Blender usa trilhas NLA compatíveis para preservar todos os clipes; exportação somente de Idle foi detectada e corrigida.
- Nico: `Idle`, `Walk`, `Run`, `Carry`, `CarryWalk`, `CarryRun`, `Crouch`, `Hide`, `LookBack`, `Panic`, `Stumble`, `Relief`. Run/Walk são movimentos articulares da biblioteca; braços de Carry são assados com IK no Blender. Carregamento é estabilizado em espaço do ator para que a inclinação do peito não jogue o rosto da caixa para baixo.
- Runtime escolhe locomotion/carry por input, Crouch ao ficar parado em SHHH, LookBack sem caixa durante investigação/busca, Stumble em colisão ruidosa durante corrida, Relief após entrega/vitória e Panic na captura. Hide existe no GLB, mas o avatar fica invisível enquanto escondido pela regra preexistente; não se apresenta isso como uma sequência de esconderijo visível.
- Crouch deriva de `Sit_Chair_Idle`, Panic de `Hit_A`, Stumble de `Dodge_Forward`, Relief de `Cheer`. São adaptações da biblioteca, **não coreografias autorais finais**; agachar/tropeçar/recuperar ainda pedem polimento. Menu de fim encobre parte das reações de fim de partida.
- Porteiro: `Idle`, `Patrol`, `Listen`, `Investigate`, `Chase`, `Search`, `Return`, `Confused`. A máquina existente dirige o estado Anim. Listen/Search têm varredura de cabeça assada; Confused é usado no início da busca. Nenhuma alteração nos critérios de visão/ruído da IA.
- Piscar/olhar/pânico usam morph targets reais. As caixas têm rosto volumétrico, pânico, tampa articulada, tremor proporcional à agitação; Paranóica movimenta pupilas e Arrogante tem pálpebras pesadas/sorriso torto. Todos os tipos são selecionados pelo progresso original das três entregas.
- Malhas skinnadas/com morph ficam fora de batching incompatível. Detalhes rígidos do mesmo osso foram unidos no Blender. Foram removidas cópias desnecessárias de caixas no Porteiro e GLBs antigos sem uso em public/.

## Câmera, cenário e correções

- Boom verifica a união canônica e obstáculos; altura sobe quando a distância comprime e evita atravessar a cabeça durante interpolação orbital. Teste percorre vários pontos/ângulos reais do mapa.
- Ângulo normal mais baixo, corpo legível no hall e corrida. Enquadramento pode passar a uma vista superior em cantos apertados; o jogador mantém controle orbital.
- Transparência automática **só nos materiais da cabeça de Nico** e FOV ampliado quando a parede comprime o boom; a caixa e o corpo permanecem legíveis. Captura real em `../evidence/art-camera-near.png` e teste final PASS.
- Uma arandela antiga flutuava na união aberta do hall: foi removida dessa passagem. Os cones opacos das demais foram substituídos por acabamentos baixos dourados, reduzindo obstruções da câmera.
- A escala antiga dos objetos e a inclinação excessiva da caixa foram corrigidas. Mesa, luminária e planta Kenney têm pivô central, base no piso e dimensões normalizadas. A gaveta tinha malha compartilhada transformada duas vezes: tornou-se single-user antes da transformação. Mesa final: 0,679 × 0,740 × 0,428 m; obstáculos continuam com os limites canônicos. A cadeira está exportada, mas não foi colocada em um caminho sem colisor.
- Direção anterior: materiais atlas e preenchimento roxo. Revisão 21/10/2026: runtime usa materiais difusos claros, luz principal âmbar suave e preenchimento azul-claro; nove novos GLBs de cenário foram modelados/remodelados no Blender, incluindo módulos de pedra irregular. O atlas art déco legado permanece no repositório, mas não é carregado durante a partida.

## Medidas dos arquivos finais

| GLB | Triângulos de origem exportada | Bytes |
|---|---:|---:|
| Nico | 19.772 | 1.161.652 |
| Porteiro | 14.284 | 802.408 |
| Caixa Nervosa | 3.956 | 145.188 |
| Pacote Arrogante | 3.728 | 133.116 |
| Caixa Paranóica | 3.860 | 137.248 |

As contagens são da geometria triangulada do pipeline; bounds/clipes do GLB foram inspecionados separadamente. Nico supera a meta inicial flexível de 18 mil em cerca de 10%; os demais atendem às faixas indicadas. Atlas legado do hotel: 1254 px, acima da sugestão de 1024 px. Não foram usados Draco/KTX2 nesta entrega; Blender local não oferece a biblioteca Draco. Tamanhos/hashes completos em `ASSET_MANIFEST.csv`, bounds/clipes em `characters-inspection.json` e `furniture-inspection-final.json`.

## Testes efetivamente executados

- Execução desta revisão, 21/10/2026: `npm test` **20/20 PASS**; `npm run typecheck` PASS; `npm run fmt` PASS.
- A execução final de `npm run test:browser` compilou a build e terminou **8/8 PASS em 15,8 min**. Cobriu perseguição real e articulações, Nico/câmera próxima, captura/reinício, WebGL2, teclado com uma entrega e retorno, joystick multitouch com SHHH, modo 3 com três entregas e desbloqueio do elevador, além do smoke de produção. No modo 3, o teste termina quando a terceira entrega libera o objetivo de retorno; ele não percorre a última fuga até a vitória. `GameState` verifica a condição de concluir/retornar em teste unitário.
- Antes de estabilizar a suíte, uma execução de modo 3 em Normal terminou em captura durante a fuga ruidosa; isso é um resultado válido das regras e não foi contado como vitória. A regressão de progressão agora usa a dificuldade Tranquila e uma rota com esconderijo real, sem modificar o estado da IA.
- `npm run test:browser` inclui build de produção, que carregou WebGL2, aceitou input e pausa/reinício e não expôs o snapshot de debug. O bundle minificado é aproximadamente 1,23 MB (331 kB gzip), acima do aviso de 500 kB; PlayCanvas também externaliza imports opcionais `node:worker_threads`. Build e smoke passaram apesar desses avisos.
- Os testes de direção abrangem cima/baixo/esquerda/direita, quatro diagonais, WASD, 0°/90°/180°/270°, projeção da tela pela matriz real da câmera e combinação de movimento com corrida/SHHH. O teste multitouch simulado confirma direita, cima e SHHH ao mesmo tempo, sem giro de câmera.
- Corrida é comprovada por valores diferentes em `upperleg.l` e `lowerleg.l` ao longo de frames renderizados; o teste não aceita apenas nome de estado/tempo avançando. Os snapshots do Porteiro também mostram as duas articulações mudando; a validação de `chase-proof.json` confirmou separadamente deltas superiores a 8° e 1°. Sem teleporte ou setters de debug. Snapshot é uma cópia somente leitura, restrita a DEV; produção foi verificada sem essa função.
- Blender executou importação, remodelagem, transferência de pesos, bake/export e renders. As poses de ação foram conferidas após corrigir a seleção de nomes de ação importados com sufixo do rig.

## Vídeo real adicional

`../evidence/nico-running.webm` foi gravado nativamente pelo Playwright a partir do navegador, sem interpolação ou geração de frames. `nico-recording-proof.json` registra Run nas duas amostras, mudanças de duas articulações, Crouch acionado por SHHH e lista vazia de erros JavaScript. O FFmpeg gratuito do Playwright precisou ser instalado para habilitar a gravação. A duração e fluidez refletem o renderizador por software do servidor.

## Limitações verificadas / não testadas

Chromium usa **SwiftShader por software** neste servidor, sem GPU física. Snapshots das capturas grandes registraram aproximadamente 1–5 FPS; isso não demonstra 30 FPS em Android. O fluxo completo roda em resolução menor nos testes, para viabilizar a regressão. **Android físico, PC com GPU, Safari/iOS, benchmark de memória/bateria e meta de 30 FPS não foram validados.** O teste de toque é emulação Chromium, não aparelho Android.

A semelhança com a referência é aproximada. Boca/olhos são modelados e expressivos, mas cabelo, mãos, lipsync, squash/stretch e animações de reação não têm o acabamento da concept art. Não há vozes gravadas, música/mix final nem GI assada; áudio continua Web Audio sintetizado com equivalentes visuais. O jogo está em GitHub Pages; a prova de regressão usa Chromium/SwiftShader, não um Android físico.

## Licenças e preservação

Bases selecionadas KayKit e móveis Kenney: CC0, textos preservados em `licenses/`, páginas e downloads no manifesto. Quaternius Standard foi realmente baixado/examinado pelo fluxo gratuito oficial, mas não integra o produto nem o pacote redistribuído; foi mantida a cautela com o aviso CC0 do pack versus QAL atual. Comparação de duas bases reais para Nico e duas opções reais para Porteiro em `ASSET_AUDIT.md`.

Branch `art/meme-viral`; salvaguarda `62b0562`; primeira prova de Nico `fe270b8`. Nenhuma compra, autenticação burlada ou estado de vitória/perseguição forçado. Layout técnico e controladores de jogabilidade foram mantidos.
