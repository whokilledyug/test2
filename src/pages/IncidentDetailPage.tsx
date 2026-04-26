import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, MessageSquare, Eye, ArrowLeft, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*, profiles!incidents_author_id_fkey(display_name, handle, emoji, color_scheme, field)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      // Increment views
      supabase.from('incidents').update({ views: (data.views || 0) + 1 }).eq('id', id!).then();
      return { ...data, author: (data as any).profiles };
    },
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles!comments_author_id_fkey(display_name, handle, emoji, color_scheme, field)')
        .eq('incident_id', id!)
        .order('upvotes', { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({ ...c, author: c.profiles }));
    },
    enabled: !!id,
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ['votes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('votes').select('target_id, target_type').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const hasVoted = (targetId: string) => userVotes.some((v: any) => v.target_id === targetId);

  const voteMutation = useMutation({
    mutationFn: async ({ targetId, targetType }: { targetId: string; targetType: string }) => {
      if (!user || !profile) throw new Error('Must be logged in');
      const voted = hasVoted(targetId);
      if (voted) {
        await supabase.from('votes').delete().match({ user_id: user.id, target_id: targetId, target_type: targetType });
        if (targetType === 'incident') {
          await supabase.from('incidents').update({ upvotes: Math.max(0, (incident?.upvotes || 1) - 1) }).eq('id', targetId);
        } else {
          const c = comments.find((c: any) => c.id === targetId);
          if (c) await supabase.from('comments').update({ upvotes: Math.max(0, c.upvotes - 1) }).eq('id', targetId);
        }
      } else {
        await supabase.from('votes').insert({ user_id: user.id, target_id: targetId, target_type: targetType });
        if (targetType === 'incident') {
          await supabase.from('incidents').update({ upvotes: (incident?.upvotes || 0) + 1 }).eq('id', targetId);
        } else {
          const c = comments.find((c: any) => c.id === targetId);
          if (c) await supabase.from('comments').update({ upvotes: c.upvotes + 1 }).eq('id', targetId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['votes', user?.id] });
    },
  });

  const submitComment = async () => {
    if (!user || !commentBody.trim()) return;
    try {
      const { error } = await supabase.from('comments').insert({
        incident_id: id!,
        author_id: user.id,
        body: commentBody.trim(),
      });
      if (error) throw error;
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const markVerified = async (commentId: string) => {
    await supabase.from('comments').update({ is_verified_fix: true }).eq('id', commentId);
    queryClient.invalidateQueries({ queryKey: ['comments', id] });
    toast.success('Marked as verified fix!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-1/3" />
          <div className="h-8 bg-secondary rounded w-2/3" />
          <div className="h-40 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!incident) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Incident not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap gap-2 mb-3">
          <SeverityBadge severity={incident.severity} />
          {incident.cloud_provider && <span className="tag-pill">{incident.cloud_provider}</span>}
          {incident.service_affected && <span className="tag-pill">{incident.service_affected}</span>}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">{incident.title}</h1>

        {incident.author && (
          <div className="flex items-center gap-2 mb-6">
            <UserAvatar emoji={incident.author.emoji} colorScheme={incident.author.color_scheme} size="sm" />
            <span className="text-sm font-medium text-foreground">{incident.author.display_name}</span>
            <span className="text-xs text-muted-foreground">{incident.author.handle}</span>
            {incident.author.field && <span className="tag-pill text-[10px]">{incident.author.field}</span>}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
            </span>
            {incident.downtime_duration && (
              <span className="severity-high text-[10px]">⏱ {incident.downtime_duration}</span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="space-y-4 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">What happened</h3>
            <p className="text-foreground text-sm whitespace-pre-wrap">{incident.description}</p>
          </div>

          {incident.root_cause && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(36 80% 41% / 0.12)' }}>
              <h3 className="text-sm font-semibold text-warning mb-2">Root Cause</h3>
              <p className="text-foreground text-sm whitespace-pre-wrap">{incident.root_cause}</p>
            </div>
          )}

          {incident.fix_method && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(160 70% 37% / 0.12)' }}>
              <h3 className="text-sm font-semibold text-success mb-2">How we fixed it</h3>
              <p className="text-foreground text-sm whitespace-pre-wrap">{incident.fix_method}</p>
            </div>
          )}

          {incident.tags && incident.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {incident.tags.map((tag: string) => <span key={tag} className="tag-pill">{tag}</span>)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
          <button
            onClick={() => voteMutation.mutate({ targetId: incident.id, targetType: 'incident' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${hasVoted(incident.id) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            disabled={!user}
          >
            <ArrowUp className="w-4 h-4" /> {incident.upvotes}
          </button>
          <span className="flex items-center gap-1 text-sm text-muted-foreground"><MessageSquare className="w-4 h-4" />{comments.length}</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground"><Eye className="w-4 h-4" />{incident.views}</span>
        </div>

        {/* Comments */}
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {comments.length} community suggestion{comments.length !== 1 ? 's' : ''}
        </h3>

        <div className="space-y-3 mb-8">
          {comments.map((comment: any) => (
            <div key={comment.id} className="card-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                {comment.author && (
                  <>
                    <UserAvatar emoji={comment.author.emoji} colorScheme={comment.author.color_scheme} size="sm" />
                    <span className="text-sm font-medium text-foreground">{comment.author.display_name}</span>
                    <span className="text-xs text-muted-foreground">{comment.author.handle}</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>

              {comment.is_verified_fix && (
                <span className="verified-badge mb-2 inline-flex items-center gap-1">
                  <Check className="w-3 h-3" /> Author Verified
                </span>
              )}

              <p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => voteMutation.mutate({ targetId: comment.id, targetType: 'comment' })}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${hasVoted(comment.id) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  disabled={!user}
                >
                  <ArrowUp className="w-3 h-3" /> {comment.upvotes}
                </button>
                {user && incident.author_id === user.id && !comment.is_verified_fix && (
                  <button onClick={() => markVerified(comment.id)} className="text-xs text-success hover:underline">
                    Mark as Verified Fix
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comment composer */}
        {user ? (
          <div className="card-surface p-4">
            <Textarea
              placeholder="Share a fix, workaround, or what worked for you..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              className="bg-surface border-input text-foreground min-h-[80px] mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Posting as {profile?.handle}</span>
              <Button onClick={submitComment} disabled={!commentBody.trim()} size="sm">Post suggestion</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Link to="/auth"><Button variant="outline">Sign in to comment</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
