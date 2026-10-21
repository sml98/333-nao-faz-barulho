# Preparação da publicação — GitHub Pages

O usuário solicitou envio ao seu GitHub e escolheu explicitamente repositório público para hospedar o jogo gratuitamente.

- Nome proposto: `333-nao-faz-barulho`.
- O repositório local agora contém o mapa canônico em `Tecnico/`, sem dependência do diretório pai. SHA-256 idêntico ao original: `558cb93f6aa2b939b3fa4e9145ba26b8ebf2846d4504d1917070c498ef323bc8`.
- Vite usa base relativa e os assets usam `import.meta.env.BASE_URL`, permitindo publicação em `/<repositorio>/`.
- `.github/workflows/pages.yml` faz instalação, typecheck, 15 testes, build e deploy da pasta dist no Pages; apenas a build pública é publicada como site.
- Testes locais executados: typecheck PASS, 15 testes PASS, build PASS, formatação PASS. Navegador Chromium executou a build na subpasta `/333-nao-faz-barulho/`: oito GLBs HTTP 200, textura e bundles carregados, pegar caixa por E, sem erros e sem snapshot de debug na produção. Registro: `github-pages-local-test.json`; captura em `../evidence/github-pages-subpath.png`.

## Estado atual após conectar GitHub

Conta autenticada confirmada: `sml98`. O conector e o GitHub CLI funcionam. A falha anterior HTTP 401 foi resolvida.

A criação do repositório público `333-nao-faz-barulho` foi tentada por GraphQL (`gh repo create`) e REST (`POST /user/repos`); ambas foram recusadas por `Resource not accessible by integration`, HTTP 403 no REST. O repositório não foi criado e nenhum arquivo foi enviado.

A instalação da conta oferece `contents: write` e `workflows: write`, com acesso a todos os repositórios; não anuncia permissões de `administration` ou `pages`. O usuário precisa criar o repositório vazio na própria conta. A ativação inicial de Pages também pode exigir a configuração pelo proprietário; verificar depois da criação sem prometer uma publicação ainda inexistente.

Atalho de criação: https://github.com/new?name=333-nao-faz-barulho&visibility=public

Depois da criação: conectar remote, enviar o projeto para main sem sobrescrever trabalho remoto existente, acompanhar o workflow e verificar a URL real. Se Pages exigir administração, orientar somente esse ajuste específico em Settings → Pages → Source: GitHub Actions. Nenhum valor de credencial foi impresso ou alterado.
