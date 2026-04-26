import { COLOR_MAP, type ColorScheme } from '@/lib/identity';

interface UserAvatarProps {
  emoji: string;
  colorScheme: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-lg',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-4xl',
};

export function UserAvatar({ emoji, colorScheme, size = 'md' }: UserAvatarProps) {
  const bg = COLOR_MAP[colorScheme as ColorScheme] || COLOR_MAP.purple;
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center shrink-0`}
      style={{ backgroundColor: bg }}
    >
      {emoji}
    </div>
  );
}
