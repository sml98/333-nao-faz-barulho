# Marcos e pendências

- [x] **Marco 0 — ambiente**: scaffold oficial, dados canônicos, scripts, WebGL2, tipos e build; screenshot inicial.
- [x] **Marco 1 — uma entrega**: input, mapa em loop, colisões, câmera, SHHH, ruído, máquina de estados da IA, esconderijo, 301, retorno, vitória, captura e reinício; comprovado no browser. Toque emulado comprovado; aparelho físico indisponível.
- [x] **Marco 2 — três entregas**: teste completo final PASS na dificuldade Normal (três entregas e retorno ao elevador). Três identidades e skins, três portas, retorno entre caixas, dificuldade Normal/Tranquila. Duas primeiras tentativas registradas sem vitória porque o percurso não contornava a pilha de caixas.
- [ ] **Marco 3 — arte/áudio final**: revisão cartoon integrada com GLBs originais de Blender, atlas gerado por IA e animações por peças. Ainda faltam refinamento autoral de rostos/cabelo/mãos, rig e transições melhores, mix e música, acabamento premium validado pelo usuário.
- [ ] **Marco 4 — validação final em aparelho**: qualidade baixa e batching, build estática e testes automáticos implementados. Regressão final e smoke de produção PASS: 6 testes de navegador em 4,0 min. Android físico, benchmark de GPU e publicação pública não executados.

## Próximas melhorias priorizadas

1. Validar sensibilidade, câmera, visibilidade e multi-touch em Android físico intermediário; medir FPS/tempo de frame, memória e tempo de carga.
2. Refinar Nico/Porteiro no Blender na direção cartoon aprovada, com rig, animações de mãos, esconder, entrega e captura e expressões faciais melhores.
3. Balancear duração, perseguições e eventos após partidas humanas, mantendo rota alternativa e avisos justos.
4. Completar ambiente/áudio, música/mixer e vozes locais estilizadas, sem serviço externo obrigatório.
5. Compactar modelos/texturas após perfil real e validar a build em hospedagem estática HTTPS, quando publicação for solicitada.

## Revisão artística MEME/VIRAL — 21/10/2026

Salvaguarda `62b0562` na branch `art/meme-viral`; primeira prova de corrida esquelética `fe270b8`. Nico KayKit remodelado, câmera com proteção da cabeça, Porteiro skinnado, três caixas separadas e móveis Kenney integrados. Reações e morphs usam `Anim`/hierarquia real. A referência oficial agora é a terceira coluna anexada nesta ordem, com uniforme vermelho/branco. Esta seção substitui as descrições de modelos por peças do histórico acima. Validação atual em `docs/ART_QA.md`; Android físico e acabamento final continuam pendentes.
