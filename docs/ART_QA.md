# QA artístico e técnico — revisão MEME / VIRAL, 21/10/2026

## Resultado e escopo

Vertical slice integrada ao jogo PlayCanvas + TypeScript + Vite existente. Nico e Porteiro agora têm rig/skin e animações reais KayKit; os uniformes, rostos, cabelo/bonés, mochila, mãos de monstro e caixas foram remodelados em Blender. O tronco novo recebe pesos transferidos da base; braços/pernas e o rig preservam a origem KayKit. A planta canônica, velocidade, ruído, agitação, regras de entrega, percepção, navegação, captura e controles foram preservados.

Referência oficial: terceira coluna de `reference/cartoon-meme-viral.jpg`. A revisão adota boné vermelho/branco, moletom vinho, olhos grandes e volumétricos, monstro vermelho com máscara escura/olhos amarelos/língua, caixas com personalidade e hotel violeta/vermelho/dourado. **Ainda não equivale exatamente ao acabamento da ilustração.** Tecidos, cabelo, luvas, expressões e iluminação continuam simplificados. Não houve aprovação artística humana nem alegação de arte final premium.

## Capturas reais e QA dos modelos

| Evidência | Origem / o que comprova |
|---|---|
| `../evidence/art-nico-front.png` | Chromium executando o jogo: rosto frontal, corpo e escala no hotel |
| `../evidence/art-nico-run-a.png`, `art-nico-run-b.png` | Frames distintos de corrida, com duas articulações não raiz verificadas pelo teste |
| `../evidence/art-nico-carry.png` | Caixa 3D na posição de carregamento, sem escala ampliada por skin |
| `../evidence/art-chase.png` | Partida real, primeira caixa segurada, Nico fugindo e Porteiro atrás em CHASE |
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
- Materiais Kenney recoloridos; paredes violetas preservam detalhes dourados por shader sobre as malhas existentes. Luz quente com preenchimento roxo; sem filtro caro de outline. Textura cartoon anterior é aplicada a paredes/piso/portas 3D; não há fundo de hotel 2D.

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

- `npm run typecheck`: PASS após integração e após o ajuste de transparência.
- `npm test`: **15 PASS** (contratos, mapa/navegação/IA/ruído e teste orbital da câmera), última execução registrada em 20:56 UTC.
- `npm run fmt`: PASS; `npm run build`: PASS. Bundle da engine gera aviso de chunk superior a 500 kB e externalização dos módulos opcionais Node worker_threads da biblioteca; não impedem build/carregamento verificados.
- `npm run test:browser`: **8 PASS em 5,9 min**, incluindo corrida de Nico, perseguição esquelética do Porteiro, captura/reinício, WebGL2, uma entrega, esconder/SHHH/pausa, joystick+SHHH simultâneos, **três entregas e retorno em Normal** e smoke de produção sem snapshot de debug. Log: `browser-regression-art.log`.
- Após o último ajuste dos GLBs/móveis: **3 PASS**, repetindo provas artísticas e produção; `art-final-verification.log`.
- Após o último ajuste das arandelas: **2 PASS em 1,6 min**, repetindo Nico/câmera próxima e produção; `final-scene-browser.log`. A gravação foi refeita na mesma versão.
- Após acrescentar transparência: produção PASS. A primeira tentativa do teste de proximidade falhou porque só girava a câmera no hall de 6 m de largura, sem comprimir a distância. O teste foi corrigido para aproximar Nico da parede por input normal; não se alterou o jogo para forçar esse resultado. **Proximidade/corrida/carry: PASS em 1,0 min**, log `camera-near-corrected-test.log`. A falha inicial e a produção PASS estão em `camera-final-browser.log`.
- Corrida é comprovada por valores diferentes em `upperleg.l` e `lowerleg.l` ao longo de frames renderizados; o teste não aceita apenas nome de estado/tempo avançando. Os snapshots do Porteiro também mostram as duas articulações mudando; a validação de `chase-proof.json` confirmou separadamente deltas superiores a 8° e 1°. Sem teleporte ou setters de debug. Snapshot é uma cópia somente leitura, restrita a DEV; produção foi verificada sem essa função.
- Blender executou importação, remodelagem, transferência de pesos, bake/export e renders. As poses de ação foram conferidas após corrigir a seleção de nomes de ação importados com sufixo do rig.

## Vídeo real adicional

`../evidence/nico-running.webm` foi gravado nativamente pelo Playwright a partir do navegador, sem interpolação ou geração de frames. `nico-recording-proof.json` registra Run nas duas amostras, mudanças de duas articulações, Crouch acionado por SHHH e lista vazia de erros JavaScript. O FFmpeg gratuito do Playwright precisou ser instalado para habilitar a gravação. A duração e fluidez refletem o renderizador por software do servidor.

## Limitações verificadas / não testadas

Chromium usa **SwiftShader por software** neste servidor, sem GPU física. Snapshots das capturas grandes registraram aproximadamente 1–5 FPS; isso não demonstra 30 FPS em Android. O fluxo completo roda em resolução menor nos testes, para viabilizar a regressão. **Android físico, PC com GPU, Safari/iOS, benchmark de memória/bateria e meta de 30 FPS não foram validados.** O teste de toque é emulação Chromium, não aparelho Android.

A semelhança com a referência é aproximada. Boca/olhos são modelados e expressivos, mas cabelo, mãos, lipsync, squash/stretch e animações de reação não têm o acabamento da concept art. Não há vozes gravadas, música/mix final nem GI assada; áudio continua Web Audio sintetizado com equivalentes visuais. Não há publicação/URL pública: servidores locais e dist/ são a prévia disponível.

## Licenças e preservação

Bases selecionadas KayKit e móveis Kenney: CC0, textos preservados em `licenses/`, páginas e downloads no manifesto. Quaternius Standard foi realmente baixado/examinado pelo fluxo gratuito oficial, mas não integra o produto nem o pacote redistribuído; foi mantida a cautela com o aviso CC0 do pack versus QAL atual. Comparação de duas bases reais para Nico e duas opções reais para Porteiro em `ASSET_AUDIT.md`.

Branch `art/meme-viral`; salvaguarda `62b0562`; primeira prova de Nico `fe270b8`. Nenhuma compra, autenticação burlada ou estado de vitória/perseguição forçado. Layout técnico e controladores de jogabilidade foram mantidos.
