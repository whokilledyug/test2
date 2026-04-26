const ADJECTIVES = ['Silent','Cosmic','Neon','Frozen','Blazing','Hollow','Ancient','Rogue','Quantum','Storm','Phantom','Velvet','Solar','Turbo','Midnight','Crystal','Iron','Stealth','Wild','Shadow','Atomic','Binary','Digital','Electric','Hyper'];
const NOUNS = ['Nebula','Thunder','Falcon','Cipher','Vortex','Circuit','Nova','Pulse','Matrix','Ember','Quasar','Signal','Comet','Reactor','Ghost','Prism','Vector','Flare','Flux','Kernel','Packet','Router','Server','Cache','Stack'];
const ANIMALS = ['Fox','Wolf','Hawk','Lynx','Bear','Crow','Otter','Raven','Viper','Panda','Gecko','Moose','Crane','Bison','Cobra','Manta','Orca','Elk','Falcon','Kite'];
const EMOJIS = ['🦊','🐺','🦅','🐾','🦁','🐦','🦦','🦉','🐍','🐼','🦎','🦌','🕊️','🐻','🐙','🪶'];
const COLOR_SCHEMES = ['purple','teal','amber','coral','blue','green'] as const;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type ColorScheme = typeof COLOR_SCHEMES[number];

export function generateIdentity() {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const animal = pick(ANIMALS);
  const emoji = pick(EMOJIS);
  const colorScheme = pick([...COLOR_SCHEMES]);
  const num = String(Math.floor(1000 + Math.random() * 9000));

  return {
    display_name: `${adj} ${noun} ${animal}`,
    handle: `@${noun.toLowerCase()}_${animal.toLowerCase()}_${num}`,
    emoji,
    color_scheme: colorScheme,
  };
}

export const COLOR_MAP: Record<ColorScheme, string> = {
  purple: '#534AB7',
  teal: '#0F6E56',
  amber: '#854F0B',
  coral: '#993C1D',
  blue: '#185FA5',
  green: '#3B6D11',
};

export function getLevel(reputation: number): string {
  if (reputation >= 1000) return 'Legend';
  if (reputation >= 600) return 'Trusted Fixer';
  if (reputation >= 300) return 'Reliable Fixer';
  if (reputation >= 100) return 'Active Fixer';
  return 'Newcomer';
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'Legend': return '#BA7517';
    case 'Trusted Fixer': return '#7F77DD';
    case 'Reliable Fixer': return '#0F6E56';
    case 'Active Fixer': return '#185FA5';
    default: return '#555870';
  }
}
