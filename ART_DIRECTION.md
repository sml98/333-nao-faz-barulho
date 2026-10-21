# Direção visual — ajuste solicitado em 21/10/2026

O usuário pediu um **cartoon 3D mais evidente, com menos realismo**. Esta orientação complementa as referências originais: conservar Nico (boné/jaqueta azul, capuz mostarda), Porteiro (bordô, máscara e sino), caixas expressivas e paleta do Bellmare; simplificar superfícies e privilegiar formas arredondadas, proporções expressivas e materiais pintados.

## Implementado

- Modelos GLB originais criados no **Blender 4.3.2**, fonte reproduzível em `tools/build_models.py`.
- Nico: silhueta, boné com aba curva, rosto com olhos/íris/pupilas, nariz, orelhas, sobrancelhas, mechas, capuz, mochila, alças, crachá, calça cargo, luvas e tênis com cadarços.
- Porteiro: corpo alongado, paletó/caudas, quepe, máscara afunilada, olhos luminosos, grade facial, sino e dedos articulados visuais.
- Caixa: papelão chanfrado, dobras, tampa com pivô, fita, olhos e boca. Óculos/dourado e laço rosa diferenciam as duas outras personalidades.
- Atlas de hotel gerado com a ferramenta de imagens usando referências fornecidas. Revisão **cartoon** substituiu a primeira versão mais realista: menos grão, formas mais grossas, sombras pintadas suaves e cores legíveis. Quatro regiões (parede, carpete, porta, madeira) amostradas por UV, sem recortar as referências do usuário para uso como cenário.
- Luz ambiente e preenchimento, sombras opcionais, tone mapping Neutral, baixa metalicidade e superfícies foscas. Batch estático no hotel e dinâmico nos modelos articulados.

## Limites reais

Não houve geração automática imagem→mesh. A busca por integração não encontrou uma ferramenta conectada específica de geração 3D. Blender foi usado para modelagem procedural original. A textura gerada não substitui a geometria jogável: mapa, avatares, caixa e NPC são 3D, com input e colisões.

As silhuetas e cores foram seguidas, mas os rostos, cabelo, tecidos e animações continuam simplificados. Não declarar igualdade às pranchas nem acabamento premium final. Não há rig esquelético/blendshapes nem iluminação global assada: as animações usam pivôs de peças e a iluminação é aproximada, com sombreamento pintado nos materiais.
