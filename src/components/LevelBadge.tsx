import { getLevelColor } from '@/lib/identity';
import { Star } from 'lucide-react';

export function LevelBadge({ level }: { level: string }) {
  const color = getLevelColor(level);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: `${color}33`, color }}
    >
      {level === 'Legend' && <Star className="w-3 h-3" />}
      {level}
    </span>
  );
}
