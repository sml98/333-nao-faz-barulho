# ORDEM DE EXECUÇÃO PARA CODEX — 3:33 NÃO FAZ BARULHO!
## RECONSTRUÇÃO ARTÍSTICA COM ASSETS GRATUITOS E PIPELINE BLENDER → PLAYCANVAS

Você é responsável por executar uma revisão técnica e artística do repositório já existente do jogo 3:33 — Não Faz Barulho!, preservando o funcionamento das mecânicas atuais e transformando o protótipo em um jogo 3D CARTOON PREMIUM, expressivo e engraçado. **A opção 3, "MEME / VIRAL", da prancha visual anexada é a referência oficial para personagens, intensidade das expressões, paleta e animação.** Não reproduza apenas uma imagem 2D como plano de fundo.

**Objetivo da ordem:** pesquisar fontes oficiais, comparar ativos prontos, baixar legalmente os gratuitos, modificar os melhores modelos com Blender (por scripts Python executáveis no servidor), transferir animações, exportar GLB, integrar e validar no PlayCanvas para celular e PC. Você deve agir e produzir arquivos funcionais, não apenas fornecer instruções genéricas. Não solicite ao usuário tarefas de pesquisa que você puder executar no ambiente. Se uma etapa exigir autenticação, CAPTCHA ou aceite humano, informe especificamente e continue com recursos alternativos de acesso público. Nunca burle controles ou utilize URLs privadas obtidas de forma indevida. Não gaste dinheiro sem autorização.

## 0. Auditoria do projeto atual e salvaguarda

1. Inspecione o repositório e identifique engine, versão do PlayCanvas, assets atuais, código dos controladores, animações, câmera, lógica de IA, controles touch, pipeline de build e problemas visuais. Registre a situação em `docs/ART_AUDIT.md`.
2. Preserve o trabalho funcional em um commit/branch identificável antes de substituir assets; evite reescrever o jogo do zero. Não altere lógica do mapa, combate/furtividade, entregas ou inteligência artificial sem necessidade justificada.
3. Identifique e corrija a câmera que atravessa a cabeça ou o corpo de Nico e os objetos que aparecem enormes na frente do enquadramento. Teste colisão, controle orbital, transparência/ocultação de malhas perto da câmera e limites de distância.
4. Localize as imagens de referência previamente anexadas e sua terceira coluna (meme/viral). Caso não estejam materializadas no projeto, procure nos arquivos existentes; se indisponíveis, registre a ausência e siga estas especificações detalhadas: personagem pequeno de cabeça grande, olhos enormes, sobrancelhas móveis, expressão de pânico cômico, monstro alto vermelho de olhos brilhantes e sorriso exagerado, caixa com rosto expressivo, hotel estilizado roxo/vermelho/dourado bem iluminado.

## 1. Repositórios oficiais de recursos a examinar — ordem de prioridade

### A — KayKit (primeira tentativa para Nico e animações)

- **Personagens base gratuitos (Adventure Pack):** https://kaylousberg.itch.io/kaykit-adventurers
- **KayKit Character Animations:** https://kaylousberg.itch.io/kaykit-character-animations
- **Furniture Bits (móveis):** https://kaylousberg.itch.io/furniture-bits
- **Prototype Bits:** https://kaylousberg.itch.io/prototype-bits

O Adventurers inclui cinco personagens estilizados gratuitos, com rig e animações. A biblioteca Character Animations anuncia 161 animações em FBX/glTF. A versão gratuita NÃO contém necessariamente arquivos-fonte .blend; importe glTF/FBX no Blender e edite a partir deles, sem assumir que o pacote Source pago está disponível. Selecione uma base humanoide editável adequada, e aproveite a compatibilidade entre rig e animações.

### B — Quaternius (comparar Nico, Porteiro e rig)

- **Universal Base Characters:** https://quaternius.com/packs/universalbasecharacters.html
- **Universal Animation Library:** https://quaternius.com/packs/universalanimationlibrary.html
- **Universal Animation Library 2:** https://quaternius.com/packs/universalanimationlibrary2.html
- **Cute Animated Monsters:** https://quaternius.com/packs/cutemonsters
- **Animated Monster Pack:** https://quaternius.com/packs/animatedmonster.html
- **Ultimate Monsters:** https://quaternius.com/packs/ultimatemonsters.html
- **Toon Shooter Kit:** https://quaternius.com/packs/toonshootergamekit.html
- **Licença oficial atual:** https://quaternius.com/license.html

Compare bases quanto a silhueta, densidade da malha, compatibilidade com humanoid rig, facilidade de adaptar o rosto, peso do arquivo e licenciamento. Observe que as páginas individuais podem mencionar CC0 enquanto a licença geral QAL, atualizada em agosto de 2026, regula os assets disponibilizados sob ela: uso em jogos e modificação permitidos, mas redistribuição como assets independentes restrita. Salve o texto/licença ou referência datada aplicável a cada download. Não presuma que versões Source pagas estão disponíveis gratuitamente.

### C — Kenney (móveis, cenário e UI)

- **Furniture Kit:** https://kenney.nl/assets/furniture-kit
- **Building Kit:** https://kenney.nl/assets/building-kit
- **Castle Kit:** https://kenney.nl/assets/castle-kit
- **Prototype Kit:** https://kenney.nl/assets/prototype-kit
- **UI Pack:** https://kenney.nl/assets/ui-pack
- **Suporte/licenças:** https://kenney.nl/support

Use seus assets CC0 para detalhes do hotel, cadeiras, mesas, aparadores, vasos, objetos interativos e interface, adaptando os materiais e cores para uma linguagem artística coerente. Não substitua o hotel inteiro por um cenário medieval ou low-poly genérico. Reaproveite a planta e sua arquitetura base já existentes.

### D — Materiais e modelos complementares

- **Poly Haven:** https://polyhaven.com (texturas, HDRIs e modelos CC0; priorize formatos leves e APIs/documentação oficiais)
- **Poly Haven API:** https://api.polyhaven.com/ (verifique termos antes de automação)
- **Sketchfab:** https://sketchfab.com (opcional, apenas modelos com download autorizado e licença compatível; downloads pela API exigem OAuth oficial: https://sketchfab.com/developers/download-api)
- **Mixamo:** https://www.mixamo.com (alternativa opcional de animação para humanoides com Adobe ID; não burlar login; ver licença em https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)

Evite recursos de procedência duvidosa, modelos extraídos de jogos comerciais, scraping proibido, cópias de personagens famosos ou conteúdo sujeito a NC/ND incompatível com o uso planejado.

## 2. Pesquise, selecione e baixe por conta própria

1. Pesquise os pacotes oficiais via ferramentas de navegação disponíveis, consulte licenças e identifique os arquivos gratuitos apropriados. Acesse download direto publicado oficialmente, caso exista; **não invente endereços de ZIP, não mascare HTTP 403, não bypass login ou links temporários e não faça scraping proibido**.
2. Caso seja possível baixar sem interação humana, use `curl -L` ou `wget` com conferência de cabeçalhos, tamanho e conteúdo, ou navegador autorizado. Se for necessário clicar/entrar no itch.io, use navegação autorizada se disponível; se exigir ação do usuário, informe somente esse bloqueio específico e avance com outra fonte pública.
3. Organize os arquivos de origem em `art_sources/` (que pode ficar fora do `public/`), crie `docs/ASSET_MANIFEST.md`/`.csv` com `nome, autor, página, URL do download efetivo, licença, data, tamanho, uso, modificações` e preserve o texto da licença quando permitido. Crie hashes SHA-256 para identificar as versões obtidas.
4. Não incorpore pastas de download gigantescas no aplicativo final; use somente as malhas, animações e materiais efetivamente necessários. Se um asset sob QAL não puder ser redistribuído isoladamente, mantenha o uso estritamente dentro do produto conforme a licença e não publique um pacote genérico de assets.
5. Apresente relatório objetivo comparando **pelo menos duas bases reais para Nico** e **duas opções de criação para O Porteiro**, usando critérios de fidelidade à referência, facilidade de rigging/retargeting, custo, tamanho e desempenho. Escolha a melhor para a primeira prova visual; se um candidato não estiver disponível, documente isso, sem inventar resultados.

## 3. Pipeline de modelagem e aparência — NÃO fazer boneco primitivo

Instale/execute Blender gratuito no ambiente se for suportado. Preferir modo headless por `blender --background --python scripts/character_build.py`; caso o ambiente não permita Blender, informe a limitação e execute importação/conversão viável sem fingir que remodelou o modelo.

### Nico: figura 3D cartoon premium

- Base: preferencialmente modelo KayKit/Quaternius, com esqueleto humanoide preservado e proporções retrabalhadas.
- Proporção cartoon: cabeça 1,3–1,6× maior que a base, tronco compacto, mãos e tênis destacados, membros estilizados, silhueta bem legível; ajustar sem quebrar rig/skin weights.
- Cara **modelada de verdade em 3D**: olhos volumétricos grandes, sobrancelhas animáveis, boca expressiva com estados aberto/fechado e sorriso/medo; piscar e movimento dos olhos. Usar shape keys/morph targets quando adequado, ou rig facial/bones. Não usar foto plana no rosto.
- Roupa: boné de entregador, moletom/jaqueta com detalhes vermelho-vinho/mostarda, mochila, calça e tênis. Recriar identidade visual do Nico, não deixar fantasia medieval ou equipamentos de combate do pack.
- Reações: idle nervoso, caminhada, corrida desesperada, carregar caixa, agachar, esconder, olhar para trás, espanto, tropeço leve com recuperação e alívio.
- Técnicas de animação: antecipação, follow-through, overshoot, squash-and-stretch controlados; feedback rápido e controle responsivo.

### O Porteiro

- Partir de uma malha humanoide alongada ou monstro rigado de fonte permitida; remodelar para figura inconfundível: alto, vermelho, cabeça escura, olhos amarelos enormes luminosos, boca com sorriso assustador e língua caricatural, boné de porteiro e mãos grandes.
- Criar rig compatível, ou adaptar o rig original; animações de patrulha lenta, escuta, investigação, corrida desengonçada, perda do jogador e confusão.
- Terror cartunesco; expressivo e potencialmente engraçado, sem gore e sem sustos visualmente agressivos desnecessários para público amplo.

### As 3 caixas vivas

- Criar malhas 3D **separadas**, com cartolina estilizada e bordas suaves; olhos tridimensionais, sobrancelhas e boca animáveis; cada caixa com proporções/paleta próprias. Não precisam de um rig humanoide.
- Caixa Nervosa: tremor, olhos preocupados e grito.
- Pacote Arrogante: olhos semicerrados, sorriso superior e cara de deboche.
- Caixa Paranóica: olhos girando, pânico, encolhimento e susto.
- Usar morph targets, transformações hierárquicas, rig simples ou deformação de malha apropriada; priorizar performance mobile.

## 4. Controle e exportação das animações

- Escolha **um rig principal consistente** por personagem; não misture clipes de esqueletos incompatíveis sem retargeting testado.
- Preferencialmente transfira/retarget animações no Blender antes do export. Verifique nomes de ossos, bind pose, escalas, orientação, root motion vs. in-place, skinning e rotação dos pés.
- Exporte arquivos `nico.glb`, `porteiro.glb`, `caixa_nervosa.glb`, `pacote_arrogante.glb` e `caixa_paranoica.glb`, e clipes quando conveniente, em glTF 2.0/GLB. Preserve materiais PBR simples e expressões (shape keys) testadas. Nomeie animações como `Idle`, `Walk`, `Run`, `Carry`, `Crouch`, `Panic`, `Listen`, `Chase`, etc.
- Gere renders de conferência frontal/lateral/traseira e close dos rostos. Comprove que malha, rig e animações não deformam de modo indesejado.
- No PlayCanvas, use o sistema `Anim`, máquina de estados e blends de acordo com a API/versionamento concreto do projeto. Leia documentação oficial: https://developer.playcanvas.com/user-manual/assets/models/ e https://developer.playcanvas.com/user-manual/animation/anim-state-graph-assets/ .
- A importação deve usar assets reais GLB, não sprites 2D mascarados de 3D. Preserve controles, colisões, lógica de entregas e áudio já existentes.

## 5. Estilo visual único (3ª referência — MEME / VIRAL)

- Cartoon 3D premium, faces de pânico extremamente expressivas, paleta de vinhos, magentas, roxos, dourado e azul; sombras legíveis e iluminação bonita, sem ultrarrealismo.
- Ajuste o hotel existente: cores vivas e materiais estilizados, superfícies arredondadas e silhuetas claras; preserve layout técnico/colisões e não substitua por foto/vídeo de fundo.
- Aplique outline discreto somente se o visual melhorar e o desempenho permitir; prefira boa geometria, gradientes e iluminação a um filtro pesado.
- Câmera terceira pessoa: mantenha Nico inteiro ou ao menos corpo/rosto legíveis durante a movimentação, evite clipping, não oculte ação com mochila/cabeça, corrija câmera em corredores.
- Evite misturar assets que pareçam de cinco jogos diferentes. Recolorize/retrabalhe e normalize escala, materiais e tratamento de luz.

## 6. Compatibilidade e desempenho

- O jogo é para **navegador Android e PC**; mantenha PlayCanvas + TypeScript + Vite existentes.
- Meta: 30 FPS em Android intermediário de referência, se puder testar em hardware; caso contrário, registrar que não foi validado. Reduzir draw calls, tamanho de texturas, sombras dinâmicas, transparência e shaders caros. Não inventar medições.
- Metas iniciais flexíveis por asset, ajustáveis após perfil: Nico 8–18 mil triângulos, Porteiro 10–25 mil, caixas 1–5 mil cada; 512–1024px de texturas comuns e atlas quando viável. É objetivo de otimização, não desculpa para visual inacabado.
- Faça testes de build, carregamento dos GLBs, ausência de erros no console, controle touch, câmera, IA, animações e entrega. Use preview real em navegador, screenshots e testes automatizados onde for possível.

## 7. ENTREGAS E CRITÉRIOS DE APROVAÇÃO (obrigatório)

**Prioridade máxima: uma vertical slice visual, não mais fases!**

1. `docs/ASSET_AUDIT.md`: escolhas, URLs oficiais, downloads efetivos e licenças.
2. Scripts reproduzíveis `scripts/` de importação, transformação Blender e exportação GLB, mais assets resultantes.
3. `public/assets/characters/` com `nico.glb`, `porteiro.glb` e as caixas quando finalizadas; sem misturas de licenças incompatíveis.
4. Uma **cena 3D REAL jogável** mostrando Nico, uma caixa expressiva e o Porteiro no corredor, com câmera e perseguição funcionando.
5. Capturas da cena no **próprio navegador do jogo**, incluindo Nico de frente parado, Nico carregando caixa e fuga com o Porteiro atrás. Além disso, renders de front/profile/back feitos no Blender para QA.
6. `docs/ART_QA.md`: comparação visual com a opção 3, limitações honestas, animações funcionais, bugs encontrados e corrigidos, tamanho dos assets, testes efetuados.
7. Preserve o repositório e entregue URL da prévia se a infraestrutura permitir, sem afirmar publicação/testes não realizados.

**Critério de reprovação:** um humano sem rosto expressivo, primitivas geométricas sem modelagem, monstros rígidos, caixas inertes, personagens 2D, clipping de câmera, cenário realista escuro e sem cor, ou apenas screenshots sintéticas/geradas que não correspondam à execução real.

Comece imediatamente pela auditoria do projeto, pesquisa e aquisição das duas melhores bases para Nico, seleção comparativa e prova visual de Nico 3D com animação de corrida. Depois integre uma caixa e O Porteiro para uma curta sequência jogável de perseguição. Trabalhe autonomamente onde o ambiente permitir; quando houver bloqueios legítimos de acesso, reporte-os com precisão e continue o que for possível.
