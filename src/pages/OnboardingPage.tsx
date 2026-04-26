import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { generateIdentity } from '@/lib/identity';
import { UserAvatar } from '@/components/UserAvatar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const FIELDS = [
  { icon: '☁️', title: 'Cloud Engineer', desc: 'I manage cloud infrastructure on AWS, GCP, Azure' },
  { icon: '⚙️', title: 'DevOps Engineer', desc: 'I build CI/CD pipelines and manage deployments' },
  { icon: '💻', title: 'Software Engineer', desc: 'I build applications and write code' },
  { icon: '🔧', title: 'Full Stack Developer', desc: 'I work on both frontend and backend' },
  { icon: '🛡️', title: 'Site Reliability Engineer', desc: 'I keep production systems alive' },
  { icon: '🗄️', title: 'Database Administrator', desc: 'I manage and optimize databases' },
  { icon: '🔒', title: 'Security Engineer', desc: 'I protect systems and infrastructure' },
  { icon: '📊', title: 'Data Engineer', desc: 'I build data pipelines and infrastructure' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedField, setSelectedField] = useState('');
  const [identity, setIdentity] = useState<ReturnType<typeof generateIdentity> | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedField) {
      toast.error('Please select your engineering field');
      return;
    }
    const id = generateIdentity();
    setIdentity(id);
    setStep(2);
  };

  const handleFinish = async () => {
    if (!user || !identity) return;
    setSaving(true);
    try {
      // Check handle uniqueness
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', identity.handle)
        .maybeSingle();

      let finalIdentity = identity;
      if (existing) {
        finalIdentity = generateIdentity();
      }

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        display_name: finalIdentity.display_name,
        handle: finalIdentity.handle,
        emoji: finalIdentity.emoji,
        color_scheme: finalIdentity.color_scheme,
        field: selectedField,
      });

      if (error) throw error;
      await refreshProfile();
      toast.success('Welcome to PostMortem.io!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-sm text-muted-foreground mb-2">Step {step} of 2</div>
        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <div className="h-1 bg-primary rounded-full transition-all" style={{ width: `${step * 50}%` }} />
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">What's your engineering field?</h1>
            <p className="text-muted-foreground mb-8">This helps us tailor your experience.</p>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map((f) => (
                <button
                  key={f.title}
                  onClick={() => setSelectedField(f.title)}
                  className={`card-surface p-4 text-left transition-all hover:-translate-y-0.5 ${selectedField === f.title ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{f.icon}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm flex items-center gap-2">
                        {f.title}
                        {selectedField === f.title && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button className="mt-8 w-full" onClick={handleContinue} disabled={!selectedField}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && identity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-foreground mb-8">Your anonymous identity is ready</h1>
            <div className="card-surface p-10 max-w-sm mx-auto">
              <div className="flex justify-center mb-4">
                <UserAvatar emoji={identity.emoji} colorScheme={identity.color_scheme} size="xl" />
              </div>
              <div className="text-2xl font-bold text-foreground">{identity.display_name}</div>
              <div className="text-muted-foreground text-sm mt-1">{identity.handle}</div>
              <div className="mt-3">
                <span className="tag-pill">{selectedField}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                This is who you are on PostMortem.io. Your real identity stays completely private.
              </p>
            </div>
            <Button className="mt-8" onClick={handleFinish} disabled={saving}>
              {saving ? 'Setting up...' : 'Enter the community →'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
