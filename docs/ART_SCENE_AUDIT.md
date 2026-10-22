# Auditoria visual e cenário — 21/10/2026

## Direção aplicada

As novas referências do usuário pedem cartoon 3D luminoso, cores de cidade costeira, formas suaves, personagens expressivos e luz dourada. A cena lógica existente continua dentro do Hotel Bellmare: corredores, portas de quartos e rotas do Porteiro permanecem no layout canônico. A referência muda a direção de cor, materiais, acabamento e iluminação; ainda não converte o mapa do hotel em uma praça externa.

## Achados e mudanças

- Antes, o principal contraste vinha de uma textura de atlas art déco de 1254 × 1254 (1.858.802 bytes), parede com tom violeta, carpete vinho e luz ambiente roxa. A textura agora permanece arquivada em `public/`, mas não é solicitada pela runtime nem enviada ao GPU durante a partida.
- Caixas de meio metro usadas como chão foram substituídas por módulos GLB de pedras arredondadas em argamassa azul-mar. As peças são apenas visual; `level.ts` continua a decidir limites, obstáculos, colisão e rotas.
- Os painéis planos/decorativos antigos viraram módulos de parede 3D com bordas arredondadas, flor e folhas em baixo relevo. Portas, arandelas, armários de esconderijo, sinalizador do objetivo, telefone e pilha de encomendas também usam GLB. Os móveis Kenney foram inspecionados, recoloridos e remodelados no Blender.
- A paleta runtime passou de roxo/madeira escura a creme, azul-ar, coral, água-marinha e dourado suave. Luz ambiente roxa foi removida; a luz principal e preenchimentos agora são quentes/neutros, com fog em tom claro. O preset baixo (padrão Android) desliga sombras e arandelas pontuais decorativas; luz ambiente, sol direcional e luz de leitura permanecem ativos. Desktop conserva o controle de qualidade existente.
- Nico, Porteiro e suas animações faciais/corporais são os GLBs KayKit remodelados em Blender já presentes no projeto. O ajuste atual de cenário não modificou rig, morphs, transições ou regras de animação. A corrida é verificada por articulações nos testes de navegador já existentes.

## Geometria visual que ainda é simplificada

- A base das paredes é uma união de caixas visuais; os módulos 3D fazem o acabamento de suas faces internas. O teto ainda é formado por segmentos de caixa claros.
- Carpetes, frisos baixos e placas de texto continuam planos/caixas simples. Eles são decoração, não colisores.
- Os módulos novos são estilizados e arredondados, mas não têm textura pintada de alta resolução, iluminação global assada, cabelo procedural ou animações faciais novas. A referência da cidade/plaza é direção visual e não foi copiada como fundo nem substituiu o mapa do hotel.
- Não foi removido nem mudado colisor, limite, rota de IA, regra de ruído, entrega ou interação.

## Arquivos e auditoria reproduzível

- GLBs de cenário: `hotelFloorTile.glb`, `hotelWallPanel.glb`, `hotelDoor.glb`, `hotelSconce.glb`, `hotelWardrobe.glb`, `hotelBeacon.glb`, `hotelTelephone.glb`, `hotelParcelStack.glb` em `public/assets/environment/`.
- Origem Kenney Furniture Kit: CC0 confirmado em `art_sources/kenney/License.txt`; as extrações OBJ/MTL para armário e caixa estão versionadas e o script também consegue extraí-las de um ZIP local opcional. Licenças de KayKit/Kenney e fontes são registradas em `docs/ASSET_AUDIT.md` e `docs/licenses/`.
- `scripts/build_hotel_models.py` reconstrói os módulos com Blender 4.3.2; `scripts/audit_art_assets.py` importa cada GLB e registra triângulos, materiais, morphs, clipes e bounds. O resultado versionado está em `docs/art-scene-audit.json`.
- `evidence/blender/hotel-modules.png` é conferência em Blender; `evidence/cartoon-gameplay-producao.png` é captura real do Playwright rodando a build de produção em Chromium/WebGL2.

O renderizador do ambiente de teste é SwiftShader por software, portanto esta inspeção não mede a aparência nem o desempenho em GPU de telefone/PC real.
