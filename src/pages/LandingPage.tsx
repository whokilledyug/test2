import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, Share2, Search, ArrowRight } from 'lucide-react';

const TAGS = ['PostgreSQL', 'Kubernetes', 'AWS', 'Nginx', 'Redis', 'Docker', 'MongoDB', 'GitHub Actions', 'Terraform', 'Kafka', 'Elasticsearch', 'MySQL', 'RabbitMQ', 'Consul', 'Prometheus', 'Jenkins', 'CircleCI', 'Lambda', 'S3', 'CloudFront'];

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-foreground">{count.toLocaleString()}</div>
      <div className="text-muted-foreground text-sm mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">PostMortem.io</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
          <Link to="/submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Submit</Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-foreground leading-tight"
        >
          The world's crash report — <br />
          <span className="text-primary">written by engineers who survived.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Anonymous. Open. Community-verified. Every server disaster, every fix, shared freely.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex gap-4 justify-center flex-wrap"
        >
          <Link to="/auth">
            <Button variant="hero">Join the community</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="heroOutline">Browse incidents</Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8">
          <AnimatedCounter target={2847} label="Incidents Shared" />
          <AnimatedCounter target={14293} label="Engineers Helped" />
          <AnimatedCounter target={98} label="% Fixes Verified" />
        </div>
      </section>

      {/* Ticker */}
      <section className="py-8 overflow-hidden border-y border-border">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...TAGS, ...TAGS].map((tag, i) => (
            <span key={i} className="tag-pill mx-2 shrink-0">{tag}</span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground text-center mb-16">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <AlertTriangle className="w-8 h-8 text-destructive" />, title: 'Something breaks', desc: 'A server crashes, a database corrupts, a deploy fails catastrophically.' },
            { icon: <Share2 className="w-8 h-8 text-primary" />, title: 'Engineer shares the fix', desc: 'An anonymous post-mortem: what happened, root cause, and exact fix steps.' },
            { icon: <Search className="w-8 h-8 text-success" />, title: 'World searches and finds it', desc: 'The next engineer with the same error finds the answer in minutes, not hours.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="card-surface p-8 text-center hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-muted-foreground text-sm">
          PostMortem.io — Open Knowledge. Built by engineers. For engineers.
        </p>
      </footer>
    </div>
  );
}
