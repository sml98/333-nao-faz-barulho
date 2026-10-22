# Controles direcionais e build Android — 21/10/2026

## Causa observada e correção

O movimento usava uma fórmula própria para reconstruir a lateral da câmera. No PlayCanvas, a entidade da câmera segue a convenção de mão que faz `camera.right` apontar para X negativo quando o yaw é zero. A fórmula antiga mandava o toque para X positivo; na tela, isso deslocava Nico para a esquerda. A frente vertical já correspondia à câmera e foi mantida após a projeção confirmar seu sentido.

`FollowCamera.movementBasis()` agora lê `Entity.right` e `Entity.forward` da câmera, zera a componente vertical, normaliza os dois vetores e entrega essa base ao `Input.movement()` e ao jogador. WASD e joystick passam pela mesma transformação; correr e SHHH são botões independentes e não alteram o vetor.

## Cobertura executada

- `tests/input-camera.test.ts`: oito sentidos do joystick e WASD, nas rotações 0°, 90°, 180° e 270°. Cada caso verifica o deslocamento mundial e a projeção pela matriz inversa real da câmera: direita/esquerda alteram o lado da tela, e cima/baixo alteram a profundidade projetada.
- O teste também combina diagonal, corrida e SHHH, confirmando que a direção continua igual.
- `tests/browser/marco1.spec.ts`: Playwright com Chromium e eventos multitouch CDP arrasta o joystick para a direita e para cima enquanto segura SHHH; confirma o deslocamento e que a câmera não gira.
- `npm test`, `npm run typecheck`, `npm run fmt`, `npm run build` e as regressões de navegador listadas em `ART_QA.md` foram executados no ambiente remoto. SwiftShader é renderização por software.

## Acesso para testar

O build de produção está publicado em GitHub Pages: <https://sml98.github.io/333-nao-faz-barulho/>. No celular, abra em Chrome/Chromium com a tela na horizontal. É necessária conexão à internet para baixar a versão pública. O menu permite escolher a partida de primeira entrega.

**Não tive acesso a um Android físico.** As provas são testes unitários com matrizes reais do PlayCanvas e eventos de toque emulados em Chromium; não alegam validação em aparelho, taxa de quadros, consumo de bateria ou resposta tátil física.
