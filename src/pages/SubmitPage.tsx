import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SeverityBadge } from '@/components/SeverityBadge';
import { AlertTriangle, ArrowLeft, X, Check } from 'lucide-react';
import { toast } from 'sonner';

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
const CLOUD_PROVIDERS = ['AWS', 'GCP', 'Azure', 'Self-hosted', 'Other'];

export default function SubmitPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [cloudProvider, setCloudProvider] = useState('');
  const [serviceAffected, setServiceAffected] = useState('');
  const [severity, setSeverity] = useState('');
  const [downtimeDuration, setDowntimeDuration] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [fixMethod, setFixMethod] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('incidents').insert({
        author_id: user.id,
        title,
        description,
        root_cause: rootCause,
        service_affected: serviceAffected,
        cloud_provider: cloudProvider,
        fix_method: fixMethod,
        severity,
        downtime_duration: downtimeDuration,
        tags,
      }).select('id').single();

      if (error) throw error;

      // Update incidents count
      await supabase.from('profiles').update({
        incidents_count: (profile.incidents_count || 0) + 1,
        reputation: (profile.reputation || 0) + 10,
      }).eq('id', user.id);

      toast.success('Your incident is live!');
      navigate(`/incidents/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <AlertTriangle className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">Submit Incident</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">What broke?</h2>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Incident Title *</label>
              <Input placeholder="e.g. PostgreSQL replica crashed under load" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface border-input text-foreground" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cloud Provider</label>
              <select value={cloudProvider} onChange={(e) => setCloudProvider(e.target.value)} className="w-full bg-surface border border-input text-foreground rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {CLOUD_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Service Affected</label>
              <Input placeholder="e.g. PostgreSQL, Kubernetes, Nginx" value={serviceAffected} onChange={(e) => setServiceAffected(e.target.value)} className="bg-surface border-input text-foreground" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITIES.map((s) => (
                  <button key={s} onClick={() => setSeverity(s)} className={`card-surface p-3 text-center text-sm transition-all ${severity === s ? 'ring-2 ring-primary' : ''}`}>
                    <SeverityBadge severity={s} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Downtime Duration</label>
              <Input placeholder="e.g. 4h 23m" value={downtimeDuration} onChange={(e) => setDowntimeDuration(e.target.value)} className="bg-surface border-input text-foreground" />
            </div>
            <Button onClick={() => { if (!title) { toast.error('Title is required'); return; } setStep(2); }} className="w-full">Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">Tell us everything</h2>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">What happened? *</label>
              <Textarea placeholder="Describe the incident timeline. What triggered it?" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-surface border-input text-foreground min-h-[120px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Root Cause *</label>
              <Textarea placeholder="What was the actual underlying cause?" value={rootCause} onChange={(e) => setRootCause(e.target.value)} className="bg-surface border-input text-foreground min-h-[80px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">How did you fix it? *</label>
              <Textarea placeholder="Step by step — what exact actions resolved it?" value={fixMethod} onChange={(e) => setFixMethod(e.target.value)} className="bg-surface border-input text-foreground min-h-[80px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Tags</label>
              <div className="flex gap-2">
                <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="bg-surface border-input text-foreground" />
                <Button variant="outline" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="tag-pill flex items-center gap-1">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => { if (!description || !rootCause || !fixMethod) { toast.error('Please fill all required fields'); return; } setStep(3); }} className="flex-1">Review</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">Review and submit</h2>
            <div className="card-surface p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <SeverityBadge severity={severity} />
                {cloudProvider && <span className="tag-pill">{cloudProvider}</span>}
                {serviceAffected && <span className="tag-pill">{serviceAffected}</span>}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              {rootCause && (
                <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'hsl(36 80% 41% / 0.15)' }}>
                  <div className="text-xs font-semibold text-warning mb-1">Root Cause</div>
                  <p className="text-sm text-foreground">{rootCause}</p>
                </div>
              )}
              {fixMethod && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(160 70% 37% / 0.15)' }}>
                  <div className="text-xs font-semibold text-success mb-1">How we fixed it</div>
                  <p className="text-sm text-foreground">{fixMethod}</p>
                </div>
              )}
            </div>

            {profile && (
              <p className="text-sm text-muted-foreground">
                Posting as {profile.display_name} ({profile.handle})
              </p>
            )}

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="rounded" />
              I confirm this incident is real and the fix information is accurate
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmit} disabled={!confirmed || submitting} className="flex-1">
                {submitting ? 'Publishing...' : 'Publish to community'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
