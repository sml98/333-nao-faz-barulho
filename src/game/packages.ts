export const personalities = [
  {
    id: 'caixa_nervosa',
    name: 'Caixa Nervosa',
    rate: 1,
    warning: 'Vai devagar! Eu vou gritar!',
    pickup: 'Só mais uma entrega… sem me sacudir, né?',
    chase: 'AGORA VOCÊ CORRE?!',
    delivered: 'Até que enfim. Cinco estrelas… talvez.',
  },
  {
    id: 'pacote_arrogante',
    name: 'Pacote Arrogante',
    rate: 0.85,
    warning: 'Parabéns. Fez barulho de novo.',
    pickup: 'Serviço de primeira, hein…',
    chase: 'Excelente. Vamos morrer.',
    delivered: 'Vou avaliar o seu serviço. Depois.',
  },
  {
    id: 'caixa_paranoica',
    name: 'Caixa Paranóica',
    rate: 1.18,
    warning: 'Tem alguém atrás da gente!',
    pickup: 'Eu ouvi alguma coisa! Não, pera…',
    chase: 'CORRE! NÃO OLHA PARA TRÁS!',
    delivered: 'Não abra. Sério. NÃO ABRA.',
  },
] as const;
export interface PackageState {
  type: string;
  agitation: number;
  highFor: number;
  cooldown: number;
  warned: boolean;
}
export const newPackage = (index = 0): PackageState => ({
  type: personalities[index].id,
  agitation: 12,
  highFor: 0,
  cooldown: 0,
  warned: false,
});
export function tickPackage(
  s: PackageState,
  dt: number,
  moving: boolean,
  running: boolean,
  shush: boolean,
) {
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.agitation = Math.max(
    0,
    Math.min(
      100,
      s.agitation +
        dt *
          (shush
            ? -22
            : running
              ? 12 * (personalities.find((p) => p.id === s.type)?.rate ?? 1)
              : moving
                ? 2
                : -6),
    ),
  );
  s.highFor = s.agitation >= 85 ? s.highFor + dt : 0;
  const warning = s.agitation >= 60 && !s.warned;
  if (warning) s.warned = true;
  if (s.agitation < 45) s.warned = false;
  const scream = s.highFor >= 1.5 && s.cooldown === 0;
  if (scream) {
    s.cooldown = 9;
    s.highFor = 0;
    s.agitation = 58;
  }
  return { warning, scream };
}
