# Preparação da publicação — GitHub Pages

O usuário solicitou envio ao seu GitHub e escolheu explicitamente repositório público para hospedar o jogo gratuitamente.

- Nome proposto: `333-nao-faz-barulho`.
- O repositório local agora contém o mapa canônico em `Tecnico/`, sem dependência do diretório pai. SHA-256 idêntico ao original: `558cb93f6aa2b939b3fa4e9145ba26b8ebf2846d4504d1917070c498ef323bc8`.
- Vite usa base relativa e os assets usam `import.meta.env.BASE_URL`, permitindo publicação em `/<repositorio>/`.
- `.github/workflows/pages.yml` faz instalação, typecheck, 15 testes, build e deploy da pasta dist no Pages; apenas a build pública é publicada como site.
- Testes locais executados: typecheck PASS, 15 testes PASS, build PASS, formatação PASS. Navegador Chromium executou a build na subpasta `/333-nao-faz-barulho/`: oito GLBs HTTP 200, textura e bundles carregados, pegar caixa por E, sem erros e sem snapshot de debug na produção. Registro: `github-pages-local-test.json`; captura em `../evidence/github-pages-subpath.png`.

## Bloqueio atual

Não há remote configurado nem publicação remota realizada. `gh auth status` falhou e `gh api user` retornou HTTP 401 Bad credentials. A consulta do gerenciador de plugins encontrou o GitHub disponível, com `installed: false`; o pedido de conexão anterior não concluiu a instalação. Nenhum valor de credencial foi impresso ou alterado.

Após a conexão válida: identificar a conta autenticada, criar o repositório público sem sobrescrever repositórios existentes, enviar a branch local para main, definir main como padrão, habilitar Pages com GitHub Actions, acompanhar o workflow e verificar a URL real publicada. Não há URL pública confirmada neste registro.
