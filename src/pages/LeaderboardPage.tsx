import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { LevelBadge } from '@/components/LevelBadge';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { profile } = useAuth();

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('upvotes_earned', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const rankColors = ['#BA7517', '#8B8FA8', '#854F0B'];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Trophy className="w-6 h-6 text-warning" />
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        </div>

        <div className="space-y-2">
          {leaders.map((user: any, i: number) => {
            const isMe = profile?.id === user.id;
            return (
              <div
                key={user.id}
                className={`card-surface p-4 flex items-center gap-4 ${isMe ? 'ring-2 ring-primary' : ''}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={i < 3 ? { backgroundColor: `${rankColors[i]}33`, color: rankColors[i] } : { color: 'hsl(var(--muted-foreground))' }}
                >
                  {i + 1}
                </div>
                <UserAvatar emoji={user.emoji} colorScheme={user.color_scheme} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground text-sm truncate">{user.display_name}</div>
                  <div className="text-xs text-muted-foreground">{user.handle}</div>
                </div>
                {user.field && <span className="tag-pill text-[10px] hidden sm:inline">{user.field}</span>}
                <LevelBadge level={user.level} />
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-foreground">{user.upvotes_earned}</div>
                  <div className="text-[10px] text-muted-foreground">upvotes</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
