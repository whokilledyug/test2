import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IncidentCard } from '@/components/IncidentCard';
import { UserAvatar } from '@/components/UserAvatar';
import { LevelBadge } from '@/components/LevelBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Search, Plus, Home, FileText, Bookmark, Trophy, LogOut, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type SortMode = 'latest' | 'upvoted' | 'viewed' | 'verified';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<SortMode>('latest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', sort, searchParams.get('q')],
    queryFn: async () => {
      let query = supabase
        .from('incidents')
        .select('*, profiles!incidents_author_id_fkey(display_name, handle, emoji, color_scheme, field)');

      const q = searchParams.get('q');
      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      switch (sort) {
        case 'upvoted': query = query.order('upvotes', { ascending: false }); break;
        case 'viewed': query = query.order('views', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        author: d.profiles,
      }));
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const tabs: { key: SortMode; label: string }[] = [
    { key: 'latest', label: 'Latest' },
    { key: 'upvoted', label: 'Most Upvoted' },
    { key: 'viewed', label: 'Most Viewed' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <nav className="border-b border-border px-4 py-3 flex items-center gap-4 sticky top-0 bg-background z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-muted-foreground">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground hidden sm:inline">PostMortem.io</span>
        </Link>
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Paste an error message or search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface border-input text-foreground"
            />
          </div>
        </form>
        <Link to="/submit">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" />Submit</Button>
        </Link>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 border-r border-border p-4 shrink-0 fixed md:sticky top-[57px] h-[calc(100vh-57px)] bg-background z-40 overflow-y-auto`}>
          {profile && (
            <div className="card-surface p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <UserAvatar emoji={profile.emoji} colorScheme={profile.color_scheme} size="lg" />
                <div className="min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{profile.display_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{profile.handle}</div>
                </div>
              </div>
              {profile.field && <span className="tag-pill text-[10px]">{profile.field}</span>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Rep: {profile.reputation}</span>
                <LevelBadge level={profile.level} />
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {[
              { icon: Home, label: 'Home Feed', to: '/dashboard' },
              { icon: FileText, label: 'My Incidents', to: '/profile' },
              { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {profile && (
            <button
              onClick={() => { signOut(); navigate('/'); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mt-4 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 max-w-3xl">
          {searchParams.get('q') && (
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Results for "{searchParams.get('q')}"
            </h2>
          )}

          <div className="flex gap-2 mb-6 border-b border-border pb-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setSort(t.key)}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${sort === t.key ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-surface p-5 animate-pulse">
                  <div className="h-4 bg-secondary rounded w-1/3 mb-3" />
                  <div className="h-3 bg-secondary rounded w-2/3 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No incidents found. Be the first to share!</p>
              <Link to="/submit"><Button>Submit an Incident</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident: any) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
