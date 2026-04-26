import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatar } from '@/components/UserAvatar';
import { LevelBadge } from '@/components/LevelBadge';
import { IncidentCard } from '@/components/IncidentCard';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, MessageSquare, ArrowUp, Check } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'incidents' | 'comments'>('incidents');

  const { data: myIncidents = [] } = useQuery({
    queryKey: ['my-incidents', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data } = await supabase
        .from('incidents')
        .select('*, profiles!incidents_author_id_fkey(display_name, handle, emoji, color_scheme, field)')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });
      return (data || []).map((d: any) => ({ ...d, author: d.profiles }));
    },
    enabled: !!profile,
  });

  if (!profile) return null;

  const repPercent = Math.min(100, (profile.reputation / (profile.reputation < 100 ? 100 : profile.reputation < 300 ? 300 : profile.reputation < 600 ? 600 : 1000)) * 100);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <UserAvatar emoji={profile.emoji} colorScheme={profile.color_scheme} size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{profile.display_name}</h1>
          <p className="text-muted-foreground">{profile.handle}</p>
          <div className="flex justify-center gap-2 mt-3">
            {profile.field && <span className="tag-pill">{profile.field}</span>}
            <LevelBadge level={profile.level} />
          </div>

          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Reputation</span>
              <span>{profile.reputation}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full">
              <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${repPercent}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="card-surface p-3 text-center">
              <div className="text-lg font-bold text-foreground">{profile.incidents_count}</div>
              <div className="text-xs text-muted-foreground">Incidents</div>
            </div>
            <div className="card-surface p-3 text-center">
              <div className="text-lg font-bold text-foreground">{profile.upvotes_earned}</div>
              <div className="text-xs text-muted-foreground">Upvotes</div>
            </div>
            <div className="card-surface p-3 text-center">
              <div className="text-lg font-bold text-foreground">{profile.reputation}</div>
              <div className="text-xs text-muted-foreground">Reputation</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-border pb-2 mb-4">
          <button onClick={() => setTab('incidents')} className={`text-sm px-3 py-1.5 rounded-md ${tab === 'incidents' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>My Incidents</button>
          <button onClick={() => setTab('comments')} className={`text-sm px-3 py-1.5 rounded-md ${tab === 'comments' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>My Comments</button>
        </div>

        {tab === 'incidents' && (
          <div className="space-y-3">
            {myIncidents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No incidents yet</p>
            ) : (
              myIncidents.map((i: any) => <IncidentCard key={i.id} incident={i} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
