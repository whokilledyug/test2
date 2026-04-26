import { Link, useNavigate } from 'react-router-dom';
import { UserAvatar } from '@/components/UserAvatar';
import { SeverityBadge } from '@/components/SeverityBadge';
import { ThumbsUp, MessageSquare, Eye, ArrowUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IncidentCardProps {
  incident: {
    id: string;
    title: string;
    description: string;
    severity: string | null;
    cloud_provider: string | null;
    service_affected: string | null;
    tags: string[] | null;
    upvotes: number;
    views: number;
    created_at: string;
    author?: {
      display_name: string;
      handle: string;
      emoji: string;
      color_scheme: string;
      field: string | null;
    };
    comment_count?: number;
  };
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const isCritical = incident.severity?.toLowerCase() === 'critical';

  return (
    <Link to={`/incidents/${incident.id}`} className="block">
      <div className={`card-surface p-5 hover:-translate-y-0.5 transition-all duration-200 ${isCritical ? 'border-l-4 border-l-critical' : ''}`}>
        {/* Author */}
        {incident.author && (
          <div className="flex items-center gap-2 mb-3">
            <UserAvatar emoji={incident.author.emoji} colorScheme={incident.author.color_scheme} size="sm" />
            <span className="text-sm font-medium text-foreground">{incident.author.display_name}</span>
            <span className="text-xs text-muted-foreground">{incident.author.handle}</span>
            {incident.author.field && <span className="tag-pill text-[10px]">{incident.author.field}</span>}
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-medium text-foreground mb-2">{incident.title}</h3>

        {/* Description preview */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{incident.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {incident.service_affected && <span className="tag-pill">{incident.service_affected}</span>}
          {incident.cloud_provider && <span className="tag-pill">{incident.cloud_provider}</span>}
          <SeverityBadge severity={incident.severity} />
          {incident.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ArrowUp className="w-3.5 h-3.5" />{incident.upvotes}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{incident.comment_count ?? 0}</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{incident.views}</span>
        </div>
      </div>
    </Link>
  );
}
