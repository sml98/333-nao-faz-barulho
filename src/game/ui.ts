import type { GameState } from './gameState';
import type { Interaction } from './interaction';
import { personalities } from './packages';
import type { AIState } from './porteiro';
export class UI {
  root = document.querySelector<HTMLElement>('#ui')!;
  constructor() {
    this.root.innerHTML = `
 <div id="hud"><div class="objective"><small>HOTEL BELLMARE · 3º ANDAR</small><strong id="objective" data-testid="objective"></strong><span id="hint"></span></div><div class="status"><small>ENCOMENDA <span id="box-state"></span></small><div class="meter"><i id="agitation"></i></div><span id="alert" data-testid="alert"></span></div><button id="pause" aria-label="Pausar" data-testid="pause">Ⅱ</button></div>
 <div id="caption" role="status" data-testid="caption"></div><div id="noise"></div><div id="context" data-testid="context"></div>
 <div id="touch"><div id="joystick" data-testid="joystick" aria-label="Joystick de movimento"><div id="knob"></div></div><div class="actions"><button id="shush" data-testid="shush">SHHH<small>segure / espaço</small></button><button id="run" data-testid="run">CORRER<small>segure / shift</small></button><button id="interact" data-testid="interact">INTERAGIR<small>E</small></button></div></div>
 <div id="overlay"><section class="menu"><div class="eyebrow">UMA MADRUGADA NO HOTEL BELLMARE</div><div class="ornament">✦</div><h1>3:33</h1><h2>NÃO FAZ BARULHO!</h2><p id="menu-copy">Um hotel adormecido. Uma encomenda que não cala a boca.<br>E alguém que leva o silêncio muito a sério.</p><div id="instructions">Pegue uma caixa por vez e entregue nos quartos 301–303.<br>Retorne ao elevador entre entregas. SHHH evita o grito.<br><span>WASD mover · arraste para olhar · E interagir<br>Shift correr · Espaço SHHH · Esc pausar<br>Toque: joystick + botões e arraste na cena</span></div><button id="start" data-testid="start">COMEÇAR ENTREGA <b>→</b></button><button id="restart" data-testid="restart" hidden>REINICIAR</button><div class="settings"><label>Modo <select id="mode" data-testid="mode"><option value="3">Três entregas</option><option value="1">Primeira entrega</option></select></label><label>Dificuldade <select id="difficulty"><option value="normal">Normal</option><option value="easy">Tranquila</option></select></label></div><div class="settings"><label><input type="checkbox" id="audio" checked> Efeitos</label><label><input type="checkbox" id="subtitles" checked> Legendas</label><label>Qualidade <select id="quality"><option value="normal">Normal</option><option value="low">Baixa</option></select></label></div><div class="footnote">PRIMEIRO TURNO · HOTEL BELLMARE</div></section></div><div id="portrait">Gire o celular para jogar na horizontal.</div>`;
  }
  text(id: string, value: string) {
    const e = document.getElementById(id)!;
    if (e.textContent !== value) e.textContent = value;
  }
  update(g: GameState, i: Interaction | null, ai: AIState, quiet: boolean) {
    const active = g.phase === 'PLAYING';
    document.getElementById('overlay')!.hidden = active;
    document.getElementById('touch')!.hidden = !active;
    document.getElementById('hud')!.hidden = !active;
    this.text(
      'objective',
      g.delivered === g.total
        ? 'Volte ao elevador'
        : g.held
          ? `Quarto ${301 + g.delivered} · ${g.delivered}/${g.total} entregue`
          : `Pegue a encomenda · ${g.delivered}/${g.total}`,
    );
    this.text(
      'hint',
      g.hidden
        ? 'Escondido · o som ainda pode denunciar você'
        : g.delivered === g.total
          ? 'Retorne pelo corredor de serviço'
          : g.held
            ? `${301 + g.delivered} ${g.delivered === 0 ? 'a oeste' : g.delivered === 1 ? 'ao centro' : 'a leste'} · ${personalities[g.delivered].name}`
            : 'Aproxime-se da caixa e interaja',
    );
    this.text(
      'box-state',
      !g.held
        ? '—'
        : g.box.agitation >= 85
          ? 'VAI GRITAR!'
          : g.box.agitation >= 60
            ? 'INQUIETA'
            : quiet
              ? 'SHHH…'
              : 'TRANQUILA',
    );
    document.getElementById('agitation')!.style.width = `${g.held ? g.box.agitation : 0}%`;
    this.text(
      'alert',
      ai === 'CHASE'
        ? '◉ ELE VIU VOCÊ — CORRA!'
        : ai === 'LISTEN'
          ? '◌ [sino vibra] Ele ouviu algo'
          : ai === 'INVESTIGATE'
            ? '◌ Investigando um ruído'
            : ai === 'SEARCH'
              ? '◌ Procurando…'
              : 'Mantenha o silêncio',
    );
    this.text('context', i ? `[E] ${i.label}` : '');
    const ib = document.querySelector<HTMLButtonElement>('#interact')!;
    ib.disabled = !i;
    ib.firstChild!.textContent =
      i?.kind === 'pickup'
        ? 'PEGAR'
        : i?.kind === 'deliver'
          ? 'ENTREGAR'
          : i?.kind === 'hide'
            ? 'ESCONDER'
            : 'INTERAGIR';
    document.body.classList.toggle('danger', ai === 'CHASE' && active);
    document.body.classList.toggle('quiet', quiet && active);
    this.root.dataset.phase = g.phase;
  }
  menu(phase: string) {
    const title =
      phase === 'WON'
        ? 'ENTREGA CONCLUÍDA'
        : phase === 'LOST'
          ? 'O SILÊNCIO VENCEU'
          : phase === 'PAUSED'
            ? 'UM INSTANTE DE SILÊNCIO'
            : 'NÃO FAZ BARULHO!';
    document.querySelector('h2')!.textContent = title;
    this.text(
      'menu-copy',
      phase === 'WON'
        ? 'Todas as encomendas entregues. Você voltou inteiro. Por enquanto.'
        : phase === 'LOST'
          ? '[sino toca] O Porteiro encontrou você. Tente outra rota e acalme a caixa.'
          : phase === 'PAUSED'
            ? 'A madrugada pode esperar. A simulação está pausada.'
            : 'Um hotel adormecido. Uma encomenda que não cala a boca.',
    );
    this.text(
      'start',
      phase === 'PAUSED'
        ? 'CONTINUAR'
        : phase === 'MENU'
          ? 'COMEÇAR ENTREGA →'
          : 'JOGAR NOVAMENTE →',
    );
    document.getElementById('restart')!.hidden = phase !== 'PAUSED';
  }
}
